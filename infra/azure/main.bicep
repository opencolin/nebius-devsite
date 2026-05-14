// Azure deployment for the nebius-homepage stack.
//
// Scope: a single subscription deployment that creates the resource group
// and stands up the Directus + Postgres + Redis + Storage stack inside.
// The Next.js web app is hosted on Vercel — it talks to the Directus URL
// emitted as an output here.
//
// Topology (simplified from the original nebius.com mirror — we skip
// Front Door because Vercel fronts the public traffic):
//
//   Vercel (Next.js, edge) ─── HTTPS ───▶ Container App: directus
//                                              │
//                                              ├── Postgres Flexible Server (Burstable B1ms)
//                                              ├── Cache for Redis (Basic C0)
//                                              └── Storage Account / Blob container
//
// Container Apps environment is consumption-tier (scale-to-zero between
// requests). Log Analytics workspace required by the env even when we
// don't actively query logs.

targetScope = 'subscription'

@description('Azure region. Defaults to West Europe (Nebius\'s primary region).')
param location string = 'westeurope'

@description('Resource group name.')
param resourceGroupName string = 'nebius-devsite-rg'

@description('Short name used as a prefix for resource names. 3-10 lowercase letters.')
@minLength(3)
@maxLength(10)
param namePrefix string = 'nbdevsite'

@description('Postgres admin login.')
param postgresAdminLogin string = 'nbadmin'

@description('Postgres admin password (12-128 chars).')
@secure()
@minLength(12)
param postgresAdminPassword string

@description('Directus KEY (any random UUID — used internally for cache keys).')
@secure()
param directusKey string

@description('Directus SECRET (long random string — JWT signing key).')
@secure()
param directusSecret string

@description('Directus admin email — created by Directus on first boot. Avoid .local/.test/.example TLDs (rejected by Directus email validator).')
param directusAdminEmail string = 'admin@nebiusdevsite.dev'

@description('Directus admin password (8-128 chars).')
@secure()
@minLength(8)
param directusAdminPassword string

@description('Tag of the web image already pushed to ACR. Default "latest" is what deploy.sh pushes.')
param webImageTag string = 'latest'

@description('Name of the image repo inside ACR.')
param webImageRepo string = 'web'

@description('Deploy the web Container App + Front Door. Set false on the FIRST pass so the backend stack stands up without needing the web image to exist yet (the web image build needs a reachable DIRECTUS_URL).')
param deployWeb bool = true

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
}

module stack 'modules/stack.bicep' = {
  name: 'stack'
  scope: rg
  params: {
    location: location
    namePrefix: namePrefix
    postgresAdminLogin: postgresAdminLogin
    postgresAdminPassword: postgresAdminPassword
    directusKey: directusKey
    directusSecret: directusSecret
    directusAdminEmail: directusAdminEmail
    directusAdminPassword: directusAdminPassword
    webImageTag: webImageTag
    webImageRepo: webImageRepo
    deployWeb: deployWeb
  }
}

// -----------------------------------------------------------------------------
// Outputs — surface the URLs the bootstrap + smoke-test steps need.
// -----------------------------------------------------------------------------

@description('Front Door public URL — this is the customer-facing site. Empty until deployWeb=true.')
output frontDoorUrl string = stack.outputs.frontDoorUrl

@description('Web Container App URL — only needed for direct origin access. Empty until deployWeb=true.')
output webOriginUrl string = stack.outputs.webOriginUrl

@description('Directus public URL — for bootstrap + admin UI.')
output directusUrl string = stack.outputs.directusUrl

@description('ACR login server — for docker push / az acr build.')
output acrLoginServer string = stack.outputs.acrLoginServer

@description('Postgres FQDN — only needed if you want to connect with psql directly.')
output postgresHost string = stack.outputs.postgresHost

@description('Blob storage account name (for Directus file uploads).')
output storageAccountName string = stack.outputs.storageAccountName

@description('Resource group ID.')
output rgId string = rg.id
