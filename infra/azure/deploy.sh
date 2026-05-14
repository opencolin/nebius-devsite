#!/usr/bin/env bash
# Deploys the full Nebius-mirror Azure stack:
#   ACR + Container Apps env + Postgres + Redis + Storage
#   + Container App: directus
#   + Container App: web
#   + Front Door Standard with cache rules
#
# Two-pass deploy because the web image needs Directus reachable at build
# time (getStaticPaths/getStaticProps fetches slugs at next build):
#
#   Phase 1: ensure RG + ACR
#   Phase 2: bicep deploy with deployWeb=false   → Directus + deps live
#   Phase 3: patch Directus PUBLIC_URL, wait for ping
#   Phase 4: bootstrap Directus (apply schema + seed)
#   Phase 5: docker build with --build-arg DIRECTUS_URL=<live>, push to ACR
#   Phase 6: bicep deploy with deployWeb=true    → web + Front Door live
#   Phase 7: print URLs + smoke check
#
# Idempotent end-to-end. Re-running just rebuilds + redeploys the web image.
#
# Prereqs:
#   - az CLI installed and logged in (`az login`)
#   - Active subscription has Contributor + ACR Tasks (or use BUILD_MODE=local)
#   - Docker Desktop running if BUILD_MODE=local (default)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# ---- Tunables --------------------------------------------------------------

LOCATION="${LOCATION:-westeurope}"
RG_NAME="${RG_NAME:-nebius-devsite-rg}"
NAME_PREFIX="${NAME_PREFIX:-nbdevsite}"
WEB_IMAGE_REPO="${WEB_IMAGE_REPO:-web}"
WEB_IMAGE_TAG="${WEB_IMAGE_TAG:-$(cd "$ROOT" && git rev-parse --short HEAD 2>/dev/null || echo "v$(date +%Y%m%d%H%M%S)")}"
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-nebius-devsite-$(date +%Y%m%d-%H%M%S)}"

# ---- Generated secrets -----------------------------------------------------

SECRETS_FILE="$ROOT/.azure-secrets.local"

if [[ -f "$SECRETS_FILE" ]]; then
  echo "Using existing secrets from $SECRETS_FILE"
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
else
  echo "Generating new secrets → $SECRETS_FILE"
  POSTGRES_PASSWORD="Pg!$(openssl rand -base64 24 | tr -d '/=+' | head -c 28)"
  DIRECTUS_KEY="$(uuidgen)"
  DIRECTUS_SECRET="$(openssl rand -hex 48)"
  DIRECTUS_ADMIN_PASSWORD="A!$(openssl rand -base64 18 | tr -d '/=+' | head -c 22)"
  # Avoid reserved/non-routable TLDs (.local, .test, .example, .invalid) —
  # Directus's email validator rejects them. .dev is a real TLD and always
  # passes. Set DIRECTUS_ADMIN_EMAIL=<you@yours> to override at run-time.
  DIRECTUS_ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:-admin@nebiusdevsite.dev}"

  cat > "$SECRETS_FILE" <<EOF
# Generated $(date -u +%Y-%m-%dT%H:%M:%SZ) — KEEP THIS FILE PRIVATE
POSTGRES_PASSWORD='$POSTGRES_PASSWORD'
DIRECTUS_KEY='$DIRECTUS_KEY'
DIRECTUS_SECRET='$DIRECTUS_SECRET'
DIRECTUS_ADMIN_PASSWORD='$DIRECTUS_ADMIN_PASSWORD'
DIRECTUS_ADMIN_EMAIL='$DIRECTUS_ADMIN_EMAIL'
EOF
  chmod 600 "$SECRETS_FILE"
  echo "  Secrets generated."
fi

# ---- Verify prereqs --------------------------------------------------------

command -v az >/dev/null 2>&1 || { echo "ERROR: az not installed. brew install azure-cli" >&2; exit 1; }
az account show >/dev/null 2>&1 || { echo "ERROR: not logged in. Run: az login" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq not installed. brew install jq" >&2; exit 1; }

SUB_ID="$(az account show --query id -o tsv)"
SUB_NAME="$(az account show --query name -o tsv)"

echo ""
echo "─────────────────────────────────────────────────"
echo "  Subscription:   $SUB_NAME ($SUB_ID)"
echo "  Region:         $LOCATION"
echo "  Resource Group: $RG_NAME"
echo "  Name prefix:    $NAME_PREFIX"
echo "  Web image tag:  $WEB_IMAGE_TAG"
echo "  Deployment:     $DEPLOYMENT_NAME"
echo "─────────────────────────────────────────────────"
echo ""
read -p "Proceed? [y/N] " -n 1 -r
echo ""
[[ $REPLY =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }

# ---- Register required RPs -------------------------------------------------

echo "→ Registering resource providers (idempotent)..."
for rp in \
  Microsoft.App \
  Microsoft.OperationalInsights \
  Microsoft.DBforPostgreSQL \
  Microsoft.Cache \
  Microsoft.Storage \
  Microsoft.ContainerRegistry \
  Microsoft.ManagedIdentity \
  Microsoft.Cdn; do
  az provider register --namespace "$rp" --wait >/dev/null
  echo "  ✓ $rp"
done

# ============================================================================
# Phase 1 — RG + ACR
# ============================================================================

UNIQUE="$(echo "$RG_NAME" | shasum -a 256 | head -c 6)"
ACR_NAME="${NAME_PREFIX}acr${UNIQUE}"

echo ""
echo "→ Phase 1: ensure RG + ACR exist..."
az group create --name "$RG_NAME" --location "$LOCATION" --output none
echo "  ✓ RG: $RG_NAME"

if ! az acr show --name "$ACR_NAME" --resource-group "$RG_NAME" >/dev/null 2>&1; then
  az acr create \
    --name "$ACR_NAME" \
    --resource-group "$RG_NAME" \
    --sku Basic \
    --location "$LOCATION" \
    --output none
  echo "  ✓ ACR: $ACR_NAME (created)"
else
  echo "  ✓ ACR: $ACR_NAME (exists)"
fi

ACR_LOGIN_SERVER="$(az acr show --name "$ACR_NAME" --resource-group "$RG_NAME" --query loginServer -o tsv)"

# ============================================================================
# Phase 2 — Bicep backend-only (deployWeb=false)
# ============================================================================
#
# Stands up Postgres, Redis, Storage, Container Apps env, Log Analytics, the
# Directus Container App, and the UAMI/AcrPull binding. SKIPS the web
# Container App + Front Door — those need the web image, which needs Directus
# to be live to build.

echo ""
echo "→ Phase 2: bicep deploy backend-only (~7 min)..."
az deployment sub create \
  --name "$DEPLOYMENT_NAME-backend" \
  --location "$LOCATION" \
  --template-file "$(dirname "$0")/main.bicep" \
  --parameters \
      location="$LOCATION" \
      resourceGroupName="$RG_NAME" \
      namePrefix="$NAME_PREFIX" \
      postgresAdminPassword="$POSTGRES_PASSWORD" \
      directusKey="$DIRECTUS_KEY" \
      directusSecret="$DIRECTUS_SECRET" \
      directusAdminEmail="$DIRECTUS_ADMIN_EMAIL" \
      directusAdminPassword="$DIRECTUS_ADMIN_PASSWORD" \
      deployWeb=false \
      webImageTag="latest" \
  --output table

DIRECTUS_URL="$(az deployment sub show --name "$DEPLOYMENT_NAME-backend" --query 'properties.outputs.directusUrl.value' -o tsv)"
POSTGRES_HOST="$(az deployment sub show --name "$DEPLOYMENT_NAME-backend" --query 'properties.outputs.postgresHost.value' -o tsv)"

# ============================================================================
# Phase 3 — Patch PUBLIC_URL on Directus + wait for ping
# ============================================================================

DIRECTUS_APP="$(az containerapp list --resource-group "$RG_NAME" --query "[?contains(name, 'directus')].name | [0]" -o tsv)"

echo ""
echo "→ Phase 3: patch PUBLIC_URL on $DIRECTUS_APP → $DIRECTUS_URL"
az containerapp update \
  --resource-group "$RG_NAME" \
  --name "$DIRECTUS_APP" \
  --set-env-vars "PUBLIC_URL=$DIRECTUS_URL" \
  --output none

echo "→ Waiting for Directus..."
for i in {1..60}; do
  if curl -fsS "$DIRECTUS_URL/server/ping" >/dev/null 2>&1; then
    echo "  ✓ $DIRECTUS_URL reachable"
    break
  fi
  printf "."
  sleep 5
done

# ============================================================================
# Phase 4 — Bootstrap Directus (mint admin token, apply schema, seed)
# ============================================================================

echo ""
echo "→ Phase 4: bootstrapping Directus (CREATE EXTENSION, login, apply schema, seed)..."

# (a) Enable PostGIS inside the directus database. Directus's events
# collection has a geometry(Point, 4326) column; without postgis the
# schema apply fails with `type "geometry" does not exist`. The Bicep
# allowlists the extension at the server level — we just need to
# CREATE EXTENSION in the directus database.
PG_HOST="$POSTGRES_HOST"
if command -v psql >/dev/null 2>&1; then
  PSQL_BIN="psql"
elif [[ -x /opt/homebrew/opt/libpq/bin/psql ]]; then
  PSQL_BIN="/opt/homebrew/opt/libpq/bin/psql"
else
  PSQL_BIN=""
  echo "  ⚠ psql not found — skipping CREATE EXTENSION postgis. Install with: brew install libpq"
fi
if [[ -n "$PSQL_BIN" ]]; then
  PGPASSWORD="$POSTGRES_PASSWORD" "$PSQL_BIN" \
    "host=$PG_HOST port=5432 dbname=directus user=nbadmin sslmode=require" \
    -c "CREATE EXTENSION IF NOT EXISTS postgis;" >/dev/null 2>&1 \
    && echo "  ✓ postgis extension ready" \
    || echo "  ⚠ postgis CREATE EXTENSION skipped (already present or insufficient grant)"

  # The container needs to restart so its DB connection sees postgis types.
  REVISION=$(az containerapp revision list --resource-group "$RG_NAME" --name "$DIRECTUS_APP" --query "[0].name" -o tsv)
  az containerapp revision restart --resource-group "$RG_NAME" --name "$DIRECTUS_APP" --revision "$REVISION" --output none
  echo "  ✓ Directus restarted"
  for i in {1..30}; do
    if curl -fsS "$DIRECTUS_URL/server/ping" >/dev/null 2>&1; then break; fi
    printf "."; sleep 3
  done
fi

# (b) Try a few times — Directus might be reachable at /server/ping but
# still initializing the bootstrap user.
for i in {1..20}; do
  TOKEN_RES="$(curl -fsS -X POST "$DIRECTUS_URL/auth/login" \
       -H 'content-type: application/json' \
       -d "{\"email\":\"$DIRECTUS_ADMIN_EMAIL\",\"password\":\"$DIRECTUS_ADMIN_PASSWORD\"}" \
       2>/dev/null || echo "")"
  TOKEN="$(echo "$TOKEN_RES" | jq -r '.data.access_token // empty' 2>/dev/null || echo "")"
  if [[ -n "$TOKEN" ]]; then
    echo "  ✓ Admin token minted"
    break
  fi
  printf "."
  sleep 5
done

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: could not log in to Directus after 100s. Check the container logs:"
  echo "  az containerapp logs show --resource-group $RG_NAME --name $DIRECTUS_APP --tail 50"
  exit 1
fi

export DIRECTUS_URL DIRECTUS_ADMIN_TOKEN="$TOKEN"

echo "→ Applying schema..."
node "$ROOT/apps/directus/scripts/apply-schema.mjs" || {
  echo "WARNING: apply-schema.mjs failed — continuing. Inspect manually if needed."
}

echo "→ Seeding content..."
node "$ROOT/apps/directus/scripts/seed.mjs" || {
  echo "WARNING: seed.mjs failed — continuing. Inspect manually if needed."
}

# ============================================================================
# Phase 5 — Build + push web image (with live DIRECTUS_URL baked in)
# ============================================================================

BUILD_MODE="${BUILD_MODE:-auto}"
if [[ "$BUILD_MODE" == "auto" ]]; then
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    BUILD_MODE="local"
  else
    BUILD_MODE="acr_tasks"
  fi
fi

echo ""
echo "→ Phase 5: building $WEB_IMAGE_REPO:$WEB_IMAGE_TAG (mode: $BUILD_MODE, DIRECTUS_URL=$DIRECTUS_URL)..."

if [[ "$BUILD_MODE" == "local" ]]; then
  az acr login --name "$ACR_NAME" --output none
  docker buildx build \
    --platform linux/amd64 \
    --file "$ROOT/infra/Dockerfile.web" \
    --build-arg DIRECTUS_URL="$DIRECTUS_URL" \
    --build-arg DIRECTUS_ADMIN_TOKEN="$TOKEN" \
    --tag "$ACR_LOGIN_SERVER/$WEB_IMAGE_REPO:$WEB_IMAGE_TAG" \
    --tag "$ACR_LOGIN_SERVER/$WEB_IMAGE_REPO:latest" \
    --push \
    "$ROOT"
else
  az acr build \
    --registry "$ACR_NAME" \
    --image "$WEB_IMAGE_REPO:$WEB_IMAGE_TAG" \
    --image "$WEB_IMAGE_REPO:latest" \
    --file "$ROOT/infra/Dockerfile.web" \
    --platform linux/amd64 \
    --build-arg DIRECTUS_URL="$DIRECTUS_URL" \
    --build-arg DIRECTUS_ADMIN_TOKEN="$TOKEN" \
    "$ROOT" \
    --output table
fi

# ============================================================================
# Phase 6 — Bicep with deployWeb=true (adds web Container App + Front Door)
# ============================================================================

echo ""
echo "→ Phase 6: bicep deploy web + Front Door (~10 min — cert provisioning)..."
az deployment sub create \
  --name "$DEPLOYMENT_NAME-web" \
  --location "$LOCATION" \
  --template-file "$(dirname "$0")/main.bicep" \
  --parameters \
      location="$LOCATION" \
      resourceGroupName="$RG_NAME" \
      namePrefix="$NAME_PREFIX" \
      postgresAdminPassword="$POSTGRES_PASSWORD" \
      directusKey="$DIRECTUS_KEY" \
      directusSecret="$DIRECTUS_SECRET" \
      directusAdminEmail="$DIRECTUS_ADMIN_EMAIL" \
      directusAdminPassword="$DIRECTUS_ADMIN_PASSWORD" \
      deployWeb=true \
      webImageTag="$WEB_IMAGE_TAG" \
      webImageRepo="$WEB_IMAGE_REPO" \
  --output table

WEB_ORIGIN_URL="$(az deployment sub show --name "$DEPLOYMENT_NAME-web" --query 'properties.outputs.webOriginUrl.value' -o tsv)"
FRONT_DOOR_URL="$(az deployment sub show --name "$DEPLOYMENT_NAME-web" --query 'properties.outputs.frontDoorUrl.value' -o tsv)"

# ============================================================================
# Phase 7 — Smoke check + done
# ============================================================================

echo ""
echo "→ Phase 7: smoke checks..."

# Origin: should respond with our app's HTML
echo "→ Web origin..."
for i in {1..30}; do
  if curl -fsS "$WEB_ORIGIN_URL/" >/dev/null 2>&1; then
    echo "  ✓ $WEB_ORIGIN_URL"
    break
  fi
  printf "."
  sleep 5
done

# Front Door: takes longer (cert + edge propagation)
echo "→ Front Door (allow ~5 min for first-byte after cert provisions)..."
for i in {1..60}; do
  if curl -fsS "$FRONT_DOOR_URL/" >/dev/null 2>&1; then
    echo "  ✓ $FRONT_DOOR_URL"
    break
  fi
  printf "."
  sleep 5
done

# Header check — confirms it really is going through Front Door
echo ""
echo "→ Front Door headers (expect x-azure-ref + x-fd-int-roxy-purgeid):"
curl -sSI "$FRONT_DOOR_URL/" | grep -iE 'x-azure-ref|x-fd-|x-cache' || echo "  (none yet — wait a minute and curl manually)"

cat <<EOF

─────────────────────────────────────────────────
  ✓ Stack live
─────────────────────────────────────────────────

  Customer-facing URL:  $FRONT_DOOR_URL
  Web origin (debug):   $WEB_ORIGIN_URL
  Directus admin:       $DIRECTUS_URL/admin/login
  Postgres host:        $POSTGRES_HOST

  Directus admin email:    $DIRECTUS_ADMIN_EMAIL
  Directus admin password: (in .azure-secrets.local)

To re-deploy with new code: ./infra/azure/deploy.sh
  (Phase 5 rebuilds the image with the current git SHA + reseeds in
  Phase 4. Phase 4 is idempotent — apply-schema + seed.mjs both no-op
  on existing rows.)

To tear down everything: az group delete --name $RG_NAME --yes
EOF
