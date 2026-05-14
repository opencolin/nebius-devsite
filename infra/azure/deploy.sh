#!/usr/bin/env bash
# Deploys the Azure backend stack and bootstraps Directus.
#
# Usage:
#   ./infra/azure/deploy.sh
#
# Prereqs:
#   - az CLI installed and logged in (`az login`)
#   - The active subscription has Contributor on the target subscription
#   - Optional: edit the params block below (location, namePrefix)
#
# Run from the repo root.

set -euo pipefail

# ---- Tunables --------------------------------------------------------------

LOCATION="${LOCATION:-westeurope}"
RG_NAME="${RG_NAME:-nebius-devsite-rg}"
NAME_PREFIX="${NAME_PREFIX:-nbdevsite}"
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-nebius-devsite-$(date +%Y%m%d-%H%M%S)}"

# ---- Generated secrets -----------------------------------------------------
#
# These are written to .azure-secrets.local (gitignored) so re-running deploy.sh
# uses the SAME secrets. Postgres rejects password rotation without explicit
# action, and the Directus admin password lookup in the bootstrap step
# needs to know what was set.

SECRETS_FILE=".azure-secrets.local"

if [[ -f "$SECRETS_FILE" ]]; then
  echo "Using existing secrets from $SECRETS_FILE"
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
else
  echo "Generating new secrets → $SECRETS_FILE"
  # Use openssl for cryptographically random secrets. Postgres rules:
  # 8-128 chars, must contain 3 of {upper, lower, digit, non-alphanumeric}.
  # Strip 'special' chars that confuse `az` arg parsing — base64 over /dev/urandom
  # gives plenty of strength with only [A-Za-z0-9+/=].
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
  echo "  Secrets generated. Loaded into env for this run."
fi

# ---- Verify prereqs --------------------------------------------------------

if ! command -v az >/dev/null 2>&1; then
  echo "ERROR: az CLI not installed. brew install azure-cli" >&2
  exit 1
fi

if ! az account show >/dev/null 2>&1; then
  echo "ERROR: not logged in to Azure. Run: az login" >&2
  exit 1
fi

SUB_ID="$(az account show --query id -o tsv)"
SUB_NAME="$(az account show --query name -o tsv)"
echo ""
echo "─────────────────────────────────────────────────"
echo "  Subscription: $SUB_NAME ($SUB_ID)"
echo "  Region:       $LOCATION"
echo "  Resource Grp: $RG_NAME"
echo "  Name prefix:  $NAME_PREFIX"
echo "  Deployment:   $DEPLOYMENT_NAME"
echo "─────────────────────────────────────────────────"
echo ""
read -p "Proceed? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

# ---- Register required RPs -------------------------------------------------
# These are idempotent — runs in seconds if already registered.

echo "→ Registering resource providers (idempotent)..."
for rp in \
  Microsoft.App \
  Microsoft.OperationalInsights \
  Microsoft.DBforPostgreSQL \
  Microsoft.Cache \
  Microsoft.Storage; do
  az provider register --namespace "$rp" --wait >/dev/null
  echo "  ✓ $rp"
done

# ---- Deploy ----------------------------------------------------------------

echo ""
echo "→ Deploying Bicep template (this takes ~5–10 minutes)..."
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
  --output table

# ---- Read outputs ----------------------------------------------------------

DIRECTUS_URL="$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.directusUrl.value' -o tsv)"
POSTGRES_HOST="$(az deployment sub show --name "$DEPLOYMENT_NAME" --query 'properties.outputs.postgresHost.value' -o tsv)"

# ---- Patch PUBLIC_URL on the Directus container --------------------------

DIRECTUS_APP="$(az containerapp list --resource-group "$RG_NAME" --query "[?contains(name, 'directus')].name | [0]" -o tsv)"
echo ""
echo "→ Patching PUBLIC_URL on $DIRECTUS_APP → $DIRECTUS_URL ..."
az containerapp update \
  --resource-group "$RG_NAME" \
  --name "$DIRECTUS_APP" \
  --set-env-vars "PUBLIC_URL=$DIRECTUS_URL" \
  --output table >/dev/null

# ---- Mint an admin token for the bootstrap step ---------------------------

echo ""
echo "→ Waiting for Directus to be reachable..."
for i in {1..40}; do
  if curl -fsS "$DIRECTUS_URL/server/ping" >/dev/null 2>&1; then
    echo "  ✓ Reachable"
    break
  fi
  printf "."
  sleep 5
done

echo ""
echo "─────────────────────────────────────────────────"
echo "  ✓ Stack live"
echo "─────────────────────────────────────────────────"
echo ""
echo "Directus URL:     $DIRECTUS_URL"
echo "Postgres host:    $POSTGRES_HOST"
echo "Admin email:      $DIRECTUS_ADMIN_EMAIL"
echo "Admin password:   (in $SECRETS_FILE)"
echo ""
echo "Next steps:"
echo "  1. Mint a Directus admin token via the API or admin UI at:"
echo "       $DIRECTUS_URL/admin/login"
echo "  2. Apply the schema:"
echo "       DIRECTUS_URL=$DIRECTUS_URL DIRECTUS_ADMIN_TOKEN=<token> \\"
echo "         node apps/directus/scripts/apply-schema.mjs"
echo "  3. Seed content:"
echo "       DIRECTUS_URL=$DIRECTUS_URL DIRECTUS_ADMIN_TOKEN=<token> \\"
echo "         node apps/directus/scripts/seed.mjs"
echo "  4. Deploy the web app to Vercel:"
echo "       DIRECTUS_URL=$DIRECTUS_URL ./infra/vercel/deploy.sh"
echo ""
