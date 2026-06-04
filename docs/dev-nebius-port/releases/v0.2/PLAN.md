# Release v0.2 — Content magnet

Branch: `port/v0.2` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).

## Why this release

Highest organic-traffic ROI, zero auth, reads only from the v0.1 data model. The typed library is the content backbone several later surfaces read from; the product-page rails upgrade dev.nebius.com's three highest-traffic pages into DevRel-editable CMS surfaces; the program + signup landings give the Startup/Builder program a real conversion home.

Builds on: `v0.1`.

## Cards in this release

### Typed content library index + detail  `content-library`

- **Epic:** Content hub · **Impact:** 5/5 · **Effort:** 3/5 · **Risk:** 🟢 low
- **Depends on:** `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** dev.nebius.com scatters learning content as ad-hoc link cards across product pages with no unified, filterable, searchable index (the canonical library lives off-site on GitHub). A typography-first grid of workshops/videos/playlists/repos/blogs/docs with a sticky type+product filter, plus per-slug detail pages that embed YouTube players and render optional markdown. Leads v0.2 because it is the content backbone the product-page rails, search, and homepage spotlight all read from.
- **Acceptance:**
  - [ ] /library renders published library_articles with working type + product filter chips showing live counts
  - [ ] /library/<slug> renders detail, embedding a YouTube player for VIDEO/WORKSHOP entries and markdown body when present
  - [ ] Each entry's external-source button is labeled by host (e.g. 'Watch on Nebius.com', 'View on GitHub')
- **Reference implementation (port-kit):**
  - `apps/web/pages/library/index.tsx`
  - `apps/web/pages/library/[slug].tsx`

### CMS-driven resource rails on product landing pages  `product-page-resource-rails`

- **Epic:** Content hub · **Impact:** 4/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `content-library` (Typed content library index + detail)
- **Why:** dev.nebius.com's /ai-cloud, /token-factory, /serverless resource sections are hand-curated static cards — adding a quickstart/video/guide means a content deploy. Rendering those rails dynamically from library_articles tagged surface=['ai-cloud'|...] (fetch-all + JS filter, since Directus JSON-array has no _contains; pinned floats to quickstarts) turns their three highest-traffic pages into DevRel-editable surfaces. v0.2 because it enhances pages that already exist and depends only on the library being the source of truth.
- **Acceptance:**
  - [ ] Each product page's quickstarts/videos/guides/repos/docs rails render from surface-tagged library_articles, no hardcoded cards
  - [ ] Pinned entries float into the quickstarts rail
  - [ ] Adding a tagged library entry in Directus makes it appear on the matching product page within the ISR window, no deploy
- **Reference implementation (port-kit):**
  - `apps/web/pages/ai-cloud.tsx`
  - `apps/web/pages/token-factory.tsx`
  - `apps/web/pages/serverless.tsx`
  - `apps/web/src/components/product/ResourceCard.tsx`

### Builders Network program landing (CMS-authored pitch)  `builders-program-landing`

- **Epic:** Content hub · **Impact:** 4/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `cms-page-constructor` (CMS catch-all pages via Page Constructor ([...slug]))
- **Why:** dev.nebius.com's only 'community' surface is a Discord invite — no on-site home explains the builders program, tiers, and perks. /builders pairs (later) the leaderboard widget with CMS-authored program-pitch content rendered through Page Constructor, acting as the front door to the program. The marketing/explainer half is low-risk and shippable in v0.2 on the existing stack, independent of the live points ranking (which comes in v2.0).
- **Acceptance:**
  - [ ] /builders renders program-pitch content from a Directus pages row (slug='builders') via Page Constructor
  - [ ] Page is in the sitemap and links to signup
  - [ ] Page renders fully without the leaderboard widget present (graceful when ranking data is not yet live)
- **Reference implementation (port-kit):**
  - `apps/web/pages/builders.tsx`
  - `apps/web/src/components/CmsRenderer.tsx`

### Signup / Builder Program join landing  `signup-builder-program-landing`

- **Epic:** Content hub · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `cms-page-constructor` (CMS catch-all pages via Page Constructor ([...slug]))
- **Why:** dev.nebius.com promotes a Startup Program but has no direct on-page apply/credits CTA — the card links out. A dedicated /signup join page with a $100-credits persuasion hero + a single CTA to console.nebius.com/signup, followed by reused home Page Constructor blocks, gives the program a real conversion landing. v0.2 because it is a marketing page assembled from existing CMS blocks; reuses the catch-all renderer.
- **Acceptance:**
  - [ ] /signup renders the persuasion hero + a single primary CTA to console signup
  - [ ] Supporting Page Constructor blocks are reused from the home pages row with header blocks stripped
  - [ ] Page is crawlable and in the sitemap
- **Reference implementation (port-kit):**
  - `apps/web/pages/signup.tsx`
  - `apps/web/src/components/CmsRenderer.tsx`

## Port-kit

The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).

## Verification

- Type-check: `npx tsc --noEmit` in the target app.
- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.


