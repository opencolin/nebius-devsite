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

@description('Directus admin email — created by Directus on first boot.')
param directusAdminEmail string = 'admin@nebius-devsite.local'

@description('Directus admin password (8-128 chars).')
@secure()
@minLength(8)
param directusAdminPassword string

@description('Allow the Directus public HTTP ingress (so the Vercel app and your laptop can reach it).')
param directusIngressExternal bool = true

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
    directusIngressExternal: directusIngressExternal
  }
}

// -----------------------------------------------------------------------------
// Outputs — surface the URLs/secrets the Vercel + bootstrap steps need.
// -----------------------------------------------------------------------------

@description('Directus public URL — use as DIRECTUS_URL env var in Vercel.')
output directusUrl string = stack.outputs.directusUrl

@description('Postgres FQDN (host) — only needed if you want to connect with psql directly.')
output postgresHost string = stack.outputs.postgresHost

@description('Blob storage account name (for Directus file uploads).')
output storageAccountName string = stack.outputs.storageAccountName

@description('Resource group ID.')
output rgId string = rg.id
