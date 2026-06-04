# dev.nebius.com Port Roadmap

_Porting the Nebius Builders site feature set into dev.nebius.com, release by release to v2.0_

> Generated from `roadmap.json` — edit that file and re-run `node gen.mjs`, do not hand-edit this file.

## Guiding principle

Two independent foundations (data-model, auth) gate everything. Ship crawlable read-only surfaces first (high ROI, zero auth), then search + chrome, then the auth keystone on the lightest gate, then the portal write-flows, then the admin console + queues that make the economy real. Never surface a half-built or un-processable feature in nav.

## Key tension resolved

Growth PM wants the $100 credits funnel in v0.x as the revenue spine; Platform PM wants all money/points mutations deferred to v2.0 on proven rails. Resolution: credit CLAIMS ship in v1.2 (builders can apply — high acquisition value) processed via Directus Studio interim; the automated approve/reject admin queue ships in v2.0. Acquisition value lands early, the privileged money-mutation surface lands last after the flow is battle-tested.

## Epics

- **Platform foundation** (`platform-foundation`, 4 cards) — The data + identity + SEO rails every surface depends on: Directus program collections + typed SDK, Directus-JWT auth, self-enumerating sitemap/SEO/ISR, feedback capture.
- **Content hub** (`content-hub`, 5 cards) — Turn the dev hub into a crawlable content destination: typed library, CMS-driven product-page rails, the CMS catch-all renderer, and the program + signup landings.
- **Community directories** (`community-directories`, 5 cards) — Social-proof and people surfaces: community apps gallery, ecosystem/integrations directory, DevRel team, fellows roll-call, office-hours booking.
- **Events & homepage liveness** (`events-liveness`, 4 cards) — The signature on-site events directory (live map) plus a homepage that threads live event/library/project data instead of static cards.
- **Search & discovery** (`search-discovery`, 1 cards) — Make the existing header search widget real: a backed index + results page across library, events, and apps.
- **Site chrome** (`site-chrome`, 2 cards) — Expanded navigation: public mega-menus + theme + footer early; the authenticated portal/admin layout shells once those areas exist.
- **Builder portal** (`builder-portal`, 6 cards) — The authenticated builder home and its write-flows: dashboard/checklist/profile, activity log, library submission, ambassador apply, credit claims, event hosting.
- **Admin & program economy** (`admin-economy`, 4 cards) — The first-party admin console + review queues that close every portal loop, the live leaderboard, and automated events refresh — what makes the program economy real.

## Release sequence

| Release | Theme | Cards | Top risk |
|---|---|:--:|---|
| **v0.1** | Data & SEO rails | 4 | 🟡 med |
| **v0.2** | Content magnet | 4 | 🟢 low |
| **v0.3** | Community directories | 4 | 🟢 low |
| **v0.4** | Events & a living homepage | 4 | 🟡 med |
| **v1.0** | Search & public chrome — public hub complete | 2 | 🟡 med |
| **v1.1** | Identity foundation | 2 | 🔴 high |
| **v1.2** | Builder Portal | 6 | 🔴 high |
| **v2.0** | Admin & economy — full parity | 5 | 🔴 high |

### v0.1 — Data & SEO rails

_Stand up the invisible foundation: the program data model + typed SDK, the CMS catch-all renderer, self-enumerating sitemap/SEO/ISR, and the feedback endpoint. Ships nothing user-visible but unblocks all of v0.x. The data-model foundation here and the auth foundation in v1.1 are independent and can be built in parallel by two people._

| Card | Epic | I | E | Risk | Depends on |
|---|---|:--:|:--:|---|---|
| **Builder/program Directus collections + typed SDK access layer** (`directus-data-model`) | Platform foundation | 5 | 3 | 🟡 med | — |
| **CMS catch-all pages via Page Constructor ([...slug])** (`cms-page-constructor`) | Content hub | 3 | 2 | 🟢 low | `directus-data-model` |
| **First-party dynamic sitemap + per-page SEO/OG + ISR** (`sitemap-seo-isr`) | Platform foundation | 3 | 2 | 🟢 low | `directus-data-model` |
| **Feedback / mockup-review capture API** (`feedback-capture`) | Platform foundation | 2 | 1 | 🟢 low | `directus-data-model` |

- **Builder/program Directus collections + typed SDK access layer** — dev.nebius.com already runs Directus but only as a headless asset store — none of the program data model exists. Define events, library_articles, projects, builders, team_members, pages, activities, credit_requests, ambassador_applications, feedback_items + the role-permission matrix, plus the three-mode typed SDK (server/admin, per-user, public). Ships first in v0.1 because almost every other card depends on these collections existing; it is one of the two independent foundations (with auth) so it can be built in parallel.
- **CMS catch-all pages via Page Constructor ([...slug])** — dev.nebius.com runs Page Constructor for its 4 fixed pages but has no generic CMS-driven catch-all to let DevRel spin up arbitrary marketing pages by slug. The [...slug] route looks up a published Directus pages row and renders its blocks JSON through Gravity Page Constructor with SEO/OG meta, skipping reserved slugs. Lands in v0.1 because the signup + program landings (v0.2) and any ad-hoc page reuse this renderer.
- **First-party dynamic sitemap + per-page SEO/OG + ISR** — dev.nebius.com's sitemap is a sitemapindex that only delegates to nebius.com and docs.nebius.com — it does not enumerate its own pages, so first-party content is invisible to crawlers as its own surface. A dynamic sitemap.xml that enumerates public + CMS pages with per-page Head/OG meta, noindex for hidden pages, and ISR (60s) is foundational SEO. Ships in v0.1 so every read-only surface added afterward is crawlable from day one.
- **Feedback / mockup-review capture API** — No lightweight on-site feedback channel exists (newsletter → HubSpot, feature requests → ideas.nebius.com). A POST /api/feedback that persists kind/message/page/email/user-agent to a feedback_items collection (with console.log fallback so it never drops feedback) is a one-endpoint, very-low-risk win useful during the porting/beta phase. Cheapest card; bundled into the v0.1 foundation.

### v0.2 — Content magnet

_Highest organic-traffic ROI, zero auth, reads only from the v0.1 data model. The typed library is the content backbone several later surfaces read from; the product-page rails upgrade dev.nebius.com's three highest-traffic pages into DevRel-editable CMS surfaces; the program + signup landings give the Startup/Builder program a real conversion home._

| Card | Epic | I | E | Risk | Depends on |
|---|---|:--:|:--:|---|---|
| **Typed content library index + detail** (`content-library`) | Content hub | 5 | 3 | 🟢 low | `directus-data-model` |
| **CMS-driven resource rails on product landing pages** (`product-page-resource-rails`) | Content hub | 4 | 2 | 🟢 low | `content-library` |
| **Builders Network program landing (CMS-authored pitch)** (`builders-program-landing`) | Content hub | 4 | 2 | 🟢 low | `cms-page-constructor` |
| **Signup / Builder Program join landing** (`signup-builder-program-landing`) | Content hub | 3 | 2 | 🟢 low | `cms-page-constructor` |

- **Typed content library index + detail** — dev.nebius.com scatters learning content as ad-hoc link cards across product pages with no unified, filterable, searchable index (the canonical library lives off-site on GitHub). A typography-first grid of workshops/videos/playlists/repos/blogs/docs with a sticky type+product filter, plus per-slug detail pages that embed YouTube players and render optional markdown. Leads v0.2 because it is the content backbone the product-page rails, search, and homepage spotlight all read from.
- **CMS-driven resource rails on product landing pages** — dev.nebius.com's /ai-cloud, /token-factory, /serverless resource sections are hand-curated static cards — adding a quickstart/video/guide means a content deploy. Rendering those rails dynamically from library_articles tagged surface=['ai-cloud'|...] (fetch-all + JS filter, since Directus JSON-array has no _contains; pinned floats to quickstarts) turns their three highest-traffic pages into DevRel-editable surfaces. v0.2 because it enhances pages that already exist and depends only on the library being the source of truth.
- **Builders Network program landing (CMS-authored pitch)** — dev.nebius.com's only 'community' surface is a Discord invite — no on-site home explains the builders program, tiers, and perks. /builders pairs (later) the leaderboard widget with CMS-authored program-pitch content rendered through Page Constructor, acting as the front door to the program. The marketing/explainer half is low-risk and shippable in v0.2 on the existing stack, independent of the live points ranking (which comes in v2.0).
- **Signup / Builder Program join landing** — dev.nebius.com promotes a Startup Program but has no direct on-page apply/credits CTA — the card links out. A dedicated /signup join page with a $100-credits persuasion hero + a single CTA to console.nebius.com/signup, followed by reused home Page Constructor blocks, gives the program a real conversion landing. v0.2 because it is a marketing page assembled from existing CMS blocks; reuses the catch-all renderer.

### v0.3 — Community directories

_Read-only social-proof and people surfaces that give builders reasons to stay on-site instead of bouncing to Discord/GitHub. Low effort, low risk, all reading the v0.1 collections. Team directory is the prerequisite for the office-hours booking gate later._

| Card | Epic | I | E | Risk | Depends on |
|---|---|:--:|:--:|---|---|
| **Community apps / 'built with Nebius' gallery (index + detail)** (`apps-showcase`) | Community directories | 4 | 2 | 🟢 low | `directus-data-model` |
| **Ecosystem umbrella + standalone integrations directory** (`ecosystem-integrations-directories`) | Community directories | 4 | 2 | 🟢 low | `apps-showcase` |
| **DevRel team people directory + member detail** (`team-directory`) | Community directories | 3 | 2 | 🟢 low | `directus-data-model` |
| **Fellows / recognized community leaders roll-call** (`fellows-directory`) | Community directories | 2 | 1 | 🟢 low | — |

- **Community apps / 'built with Nebius' gallery (index + detail)** — dev.nebius.com has no project showcase anywhere — social proof of what builders ship is entirely missing. /apps is a grid of community + hackathon projects with cover cards, award/featured pills, and a segmented filter, plus per-slug detail pages with repo/demo links and builder byline. Low effort/risk read-only projects collection; leads v0.3 as the anchor of the community surface.
- **Ecosystem umbrella + standalone integrations directory** — dev.nebius.com expresses integrations only as a static text matrix on the Token Factory page and a docs section — no browsable, filterable directory. /ecosystem is the canonical umbrella mixing community apps + ~85 partner integrations with a Kind+product filter and a 'Submit your project' GitHub-issue CTA; /integrations is the standalone partner directory. Grouped (same data + filter pattern) and placed in v0.3 next to apps; the R3F membrane hero is optional polish.
- **DevRel team people directory + member detail** — dev.nebius.com has no people/team page — builders can't see or reach the DevRel advocates, and there's no human face to 'Builder Hours'. /team is a grid of advocates (bio, region, expertise) with a 'Book office hours' CTA when calendly_url is set, plus per-slug profiles. Read-only team_members; placed in v0.3 because it is the natural prerequisite for the office-hours booking gate in v1.1.
- **Fellows / recognized community leaders roll-call** — No recognition surface for top community members exists. /fellows is a curated public roll-call from a static array, emitting noindex,nofollow while being curated. Lowest effort (static data, single page, no CMS/auth) and lowest impact (hidden, niche) — a cheap recognition lever bundled into the v0.3 community release. No hard dependency since it is fully static.

### v0.4 — Events & a living homepage

_The signature on-site events directory (live Leaflet map) keeps builders in the funnel and gives the hub its own reason to exist; the homepage then threads live event/library/project data through hero + spotlight sections. Grouped because the homepage dynamics depend on the events/library/apps collections now being populated. Client-only map work is isolated to this release for focused perf budgeting._

| Card | Epic | I | E | Risk | Depends on |
|---|---|:--:|:--:|---|---|
| **On-site events directory with live map + city filter** (`events-directory`) | Events & homepage liveness | 5 | 3 | 🟡 med | `directus-data-model` |
| **Homepage live events-map hero** (`homepage-events-map-hero`) | Events & homepage liveness | 3 | 2 | 🟡 med | `events-directory` |
| **Homepage dynamic sections (active events, workshop + builder spotlight)** (`homepage-dynamic-content-sections`) | Events & homepage liveness | 3 | 2 | 🟢 low | `events-directory`, `content-library`, `apps-showcase` |
| **Homepage static marketing sections (coding-agents, ecosystem marquee, programs, etc.)** (`homepage-static-marketing-sections`) | Events & homepage liveness | 2 | 2 | 🟢 low | — |

- **On-site events directory with live map + city filter** — dev.nebius.com has no on-site events surface — 'Hackathons & Events' and 'Builder Hours' are outbound links to nebius.com/events. An on-site dark Leaflet map with click-to-filter city pins, upcoming-vs-past split, city-alias folding, venue-local times, and Luma/Nebius RSVP deep-links keeps builders in the funnel. Leads v0.4 as the signature experience; the homepage dynamics depend on it. Medium risk only because Leaflet is client-only and needs SSR-safe dynamic import.
- **Homepage live events-map hero** — dev.nebius.com's homepage hero is a static 'choose a starting point' block. A full-bleed Leaflet globe plotting every located event + a 'Start building' CTA + a location-count footnote is a distinctive proof-of-activity above the fold that reinforces the events directory. v0.4 alongside events. Medium risk because the map/mesh are client-only above-the-fold JS that must be SSR-guarded and perf-budgeted.
- **Homepage dynamic sections (active events, workshop + builder spotlight)** — dev.nebius.com's homepage is entirely static. Threading live data through it — ActiveEvents (next 3 upcoming/live as RSVP cards), WorkshopSpotlight (one curated library workshop + related rail, pinned-aware), BuilderSpotlight (one project/month deterministically) — keeps the landing page fresh without manual edits. v0.4 because each section depends on its source collection now existing.
- **Homepage static marketing sections (coding-agents, ecosystem marquee, programs, etc.)** — Mostly at parity in spirit — dev.nebius.com already has product-router cards, use-cases, Community, and Programs (Startup Program, Nebius Academy). The deltas to preserve in a port: a CodingAgents/IDE section (Cursor, Cline, OpenClaw) they lack, an EcosystemPartners marquee (~85 entries), and program metric stat blocks. Bundled into v0.4 for homepage completeness. No hard data dependency (metrics are hardcoded pending a metrics collection).

### v1.0 — Search & public chrome — public hub complete

_Milestone: the entire unauthenticated builder hub is done and discoverable. Search becomes real now that there is indexed content (library/events/apps) to search, with a Directus fallback that de-risks the optional Typesense dependency. Public mega-menus + theme + footer finish the navigation. Zero auth surface exposed yet._

| Card | Epic | I | E | Risk | Depends on |
|---|---|:--:|:--:|---|---|
| **Unified search results page + header autocomplete** (`search`) | Search & discovery | 4 | 3 | 🟡 med | `content-library`, `events-directory`, `apps-showcase` |
| **Public chrome: Products/Docs mega-menus, theme toggle, footer, auth buttons** (`chrome-public-nav`) | Site chrome | 2 | 1 | 🟢 low | — |

- **Unified search results page + header autocomplete** — dev.nebius.com ships the same Gravity SearchProposal header widget we use, but it has no real index and no results page — nothing on-site to search. Make it real: GET /api/search backs both the debounced top-6 dropdown and a server-rendered /search?q= grid; primary path queries Typesense, falls back to Directus _icontains across events + library + projects. v1.0 because it only makes sense once indexed content exists; the Directus fallback de-risks the optional Typesense provisioning.
- **Public chrome: Products/Docs mega-menus, theme toggle, footer, auth buttons** — Split from the chrome gap (Design PM's hard recommendation) so the public half ships without waiting on portal/admin. dev.nebius.com has a thin public nav + footer; add Products/Docs mega-menus, a light/dark theme toggle, a richer footer linking otherwise-hidden pages, and Log in / Get started buttons. v1.0 to complete the public hub's navigation. Pure presentation, no deps.

### v1.1 — Identity foundation

_Introduce the Directus-JWT cookie/session/role layer — the keystone for everything stateful — on the lightest possible gate: the office-hours booking reveal (signed-out sees 'Sign in to book', signed-in gets the live Calendly link). Validates the auth surface in production before any high-stakes flow depends on it. Must reconcile with the existing Nebius SSO (auth.nebius.com) vs a parallel Directus identity — that decision blocks the release._

| Card | Epic | I | E | Risk | Depends on |
|---|---|:--:|:--:|---|---|
| **Builder auth + session/role gating (Directus-JWT cookies)** (`auth-sessions`) | Platform foundation | 5 | 4 | 🔴 high | — |
| **Office Hours booking (auth-gated Calendly reveal)** (`office-hours`) | Community directories | 3 | 2 | 🟡 med | `team-directory`, `auth-sessions` |

- **Builder auth + session/role gating (Directus-JWT cookies)** — dev.nebius.com has zero first-party auth — every 'Log in' bounces to auth.nebius.com / external consoles. Nothing stateful or personalized can exist without a session layer: forward to Directus /auth/login, store access+refresh in httpOnly cookies, rotate expired tokens, support ?next=, expose requireRole/enforceRole. The second independent foundation (with data-model). Introduced in v1.1 on the lightest gate (office-hours) to validate it before the portal depends on it. High risk: new identity surface, token storage, CSRF/session-fixation; may need reconciliation with Nebius SSO rather than a parallel Directus identity — that decision blocks the release.
- **Office Hours booking (auth-gated Calendly reveal)** — dev.nebius.com lists 'Builder Hours' as a marketing card with no booking surface. /office-hours combines recurring drop-in slots with per-advocate 1:1 slots and gates the booking reveal server-side: signed-out sees 'Sign in to book', signed-in gets the live Calendly link. Chosen as the FIRST auth-gated surface (v1.1) because it is the lowest-risk gate to validate the session layer in production — read-mostly, no money/points. Converts the existing 'Builder Hours' promise into a real funnel.

### v1.2 — Builder Portal

_Stand up the authenticated portal shell and all its write-flows. Submissions (library, ambassador, activity) and applications (credit claims, hosted events) enter PENDING/DRAFT and are processed via Directus Studio in the interim — the dedicated on-site admin queues come in v2.0. Credit claims ship here (not v2.0) for acquisition value, with manual interim processing, resolving the Growth-vs-Platform tension. Hard requirement: DRAFT user events must be status-filtered out of the public directory._

| Card | Epic | I | E | Risk | Depends on |
|---|---|:--:|:--:|---|---|
| **Builder Portal shell + dashboard + onboarding checklist + profile editor** (`portal-shell`) | Builder portal | 5 | 4 | 🔴 high | `auth-sessions`, `directus-data-model` |
| **Portal activity log + self-report a win** (`portal-activity-log`) | Builder portal | 3 | 3 | 🟡 med | `portal-shell`, `auth-sessions`, `directus-data-model` |
| **Portal library submission (community content for review)** (`portal-library-submission`) | Builder portal | 3 | 2 | 🟡 med | `portal-shell`, `auth-sessions`, `content-library` |
| **Portal Ambassador application** (`portal-ambassador-apply`) | Builder portal | 3 | 2 | 🟡 med | `portal-shell`, `auth-sessions`, `directus-data-model` |
| **Portal intro-credit claim flows (Token Factory + AI Cloud, $100)** (`portal-credit-claims`) | Builder portal | 5 | 3 | 🔴 high | `portal-shell`, `auth-sessions`, `directus-data-model` |
| **Portal host-an-event flow + my-events** (`portal-event-hosting`) | Builder portal | 4 | 3 | 🔴 high | `portal-shell`, `auth-sessions`, `directus-data-model`, `events-directory` |

- **Builder Portal shell + dashboard + onboarding checklist + profile editor** — No signed-in builder portal exists on dev.nebius.com — dashboards/usage/account all live in external consoles. /portal is the authenticated program home: stat cards, Quick Actions, recent-activity feed, points-bearing onboarding checklist, and a profile editor that PATCHes the user row (email read-only). The container every other portal write-flow lives inside; leads v1.2. High risk: builder-gated server-side mutations to user records; dashboard stats start as sample data until the aggregation is wired.
- **Portal activity log + self-report a win** — No points/activity tracking exists. The activity log lists points-bearing actions with status pills, plus /portal/activity/new to self-report a win (type, proof URL, details) into the activities collection. This is the ledger underpinning the gamified economy and the leaderboard (v2.0). v1.2 inside the portal; entries enter PENDING and are approved via Directus Studio until the admin activity queue ships in v2.0. Medium risk: user-submitted claims feed points → needs proof validation + abuse controls.
- **Portal library submission (community content for review)** — No path exists for builders to contribute content — all library material is first-party. A submit form (title, type, level, external URL, blurb, optional markdown) creates a PENDING library_articles row; accepted entries earn +50 pts and publish. Turns the library two-sided and feeds the points economy. v1.2; moderation happens via Directus Studio until the admin library queue ships in v2.0. Medium risk: UGC entering a published collection needs moderation + sanitization (smaller blast radius than credits/events).
- **Portal Ambassador application** — dev.nebius.com mentions programs but has no ambassador/advocate application funnel. A form (handle, email, city/country, what they've built, meetups to host, communities) creates a PENDING ambassador_applications row for monthly admin review — a clean, contained lead-gen flow for the community-leader pipeline. v1.2; reviewed via Directus Studio until the admin queue ships in v2.0. Medium risk: authenticated write with PII (location) → needs review queue + anti-spam.
- **Portal intro-credit claim flows (Token Factory + AI Cloud, $100)** — The strongest acquisition lever a builder hub can own: two claim forms (claim-tf, claim-ai) POST to /api/portal/credits/claim, creating a credit_requests row (amount_usd=100, status=PENDING); AI Cloud requires justification, TF needs only the account email. Ships in v1.2 (not v2.0) to land acquisition value early — resolving the Growth-vs-Platform tension — with interim manual processing in Directus Studio; the automated approve/reject queue ships in v2.0. High risk: touches money → tightly auth-gated, rate-limited, one-claim-per-product-per-user.
- **Portal host-an-event flow + my-events** — No way exists for a builder to propose/host a community event or request event credits. /portal/events/new does a two-step write: create an events row (status=DRAFT, builder=session user), then a linked credit_requests row (kind=EVENT), rolling back the event if the credit request fails. v1.2 inside the portal. High risk: multi-collection transactional write tied to credits, and it injects DRAFT rows into the same events collection that powers the public directory — DRAFT must be filtered out of public /events.

### v2.0 — Admin & economy — full parity

_The release that makes the program economy real and reaches parity with the Builders site. The first-party admin console + review queues close every portal loop (approve/reject credits, publish submissions, grant points), the portal/admin layout shells land, the live leaderboard goes up now that the activity ledger has real data, and automated events refresh keeps the directory current. These are the privileged money/points/publish mutations — they ship last, with the most review and an audit trail._

| Card | Epic | I | E | Risk | Depends on |
|---|---|:--:|:--:|---|---|
| **Admin operations console (exec dashboard + builders/team management)** (`admin-console`) | Admin & program economy | 4 | 4 | 🔴 high | `auth-sessions`, `directus-data-model` |
| **Admin review queues (library, credits, per-event credits, ambassador, activities)** (`admin-review-queues`) | Admin & program economy | 4 | 4 | 🔴 high | `admin-console`, `portal-credit-claims`, `portal-event-hosting`, `portal-library-submission`, `portal-ambassador-apply`, `portal-activity-log` |
| **Authenticated layout shells (PortalLayout/Sidebar + AdminLayout/Sidebar)** (`chrome-portal-admin-shells`) | Site chrome | 2 | 1 | 🟢 low | `portal-shell`, `admin-console` |
| **Builder leaderboard (public top-10 widget + full gated leaderboard)** (`leaderboard`) | Admin & program economy | 4 | 3 | 🟡 med | `directus-data-model`, `auth-sessions`, `portal-activity-log` |
| **Admin events refresh (Luma + nebius.com Tavily scrape)** (`events-refresh-scrape`) | Admin & program economy | 3 | 3 | 🟡 med | `events-directory`, `auth-sessions`, `admin-console` |

- **Admin operations console (exec dashboard + builders/team management)** — dev.nebius.com has no admin/program-ops surface (Directus Studio is the only back office today). /admin is a dedicated console: exec dashboard with program metric cards + an open-queues list, plus live management tables for builders and team_members. Makes the program operable by DevRel without raw Directus access. Leads v2.0 as the shell every review queue plugs into. High risk: elevated privileges over user + program data; somewhat optional vs using Directus Studio directly, which is why it is sequenced last.
- **Admin review queues (library, credits, per-event credits, ambassador, activities)** — Every portal write-flow produces a PENDING record needing human review; this is the single biggest 'make it real' task — until the approve/reject handlers write back (they are no-ops today), the whole portal economy is non-functional. Grouped: queues for library submissions, intro credit claims (TF auto-approvable, AI Cloud needs review), per-event TF credit requests, ambassador apps, and self-reported activities, all via the shared QueueTable. v2.0 because it depends on the admin console plus every portal flow that feeds a queue. Highest-privilege mutations (approve money, publish content, grant points) → most review + audit trail.
- **Authenticated layout shells (PortalLayout/Sidebar + AdminLayout/Sidebar)** — Second half of the split chrome gap: the authenticated navigation shells that don't exist on dev.nebius.com at all. Sequenced after the portal + admin areas exist (depends on both). Lands in v2.0 to finalize the authenticated IA once all gated surfaces are present. Low risk: presentational.
- **Builder leaderboard (public top-10 widget + full gated leaderboard)** — dev.nebius.com has no leaderboard/ranking — no competitive/recognition loop. A public /builders top-10 widget, a /builders/all roster, and an auth-gated /portal/leaderboard ranked by points_total (shared LeaderboardTable). Strong engagement/retention driver. v2.0 because a meaningful ranking depends on the activities/points ledger being populated and accurate — a hollow leaderboard on sample data undercuts trust, so it ships only after v1.2's activity log + v2.0's approval queues produce real points.
- **Admin events refresh (Luma + nebius.com Tavily scrape)** — Keeps the events directory current without manual entry: an admin-only Refresh hits /api/events/refresh, which uses Tavily Extract to scrape lu.ma/nebiusAI + nebius.com/events, parses titles/dates/cities, dedupes by normalized title, and upserts into events. Valuable ops once the directory + admin console exist; lands in v2.0 with the rest of the admin surface. Medium risk: writes to events, calls an external scraping API with its own key/rate limits, must be admin-gated; parser brittleness is an ongoing maintenance cost.

