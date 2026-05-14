# Azure deployment

Mirrors Nebius.com's hosting topology: Next.js origin in **Azure Container
Apps**, fronted by **Azure Front Door** for global edge caching. Directus runs
as a sibling Container App backed by **Azure Database for PostgreSQL**, with
**Azure Cache for Redis** and uploads in **Azure Blob Storage**. Search uses
**Typesense Cloud** (no self-hosting in prod).

The `x-azure-ref` and `x-fd-int-roxy-purgeid` headers visible on
`curl -I https://nebius.com` are the platform-side artifacts of this same
Front Door setup.

## One-time setup

```bash
az login
az account set --subscription <sub-id>

# Build and push the web image (Azure Container Registry)
az acr login --name <acr-name>
docker buildx build --platform linux/amd64 \
  -f infra/Dockerfile.web -t <acr-name>.azurecr.io/nebius-homepage-web:$(git rev-parse --short HEAD) . \
  --build-arg NEXT_PUBLIC_DIRECTUS_PUBLIC_URL=https://assets.your-domain.com \
  --build-arg NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID \
  --push
```

## Deploy

```bash
az deployment sub create \
  --location westeurope \
  --template-file infra/azure/main.bicep \
  --parameters \
      webImage='<acr-name>.azurecr.io/nebius-homepage-web:<sha>' \
      directusImage='directus/directus:11.4.1' \
      postgresAdminPassword='<secret>' \
      directusKey='<uuid>' \
      directusSecret='<long-random>' \
      typesenseAdminKey='<from-typesense-cloud>'
```

## Cache rules (set on the Front Door route)

| Path | Cache control |
|---|---|
| `/_next/static/*` | `public, max-age=31536000, immutable` |
| `/api/*` | `private, no-store` |
| `/*` (HTML) | `public, s-maxage=60, stale-while-revalidate=300, stale-if-error=31536000` |

These match the HTML cache header `nebius.com` serves today.

## Rollback

`az containerapp revision list --name nebius-homepage-web` to see active
revisions; `az containerapp revision activate --revision <name>` flips traffic
back instantly. Front Door cache purge: `az afd endpoint purge`.
