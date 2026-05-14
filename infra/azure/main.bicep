// Azure deployment skeleton for the nebius-homepage stack.
// Mirrors nebius.com's topology: Container Apps + Front Door + Postgres + Redis + Storage.
//
// This is a minimal starter — a production-grade revision will want VNet
// integration, Private Endpoints, Key Vault for secrets, App Insights for
// observability, and managed identity binding from Container Apps to ACR
// and Blob Storage.

targetScope = 'subscription'

@description('Azure region (westeurope, northeurope, eastus, etc).')
param location string = 'westeurope'

@description('Resource group name.')
param resourceGroupName string = 'nebius-homepage-rg'

@description('Image for the web app (e.g. acr.azurecr.io/nebius-homepage-web:<sha>).')
param webImage string

@description('Image for Directus (e.g. directus/directus:11.4.1).')
param directusImage string

@secure()
param postgresAdminPassword string
@secure()
param directusKey string
@secure()
param directusSecret string
@secure()
param typesenseAdminKey string

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
}

// TODO(team): break the resources below out into modules/ as the deploy grows.
// For now we define everything inline so a single `az deployment sub create`
// stands up a working stack.
//
// Resources to define inside `rg`:
//
//   1. Azure Container Apps environment (consumption profile, scale-to-zero).
//      type: Microsoft.App/managedEnvironments@2024-03-01
//
//   2. Postgres Flexible Server + database `directus`.
//      type: Microsoft.DBforPostgreSQL/flexibleServers@2024-03-01-preview
//      With administratorLogin = 'directus' and the secure parameter as password.
//      Add a `directus` database under it.
//
//   3. Cache for Redis (Basic C0 for dev, Standard C1+ for prod).
//      type: Microsoft.Cache/redis@2024-03-01
//
//   4. Storage Account + Blob container for Directus uploads.
//      type: Microsoft.Storage/storageAccounts@2024-01-01
//      With one container `directus-uploads`.
//
//   5. Container App `directus`: directusImage, env from Postgres + Redis + Storage,
//      ingress external on port 8055.
//      type: Microsoft.App/containerApps@2024-03-01
//
//   6. Container App `web`: webImage, env vars:
//        DIRECTUS_URL=https://<directus-fqdn>
//        DIRECTUS_ADMIN_TOKEN=<from Key Vault>
//        TYPESENSE_HOST/PORT/PROTOCOL/* (point at Typesense Cloud)
//        AUTH_COOKIE_SECURE=1
//      Ingress external on port 3000.
//
//   7. Front Door Standard: profile + endpoint + origin group + route
//      with cache rules:
//        /_next/static/*  → public, max-age=31536000, immutable
//        /api/*           → private, no-store
//        /*               → public, s-maxage=60, swr=300, sif-error=31536000
//      type: Microsoft.Cdn/profiles@2024-02-01 (Standard_AzureFrontDoor)
//
//   8. Custom domain + managed cert on the Front Door endpoint.

output rgId string = rg.id
output todo string = 'Fill in resource definitions per inline guide.'
