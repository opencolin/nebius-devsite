# Azure deployment

Backend stack for nebius-devsite: Directus + Postgres + Redis + Blob storage,
running on **Azure Container Apps**. The Next.js web app is hosted on
**Vercel** — it talks to the Directus URL emitted as an output here.

```
   Vercel (Next.js, edge)
            │
            │  HTTPS
            ▼
   Container App: directus  ◀──┐
            │                  │
            ├─▶ Postgres Flex Server  (~$15/mo)
            ├─▶ Cache for Redis       (~$16/mo)
            └─▶ Storage Account/Blob  (~$2/mo)
                                       │
                          Container Apps env (consumption tier, scale-to-zero)
                          Log Analytics workspace
```

Total estimated cost: **~$40/mo** for low-traffic. Front Door was deliberately
omitted — Vercel fronts the web traffic, so the Front Door spend (~$35) on the
backend wouldn't earn its keep.

## One-time setup

```bash
brew install azure-cli   # if you don't have it
az login
az account set --subscription <your-sub-id>   # if you have multiple
```

## Deploy the backend

```bash
./infra/azure/deploy.sh
```

The script:
1. Generates random secrets on first run (saved to `.azure-secrets.local`,
   gitignored). Subsequent runs reuse the same secrets.
2. Registers the required resource providers (idempotent).
3. Runs `az deployment sub create` with the Bicep template — takes ~5–10 min.
4. Patches `PUBLIC_URL` on the Directus container with the freshly-minted FQDN.
5. Waits for `/server/ping` to come back 200.
6. Prints the Directus URL + next-step commands.

## Bootstrap Directus content

The deploy creates an empty Directus. Apply the schema and seed content:

```bash
# 1. Mint an admin token
#    Either: log into https://<directus-url>/admin with the email/password
#            from .azure-secrets.local, then User Directory → Admin User →
#            Token (rotate / copy)
#    Or: API call:
#         curl -X POST https://<directus-url>/auth/login \
#              -H 'content-type: application/json' \
#              -d '{"email":"admin@nebius-devsite.local","password":"<from-secrets>"}'

export DIRECTUS_URL='https://<from-deploy-output>'
export DIRECTUS_ADMIN_TOKEN='<from-step-above>'

# 2. Apply the schema
node apps/directus/scripts/apply-schema.mjs

# 3. Seed content
node apps/directus/scripts/seed.mjs

# 4. (Optional) import upstream library bodies
node apps/directus/scripts/import-upstream-library-bodies.mjs

# 5. (Optional) import builders from project repos
node apps/directus/scripts/import-builders-from-projects.mjs
```

## Deploy the web to Vercel

```bash
DIRECTUS_URL='https://<from-deploy-output>' \
DIRECTUS_ADMIN_TOKEN='<from-bootstrap>' \
  ./infra/vercel/deploy.sh
```

First run will prompt for Vercel scope + project name; subsequent runs are
non-interactive (uses `apps/web/.vercel/project.json`).

## Cost rollback / teardown

Everything is in one resource group, so:

```bash
az group delete --name nebius-devsite-rg --yes --no-wait
```

…drops the entire monthly cost to zero.

## Future hardening (not in v1)

- VNet integration + private endpoints for Postgres / Redis / Storage
- Key Vault for secrets (currently inlined as Container App secrets)
- Azure Container Registry + custom Directus image with the schema baked in
- Front Door in front of the Container App if we move web hosting off Vercel
- Application Insights for Directus telemetry
- Azure Database for PostgreSQL Flexible Server: bump to Burstable B2s (HA)
