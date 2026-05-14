# Azure deployment — full Nebius mirror

This deploy mirrors `nebius.com`'s actual topology exactly:

```
   Front Door Standard ─── global edge, cache rules ───────┐
        │                                                   │
        │  HTTPS                                            │  x-azure-ref
        ▼                                                   │  x-fd-int-roxy-purgeid
   Container App: web (Next.js)                             │
        │                                                   │
        │  HTTPS (internal)                                 │
        ▼                                                   │
   Container App: directus (CMS) ◀──┐                       │
        │                            │                      │
        ├─▶ Postgres Flex Server     │  Container Apps      │
        ├─▶ Cache for Redis          │  environment         │
        └─▶ Storage Account/Blob     │  (consumption)       │
                                     │                      │
                              Log Analytics      ACR (web image source,
                              workspace          AcrPull via UAMI)
```

**Verification it's the same topology as nebius.com:**

```bash
$ curl -sSI https://nebius.com/ | grep -iE 'x-azure-ref|x-fd-|x-cache'
x-azure-ref: 20260514T173852Z-r1756c5b488hh4gphC1SJCrpxg0000000ff...
x-fd-int-roxy-purgeid: 0
x-cache: TCP_HIT

$ curl -sSI https://<your-front-door-url>/ | grep -iE 'x-azure-ref|x-fd-|x-cache'
x-azure-ref: 20260514T...
x-fd-int-roxy-purgeid: 0
x-cache: TCP_HIT
```

Both servers return the same Front Door platform headers.

## Cost rundown (~$80–100/mo for low traffic)

| Resource | Tier | Monthly |
|---|---|---|
| Front Door Standard | Base + low traffic | ~$35 |
| Container Apps env (consumption, scale-to-zero) | — | ~$0–15 |
| Container App: web | scale 1–5 | ~$5–15 |
| Container App: directus | scale 1–3 | ~$5–10 |
| Postgres Flexible Server | Burstable B1ms | ~$15 |
| Cache for Redis | Basic C0 | ~$16 |
| Storage Account + Blob | LRS, low traffic | ~$2 |
| Container Registry | Basic | ~$5 |
| Log Analytics workspace | 30-day retention, low ingest | ~$0–5 |
| **Total** | | **~$80–100** |

Teardown anytime drops cost to zero:

```bash
az group delete --name nebius-devsite-rg --yes --no-wait
```

## One-time setup

```bash
brew install azure-cli   # if you don't have it
az login
az account set --subscription <your-sub-id>   # if you have multiple
```

## Deploy

```bash
./infra/azure/deploy.sh
```

The script runs three phases:

1. **RG + ACR** (~2 min) — `az group create` + `az acr create`. Idempotent.
2. **Build + push the web image** (~3 min) — `az acr build` runs the Docker
   build inside Azure (no local Docker daemon needed) using `infra/Dockerfile.web`,
   tagged with the current git SHA and `latest`.
3. **Full stack via Bicep** (~10 min) — Postgres, Redis, Storage, Container
   Apps env, both Container Apps (directus + web), Front Door, cache rules.
   Front Door cert issuance is the long pole at the end.

Secrets are generated on the first run and saved to `.azure-secrets.local`
(gitignored). Subsequent runs reuse them so passwords don't churn.

## Bootstrap Directus content

The deploy creates an empty Directus. Apply the schema and seed content:

```bash
# 1. Mint an admin token (either via admin UI at /admin/login or via API):
curl -sX POST https://<directus-fqdn>/auth/login \
     -H 'content-type: application/json' \
     -d "{\"email\":\"admin@nebius-devsite.local\",\"password\":\"$(grep PASSWORD .azure-secrets.local | head -1 | cut -d= -f2-)\"}" \
  | jq -r .data.access_token

# 2. Apply schema and seed
export DIRECTUS_URL='https://<directus-fqdn>'
export DIRECTUS_ADMIN_TOKEN='<token>'

node apps/directus/scripts/apply-schema.mjs
node apps/directus/scripts/seed.mjs

# 3. (Optional) populate the long-form content
node apps/directus/scripts/import-upstream-library-bodies.mjs
node apps/directus/scripts/import-builders-from-projects.mjs
```

## Re-deploy after code changes

```bash
./infra/azure/deploy.sh
```

Rebuilds the web image with the current git SHA, pushes it to ACR, and the
Container App pulls the new image. Front Door cache invalidates per the
route's `s-maxage=60` (or use `az afd endpoint purge` for immediate).

## Cache rules

Set on the Front Door route via Bicep — visible in the Azure Portal at
**Front Door & CDN profiles → cacherules**:

| Path | Header set |
|---|---|
| `/_next/static/*` | `Cache-Control: public, max-age=31536000, immutable` |
| `/api/*` | `Cache-Control: private, no-store` |
| `/*` (everything else) | `Cache-Control: public, s-maxage=60, stale-while-revalidate=300, stale-if-error=31536000` |

These match what `curl -I https://nebius.com/` returns today.

## Locking down Postgres

The deploy adds a server-level firewall rule `AllowAll-DELETE-AFTER-SEED` so
the seed scripts can run from a laptop. After seeding, delete it:

```bash
PG="$(az postgres flexible-server list --query "[0].name" -o tsv)"
az postgres flexible-server firewall-rule delete \
  --resource-group nebius-devsite-rg \
  --name "$PG" \
  --rule-name AllowAll-DELETE-AFTER-SEED \
  --yes
```

Container Apps reach Postgres via the `AllowAllAzureServices` rule, which
stays.

## Future hardening

- VNet integration + private endpoints for Postgres / Redis / Storage
- Key Vault for secrets (currently inlined as Container App secrets)
- Custom Directus image with the schema baked in (skip the manual bootstrap)
- Custom domain + managed cert on Front Door
- Application Insights for both Container Apps
- Postgres Burstable B2s with HA for prod
