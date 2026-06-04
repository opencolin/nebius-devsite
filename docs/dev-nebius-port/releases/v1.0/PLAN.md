# Release v1.0 — Search & public chrome — public hub complete

Branch: `port/v1.0` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).

## Why this release

Milestone: the entire unauthenticated builder hub is done and discoverable. Search becomes real now that there is indexed content (library/events/apps) to search, with a Directus fallback that de-risks the optional Typesense dependency. Public mega-menus + theme + footer finish the navigation. Zero auth surface exposed yet.

Builds on: `v0.1` → `v0.2` → `v0.3` → `v0.4`.

## Cards in this release

### Unified search results page + header autocomplete  `search`

- **Epic:** Search & discovery · **Impact:** 4/5 · **Effort:** 3/5 · **Risk:** 🟡 med
- **Depends on:** `content-library` (Typed content library index + detail), `events-directory` (On-site events directory with live map + city filter), `apps-showcase` (Community apps / 'built with Nebius' gallery (index + detail))
- **Why:** dev.nebius.com ships the same Gravity SearchProposal header widget we use, but it has no real index and no results page — nothing on-site to search. Make it real: GET /api/search backs both the debounced top-6 dropdown and a server-rendered /search?q= grid; primary path queries Typesense, falls back to Directus _icontains across events + library + projects. v1.0 because it only makes sense once indexed content exists; the Directus fallback de-risks the optional Typesense provisioning.
- **Acceptance:**
  - [ ] Header search returns debounced top results; /search?q= renders a server-fetched grid (hits present in initial HTML) with Kind filter chips
  - [ ] With Typesense unconfigured, the Directus fallback still returns results across library/events/apps
  - [ ] Search index stays in sync on content publish (webhook or scheduled reindex documented)
- **Reference implementation (port-kit):**
  - `apps/web/pages/search.tsx`
  - `apps/web/pages/api/search.ts`
  - `apps/web/src/lib/typesense.ts`
  - `apps/web/src/components/search/SearchProposal.tsx`
  - `apps/web/src/lib/search-types.ts`

### Public chrome: Products/Docs mega-menus, theme toggle, footer, auth buttons  `chrome-public-nav`

- **Epic:** Site chrome · **Impact:** 2/5 · **Effort:** 1/5 · **Risk:** 🟢 low
- **Depends on:** — none
- **Why:** Split from the chrome gap (Design PM's hard recommendation) so the public half ships without waiting on portal/admin. dev.nebius.com has a thin public nav + footer; add Products/Docs mega-menus, a light/dark theme toggle, a richer footer linking otherwise-hidden pages, and Log in / Get started buttons. v1.0 to complete the public hub's navigation. Pure presentation, no deps.
- **Acceptance:**
  - [ ] Public nav exposes Products + Docs hover/click mega-menus with the 200ms grace behavior
  - [ ] Theme toggle switches light/dark and persists; footer links the full public surface
  - [ ] Log in / Get started buttons are present (wire to auth in v1.1)
- **Reference implementation (port-kit):**
  - `apps/web/src/components/chrome/PublicNav.tsx`
  - `apps/web/src/components/chrome/ProductsMenu.tsx`
  - `apps/web/src/components/chrome/DocsMenu.tsx`
  - `apps/web/src/components/chrome/Footer.tsx`
  - `apps/web/src/components/chrome/ThemeToggle.tsx`

## Port-kit

The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).

## Verification

- Type-check: `npx tsc --noEmit` in the target app.
- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.


