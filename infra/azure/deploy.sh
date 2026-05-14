#!/usr/bin/env bash
# Deploys the full Nebius-mirror Azure stack:
#   ACR + Container Apps env + Postgres + Redis + Storage
#   + Container App: directus
#   + Container App: web
#   + Front Door Standard with cache rules
#
# Two-phase deploy:
#   1. Create RG + ACR (small bicep, ~2 min)
#   2. Build + push the web image (ACR Tasks, ~3 min)
#   3. Full bicep deploy (~10 min — Front Door cert issuance is the
#      long pole)
#
# Total: ~15 minutes end-to-end.
#
# Prereqs:
#   - az CLI installed and logged in (`az login`)
#   - Active subscription has Contributor role
#
# Usage:
#   ./infra/azure/deploy.sh
#
# Env overrides:
#   LOCATION=westeurope
#   RG_NAME=nebius-devsite-rg
#   NAME_PREFIX=nbdevsite

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
  DIRECTUS_ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:-admin@nebius-devsite.local}"

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

# ---- Phase 1: create RG + ACR ---------------------------------------------
#
# We need ACR to exist *before* we build the web image. Using a tiny inline
# template here so the rest of the stack stays in main.bicep.

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

# ---- Phase 2: build + push the web image via ACR Tasks ---------------------
#
# az acr build runs the Docker build inside Azure (no local Docker needed),
# pushes the result to the registry, and tags it with the SHA.

echo ""
echo "→ Phase 2: building $WEB_IMAGE_REPO:$WEB_IMAGE_TAG in ACR..."
az acr build \
  --registry "$ACR_NAME" \
  --image "$WEB_IMAGE_REPO:$WEB_IMAGE_TAG" \
  --image "$WEB_IMAGE_REPO:latest" \
  --file "$ROOT/infra/Dockerfile.web" \
  --platform linux/amd64 \
  "$ROOT" \
  --output table

# ---- Phase 3: deploy the full stack ----------------------------------------

# Bicep needs the namePrefix to derive the same ACR name we used above.
# We pass NAME_PREFIX through; the deterministic uniqueString() inside the
# module produces the same ACR name as we just created (the resource will
# be "imported" rather than re-created in Bicep's idempotent plan).

echo ""
echo "→ Phase 3: deploying the full stack (Bicep)..."
echo "  This takes ~10 min — Front Door cert issuance is the long pole."
az deployment sub create \
  --name "$DEPLOYMENT_NAME" \
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
      webImageTag="$WEB_IMAGE_TAG" \
      webImageRepo="$WEB_IMAGE_REPO" \
  --output table

# ---- Read outputs ----------------------------------------------------------

DIRECTUS_URL="$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.directusUrl.value' -o tsv)"
WEB_ORIGIN_URL="$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.webOriginUrl.value' -o tsv)"
FRONT_DOOR_URL="$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.frontDoorUrl.value' -o tsv)"
POSTGRES_HOST="$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.postgresHost.value' -o tsv)"

# ---- Post-deploy: patch PUBLIC_URL on Directus -----------------------------

DIRECTUS_APP="$(az containerapp list --resource-group "$RG_NAME" --query "[?contains(name, 'directus')].name | [0]" -o tsv)"
echo ""
echo "→ Patching PUBLIC_URL on $DIRECTUS_APP..."
az containerapp update \
  --resource-group "$RG_NAME" \
  --name "$DIRECTUS_APP" \
  --set-env-vars "PUBLIC_URL=$DIRECTUS_URL" \
  --output none

# ---- Wait for Directus to come up ------------------------------------------

echo ""
echo "→ Waiting for Directus..."
for i in {1..40}; do
  if curl -fsS "$DIRECTUS_URL/server/ping" >/dev/null 2>&1; then
    echo "  ✓ $DIRECTUS_URL reachable"
    break
  fi
  printf "."
  sleep 5
done

# ---- Done ------------------------------------------------------------------

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

Verify the Nebius-mirror headers come through Front Door:
  curl -sSI $FRONT_DOOR_URL | grep -iE 'x-azure-ref|x-fd-|x-cache'

Next: bootstrap Directus (schema + seed):

  # 1. Log in to mint a token (or use admin UI):
  curl -sX POST $DIRECTUS_URL/auth/login \\
       -H 'content-type: application/json' \\
       -d '{"email":"$DIRECTUS_ADMIN_EMAIL","password":"<from-secrets>"}' \\
    | jq -r .data.access_token

  # 2. Apply schema + seed:
  export DIRECTUS_URL=$DIRECTUS_URL
  export DIRECTUS_ADMIN_TOKEN=<from-step-above>
  node apps/directus/scripts/apply-schema.mjs
  node apps/directus/scripts/seed.mjs

After seeding, the web app already points at Directus — just refresh
$FRONT_DOOR_URL to see the seeded content.

To re-deploy with new code:
  ./infra/azure/deploy.sh    # rebuilds + redeploys the web image
EOF
