#!/usr/bin/env bash
# export-devsite.sh — build the PUBLIC devsite pages as a static export and copy
# them into the GitHub Pages repo at nebius-ecosystem-cookbook/devsite/.
#
# This replaces the wget snapshot with a real source build: `output: export`
# (gated by DEVSITE_EXPORT in next.config.js) + basePath, so every asset/route
# URL is correct under the /nebius-ecosystem-cookbook/devsite/ subpath with no
# post-processing. getStaticProps fetches live data from cms.buildspace.sh, so a
# valid DIRECTUS_ADMIN_TOKEN is required (the public collections are not
# anonymously readable).
#
# The 26 gated SSR pages (portal/admin/login/search/sitemap/office-hours) use
# getServerSideProps, which `output: export` cannot build — they are held out
# for the duration of the build and restored afterward (they are not part of the
# public devsite anyway).
#
# Usage:
#   # put the prod token in apps/web/.env.local (DIRECTUS_ADMIN_TOKEN=...), or:
#   DIRECTUS_ADMIN_TOKEN=xxxx ./scripts/export-devsite.sh
set -euo pipefail
cd "$(dirname "$0")/.."
WEB="apps/web"
DEST="../nebius-ecosystem-cookbook/devsite"
DIRECTUS="https://cms.buildspace.sh"

# Token: shell env wins; otherwise read it out of apps/web/.env.local.
if [ -z "${DIRECTUS_ADMIN_TOKEN:-}" ] && [ -f "$WEB/.env.local" ]; then
  DIRECTUS_ADMIN_TOKEN=$(grep -E '^DIRECTUS_ADMIN_TOKEN=' "$WEB/.env.local" | head -1 | cut -d= -f2- | tr -d '"'\''' )
fi
: "${DIRECTUS_ADMIN_TOKEN:?set DIRECTUS_ADMIN_TOKEN (prod cms.buildspace.sh token) in apps/web/.env.local or the environment}"
export DIRECTUS_ADMIN_TOKEN

echo "→ verifying token against $DIRECTUS …"
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
  -H "Authorization: Bearer $DIRECTUS_ADMIN_TOKEN" "$DIRECTUS/items/events?limit=1&fields=id")
[ "$code" = "200" ] || { echo "  token rejected (HTTP $code). Aborting."; exit 1; }
echo "  ok (HTTP 200)"

# Hold out the SSR pages (output:export can't build getServerSideProps).
STASH="$(mktemp -d)"
HOLDOUTS=(portal admin login.tsx search.tsx sitemap.xml.ts office-hours.tsx)
restore() { for h in "${HOLDOUTS[@]}"; do [ -e "$STASH/$h" ] && mv "$STASH/$h" "$WEB/pages/$h" || true; done; }
trap restore EXIT
echo "→ holding out ${#HOLDOUTS[@]} SSR page targets…"
for h in "${HOLDOUTS[@]}"; do [ -e "$WEB/pages/$h" ] && mv "$WEB/pages/$h" "$STASH/$h"; done

# Build the static export. Inline env so it beats .env.local's localhost values
# (Next leaves already-set process.env untouched).
echo "→ next build (static export)…"
( cd "$WEB" && rm -rf out && \
  DEVSITE_EXPORT=1 \
  DIRECTUS_URL="$DIRECTUS" \
  NEXT_PUBLIC_DIRECTUS_PUBLIC_URL="$DIRECTUS" \
  pnpm exec next build )

# Copy the export into the Pages repo.
echo "→ copying out/ → $DEST …"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$WEB/out/." "$DEST/"

echo "✓ exported $(find "$DEST" -name '*.html' | wc -l | tr -d ' ') html pages to $DEST"
