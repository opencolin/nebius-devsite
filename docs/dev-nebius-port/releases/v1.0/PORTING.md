# Port-kit — v1.0 Search & public chrome — public hub complete

Reference implementations lifted from the Builders repo for this release. These are
snapshots to PORT, not drop-in files.

## How to adapt

dev.nebius.com is already Next.js Pages Router + Gravity UI + Page Constructor + Directus, so the
component structure ports closely. When adapting each reference file:
- Keep Gravity UI primitives + their theme tokens; drop our bespoke CSS-module classnames where they have an equivalent.
- Repoint data reads at their Directus instance + the collections from the `directus-data-model` card.
- Preserve ISR `revalidate: 60` to match their `s-maxage=60` edge cache.
- Gate any authenticated surface behind the `auth-sessions` card (reconcile with auth.nebius.com SSO first).
- Strip demo-only bits (MockupBanner, sample/placeholder data) before shipping.

## Files by card

### Unified search results page + header autocomplete  `search`

Epic Search & discovery · I4/E3/med. dev.nebius.com ships the same Gravity SearchProposal header widget we use, but it has no real index and no results page — nothing on-site to search. Make it real: GET /api/search backs both the debounced top-6 dropdown and a server-rendered /search?q= grid; primary path queries Typesense, falls back to Directus _icontains across events + library + projects. v1.0 because it only makes sense once indexed content exists; the Directus fallback de-risks the optional Typesense provisioning.

- `port-kit/apps/web/pages/search.tsx`
- `port-kit/apps/web/pages/api/search.ts`
- `port-kit/apps/web/src/lib/typesense.ts`
- `port-kit/apps/web/src/components/search/SearchProposal.tsx`
- `port-kit/apps/web/src/lib/search-types.ts`

### Public chrome: Products/Docs mega-menus, theme toggle, footer, auth buttons  `chrome-public-nav`

Epic Site chrome · I2/E1/low. Split from the chrome gap (Design PM's hard recommendation) so the public half ships without waiting on portal/admin. dev.nebius.com has a thin public nav + footer; add Products/Docs mega-menus, a light/dark theme toggle, a richer footer linking otherwise-hidden pages, and Log in / Get started buttons. v1.0 to complete the public hub's navigation. Pure presentation, no deps.

- `port-kit/apps/web/src/components/chrome/PublicNav.tsx`
- `port-kit/apps/web/src/components/chrome/ProductsMenu.tsx`
- `port-kit/apps/web/src/components/chrome/DocsMenu.tsx`
- `port-kit/apps/web/src/components/chrome/Footer.tsx`
- `port-kit/apps/web/src/components/chrome/ThemeToggle.tsx`

