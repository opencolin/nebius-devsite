// Resource-group-scoped module — full Nebius topology mirror.
//
//   Front Door Standard                  ┐
//        │                                │  global edge, cache rules,
//        │  HTTPS                         │  x-azure-ref headers
//        ▼                                │
//   Container App: web   ◀────────────────┘
//        │
//        │  HTTPS (internal)
//        ▼
//   Container App: directus ◀──┐
//        │                     │
//        ├── Postgres Flex     │
//        ├── Cache for Redis   │  Container Apps env (consumption)
//        └── Storage / Blob    │  Log Analytics workspace
//                              │
//                              └─ ACR (web image source, AcrPull via UAMI)

targetScope = 'resourceGroup'

param location string
param namePrefix string
param postgresAdminLogin string
@secure()
param postgresAdminPassword string
@secure()
param directusKey string
@secure()
param directusSecret string
param directusAdminEmail string
@secure()
param directusAdminPassword string

@description('Tag of the web image already pushed to ACR. Default "latest" is what deploy.sh pushes first.')
param webImageTag string = 'latest'

@description('Name of the image repo inside ACR (default "web").')
param webImageRepo string = 'web'

@description('Skip web Container App + Front Door on the first pass (image must exist + Directus must be live before this can be true).')
param deployWeb bool = true

// ---- GitHub OAuth (for Directus auth_github provider) ----
// These default to empty so a fresh bicep run doesn't fail when the
// developer hasn't registered the OAuth App yet. Populate them via
// `az containerapp secret set` once the OAuth App exists on
// github.com/settings/developers. With empty values, the provider
// stays disabled and the GitHub login button on /login 502s — that's
// the intended fail-loud behavior, not silent fallback.
@secure()
@description('GitHub OAuth App client ID (github.com/settings/developers).')
param githubClientId string = ''

@secure()
@description('GitHub OAuth App client secret.')
param githubClientSecret string = ''

@description('Comma-separated list of post-OAuth redirect URLs. Each one must exactly match what the LoginForm sends in the `redirect` query param.')
param githubRedirectAllowList string = 'https://demo.buildspace.sh/portal,https://demo.buildspace.sh/portal/checklist,https://demo.buildspace.sh'

@description('UUID of the Directus role that GitHub-authed users land in by default (created out-of-band via /roles).')
param defaultBuilderRoleId string = '8ad54e0b-0e9f-414c-8558-8134c30f79d9'

// Random suffix to keep globally-unique names (Storage, Postgres, ACR) stable
// across redeploys while still avoiding collisions if the resource group
// is recreated. uniqueString() is deterministic per RG name.
var unique = take(uniqueString(resourceGroup().id), 6)
var storageName = '${namePrefix}st${unique}'
var pgServerName = '${namePrefix}-pg-${unique}'
var redisName = '${namePrefix}-redis-${unique}'
var acrName = '${namePrefix}acr${unique}'
var lawName = '${namePrefix}-logs'
var caeName = '${namePrefix}-cae'
var uamiName = '${namePrefix}-acr-puller'
var directusAppName = '${namePrefix}-directus'
var webAppName = '${namePrefix}-web'
var fdProfileName = '${namePrefix}-fd'
var fdEndpointName = '${namePrefix}-edge'

// -----------------------------------------------------------------------------
// 1. Log Analytics workspace
// -----------------------------------------------------------------------------

resource law 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: lawName
  location: location
  properties: {
    sku: {name: 'PerGB2018'}
    retentionInDays: 30
    features: {enableLogAccessUsingOnlyResourcePermissions: true}
  }
}

// -----------------------------------------------------------------------------
// 2. Azure Container Registry (Basic ~$5/mo) + User-Assigned Managed Identity
//    bound to it via AcrPull so Container Apps can pull the web image.
// -----------------------------------------------------------------------------

resource acr 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: acrName
  location: location
  sku: {name: 'Basic'}
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: uamiName
  location: location
}

// Built-in role: AcrPull
var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'

resource acrPullAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: acr
  name: guid(acr.id, uami.id, acrPullRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId: uami.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// -----------------------------------------------------------------------------
// 3. Postgres Flexible Server + `directus` database
// -----------------------------------------------------------------------------

resource pg 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: pgServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: postgresAdminLogin
    administratorLoginPassword: postgresAdminPassword
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {mode: 'Disabled'}
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
  }
}

resource pgFwAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: pg
  name: 'AllowAllAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Allowlist the PostGIS extension at the server level so the bootstrap
// script can run `CREATE EXTENSION postgis` inside the directus database.
// Without this, Directus's events collection (which has a geometry column
// for event coords) fails the schema apply with `type "geometry" does not exist`.
resource pgConfigExtensions 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = {
  parent: pg
  name: 'azure.extensions'
  properties: {
    value: 'POSTGIS,POSTGIS_RASTER,POSTGIS_TOPOLOGY'
    source: 'user-override'
  }
}

// Open during initial seed so the script can run from a laptop.
// Lock down to specific egress IPs after the initial seed.
resource pgFwAll 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: pg
  name: 'AllowAll-DELETE-AFTER-SEED'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

resource pgDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: pg
  name: 'directus'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// -----------------------------------------------------------------------------
// 4. Cache for Redis (Basic C0, ~$16/mo)
// -----------------------------------------------------------------------------

resource redis 'Microsoft.Cache/redis@2024-11-01' = {
  name: redisName
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    redisVersion: '6'
  }
}

// -----------------------------------------------------------------------------
// 5. Storage Account + Blob container for Directus uploads
// -----------------------------------------------------------------------------

resource storage 'Microsoft.Storage/storageAccounts@2024-01-01' = {
  name: storageName
  location: location
  sku: {name: 'Standard_LRS'}
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    publicNetworkAccess: 'Enabled'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2024-01-01' = {
  parent: storage
  name: 'default'
  properties: {}
}

resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2024-01-01' = {
  parent: blobService
  name: 'directus-uploads'
  properties: {publicAccess: 'None'}
}

// -----------------------------------------------------------------------------
// 6. Container Apps environment
// -----------------------------------------------------------------------------

resource cae 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: caeName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: law.properties.customerId
        sharedKey: law.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {name: 'Consumption', workloadProfileType: 'Consumption'}
    ]
  }
}

// -----------------------------------------------------------------------------
// 7. Container App: directus  (stock image, no ACR needed)
// -----------------------------------------------------------------------------

var postgresHost = '${pg.name}.postgres.database.azure.com'
var redisHost = '${redis.name}.redis.cache.windows.net'
var redisPassword = redis.listKeys().primaryKey
var storageKey = storage.listKeys().keys[0].value

resource directus 'Microsoft.App/containerApps@2024-03-01' = {
  name: directusAppName
  location: location
  properties: {
    managedEnvironmentId: cae.id
    workloadProfileName: 'Consumption'
    configuration: {
      ingress: {
        external: true
        targetPort: 8055
        transport: 'http'
        allowInsecure: false
        traffic: [{latestRevision: true, weight: 100}]
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          allowCredentials: false
        }
      }
      secrets: [
        {name: 'pg-password', value: postgresAdminPassword}
        {name: 'directus-key', value: directusKey}
        {name: 'directus-secret', value: directusSecret}
        {name: 'directus-admin-password', value: directusAdminPassword}
        {name: 'redis-password', value: redisPassword}
        {name: 'storage-key', value: storageKey}
        // GitHub OAuth — leave blank during bicep create; populate via
        // `az containerapp secret set` once the OAuth App exists on
        // github.com/settings/developers. Empty string is treated as
        // "not configured" by Directus, so the provider stays inert
        // until creds land. See infra/azure/README.md.
        {name: 'auth-github-client-id', value: githubClientId}
        {name: 'auth-github-client-secret', value: githubClientSecret}
      ]
    }
    template: {
      containers: [
        {
          name: 'directus'
          image: 'directus/directus:11.17.4'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {name: 'DB_CLIENT', value: 'pg'}
            {name: 'DB_HOST', value: postgresHost}
            {name: 'DB_PORT', value: '5432'}
            {name: 'DB_DATABASE', value: 'directus'}
            {name: 'DB_USER', value: postgresAdminLogin}
            {name: 'DB_PASSWORD', secretRef: 'pg-password'}
            {name: 'DB_SSL__REJECT_UNAUTHORIZED', value: 'false'}
            {name: 'CACHE_ENABLED', value: 'true'}
            {name: 'CACHE_STORE', value: 'redis'}
            {name: 'REDIS_HOST', value: redisHost}
            {name: 'REDIS_PORT', value: '6380'}
            {name: 'REDIS_PASSWORD', secretRef: 'redis-password'}
            {name: 'REDIS_TLS', value: 'true'}
            {name: 'STORAGE_LOCATIONS', value: 'azure'}
            {name: 'STORAGE_AZURE_DRIVER', value: 'azure'}
            {name: 'STORAGE_AZURE_CONTAINER_NAME', value: 'directus-uploads'}
            {name: 'STORAGE_AZURE_ACCOUNT_NAME', value: storage.name}
            {name: 'STORAGE_AZURE_ACCOUNT_KEY', secretRef: 'storage-key'}
            {name: 'KEY', secretRef: 'directus-key'}
            {name: 'SECRET', secretRef: 'directus-secret'}
            {name: 'ADMIN_EMAIL', value: directusAdminEmail}
            {name: 'ADMIN_PASSWORD', secretRef: 'directus-admin-password'}
            {name: 'PUBLIC_URL', value: 'https://placeholder.invalid'}
            {name: 'CORS_ENABLED', value: 'true'}
            {name: 'CORS_ORIGIN', value: 'true'}
            {name: 'WEBSOCKETS_ENABLED', value: 'false'}
            {name: 'TELEMETRY', value: 'false'}
            // ---- GitHub OAuth ----
            // SESSION_COOKIE_DOMAIN must include a leading dot so the
            // cookie crosses subdomains (cms.* sets it, demo.* reads it).
            // Together with AUTH_PROVIDERS=github + the AUTH_GITHUB_*
            // env vars below, the Builder Network signup flow works
            // end-to-end. The CLIENT_ID/SECRET are wired as secrets;
            // they're empty until the OAuth App is registered.
            {name: 'SESSION_COOKIE_DOMAIN', value: '.buildspace.sh'}
            {name: 'REFRESH_TOKEN_COOKIE_DOMAIN', value: '.buildspace.sh'}
            {name: 'AUTH_PROVIDERS', value: 'github'}
            {name: 'AUTH_GITHUB_DRIVER', value: 'github'}
            {name: 'AUTH_GITHUB_CLIENT_ID', secretRef: 'auth-github-client-id'}
            {name: 'AUTH_GITHUB_CLIENT_SECRET', secretRef: 'auth-github-client-secret'}
            {name: 'AUTH_GITHUB_DEFAULT_ROLE_ID', value: defaultBuilderRoleId}
            {name: 'AUTH_GITHUB_REDIRECT_ALLOW_LIST', value: githubRedirectAllowList}
            {name: 'AUTH_GITHUB_ALLOW_PUBLIC_REGISTRATION', value: 'true'}
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-concurrency'
            http: {metadata: {concurrentRequests: '20'}}
          }
        ]
      }
    }
  }
  dependsOn: [
    pgDb
    pgFwAzure
    uploadsContainer
  ]
}

// -----------------------------------------------------------------------------
// 8. Container App: web  (Next.js — pulls from ACR via UAMI)
//
// On a first-ever deploy the image isn't pushed yet — deploy.sh does
// `az acr build` *before* the bicep run, so by the time we hit this
// resource the tag exists. If you want to deploy infra without an image
// yet, set webImageTag='mcr.microsoft.com/k8se/quickstart:latest' and
// override the FQDN-only image path in the env block.
// -----------------------------------------------------------------------------

var directusFqdn = directus.properties.configuration.ingress.fqdn

resource web 'Microsoft.App/containerApps@2024-03-01' = if (deployWeb) {
  name: webAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${uami.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: cae.id
    workloadProfileName: 'Consumption'
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
        traffic: [{latestRevision: true, weight: 100}]
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: uami.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${acr.properties.loginServer}/${webImageRepo}:${webImageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {name: 'DIRECTUS_URL', value: 'https://${directusFqdn}'}
            // Admin token is injected by deploy.sh as a separate
            // `az containerapp update` since the token is minted after
            // Directus boots — see the bootstrap step in deploy.sh.
            {name: 'AUTH_COOKIE_SECURE', value: '1'}
            {name: 'NODE_ENV', value: 'production'}
            {name: 'PORT', value: '3000'}
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: [
          {
            name: 'http-concurrency'
            http: {metadata: {concurrentRequests: '40'}}
          }
        ]
      }
    }
  }
  dependsOn: [
    // ACR role assignment must exist before the app tries to pull. The
    // `directus` dependency is implicit (we reference directusFqdn in env).
    acrPullAssignment
  ]
}

// -----------------------------------------------------------------------------
// 9. Front Door Standard + endpoint + origin + route + cache rules
//
// Mirrors nebius.com's edge topology — the rule set below replicates the
// three cache headers visible on a `curl -I https://nebius.com`:
//   /_next/static/* → public, max-age=31536000, immutable
//   /api/*          → private, no-store
//   /* (HTML)       → public, s-maxage=60, swr=300, sif-error=31536000
// -----------------------------------------------------------------------------

resource fdProfile 'Microsoft.Cdn/profiles@2024-02-01' = if (deployWeb) {
  name: fdProfileName
  location: 'global'
  sku: {name: 'Standard_AzureFrontDoor'}
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

resource fdEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2024-02-01' = if (deployWeb) {
  parent: fdProfile
  name: fdEndpointName
  location: 'global'
  properties: {
    enabledState: 'Enabled'
  }
}

resource fdOriginGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = if (deployWeb) {
  parent: fdProfile
  name: 'web-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 2
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 60
    }
    sessionAffinityState: 'Disabled'
  }
}

resource fdOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = if (deployWeb) {
  parent: fdOriginGroup
  name: 'web-origin'
  properties: {
    hostName: web.properties.configuration.ingress.fqdn
    httpPort: 80
    httpsPort: 443
    originHostHeader: web.properties.configuration.ingress.fqdn
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
    enforceCertificateNameCheck: true
  }
}

// Rule set carrying the three cache rules. Each rule has a URL-path
// condition and an `ModifyResponseHeader` action to set Cache-Control.
resource fdRuleSet 'Microsoft.Cdn/profiles/ruleSets@2024-02-01' = if (deployWeb) {
  parent: fdProfile
  name: 'cacherules'
}

resource fdRuleStatic 'Microsoft.Cdn/profiles/ruleSets/rules@2024-02-01' = if (deployWeb) {
  parent: fdRuleSet
  name: 'staticImmutable'
  properties: {
    order: 1
    matchProcessingBehavior: 'Continue'
    conditions: [
      {
        name: 'UrlPath'
        parameters: {
          typeName: 'DeliveryRuleUrlPathMatchConditionParameters'
          operator: 'BeginsWith'
          matchValues: ['/_next/static/']
          negateCondition: false
        }
      }
    ]
    actions: [
      {
        name: 'ModifyResponseHeader'
        parameters: {
          typeName: 'DeliveryRuleHeaderActionParameters'
          headerAction: 'Overwrite'
          headerName: 'Cache-Control'
          value: 'public, max-age=31536000, immutable'
        }
      }
    ]
  }
}

resource fdRuleApi 'Microsoft.Cdn/profiles/ruleSets/rules@2024-02-01' = if (deployWeb) {
  parent: fdRuleSet
  name: 'apiNoStore'
  properties: {
    order: 2
    matchProcessingBehavior: 'Continue'
    conditions: [
      {
        name: 'UrlPath'
        parameters: {
          typeName: 'DeliveryRuleUrlPathMatchConditionParameters'
          operator: 'BeginsWith'
          matchValues: ['/api/']
          negateCondition: false
        }
      }
    ]
    actions: [
      {
        name: 'ModifyResponseHeader'
        parameters: {
          typeName: 'DeliveryRuleHeaderActionParameters'
          headerAction: 'Overwrite'
          headerName: 'Cache-Control'
          value: 'private, no-store'
        }
      }
    ]
  }
}

resource fdRuleHtml 'Microsoft.Cdn/profiles/ruleSets/rules@2024-02-01' = if (deployWeb) {
  parent: fdRuleSet
  name: 'htmlSWR'
  properties: {
    order: 3
    matchProcessingBehavior: 'Continue'
    conditions: [
      {
        name: 'UrlPath'
        parameters: {
          typeName: 'DeliveryRuleUrlPathMatchConditionParameters'
          operator: 'BeginsWith'
          matchValues: ['/']
          negateCondition: false
        }
      }
    ]
    actions: [
      {
        name: 'ModifyResponseHeader'
        parameters: {
          typeName: 'DeliveryRuleHeaderActionParameters'
          headerAction: 'Overwrite'
          headerName: 'Cache-Control'
          value: 'public, s-maxage=60, stale-while-revalidate=300, stale-if-error=31536000'
        }
      }
    ]
  }
}

resource fdRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = if (deployWeb) {
  parent: fdEndpoint
  name: 'default'
  properties: {
    originGroup: {id: fdOriginGroup.id}
    ruleSets: [{id: fdRuleSet.id}]
    supportedProtocols: ['Http', 'Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    enabledState: 'Enabled'
    cacheConfiguration: {
      queryStringCachingBehavior: 'IgnoreQueryString'
      // Compression DISABLED: Front Door Standard's on-the-fly Brotli/Gzip
      // negotiation hangs HTTP/2 streams when browsers send the canonical
      // Accept-Encoding: gzip, deflate, br header (single-encoding curls work
      // fine, but the browser-style multi-encoding negotiation deadlocks).
      // Without compression, the page renders but you eat ~10x bandwidth on
      // CSS/JS — fine for a mockup. Revisit when AFD fixes the bug or
      // when we move to pre-compressed Brotli served by Next directly.
      compressionSettings: {
        contentTypesToCompress: [
          'text/html'
          'text/css'
          'text/plain'
          'text/javascript'
          'application/javascript'
          'application/json'
          'application/xml'
          'application/x-javascript'
          'image/svg+xml'
        ]
        isCompressionEnabled: false
      }
    }
  }
  dependsOn: [
    fdOrigin
    fdRuleStatic
    fdRuleApi
    fdRuleHtml
  ]
}

// -----------------------------------------------------------------------------
// Outputs
// -----------------------------------------------------------------------------

output directusUrl string = 'https://${directus.properties.configuration.ingress.fqdn}'
output webOriginUrl string = deployWeb ? 'https://${web.properties.configuration.ingress.fqdn}' : ''
output frontDoorUrl string = deployWeb ? 'https://${fdEndpoint.properties.hostName}' : ''
output acrLoginServer string = acr.properties.loginServer
output postgresHost string = postgresHost
output storageAccountName string = storage.name
