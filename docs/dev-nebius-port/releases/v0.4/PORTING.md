# Port-kit — v0.4 Events & a living homepage

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

### On-site events directory with live map + city filter  `events-directory`

Epic Events & homepage liveness · I5/E3/med. dev.nebius.com has no on-site events surface — 'Hackathons & Events' and 'Builder Hours' are outbound links to nebius.com/events. An on-site dark Leaflet map with click-to-filter city pins, upcoming-vs-past split, city-alias folding, venue-local times, and Luma/Nebius RSVP deep-links keeps builders in the funnel. Leads v0.4 as the signature experience; the homepage dynamics depend on it. Medium risk only because Leaflet is client-only and needs SSR-safe dynamic import.

- `port-kit/apps/web/pages/events/index.tsx`
- `port-kit/apps/web/src/components/events/EventsMap.tsx`
- `port-kit/apps/web/src/lib/event-url.ts`
- `port-kit/apps/web/src/lib/format.ts`

### Homepage live events-map hero  `homepage-events-map-hero`

Epic Events & homepage liveness · I3/E2/med. dev.nebius.com's homepage hero is a static 'choose a starting point' block. A full-bleed Leaflet globe plotting every located event + a 'Start building' CTA + a location-count footnote is a distinctive proof-of-activity above the fold that reinforces the events directory. v0.4 alongside events. Medium risk because the map/mesh are client-only above-the-fold JS that must be SSR-guarded and perf-budgeted.

- `port-kit/apps/web/pages/index.tsx`
- `port-kit/apps/web/src/components/hero/HeroEventsMap.tsx`
- `port-kit/apps/web/src/components/hero/PhosphorMesh.tsx`

### Homepage dynamic sections (active events, workshop + builder spotlight)  `homepage-dynamic-content-sections`

Epic Events & homepage liveness · I3/E2/low. dev.nebius.com's homepage is entirely static. Threading live data through it — ActiveEvents (next 3 upcoming/live as RSVP cards), WorkshopSpotlight (one curated library workshop + related rail, pinned-aware), BuilderSpotlight (one project/month deterministically) — keeps the landing page fresh without manual edits. v0.4 because each section depends on its source collection now existing.

- `port-kit/apps/web/src/components/marketing/ActiveEvents.tsx`
- `port-kit/apps/web/src/components/marketing/WorkshopSpotlight.tsx`
- `port-kit/apps/web/src/components/marketing/BuilderSpotlight.tsx`
- `port-kit/apps/web/src/lib/event-url.ts`

### Homepage static marketing sections (coding-agents, ecosystem marquee, programs, etc.)  `homepage-static-marketing-sections`

Epic Events & homepage liveness · I2/E2/low. Mostly at parity in spirit — dev.nebius.com already has product-router cards, use-cases, Community, and Programs (Startup Program, Nebius Academy). The deltas to preserve in a port: a CodingAgents/IDE section (Cursor, Cline, OpenClaw) they lack, an EcosystemPartners marquee (~85 entries), and program metric stat blocks. Bundled into v0.4 for homepage completeness. No hard data dependency (metrics are hardcoded pending a metrics collection).

- `port-kit/apps/web/src/components/marketing/Products.tsx`
- `port-kit/apps/web/src/components/marketing/CodingAgents.tsx`
- `port-kit/apps/web/src/components/marketing/UseCases.tsx`
- `port-kit/apps/web/src/components/marketing/Community.tsx`
- `port-kit/apps/web/src/components/marketing/Programs.tsx`
- `port-kit/apps/web/src/components/marketing/EcosystemPartners.tsx`
- `port-kit/apps/web/src/components/marketing/Contact.tsx`
- `port-kit/apps/web/src/components/marketing/BuildInPublic.tsx`

