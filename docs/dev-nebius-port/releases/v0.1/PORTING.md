# Port-kit — v0.1 Data & SEO rails

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

### Builder/program Directus collections + typed SDK access layer  `directus-data-model`

Epic Platform foundation · I5/E3/med. dev.nebius.com already runs Directus but only as a headless asset store — none of the program data model exists. Define events, library_articles, projects, builders, team_members, pages, activities, credit_requests, ambassador_applications, feedback_items + the role-permission matrix, plus the three-mode typed SDK (server/admin, per-user, public). Ships first in v0.1 because almost every other card depends on these collections existing; it is one of the two independent foundations (with auth) so it can be built in parallel.

- `port-kit/apps/web/src/lib/directus.ts`
- `port-kit/apps/web/src/lib/types.ts`

### CMS catch-all pages via Page Constructor ([...slug])  `cms-page-constructor`

Epic Content hub · I3/E2/low. dev.nebius.com runs Page Constructor for its 4 fixed pages but has no generic CMS-driven catch-all to let DevRel spin up arbitrary marketing pages by slug. The [...slug] route looks up a published Directus pages row and renders its blocks JSON through Gravity Page Constructor with SEO/OG meta, skipping reserved slugs. Lands in v0.1 because the signup + program landings (v0.2) and any ad-hoc page reuse this renderer.

- `port-kit/apps/web/pages/[...slug].tsx`
- `port-kit/apps/web/src/components/CmsRenderer.tsx`
- `port-kit/apps/web/src/lib/pageConstructor.ts`

### First-party dynamic sitemap + per-page SEO/OG + ISR  `sitemap-seo-isr`

Epic Platform foundation · I3/E2/low. dev.nebius.com's sitemap is a sitemapindex that only delegates to nebius.com and docs.nebius.com — it does not enumerate its own pages, so first-party content is invisible to crawlers as its own surface. A dynamic sitemap.xml that enumerates public + CMS pages with per-page Head/OG meta, noindex for hidden pages, and ISR (60s) is foundational SEO. Ships in v0.1 so every read-only surface added afterward is crawlable from day one.

- `port-kit/apps/web/pages/sitemap.xml.ts`
- `port-kit/apps/web/pages/_document.tsx`

### Feedback / mockup-review capture API  `feedback-capture`

Epic Platform foundation · I2/E1/low. No lightweight on-site feedback channel exists (newsletter → HubSpot, feature requests → ideas.nebius.com). A POST /api/feedback that persists kind/message/page/email/user-agent to a feedback_items collection (with console.log fallback so it never drops feedback) is a one-endpoint, very-low-risk win useful during the porting/beta phase. Cheapest card; bundled into the v0.1 foundation.

- `port-kit/apps/web/pages/api/feedback.ts`

