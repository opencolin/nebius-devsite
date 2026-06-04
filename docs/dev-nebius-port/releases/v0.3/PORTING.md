# Port-kit — v0.3 Community directories

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

### Community apps / 'built with Nebius' gallery (index + detail)  `apps-showcase`

Epic Community directories · I4/E2/low. dev.nebius.com has no project showcase anywhere — social proof of what builders ship is entirely missing. /apps is a grid of community + hackathon projects with cover cards, award/featured pills, and a segmented filter, plus per-slug detail pages with repo/demo links and builder byline. Low effort/risk read-only projects collection; leads v0.3 as the anchor of the community surface.

- `port-kit/apps/web/pages/apps/index.tsx`
- `port-kit/apps/web/pages/apps/[slug].tsx`
- `port-kit/apps/web/src/lib/projects.ts`

### Ecosystem umbrella + standalone integrations directory  `ecosystem-integrations-directories`

Epic Community directories · I4/E2/low. dev.nebius.com expresses integrations only as a static text matrix on the Token Factory page and a docs section — no browsable, filterable directory. /ecosystem is the canonical umbrella mixing community apps + ~85 partner integrations with a Kind+product filter and a 'Submit your project' GitHub-issue CTA; /integrations is the standalone partner directory. Grouped (same data + filter pattern) and placed in v0.3 next to apps; the R3F membrane hero is optional polish.

- `port-kit/apps/web/pages/ecosystem.tsx`
- `port-kit/apps/web/pages/integrations.tsx`
- `port-kit/apps/web/src/lib/ecosystem-partners.ts`
- `port-kit/apps/web/src/components/integrations/HeroSection.tsx`
- `port-kit/apps/web/src/components/integrations/Hero3D.tsx`

### DevRel team people directory + member detail  `team-directory`

Epic Community directories · I3/E2/low. dev.nebius.com has no people/team page — builders can't see or reach the DevRel advocates, and there's no human face to 'Builder Hours'. /team is a grid of advocates (bio, region, expertise) with a 'Book office hours' CTA when calendly_url is set, plus per-slug profiles. Read-only team_members; placed in v0.3 because it is the natural prerequisite for the office-hours booking gate in v1.1.

- `port-kit/apps/web/pages/team/index.tsx`
- `port-kit/apps/web/pages/team/[slug].tsx`

### Fellows / recognized community leaders roll-call  `fellows-directory`

Epic Community directories · I2/E1/low. No recognition surface for top community members exists. /fellows is a curated public roll-call from a static array, emitting noindex,nofollow while being curated. Lowest effort (static data, single page, no CMS/auth) and lowest impact (hidden, niche) — a cheap recognition lever bundled into the v0.3 community release. No hard dependency since it is fully static.

- `port-kit/apps/web/pages/fellows.tsx`
- `port-kit/apps/web/src/lib/fellows.ts`

