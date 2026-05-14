// Resource-group-scoped module — provisions the full backend stack.
//
// Everything Directus needs: Postgres, Redis, Blob storage, and the
// Container App that runs the directus/directus:11.4.1 image.

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
param directusIngressExternal bool

// Random suffix to keep globally-unique names (Storage, Postgres) stable
// across redeploys while still avoiding collisions if the resource group
// is recreated. uniqueString() is deterministic per RG name.
var unique = take(uniqueString(resourceGroup().id), 6)
var storageName = '${namePrefix}st${unique}'
var pgServerName = '${namePrefix}-pg-${unique}'
var redisName = '${namePrefix}-redis-${unique}'
var lawName = '${namePrefix}-logs'
var caeName = '${namePrefix}-cae'
var directusAppName = '${namePrefix}-directus'

// -----------------------------------------------------------------------------
// 1. Log Analytics workspace (required by Container Apps env)
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
// 2. Postgres Flexible Server + `directus` database
//    - Burstable B1ms is the cheapest production-grade tier (~$15/mo)
//    - SSL required (Directus connects via TLS by default)
//    - Firewall allows "All Azure services" so Container Apps can reach it
//      without VNet integration. For prod-grade you'd add a private endpoint.
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
      // Public access; gated by firewall rules below.
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

// Open to the whole internet so seeding from a laptop works without VPN.
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
// 3. Cache for Redis (Basic C0, ~$16/mo)
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
// 4. Storage Account + Blob container for Directus uploads
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
// 5. Container Apps environment
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
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// -----------------------------------------------------------------------------
// 6. Container App: directus
//    - Image: stock directus/directus:11.4.1 (no custom build needed)
//    - Env: Postgres, Redis, Blob, KEY/SECRET, admin creds
//    - Ingress: external HTTPS on 8055 (Container Apps terminates TLS)
//    - Replicas: 1-3, scales on HTTP concurrency
// -----------------------------------------------------------------------------

var postgresHost = '${pg.name}.postgres.database.azure.com'
var redisHost = '${redis.name}.redis.cache.windows.net'
// Build the Redis URL from the access key. listKeys() returns
// {primaryKey, secondaryKey}; Redis uses primaryKey as the password.
var redisPassword = redis.listKeys().primaryKey
var storageKey = storage.listKeys().keys[0].value
// Public URL of the directus app — emitted as the fqdn after creation.
// Used both in the app's PUBLIC_URL env and as the deployment output.

resource directus 'Microsoft.App/containerApps@2024-03-01' = {
  name: directusAppName
  location: location
  properties: {
    managedEnvironmentId: cae.id
    workloadProfileName: 'Consumption'
    configuration: {
      ingress: {
        external: directusIngressExternal
        targetPort: 8055
        transport: 'http'
        allowInsecure: false
        traffic: [{latestRevision: true, weight: 100}]
        corsPolicy: {
          // Permissive CORS so Vercel preview deploys can hit the API.
          // Tighten when a single canonical web hostname is decided.
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
      ]
    }
    template: {
      containers: [
        {
          name: 'directus'
          image: 'directus/directus:11.4.1'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            // ---- Database ----
            {name: 'DB_CLIENT', value: 'pg'}
            {name: 'DB_HOST', value: postgresHost}
            {name: 'DB_PORT', value: '5432'}
            {name: 'DB_DATABASE', value: 'directus'}
            {name: 'DB_USER', value: postgresAdminLogin}
            {name: 'DB_PASSWORD', secretRef: 'pg-password'}
            {name: 'DB_SSL__REJECT_UNAUTHORIZED', value: 'false'}
            // ---- Cache (Redis) ----
            {name: 'CACHE_ENABLED', value: 'true'}
            {name: 'CACHE_STORE', value: 'redis'}
            {name: 'REDIS_HOST', value: redisHost}
            {name: 'REDIS_PORT', value: '6380'}
            {name: 'REDIS_PASSWORD', secretRef: 'redis-password'}
            {name: 'REDIS_TLS', value: 'true'}
            // ---- File uploads (Azure Blob) ----
            {name: 'STORAGE_LOCATIONS', value: 'azure'}
            {name: 'STORAGE_AZURE_DRIVER', value: 'azure'}
            {name: 'STORAGE_AZURE_CONTAINER_NAME', value: 'directus-uploads'}
            {name: 'STORAGE_AZURE_ACCOUNT_NAME', value: storage.name}
            {name: 'STORAGE_AZURE_ACCOUNT_KEY', secretRef: 'storage-key'}
            // ---- Auth ----
            {name: 'KEY', secretRef: 'directus-key'}
            {name: 'SECRET', secretRef: 'directus-secret'}
            {name: 'ADMIN_EMAIL', value: directusAdminEmail}
            {name: 'ADMIN_PASSWORD', secretRef: 'directus-admin-password'}
            // ---- Networking ----
            // PUBLIC_URL needs the actual fqdn — we'll patch it after the
            // app is created since the fqdn is generated by ACA.
            {name: 'PUBLIC_URL', value: 'https://placeholder.invalid'}
            {name: 'CORS_ENABLED', value: 'true'}
            {name: 'CORS_ORIGIN', value: 'true'}
            // ---- Misc ----
            {name: 'WEBSOCKETS_ENABLED', value: 'false'}
            {name: 'TELEMETRY', value: 'false'}
            // ---- Behavior on first boot ----
            // The first boot of a fresh image initializes the schema (the
            // built-in Directus collections) and creates the admin user
            // from ADMIN_EMAIL/ADMIN_PASSWORD. Our project schema gets
            // applied later via `directus schema apply` (run from a
            // bootstrap script against the live URL).
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-concurrency'
            http: {
              metadata: {concurrentRequests: '20'}
            }
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
// Outputs
// -----------------------------------------------------------------------------

output directusUrl string = 'https://${directus.properties.configuration.ingress.fqdn}'
output postgresHost string = postgresHost
output storageAccountName string = storage.name
