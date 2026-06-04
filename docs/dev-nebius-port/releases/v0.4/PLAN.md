# Release v0.4 — Events & a living homepage

Branch: `port/v0.4` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).

## Why this release

The signature on-site events directory (live Leaflet map) keeps builders in the funnel and gives the hub its own reason to exist; the homepage then threads live event/library/project data through hero + spotlight sections. Grouped because the homepage dynamics depend on the events/library/apps collections now being populated. Client-only map work is isolated to this release for focused perf budgeting.

Builds on: `v0.1` → `v0.2` → `v0.3`.

## Cards in this release

### On-site events directory with live map + city filter  `events-directory`

- **Epic:** Events & homepage liveness · **Impact:** 5/5 · **Effort:** 3/5 · **Risk:** 🟡 med
- **Depends on:** `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** dev.nebius.com has no on-site events surface — 'Hackathons & Events' and 'Builder Hours' are outbound links to nebius.com/events. An on-site dark Leaflet map with click-to-filter city pins, upcoming-vs-past split, city-alias folding, venue-local times, and Luma/Nebius RSVP deep-links keeps builders in the funnel. Leads v0.4 as the signature experience; the homepage dynamics depend on it. Medium risk only because Leaflet is client-only and needs SSR-safe dynamic import.
- **Acceptance:**
  - [ ] /events renders the events collection on a Leaflet map with click-to-filter city pins/chips and an upcoming/past split
  - [ ] Map is dynamically imported (no window-on-server crash) and degrades to a list if WebGL/JS unavailable
  - [ ] Times display in venue-local timezone; city aliases (e.g. München→Munich) fold correctly
- **Reference implementation (port-kit):**
  - `apps/web/pages/events/index.tsx`
  - `apps/web/src/components/events/EventsMap.tsx`
  - `apps/web/src/lib/event-url.ts`
  - `apps/web/src/lib/format.ts`

### Homepage live events-map hero  `homepage-events-map-hero`

- **Epic:** Events & homepage liveness · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟡 med
- **Depends on:** `events-directory` (On-site events directory with live map + city filter)
- **Why:** dev.nebius.com's homepage hero is a static 'choose a starting point' block. A full-bleed Leaflet globe plotting every located event + a 'Start building' CTA + a location-count footnote is a distinctive proof-of-activity above the fold that reinforces the events directory. v0.4 alongside events. Medium risk because the map/mesh are client-only above-the-fold JS that must be SSR-guarded and perf-budgeted.
- **Acceptance:**
  - [ ] Homepage hero plots events with coordinates on a Leaflet globe with a working primary CTA
  - [ ] Above-the-fold JS is SSR-guarded and within an agreed performance budget (LCP not regressed beyond target)
  - [ ] Hero degrades to a static fallback when the map can't load
- **Reference implementation (port-kit):**
  - `apps/web/pages/index.tsx`
  - `apps/web/src/components/hero/HeroEventsMap.tsx`
  - `apps/web/src/components/hero/PhosphorMesh.tsx`

### Homepage dynamic sections (active events, workshop + builder spotlight)  `homepage-dynamic-content-sections`

- **Epic:** Events & homepage liveness · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `events-directory` (On-site events directory with live map + city filter), `content-library` (Typed content library index + detail), `apps-showcase` (Community apps / 'built with Nebius' gallery (index + detail))
- **Why:** dev.nebius.com's homepage is entirely static. Threading live data through it — ActiveEvents (next 3 upcoming/live as RSVP cards), WorkshopSpotlight (one curated library workshop + related rail, pinned-aware), BuilderSpotlight (one project/month deterministically) — keeps the landing page fresh without manual edits. v0.4 because each section depends on its source collection now existing.
- **Acceptance:**
  - [ ] ActiveEvents shows the next 3 upcoming/live events and drives a live-event hero pill when one is active
  - [ ] WorkshopSpotlight features a pinned-first library workshop with a related rail
  - [ ] BuilderSpotlight cycles one project deterministically (stable within a month, UTC)
- **Reference implementation (port-kit):**
  - `apps/web/src/components/marketing/ActiveEvents.tsx`
  - `apps/web/src/components/marketing/WorkshopSpotlight.tsx`
  - `apps/web/src/components/marketing/BuilderSpotlight.tsx`
  - `apps/web/src/lib/event-url.ts`

### Homepage static marketing sections (coding-agents, ecosystem marquee, programs, etc.)  `homepage-static-marketing-sections`

- **Epic:** Events & homepage liveness · **Impact:** 2/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** — none
- **Why:** Mostly at parity in spirit — dev.nebius.com already has product-router cards, use-cases, Community, and Programs (Startup Program, Nebius Academy). The deltas to preserve in a port: a CodingAgents/IDE section (Cursor, Cline, OpenClaw) they lack, an EcosystemPartners marquee (~85 entries), and program metric stat blocks. Bundled into v0.4 for homepage completeness. No hard data dependency (metrics are hardcoded pending a metrics collection).
- **Acceptance:**
  - [ ] CodingAgents/IDE-integration section renders (Cursor/Cline/OpenClaw etc.)
  - [ ] EcosystemPartners marquee renders the partner set; Programs section uses 'Nebius Academy' naming
  - [ ] Program metric stat blocks render (hardcoded values flagged as TODO: wire to a metrics source)
- **Reference implementation (port-kit):**
  - `apps/web/src/components/marketing/Products.tsx`
  - `apps/web/src/components/marketing/CodingAgents.tsx`
  - `apps/web/src/components/marketing/UseCases.tsx`
  - `apps/web/src/components/marketing/Community.tsx`
  - `apps/web/src/components/marketing/Programs.tsx`
  - `apps/web/src/components/marketing/EcosystemPartners.tsx`
  - `apps/web/src/components/marketing/Contact.tsx`
  - `apps/web/src/components/marketing/BuildInPublic.tsx`

## Port-kit

The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).

## Verification

- Type-check: `npx tsc --noEmit` in the target app.
- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.


