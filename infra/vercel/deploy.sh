#!/usr/bin/env bash
# Deploys apps/web to Vercel as a production deployment.
#
# Pre-flight:
#   - vercel CLI installed (`npm i -g vercel@latest`)
#   - vercel login (`vercel login`)
#   - DIRECTUS_URL (output of infra/azure/deploy.sh) exported or in env
#   - DIRECTUS_ADMIN_TOKEN (minted in Directus admin UI) exported or in env
#
# First-run extras:
#   - The script will link the project (asks scope + project name once,
#     then writes apps/web/.vercel/project.json which is checked in).
#
# Usage:
#   DIRECTUS_URL=https://nbdevsite-directus-xxxx.azurecontainerapps.io \
#   DIRECTUS_ADMIN_TOKEN=eyJxxx... \
#     ./infra/vercel/deploy.sh

set -euo pipefail

cd "$(dirname "$0")/../../apps/web"

# ---- Required env ----------------------------------------------------------

: "${DIRECTUS_URL:?DIRECTUS_URL is required (output of infra/azure/deploy.sh)}"
: "${DIRECTUS_ADMIN_TOKEN:?DIRECTUS_ADMIN_TOKEN is required (mint in Directus admin UI)}"

if ! command -v vercel >/dev/null 2>&1; then
  echo "ERROR: vercel CLI not installed. Run: npm i -g vercel@latest" >&2
  exit 1
fi

# ---- Link the project (idempotent) ----------------------------------------
#
# `vercel link --yes` will use the most recent linked project; on first run
# it'll prompt for scope + project name. After the first run, .vercel/
# is written and subsequent runs are non-interactive.

if [[ ! -f .vercel/project.json ]]; then
  echo "→ Linking project (first-run, interactive)..."
  vercel link --yes || true
fi

# ---- Push env vars (idempotent — overwrites if exists) --------------------

echo "→ Setting env vars (production)..."

# Helper: replace the env var if it exists, add if not.
set_env() {
  local name="$1" value="$2" target="${3:-production}"
  # Remove existing (silently OK if missing)
  vercel env rm "$name" "$target" --yes 2>/dev/null || true
  # Add fresh
  printf '%s' "$value" | vercel env add "$name" "$target" >/dev/null
  echo "  ✓ $name ($target)"
}

set_env DIRECTUS_URL "$DIRECTUS_URL" production
set_env DIRECTUS_URL "$DIRECTUS_URL" preview
set_env DIRECTUS_URL "$DIRECTUS_URL" development

set_env DIRECTUS_ADMIN_TOKEN "$DIRECTUS_ADMIN_TOKEN" production
set_env DIRECTUS_ADMIN_TOKEN "$DIRECTUS_ADMIN_TOKEN" preview

# AUTH_COOKIE_SECURE=1 so the session cookie has Secure flag in prod
set_env AUTH_COOKIE_SECURE "1" production
set_env AUTH_COOKIE_SECURE "1" preview

# ---- Deploy ---------------------------------------------------------------

echo ""
echo "→ Deploying to Vercel (prod)..."
vercel deploy --prod --yes

echo ""
echo "─────────────────────────────────────────────────"
echo "  ✓ Deployed"
echo "─────────────────────────────────────────────────"
echo ""
echo "Production URL is shown above ↑"
echo ""
echo "Smoke checks:"
echo "  curl -sSI https://<your-vercel-url>/  | head -3"
echo "  curl -sSI https://<your-vercel-url>/library  | head -3"
echo ""
