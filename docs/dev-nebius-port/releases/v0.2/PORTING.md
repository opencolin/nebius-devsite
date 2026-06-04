# Port-kit — v0.2 Content magnet

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

### Typed content library index + detail  `content-library`

Epic Content hub · I5/E3/low. dev.nebius.com scatters learning content as ad-hoc link cards across product pages with no unified, filterable, searchable index (the canonical library lives off-site on GitHub). A typography-first grid of workshops/videos/playlists/repos/blogs/docs with a sticky type+product filter, plus per-slug detail pages that embed YouTube players and render optional markdown. Leads v0.2 because it is the content backbone the product-page rails, search, and homepage spotlight all read from.

- `port-kit/apps/web/pages/library/index.tsx`
- `port-kit/apps/web/pages/library/[slug].tsx`

### CMS-driven resource rails on product landing pages  `product-page-resource-rails`

Epic Content hub · I4/E2/low. dev.nebius.com's /ai-cloud, /token-factory, /serverless resource sections are hand-curated static cards — adding a quickstart/video/guide means a content deploy. Rendering those rails dynamically from library_articles tagged surface=['ai-cloud'|...] (fetch-all + JS filter, since Directus JSON-array has no _contains; pinned floats to quickstarts) turns their three highest-traffic pages into DevRel-editable surfaces. v0.2 because it enhances pages that already exist and depends only on the library being the source of truth.

- `port-kit/apps/web/pages/ai-cloud.tsx`
- `port-kit/apps/web/pages/token-factory.tsx`
- `port-kit/apps/web/pages/serverless.tsx`
- `port-kit/apps/web/src/components/product/ResourceCard.tsx`

### Builders Network program landing (CMS-authored pitch)  `builders-program-landing`

Epic Content hub · I4/E2/low. dev.nebius.com's only 'community' surface is a Discord invite — no on-site home explains the builders program, tiers, and perks. /builders pairs (later) the leaderboard widget with CMS-authored program-pitch content rendered through Page Constructor, acting as the front door to the program. The marketing/explainer half is low-risk and shippable in v0.2 on the existing stack, independent of the live points ranking (which comes in v2.0).

- `port-kit/apps/web/pages/builders.tsx`
- `port-kit/apps/web/src/components/CmsRenderer.tsx`

### Signup / Builder Program join landing  `signup-builder-program-landing`

Epic Content hub · I3/E2/low. dev.nebius.com promotes a Startup Program but has no direct on-page apply/credits CTA — the card links out. A dedicated /signup join page with a $100-credits persuasion hero + a single CTA to console.nebius.com/signup, followed by reused home Page Constructor blocks, gives the program a real conversion landing. v0.2 because it is a marketing page assembled from existing CMS blocks; reuses the catch-all renderer.

- `port-kit/apps/web/pages/signup.tsx`
- `port-kit/apps/web/src/components/CmsRenderer.tsx`

