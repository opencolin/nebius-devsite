# Release v0.1 — Data & SEO rails

Branch: `port/v0.1` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).

## Why this release

Stand up the invisible foundation: the program data model + typed SDK, the CMS catch-all renderer, self-enumerating sitemap/SEO/ISR, and the feedback endpoint. Ships nothing user-visible but unblocks all of v0.x. The data-model foundation here and the auth foundation in v1.1 are independent and can be built in parallel by two people.

Builds on: _nothing (first release)_.

## Cards in this release

### Builder/program Directus collections + typed SDK access layer  `directus-data-model`

- **Epic:** Platform foundation · **Impact:** 5/5 · **Effort:** 3/5 · **Risk:** 🟡 med
- **Depends on:** — none
- **Why:** dev.nebius.com already runs Directus but only as a headless asset store — none of the program data model exists. Define events, library_articles, projects, builders, team_members, pages, activities, credit_requests, ambassador_applications, feedback_items + the role-permission matrix, plus the three-mode typed SDK (server/admin, per-user, public). Ships first in v0.1 because almost every other card depends on these collections existing; it is one of the two independent foundations (with auth) so it can be built in parallel.
- **Acceptance:**
  - [ ] All program collections exist with the role-permission matrix applied (builder can read/write only own rows via $CURRENT_USER; public read-only on published surfaces)
  - [ ] Typed SDK exposes directusServer(), directusAsUser(), directusPublic(), assetUrl() and is imported by at least one read-only page
  - [ ] A schema snapshot is versioned so the team can re-apply with directus schema apply
- **Reference implementation (port-kit):**
  - `apps/web/src/lib/directus.ts`
  - `apps/web/src/lib/types.ts`

### CMS catch-all pages via Page Constructor ([...slug])  `cms-page-constructor`

- **Epic:** Content hub · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** dev.nebius.com runs Page Constructor for its 4 fixed pages but has no generic CMS-driven catch-all to let DevRel spin up arbitrary marketing pages by slug. The [...slug] route looks up a published Directus pages row and renders its blocks JSON through Gravity Page Constructor with SEO/OG meta, skipping reserved slugs. Lands in v0.1 because the signup + program landings (v0.2) and any ad-hoc page reuse this renderer.
- **Acceptance:**
  - [ ] Visiting /<slug> for a published pages row renders its blocks through Page Constructor with correct SEO/OG tags
  - [ ] Reserved slugs with dedicated .tsx files are not shadowed by the catch-all
  - [ ] An unpublished/missing slug returns 404 (with ISR revalidate)
- **Reference implementation (port-kit):**
  - `apps/web/pages/[...slug].tsx`
  - `apps/web/src/components/CmsRenderer.tsx`
  - `apps/web/src/lib/pageConstructor.ts`

### First-party dynamic sitemap + per-page SEO/OG + ISR  `sitemap-seo-isr`

- **Epic:** Platform foundation · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** dev.nebius.com's sitemap is a sitemapindex that only delegates to nebius.com and docs.nebius.com — it does not enumerate its own pages, so first-party content is invisible to crawlers as its own surface. A dynamic sitemap.xml that enumerates public + CMS pages with per-page Head/OG meta, noindex for hidden pages, and ISR (60s) is foundational SEO. Ships in v0.1 so every read-only surface added afterward is crawlable from day one.
- **Acceptance:**
  - [ ] /sitemap.xml self-enumerates all public + published CMS routes (not just an index delegating off-site)
  - [ ] Each public page emits title/description/OG tags; hidden pages emit noindex,nofollow
  - [ ] CMS-backed pages revalidate within 60s of a Directus edit
- **Reference implementation (port-kit):**
  - `apps/web/pages/sitemap.xml.ts`
  - `apps/web/pages/_document.tsx`

### Feedback / mockup-review capture API  `feedback-capture`

- **Epic:** Platform foundation · **Impact:** 2/5 · **Effort:** 1/5 · **Risk:** 🟢 low
- **Depends on:** `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** No lightweight on-site feedback channel exists (newsletter → HubSpot, feature requests → ideas.nebius.com). A POST /api/feedback that persists kind/message/page/email/user-agent to a feedback_items collection (with console.log fallback so it never drops feedback) is a one-endpoint, very-low-risk win useful during the porting/beta phase. Cheapest card; bundled into the v0.1 foundation.
- **Acceptance:**
  - [ ] POST /api/feedback persists a row to feedback_items and returns 200
  - [ ] If the collection is missing, the endpoint logs and still returns success (never drops feedback)
  - [ ] Endpoint is rate-limited / not abusable as an open relay
- **Reference implementation (port-kit):**
  - `apps/web/pages/api/feedback.ts`

## Port-kit

The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).

## Verification

- Type-check: `npx tsc --noEmit` in the target app.
- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.


