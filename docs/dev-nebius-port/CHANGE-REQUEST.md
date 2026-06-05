# Change Request — Port the Nebius Builders surface into dev.nebius.com — content, then features

> Generated from `roadmap.json` + `content-manifest.json` — edit those and re-run `node gen.mjs cr`. Do not hand-edit.

| Field | Value |
|---|---|
| CR ID | CR-DEVNEBIUS-001 |
| Status | Proposed |
| Date | 2026-06-04 |
| Requestor | Nebius DevRel (collin@dabl.club) |
| Target system | dev.nebius.com (production web) |
| Reference build | demo.buildspace.tv (the Builders mockup that demonstrates the target end-state) |

## 1. Summary

Bring dev.nebius.com from a 4-page product microsite up to the full Nebius Builders surface already demonstrated on the reference build. Land **content first** (read-only, crawlable, low-risk), then **features** (search, identity, the builder portal, and the admin/economy console), across eight releases (v0.1 → v2.0).

- **Content:** 410+ catalogued items across 7 collections (library, community apps, integrations, events, team, fellows, CMS pages).
- **Features:** 8 epics · 8 releases · 31 kanban cards, each with reasoning + acceptance criteria + reference files.

## 2. Background & rationale

Two independent foundations (data-model, auth) gate everything. Ship crawlable read-only surfaces first (high ROI, zero auth), then search + chrome, then the auth keystone on the lightest gate, then the portal write-flows, then the admin console + queues that make the economy real. Never surface a half-built or un-processable feature in nav.

dev.nebius.com today is a deliberately thin first-party microsite (home + /ai-cloud + /token-factory + /serverless) on the exact stack this CR targets: Next.js Pages Router + Gravity UI + Page Constructor + Directus CMS (+ HubSpot forms). dev.nebius.com already runs this exact stack, so both content and components port closely. It uses Directus today only as a headless asset store (no program data model). Every dynamic builder surface is currently absent or offloaded off-site (events → nebius.com/events, community → Discord, portal → external consoles). This CR closes that gap on-site. Full gap analysis: `gap-analysis.md`.

## 3. Scope

**In scope**
- Part A: migrate all catalogued content into Directus collections on dev.nebius.com.
- Part B: build the 8 feature epics (31 cards), v0.1 → v2.0.

**Out of scope** (called out so the team is not surprised)
- Backend credit/grant *fulfillment* — this CR covers the request + approval flow, not the disbursement system.
- The final identity decision is a prerequisite, not a deliverable here (see Risk R1).
- Licensed media / non-Nebius brand assets used as placeholders on the reference build.

## 4. Part A — Content additions (land first)

Read-only, crawlable, and low-risk. All of Part A hangs off one foundation: the program data model (`directus-data-model`, release v0.1). Nothing here needs auth.

### Content inventory

| Content | Collection | Items | Notes |
|---|---|:--:|---|
| **Content library** | `library_articles` | 159 | The content backbone. `surface` controls which product page each entry rails onto (/ai-cloud, /token-factory, /serverless, /tavily); `pinned` floats an entry to a page's quickstarts and the homepage WorkshopSpotlight. Every external URL is link-checked (oEmbed for YouTube). |
| **Community apps / 'built with Nebius' gallery** | `projects` | 146 | Social proof of what builders ship. Placeholder/test rows excluded; repo_urls audited so no dead 'View on GitHub' links. Forks credit the original creator. |
| **Ecosystem integrations** | `integrations (new)` | 85 | Currently a typed TS list for SSG. Recommend migrating to a Directus collection so DevRel can edit without a deploy. `products` uses the hyphenated enum (token-factory, ai-cloud, tavily). |
| **Events directory** | `events` | TBC at migration (sourced from lu.ma/NebiusAI + nebius.com/events) | Geo-coded for the live map. Keep an admin refresh (Tavily Extract scrape of Luma + nebius.com/events, dedup by normalized title). |
| **DevRel team directory** | `team_members` | TBC at migration (active DevRel advocates) | Drives /team and the office-hours booking surface (calendly_url gates the 'Book office hours' CTA). |
| **Fellows roll-call** | `fellows (static today)` | 20 | Curated recognition surface; emits noindex,nofollow while curated. Lowest priority; static array is fine to start. |
| **CMS pages (Page Constructor blocks)** | `pages` | 5 pages | Marketing/program copy rendered through Gravity Page Constructor via the [...slug] catch-all. Lets DevRel spin up pages by slug without a deploy. |

### Per-collection detail

#### Content library — `library_articles`

- **Volume:** 159 items (live on the reference build (incl. 55 dev.nebius.com resources from the Phase-1 import + a 4-wave verified discovery sweep))
- **Types:** WORKSHOP, VIDEO, PLAYLIST, REPO, BLOG, DOCS
- **Key fields:** `slug`, `type`, `title`, `blurb`, `level`, `duration_min`, `product_focus`, `body_md`, `external_url`, `is_official`, `surface`, `pinned`
- **Notes:** The content backbone. `surface` controls which product page each entry rails onto (/ai-cloud, /token-factory, /serverless, /tavily); `pinned` floats an entry to a page's quickstarts and the homepage WorkshopSpotlight. Every external URL is link-checked (oEmbed for YouTube).

#### Community apps / 'built with Nebius' gallery — `projects`

- **Volume:** 146 items (live on the reference build (community OSS + hackathon projects, fork-audited for live public repos))
- **Key fields:** `slug`, `title`, `tagline`, `description`, `builder_handle`, `tags`, `product_focus`, `repo_url`, `demo_url`, `stars`, `featured`
- **Notes:** Social proof of what builders ship. Placeholder/test rows excluded; repo_urls audited so no dead 'View on GitHub' links. Forks credit the original creator.

#### Ecosystem integrations — `integrations (new)`

- **Volume:** 85 items (apps/web/src/lib/ecosystem-partners.ts (partner integrations: LiteLLM, LlamaIndex, LangChain, CrewAI, Tavily, Mastra, Zed, Cline, Continue, etc.))
- **Key fields:** `slug`, `name`, `category`, `products`, `docsUrl`, `homepage`, `blurb`
- **Notes:** Currently a typed TS list for SSG. Recommend migrating to a Directus collection so DevRel can edit without a deploy. `products` uses the hyphenated enum (token-factory, ai-cloud, tavily).

#### Events directory — `events`

- **Volume:** TBC at migration (sourced from lu.ma/NebiusAI + nebius.com/events)
- **Key fields:** `title`, `description`, `format`, `starts_at`, `ends_at`, `timezone`, `venue_name`, `city`, `country`, `location(point)`, `is_online`, `product_focus`, `status`, `is_official`, `official_url`, `luma_url`
- **Notes:** Geo-coded for the live map. Keep an admin refresh (Tavily Extract scrape of Luma + nebius.com/events, dedup by normalized title).

#### DevRel team directory — `team_members`

- **Volume:** TBC at migration (active DevRel advocates)
- **Key fields:** `slug`, `name`, `title`, `bio`, `region`, `timezone`, `expertise`, `languages`, `active`, `sort_order`, `socials`, `calendly_url`
- **Notes:** Drives /team and the office-hours booking surface (calendly_url gates the 'Book office hours' CTA).

#### Fellows roll-call — `fellows (static today)`

- **Volume:** 20 items (apps/web/src/lib/fellows.ts)
- **Key fields:** `name`, `org`, `city`, `region`, `tagline`, `photo`, `linkedin`
- **Notes:** Curated recognition surface; emits noindex,nofollow while curated. Lowest priority; static array is fine to start.

#### CMS pages (Page Constructor blocks) — `pages`

- **Pages:** home, builders, office-hours, localhosts, signup
- **Key fields:** `slug`, `title`, `seo_description`, `seo_image`, `blocks(JSON)`, `status`
- **Notes:** Marketing/program copy rendered through Gravity Page Constructor via the [...slug] catch-all. Lets DevRel spin up pages by slug without a deploy.

### Tagging

- **Library surface:** `ai-cloud`, `token-factory`, `serverless`, `tavily`, `library` — controls product-page rails.
- **Library types:** `WORKSHOP`, `VIDEO`, `PLAYLIST`, `REPO`, `BLOG`, `DOCS`.
- **`product_focus` enum:** `tokenfactory`, `aicloud`, `openclaw`, `soperator`, `tavily`.
- **Integration `products`:** `token-factory`, `ai-cloud`, `tavily` (hyphenated).

### Migration mechanism

- **How:** Apply the program schema (directus schema apply schema.yaml + role/permission matrix), then run idempotent ingest scripts per collection.
- **Tooling:** docs/content-expansion/state/ingest.mjs — generic Directus ingester (library|projects): live dedup by slug + canonical URL, dry-run by default, --apply to POST. verify.mjs — URL/oEmbed link-check before ingest.
- **Dedup:** Normalize URLs before compare; YouTube canonicalizes to yt:<videoId> (avoids collapsing all watch?v= URLs to one key); match by slug + canonical URL.
- **Rollback:** Each ingest batch writes a rollback-*.json (delete-by-id) for one-command revert.
- **Verification:** Re-confirm live counts from Directus aggregate at migration time (read-replica lag can make limit=-1 under-read vs aggregate count; union live ∪ verified-*.json).

## 5. Part B — Feature additions

Two independent foundations gate everything and can be built in parallel: `directus-data-model` (v0.1, also powers all of Part A) and `auth-sessions` (v1.1). Growth PM wants the $100 credits funnel in v0.x as the revenue spine; Platform PM wants all money/points mutations deferred to v2.0 on proven rails. Resolution: credit CLAIMS ship in v1.2 (builders can apply — high acquisition value) processed via Directus Studio interim; the automated approve/reject admin queue ships in v2.0. Acquisition value lands early, the privileged money-mutation surface lands last after the flow is battle-tested.

### Epics

- **Platform foundation** (`platform-foundation`, 4 cards) — The data + identity + SEO rails every surface depends on: Directus program collections + typed SDK, Directus-JWT auth, self-enumerating sitemap/SEO/ISR, feedback capture.
- **Content hub** (`content-hub`, 5 cards) — Turn the dev hub into a crawlable content destination: typed library, CMS-driven product-page rails, the CMS catch-all renderer, and the program + signup landings.
- **Community directories** (`community-directories`, 5 cards) — Social-proof and people surfaces: community apps gallery, ecosystem/integrations directory, DevRel team, fellows roll-call, office-hours booking.
- **Events & homepage liveness** (`events-liveness`, 4 cards) — The signature on-site events directory (live map) plus a homepage that threads live event/library/project data instead of static cards.
- **Search & discovery** (`search-discovery`, 1 cards) — Make the existing header search widget real: a backed index + results page across library, events, and apps.
- **Site chrome** (`site-chrome`, 2 cards) — Expanded navigation: public mega-menus + theme + footer early; the authenticated portal/admin layout shells once those areas exist.
- **Builder portal** (`builder-portal`, 6 cards) — The authenticated builder home and its write-flows: dashboard/checklist/profile, activity log, library submission, ambassador apply, credit claims, event hosting.
- **Admin & program economy** (`admin-economy`, 4 cards) — The first-party admin console + review queues that close every portal loop, the live leaderboard, and automated events refresh — what makes the program economy real.

### Releases

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

### Change items by release

#### v0.1 — Data & SEO rails

_Stand up the invisible foundation: the program data model + typed SDK, the CMS catch-all renderer, self-enumerating sitemap/SEO/ISR, and the feedback endpoint. Ships nothing user-visible but unblocks all of v0.x. The data-model foundation here and the auth foundation in v1.1 are independent and can be built in parallel by two people._

- **Builder/program Directus collections + typed SDK access layer** (`directus-data-model`) — Platform foundation · I5/E3/🟡 med
  - **Why:** dev.nebius.com already runs Directus but only as a headless asset store — none of the program data model exists. Define events, library_articles, projects, builders, team_members, pages, activities, credit_requests, ambassador_applications, feedback_items + the role-permission matrix, plus the three-mode typed SDK (server/admin, per-user, public). Ships first in v0.1 because almost every other card depends on these collections existing; it is one of the two independent foundations (with auth) so it can be built in parallel.
  - **Acceptance:** All program collections exist with the role-permission matrix applied (builder can read/write only own rows via $CURRENT_USER; public read-only on published surfaces); Typed SDK exposes directusServer(), directusAsUser(), directusPublic(), assetUrl() and is imported by at least one read-only page; A schema snapshot is versioned so the team can re-apply with directus schema apply
  - **Reference:** `apps/web/src/lib/directus.ts`, `apps/web/src/lib/types.ts`
- **CMS catch-all pages via Page Constructor ([...slug])** (`cms-page-constructor`) — Content hub · I3/E2/🟢 low · depends on `directus-data-model`
  - **Why:** dev.nebius.com runs Page Constructor for its 4 fixed pages but has no generic CMS-driven catch-all to let DevRel spin up arbitrary marketing pages by slug. The [...slug] route looks up a published Directus pages row and renders its blocks JSON through Gravity Page Constructor with SEO/OG meta, skipping reserved slugs. Lands in v0.1 because the signup + program landings (v0.2) and any ad-hoc page reuse this renderer.
  - **Acceptance:** Visiting /<slug> for a published pages row renders its blocks through Page Constructor with correct SEO/OG tags; Reserved slugs with dedicated .tsx files are not shadowed by the catch-all; An unpublished/missing slug returns 404 (with ISR revalidate)
  - **Reference:** `apps/web/pages/[...slug].tsx`, `apps/web/src/components/CmsRenderer.tsx`, `apps/web/src/lib/pageConstructor.ts`
- **First-party dynamic sitemap + per-page SEO/OG + ISR** (`sitemap-seo-isr`) — Platform foundation · I3/E2/🟢 low · depends on `directus-data-model`
  - **Why:** dev.nebius.com's sitemap is a sitemapindex that only delegates to nebius.com and docs.nebius.com — it does not enumerate its own pages, so first-party content is invisible to crawlers as its own surface. A dynamic sitemap.xml that enumerates public + CMS pages with per-page Head/OG meta, noindex for hidden pages, and ISR (60s) is foundational SEO. Ships in v0.1 so every read-only surface added afterward is crawlable from day one.
  - **Acceptance:** /sitemap.xml self-enumerates all public + published CMS routes (not just an index delegating off-site); Each public page emits title/description/OG tags; hidden pages emit noindex,nofollow; CMS-backed pages revalidate within 60s of a Directus edit
  - **Reference:** `apps/web/pages/sitemap.xml.ts`, `apps/web/pages/_document.tsx`
- **Feedback / mockup-review capture API** (`feedback-capture`) — Platform foundation · I2/E1/🟢 low · depends on `directus-data-model`
  - **Why:** No lightweight on-site feedback channel exists (newsletter → HubSpot, feature requests → ideas.nebius.com). A POST /api/feedback that persists kind/message/page/email/user-agent to a feedback_items collection (with console.log fallback so it never drops feedback) is a one-endpoint, very-low-risk win useful during the porting/beta phase. Cheapest card; bundled into the v0.1 foundation.
  - **Acceptance:** POST /api/feedback persists a row to feedback_items and returns 200; If the collection is missing, the endpoint logs and still returns success (never drops feedback); Endpoint is rate-limited / not abusable as an open relay
  - **Reference:** `apps/web/pages/api/feedback.ts`

#### v0.2 — Content magnet

_Highest organic-traffic ROI, zero auth, reads only from the v0.1 data model. The typed library is the content backbone several later surfaces read from; the product-page rails upgrade dev.nebius.com's three highest-traffic pages into DevRel-editable CMS surfaces; the program + signup landings give the Startup/Builder program a real conversion home._

- **Typed content library index + detail** (`content-library`) — Content hub · I5/E3/🟢 low · depends on `directus-data-model`
  - **Why:** dev.nebius.com scatters learning content as ad-hoc link cards across product pages with no unified, filterable, searchable index (the canonical library lives off-site on GitHub). A typography-first grid of workshops/videos/playlists/repos/blogs/docs with a sticky type+product filter, plus per-slug detail pages that embed YouTube players and render optional markdown. Leads v0.2 because it is the content backbone the product-page rails, search, and homepage spotlight all read from.
  - **Acceptance:** /library renders published library_articles with working type + product filter chips showing live counts; /library/<slug> renders detail, embedding a YouTube player for VIDEO/WORKSHOP entries and markdown body when present; Each entry's external-source button is labeled by host (e.g. 'Watch on Nebius.com', 'View on GitHub')
  - **Reference:** `apps/web/pages/library/index.tsx`, `apps/web/pages/library/[slug].tsx`
- **CMS-driven resource rails on product landing pages** (`product-page-resource-rails`) — Content hub · I4/E2/🟢 low · depends on `content-library`
  - **Why:** dev.nebius.com's /ai-cloud, /token-factory, /serverless resource sections are hand-curated static cards — adding a quickstart/video/guide means a content deploy. Rendering those rails dynamically from library_articles tagged surface=['ai-cloud'|...] (fetch-all + JS filter, since Directus JSON-array has no _contains; pinned floats to quickstarts) turns their three highest-traffic pages into DevRel-editable surfaces. v0.2 because it enhances pages that already exist and depends only on the library being the source of truth.
  - **Acceptance:** Each product page's quickstarts/videos/guides/repos/docs rails render from surface-tagged library_articles, no hardcoded cards; Pinned entries float into the quickstarts rail; Adding a tagged library entry in Directus makes it appear on the matching product page within the ISR window, no deploy
  - **Reference:** `apps/web/pages/ai-cloud.tsx`, `apps/web/pages/token-factory.tsx`, `apps/web/pages/serverless.tsx`, `apps/web/src/components/product/ResourceCard.tsx`
- **Builders Network program landing (CMS-authored pitch)** (`builders-program-landing`) — Content hub · I4/E2/🟢 low · depends on `cms-page-constructor`
  - **Why:** dev.nebius.com's only 'community' surface is a Discord invite — no on-site home explains the builders program, tiers, and perks. /builders pairs (later) the leaderboard widget with CMS-authored program-pitch content rendered through Page Constructor, acting as the front door to the program. The marketing/explainer half is low-risk and shippable in v0.2 on the existing stack, independent of the live points ranking (which comes in v2.0).
  - **Acceptance:** /builders renders program-pitch content from a Directus pages row (slug='builders') via Page Constructor; Page is in the sitemap and links to signup; Page renders fully without the leaderboard widget present (graceful when ranking data is not yet live)
  - **Reference:** `apps/web/pages/builders.tsx`, `apps/web/src/components/CmsRenderer.tsx`
- **Signup / Builder Program join landing** (`signup-builder-program-landing`) — Content hub · I3/E2/🟢 low · depends on `cms-page-constructor`
  - **Why:** dev.nebius.com promotes a Startup Program but has no direct on-page apply/credits CTA — the card links out. A dedicated /signup join page with a $100-credits persuasion hero + a single CTA to console.nebius.com/signup, followed by reused home Page Constructor blocks, gives the program a real conversion landing. v0.2 because it is a marketing page assembled from existing CMS blocks; reuses the catch-all renderer.
  - **Acceptance:** /signup renders the persuasion hero + a single primary CTA to console signup; Supporting Page Constructor blocks are reused from the home pages row with header blocks stripped; Page is crawlable and in the sitemap
  - **Reference:** `apps/web/pages/signup.tsx`, `apps/web/src/components/CmsRenderer.tsx`

#### v0.3 — Community directories

_Read-only social-proof and people surfaces that give builders reasons to stay on-site instead of bouncing to Discord/GitHub. Low effort, low risk, all reading the v0.1 collections. Team directory is the prerequisite for the office-hours booking gate later._

- **Community apps / 'built with Nebius' gallery (index + detail)** (`apps-showcase`) — Community directories · I4/E2/🟢 low · depends on `directus-data-model`
  - **Why:** dev.nebius.com has no project showcase anywhere — social proof of what builders ship is entirely missing. /apps is a grid of community + hackathon projects with cover cards, award/featured pills, and a segmented filter, plus per-slug detail pages with repo/demo links and builder byline. Low effort/risk read-only projects collection; leads v0.3 as the anchor of the community surface.
  - **Acceptance:** /apps renders the projects collection as filterable cards (Featured / product / hackathon / other) with placeholder rows excluded; /apps/<slug> shows repo + demo links, tags, product focus, builder byline; Broken/private repo links are validated out (no dead 'View on GitHub')
  - **Reference:** `apps/web/pages/apps/index.tsx`, `apps/web/pages/apps/[slug].tsx`, `apps/web/src/lib/projects.ts`
- **Ecosystem umbrella + standalone integrations directory** (`ecosystem-integrations-directories`) — Community directories · I4/E2/🟢 low · depends on `apps-showcase`
  - **Why:** dev.nebius.com expresses integrations only as a static text matrix on the Token Factory page and a docs section — no browsable, filterable directory. /ecosystem is the canonical umbrella mixing community apps + ~85 partner integrations with a Kind+product filter and a 'Submit your project' GitHub-issue CTA; /integrations is the standalone partner directory. Grouped (same data + filter pattern) and placed in v0.3 next to apps; the R3F membrane hero is optional polish.
  - **Acceptance:** /ecosystem renders apps + integrations in one grid with a working Kind + product filter and live counts; /integrations renders the ~85-partner directory with product + category chips; 'Submit your project' opens a prefilled GitHub issue; the R3F hero degrades gracefully without WebGL
  - **Reference:** `apps/web/pages/ecosystem.tsx`, `apps/web/pages/integrations.tsx`, `apps/web/src/lib/ecosystem-partners.ts`, `apps/web/src/components/integrations/HeroSection.tsx`, `apps/web/src/components/integrations/Hero3D.tsx`
- **DevRel team people directory + member detail** (`team-directory`) — Community directories · I3/E2/🟢 low · depends on `directus-data-model`
  - **Why:** dev.nebius.com has no people/team page — builders can't see or reach the DevRel advocates, and there's no human face to 'Builder Hours'. /team is a grid of advocates (bio, region, expertise) with a 'Book office hours' CTA when calendly_url is set, plus per-slug profiles. Read-only team_members; placed in v0.3 because it is the natural prerequisite for the office-hours booking gate in v1.1.
  - **Acceptance:** /team renders active team_members with bio/region/expertise; /team/<slug> shows full profile with languages + social links; A member with calendly_url shows a 'Book office hours' CTA (links out for now; gated reveal arrives with office-hours in v1.1)
  - **Reference:** `apps/web/pages/team/index.tsx`, `apps/web/pages/team/[slug].tsx`
- **Fellows / recognized community leaders roll-call** (`fellows-directory`) — Community directories · I2/E1/🟢 low
  - **Why:** No recognition surface for top community members exists. /fellows is a curated public roll-call from a static array, emitting noindex,nofollow while being curated. Lowest effort (static data, single page, no CMS/auth) and lowest impact (hidden, niche) — a cheap recognition lever bundled into the v0.3 community release. No hard dependency since it is fully static.
  - **Acceptance:** /fellows renders the curated roll-call with org/city/region + tagline per fellow; Page emits noindex,nofollow and is excluded from the sitemap while curated; No row-overlap / layout regressions in the featured + full grids
  - **Reference:** `apps/web/pages/fellows.tsx`, `apps/web/src/lib/fellows.ts`

#### v0.4 — Events & a living homepage

_The signature on-site events directory (live Leaflet map) keeps builders in the funnel and gives the hub its own reason to exist; the homepage then threads live event/library/project data through hero + spotlight sections. Grouped because the homepage dynamics depend on the events/library/apps collections now being populated. Client-only map work is isolated to this release for focused perf budgeting._

- **On-site events directory with live map + city filter** (`events-directory`) — Events & homepage liveness · I5/E3/🟡 med · depends on `directus-data-model`
  - **Why:** dev.nebius.com has no on-site events surface — 'Hackathons & Events' and 'Builder Hours' are outbound links to nebius.com/events. An on-site dark Leaflet map with click-to-filter city pins, upcoming-vs-past split, city-alias folding, venue-local times, and Luma/Nebius RSVP deep-links keeps builders in the funnel. Leads v0.4 as the signature experience; the homepage dynamics depend on it. Medium risk only because Leaflet is client-only and needs SSR-safe dynamic import.
  - **Acceptance:** /events renders the events collection on a Leaflet map with click-to-filter city pins/chips and an upcoming/past split; Map is dynamically imported (no window-on-server crash) and degrades to a list if WebGL/JS unavailable; Times display in venue-local timezone; city aliases (e.g. München→Munich) fold correctly
  - **Reference:** `apps/web/pages/events/index.tsx`, `apps/web/src/components/events/EventsMap.tsx`, `apps/web/src/lib/event-url.ts`, `apps/web/src/lib/format.ts`
- **Homepage live events-map hero** (`homepage-events-map-hero`) — Events & homepage liveness · I3/E2/🟡 med · depends on `events-directory`
  - **Why:** dev.nebius.com's homepage hero is a static 'choose a starting point' block. A full-bleed Leaflet globe plotting every located event + a 'Start building' CTA + a location-count footnote is a distinctive proof-of-activity above the fold that reinforces the events directory. v0.4 alongside events. Medium risk because the map/mesh are client-only above-the-fold JS that must be SSR-guarded and perf-budgeted.
  - **Acceptance:** Homepage hero plots events with coordinates on a Leaflet globe with a working primary CTA; Above-the-fold JS is SSR-guarded and within an agreed performance budget (LCP not regressed beyond target); Hero degrades to a static fallback when the map can't load
  - **Reference:** `apps/web/pages/index.tsx`, `apps/web/src/components/hero/HeroEventsMap.tsx`, `apps/web/src/components/hero/PhosphorMesh.tsx`
- **Homepage dynamic sections (active events, workshop + builder spotlight)** (`homepage-dynamic-content-sections`) — Events & homepage liveness · I3/E2/🟢 low · depends on `events-directory`, `content-library`, `apps-showcase`
  - **Why:** dev.nebius.com's homepage is entirely static. Threading live data through it — ActiveEvents (next 3 upcoming/live as RSVP cards), WorkshopSpotlight (one curated library workshop + related rail, pinned-aware), BuilderSpotlight (one project/month deterministically) — keeps the landing page fresh without manual edits. v0.4 because each section depends on its source collection now existing.
  - **Acceptance:** ActiveEvents shows the next 3 upcoming/live events and drives a live-event hero pill when one is active; WorkshopSpotlight features a pinned-first library workshop with a related rail; BuilderSpotlight cycles one project deterministically (stable within a month, UTC)
  - **Reference:** `apps/web/src/components/marketing/ActiveEvents.tsx`, `apps/web/src/components/marketing/WorkshopSpotlight.tsx`, `apps/web/src/components/marketing/BuilderSpotlight.tsx`, `apps/web/src/lib/event-url.ts`
- **Homepage static marketing sections (coding-agents, ecosystem marquee, programs, etc.)** (`homepage-static-marketing-sections`) — Events & homepage liveness · I2/E2/🟢 low
  - **Why:** Mostly at parity in spirit — dev.nebius.com already has product-router cards, use-cases, Community, and Programs (Startup Program, Nebius Academy). The deltas to preserve in a port: a CodingAgents/IDE section (Cursor, Cline, OpenClaw) they lack, an EcosystemPartners marquee (~85 entries), and program metric stat blocks. Bundled into v0.4 for homepage completeness. No hard data dependency (metrics are hardcoded pending a metrics collection).
  - **Acceptance:** CodingAgents/IDE-integration section renders (Cursor/Cline/OpenClaw etc.); EcosystemPartners marquee renders the partner set; Programs section uses 'Nebius Academy' naming; Program metric stat blocks render (hardcoded values flagged as TODO: wire to a metrics source)
  - **Reference:** `apps/web/src/components/marketing/Products.tsx`, `apps/web/src/components/marketing/CodingAgents.tsx`, `apps/web/src/components/marketing/UseCases.tsx`, `apps/web/src/components/marketing/Community.tsx`, `apps/web/src/components/marketing/Programs.tsx`, `apps/web/src/components/marketing/EcosystemPartners.tsx`, `apps/web/src/components/marketing/Contact.tsx`, `apps/web/src/components/marketing/BuildInPublic.tsx`

#### v1.0 — Search & public chrome — public hub complete

_Milestone: the entire unauthenticated builder hub is done and discoverable. Search becomes real now that there is indexed content (library/events/apps) to search, with a Directus fallback that de-risks the optional Typesense dependency. Public mega-menus + theme + footer finish the navigation. Zero auth surface exposed yet._

- **Unified search results page + header autocomplete** (`search`) — Search & discovery · I4/E3/🟡 med · depends on `content-library`, `events-directory`, `apps-showcase`
  - **Why:** dev.nebius.com ships the same Gravity SearchProposal header widget we use, but it has no real index and no results page — nothing on-site to search. Make it real: GET /api/search backs both the debounced top-6 dropdown and a server-rendered /search?q= grid; primary path queries Typesense, falls back to Directus _icontains across events + library + projects. v1.0 because it only makes sense once indexed content exists; the Directus fallback de-risks the optional Typesense provisioning.
  - **Acceptance:** Header search returns debounced top results; /search?q= renders a server-fetched grid (hits present in initial HTML) with Kind filter chips; With Typesense unconfigured, the Directus fallback still returns results across library/events/apps; Search index stays in sync on content publish (webhook or scheduled reindex documented)
  - **Reference:** `apps/web/pages/search.tsx`, `apps/web/pages/api/search.ts`, `apps/web/src/lib/typesense.ts`, `apps/web/src/components/search/SearchProposal.tsx`, `apps/web/src/lib/search-types.ts`
- **Public chrome: Products/Docs mega-menus, theme toggle, footer, auth buttons** (`chrome-public-nav`) — Site chrome · I2/E1/🟢 low
  - **Why:** Split from the chrome gap (Design PM's hard recommendation) so the public half ships without waiting on portal/admin. dev.nebius.com has a thin public nav + footer; add Products/Docs mega-menus, a light/dark theme toggle, a richer footer linking otherwise-hidden pages, and Log in / Get started buttons. v1.0 to complete the public hub's navigation. Pure presentation, no deps.
  - **Acceptance:** Public nav exposes Products + Docs hover/click mega-menus with the 200ms grace behavior; Theme toggle switches light/dark and persists; footer links the full public surface; Log in / Get started buttons are present (wire to auth in v1.1)
  - **Reference:** `apps/web/src/components/chrome/PublicNav.tsx`, `apps/web/src/components/chrome/ProductsMenu.tsx`, `apps/web/src/components/chrome/DocsMenu.tsx`, `apps/web/src/components/chrome/Footer.tsx`, `apps/web/src/components/chrome/ThemeToggle.tsx`

#### v1.1 — Identity foundation

_Introduce the Directus-JWT cookie/session/role layer — the keystone for everything stateful — on the lightest possible gate: the office-hours booking reveal (signed-out sees 'Sign in to book', signed-in gets the live Calendly link). Validates the auth surface in production before any high-stakes flow depends on it. Must reconcile with the existing Nebius SSO (auth.nebius.com) vs a parallel Directus identity — that decision blocks the release._

- **Builder auth + session/role gating (Directus-JWT cookies)** (`auth-sessions`) — Platform foundation · I5/E4/🔴 high
  - **Why:** dev.nebius.com has zero first-party auth — every 'Log in' bounces to auth.nebius.com / external consoles. Nothing stateful or personalized can exist without a session layer: forward to Directus /auth/login, store access+refresh in httpOnly cookies, rotate expired tokens, support ?next=, expose requireRole/enforceRole. The second independent foundation (with data-model). Introduced in v1.1 on the lightest gate (office-hours) to validate it before the portal depends on it. High risk: new identity surface, token storage, CSRF/session-fixation; may need reconciliation with Nebius SSO rather than a parallel Directus identity — that decision blocks the release.
  - **Acceptance:** Login sets httpOnly secure cookies; expired access tokens transparently refresh; logout clears session; requireRole gate redirects signed-out users to /login?next=... and 403s wrong-role users; Decision recorded: reuse auth.nebius.com SSO vs parallel Directus identity, with CSRF protection on auth POSTs
  - **Reference:** `apps/web/pages/login.tsx`, `apps/web/src/components/auth/LoginForm.tsx`, `apps/web/pages/api/auth/login.ts`, `apps/web/pages/api/auth/me.ts`, `apps/web/pages/api/auth/logout.ts`, `apps/web/src/lib/auth.ts`
- **Office Hours booking (auth-gated Calendly reveal)** (`office-hours`) — Community directories · I3/E2/🟡 med · depends on `team-directory`, `auth-sessions`
  - **Why:** dev.nebius.com lists 'Builder Hours' as a marketing card with no booking surface. /office-hours combines recurring drop-in slots with per-advocate 1:1 slots and gates the booking reveal server-side: signed-out sees 'Sign in to book', signed-in gets the live Calendly link. Chosen as the FIRST auth-gated surface (v1.1) because it is the lowest-risk gate to validate the session layer in production — read-mostly, no money/points. Converts the existing 'Builder Hours' promise into a real funnel.
  - **Acceptance:** Signed-out visitors see 'Sign in to book'; signed-in users see the live Calendly link; Drop-in + per-advocate 1:1 slots render from team_members with calendly_url; Hero uses the brand navy (#061a26), not black; no auth leak in the static HTML for signed-out users
  - **Reference:** `apps/web/pages/office-hours.tsx`

#### v1.2 — Builder Portal

_Stand up the authenticated portal shell and all its write-flows. Submissions (library, ambassador, activity) and applications (credit claims, hosted events) enter PENDING/DRAFT and are processed via Directus Studio in the interim — the dedicated on-site admin queues come in v2.0. Credit claims ship here (not v2.0) for acquisition value, with manual interim processing, resolving the Growth-vs-Platform tension. Hard requirement: DRAFT user events must be status-filtered out of the public directory._

- **Builder Portal shell + dashboard + onboarding checklist + profile editor** (`portal-shell`) — Builder portal · I5/E4/🔴 high · depends on `auth-sessions`, `directus-data-model`
  - **Why:** No signed-in builder portal exists on dev.nebius.com — dashboards/usage/account all live in external consoles. /portal is the authenticated program home: stat cards, Quick Actions, recent-activity feed, points-bearing onboarding checklist, and a profile editor that PATCHes the user row (email read-only). The container every other portal write-flow lives inside; leads v1.2. High risk: builder-gated server-side mutations to user records; dashboard stats start as sample data until the aggregation is wired.
  - **Acceptance:** /portal is reachable only when signed in as a builder; redirects to /login?next=/portal otherwise; Profile editor PATCHes the directus_users row pinned to the session user id (cannot edit other users; email read-only); Checklist persists completion and dashboard cards render (sample-data items clearly flagged until aggregation lands)
  - **Reference:** `apps/web/pages/portal/index.tsx`, `apps/web/src/components/chrome/PortalLayout.tsx`, `apps/web/src/components/chrome/PortalSidebar.tsx`, `apps/web/pages/portal/checklist.tsx`, `apps/web/pages/portal/profile.tsx`, `apps/web/pages/api/portal/profile.ts`
- **Portal activity log + self-report a win** (`portal-activity-log`) — Builder portal · I3/E3/🟡 med · depends on `portal-shell`, `auth-sessions`, `directus-data-model`
  - **Why:** No points/activity tracking exists. The activity log lists points-bearing actions with status pills, plus /portal/activity/new to self-report a win (type, proof URL, details) into the activities collection. This is the ledger underpinning the gamified economy and the leaderboard (v2.0). v1.2 inside the portal; entries enter PENDING and are approved via Directus Studio until the admin activity queue ships in v2.0. Medium risk: user-submitted claims feed points → needs proof validation + abuse controls.
  - **Acceptance:** /portal/activity lists the signed-in builder's activities with status pills; /portal/activity/new writes a PENDING activities row scoped to the session user; Points are not granted until an activity is approved (no self-grant); interim approval path via Directus Studio documented
  - **Reference:** `apps/web/pages/portal/activity/index.tsx`, `apps/web/pages/portal/activity/new.tsx`, `apps/web/src/components/chrome/StubCallout.tsx`
- **Portal library submission (community content for review)** (`portal-library-submission`) — Builder portal · I3/E2/🟡 med · depends on `portal-shell`, `auth-sessions`, `content-library`
  - **Why:** No path exists for builders to contribute content — all library material is first-party. A submit form (title, type, level, external URL, blurb, optional markdown) creates a PENDING library_articles row; accepted entries earn +50 pts and publish. Turns the library two-sided and feeds the points economy. v1.2; moderation happens via Directus Studio until the admin library queue ships in v2.0. Medium risk: UGC entering a published collection needs moderation + sanitization (smaller blast radius than credits/events).
  - **Acceptance:** /portal/library/submit creates a PENDING (unpublished) library_articles row; it does NOT appear on public /library until approved; Inputs are sanitized; external URL is validated; Approval grants +50 pts via the activity ledger (interim: manual approve in Directus Studio)
  - **Reference:** `apps/web/pages/portal/library/submit.tsx`, `apps/web/pages/portal/library/index.tsx`, `apps/web/src/components/chrome/StubCallout.tsx`
- **Portal Ambassador application** (`portal-ambassador-apply`) — Builder portal · I3/E2/🟡 med · depends on `portal-shell`, `auth-sessions`, `directus-data-model`
  - **Why:** dev.nebius.com mentions programs but has no ambassador/advocate application funnel. A form (handle, email, city/country, what they've built, meetups to host, communities) creates a PENDING ambassador_applications row for monthly admin review — a clean, contained lead-gen flow for the community-leader pipeline. v1.2; reviewed via Directus Studio until the admin queue ships in v2.0. Medium risk: authenticated write with PII (location) → needs review queue + anti-spam.
  - **Acceptance:** /portal/ambassador/apply writes a PENDING ambassador_applications row scoped to the session user; Form validates required fields; PII is stored only in the gated collection (not exposed publicly); Basic anti-spam (one open application per user / rate limit)
  - **Reference:** `apps/web/pages/portal/ambassador/apply.tsx`, `apps/web/pages/api/portal/ambassador/apply.ts`
- **Portal intro-credit claim flows (Token Factory + AI Cloud, $100)** (`portal-credit-claims`) — Builder portal · I5/E3/🔴 high · depends on `portal-shell`, `auth-sessions`, `directus-data-model`
  - **Why:** The strongest acquisition lever a builder hub can own: two claim forms (claim-tf, claim-ai) POST to /api/portal/credits/claim, creating a credit_requests row (amount_usd=100, status=PENDING); AI Cloud requires justification, TF needs only the account email. Ships in v1.2 (not v2.0) to land acquisition value early — resolving the Growth-vs-Platform tension — with interim manual processing in Directus Studio; the automated approve/reject queue ships in v2.0. High risk: touches money → tightly auth-gated, rate-limited, one-claim-per-product-per-user.
  - **Acceptance:** Signed-in builders can submit a TF or AI Cloud claim; a PENDING credit_requests row (amount_usd=100) is created; AI Cloud claim requires a justification; duplicate claims per product per user are blocked; Claims are processable in the interim via Directus Studio; the card explicitly notes the automated queue lands in v2.0 (no false 'approved' state shown to users before then)
  - **Reference:** `apps/web/pages/portal/credits/claim-tf.tsx`, `apps/web/pages/portal/credits/claim-ai.tsx`, `apps/web/pages/portal/credits/index.tsx`, `apps/web/pages/api/portal/credits/claim.ts`
- **Portal host-an-event flow + my-events** (`portal-event-hosting`) — Builder portal · I4/E3/🔴 high · depends on `portal-shell`, `auth-sessions`, `directus-data-model`, `events-directory`
  - **Why:** No way exists for a builder to propose/host a community event or request event credits. /portal/events/new does a two-step write: create an events row (status=DRAFT, builder=session user), then a linked credit_requests row (kind=EVENT), rolling back the event if the credit request fails. v1.2 inside the portal. High risk: multi-collection transactional write tied to credits, and it injects DRAFT rows into the same events collection that powers the public directory — DRAFT must be filtered out of public /events.
  - **Acceptance:** /portal/events/new creates a DRAFT events row + linked EVENT credit_requests row atomically (event rolled back if the credit write fails); DRAFT/user-submitted events never appear on the public /events directory or homepage hero; /portal/events lists the builder's own hosted events with status
  - **Reference:** `apps/web/pages/portal/events/index.tsx`, `apps/web/pages/portal/events/new.tsx`, `apps/web/pages/portal/events/[id].tsx`, `apps/web/pages/api/portal/events/index.ts`

#### v2.0 — Admin & economy — full parity

_The release that makes the program economy real and reaches parity with the Builders site. The first-party admin console + review queues close every portal loop (approve/reject credits, publish submissions, grant points), the portal/admin layout shells land, the live leaderboard goes up now that the activity ledger has real data, and automated events refresh keeps the directory current. These are the privileged money/points/publish mutations — they ship last, with the most review and an audit trail._

- **Admin operations console (exec dashboard + builders/team management)** (`admin-console`) — Admin & program economy · I4/E4/🔴 high · depends on `auth-sessions`, `directus-data-model`
  - **Why:** dev.nebius.com has no admin/program-ops surface (Directus Studio is the only back office today). /admin is a dedicated console: exec dashboard with program metric cards + an open-queues list, plus live management tables for builders and team_members. Makes the program operable by DevRel without raw Directus access. Leads v2.0 as the shell every review queue plugs into. High risk: elevated privileges over user + program data; somewhat optional vs using Directus Studio directly, which is why it is sequenced last.
  - **Acceptance:** /admin is reachable only with role=admin; builders/public are redirected/403; Builders + team_members management tables support the documented edits with an audit trail; Exec dashboard shows real pending counts per queue (links to the queues shipping in this release)
  - **Reference:** `apps/web/pages/admin/index.tsx`, `apps/web/pages/admin/builders.tsx`, `apps/web/pages/admin/team.tsx`, `apps/web/src/components/chrome/AdminLayout.tsx`, `apps/web/src/components/chrome/AdminSidebar.tsx`, `apps/web/src/components/chrome/QueueTable.tsx`
- **Admin review queues (library, credits, per-event credits, ambassador, activities)** (`admin-review-queues`) — Admin & program economy · I4/E4/🔴 high · depends on `admin-console`, `portal-credit-claims`, `portal-event-hosting`, `portal-library-submission`, `portal-ambassador-apply`, `portal-activity-log`
  - **Why:** Every portal write-flow produces a PENDING record needing human review; this is the single biggest 'make it real' task — until the approve/reject handlers write back (they are no-ops today), the whole portal economy is non-functional. Grouped: queues for library submissions, intro credit claims (TF auto-approvable, AI Cloud needs review), per-event TF credit requests, ambassador apps, and self-reported activities, all via the shared QueueTable. v2.0 because it depends on the admin console plus every portal flow that feeds a queue. Highest-privilege mutations (approve money, publish content, grant points) → most review + audit trail.
  - **Acceptance:** Each queue lists PENDING records and supports approve/reject that actually writes status + side-effects (publish entry / grant points / mark credit approved); Approvals are idempotent and audit-logged (who/when); rejecting requires a reason; Approving a credit claim transitions it out of PENDING and is reflected in the builder's /portal/credits
  - **Reference:** `apps/web/pages/admin/library.tsx`, `apps/web/pages/admin/credit-claims.tsx`, `apps/web/pages/admin/credit-requests.tsx`, `apps/web/pages/admin/ambassador-applications.tsx`, `apps/web/pages/admin/activities.tsx`, `apps/web/src/components/chrome/QueueTable.tsx`
- **Authenticated layout shells (PortalLayout/Sidebar + AdminLayout/Sidebar)** (`chrome-portal-admin-shells`) — Site chrome · I2/E1/🟢 low · depends on `portal-shell`, `admin-console`
  - **Why:** Second half of the split chrome gap: the authenticated navigation shells that don't exist on dev.nebius.com at all. Sequenced after the portal + admin areas exist (depends on both). Lands in v2.0 to finalize the authenticated IA once all gated surfaces are present. Low risk: presentational.
  - **Acceptance:** PortalLayout + PortalSidebar wrap all /portal/* routes with consistent nav; AdminLayout + AdminSidebar wrap all /admin/* routes with consistent nav + queue links; Authenticated chrome never renders for signed-out users
  - **Reference:** `apps/web/src/components/chrome/PortalLayout.tsx`, `apps/web/src/components/chrome/AdminLayout.tsx`, `apps/web/src/components/chrome/PortalSidebar.tsx`, `apps/web/src/components/chrome/AdminSidebar.tsx`
- **Builder leaderboard (public top-10 widget + full gated leaderboard)** (`leaderboard`) — Admin & program economy · I4/E3/🟡 med · depends on `directus-data-model`, `auth-sessions`, `portal-activity-log`
  - **Why:** dev.nebius.com has no leaderboard/ranking — no competitive/recognition loop. A public /builders top-10 widget, a /builders/all roster, and an auth-gated /portal/leaderboard ranked by points_total (shared LeaderboardTable). Strong engagement/retention driver. v2.0 because a meaningful ranking depends on the activities/points ledger being populated and accurate — a hollow leaderboard on sample data undercuts trust, so it ships only after v1.2's activity log + v2.0's approval queues produce real points.
  - **Acceptance:** /builders shows a top-10 widget; /builders/all shows the full roster; /portal/leaderboard is auth-gated; Rankings are computed from real approved points (not sample data) — verified non-empty before launch; Ties + zero-point builders handled sensibly; no PII beyond handle/name/location
  - **Reference:** `apps/web/pages/builders.tsx`, `apps/web/pages/builders/all.tsx`, `apps/web/pages/portal/leaderboard.tsx`, `apps/web/src/components/builders/LeaderboardTable.tsx`
- **Admin events refresh (Luma + nebius.com Tavily scrape)** (`events-refresh-scrape`) — Admin & program economy · I3/E3/🟡 med · depends on `events-directory`, `auth-sessions`, `admin-console`
  - **Why:** Keeps the events directory current without manual entry: an admin-only Refresh hits /api/events/refresh, which uses Tavily Extract to scrape lu.ma/nebiusAI + nebius.com/events, parses titles/dates/cities, dedupes by normalized title, and upserts into events. Valuable ops once the directory + admin console exist; lands in v2.0 with the rest of the admin surface. Medium risk: writes to events, calls an external scraping API with its own key/rate limits, must be admin-gated; parser brittleness is an ongoing maintenance cost.
  - **Acceptance:** Admin-only Refresh upserts scraped events deduped by normalized title (no duplicate rows); Tavily key stays server-side; the endpoint is admin-gated and rate-limited; Scrape failures degrade gracefully (existing events untouched; error surfaced to admin)
  - **Reference:** `apps/web/pages/api/events/refresh.ts`, `apps/web/pages/api/scrape-events.ts`, `apps/web/pages/events/index.tsx`

## 6. Dependencies & sequencing

- **Part A (content)** depends only on `directus-data-model` (v0.1). Once the schema is applied, all content can load.
- **Part B (features)** follows the release order; each release is independently shippable.
- Order: `v0.1` → `v0.2` → `v0.3` → `v0.4` → `v1.0` → `v1.1` → `v1.2` → `v2.0`.

## 7. Risk assessment

| # | Area | Level | Risk | Mitigation |
|---|---|---|---|---|
| R1 | Identity | 🔴 high | Standing up a parallel Directus-JWT identity could conflict with the existing Nebius SSO at auth.nebius.com. | Decide identity source-of-truth before any gated feature (auth-sessions card). Prefer reconciling with auth.nebius.com SSO over a parallel identity. Add CSRF protection on auth POSTs. |
| R2 | Permissions / data exposure | 🔴 high | Per-user Directus permission scoping done wrong leaks other users' rows. | Role-permission matrix with $CURRENT_USER filters; a permission-test gate in CI before portal/admin ship. |
| R3 | Money / points mutations | 🔴 high | Credit claims, event credits, and points grants are privileged writes; the admin approve/reject handlers are no-ops on the reference build. | Ship money/points write-flows last on proven rails; pair credit-claims with its admin queue; idempotent, audit-logged approvals. |
| R4 | UGC moderation | 🟡 med | Builder-submitted library/events/activities entering published collections without review. | Submissions enter PENDING/DRAFT; status-filter DRAFT out of public surfaces (esp. the events directory); admin review queues before publish. |
| R5 | SEO / indexing | 🟡 med | DRAFT/PENDING UGC or noindex pages leaking into the sitemap; first-party content invisible to crawlers. | Self-enumerating sitemap that excludes hidden pages; keep DRAFT/PENDING out of indexed surfaces; server-rendered HTML for content. |
| R6 | Client-only / performance | 🟡 med | Leaflet map (events + homepage hero) and the R3F membrane touch window and add above-the-fold JS. | SSR-safe dynamic imports, non-WebGL fallbacks, Core Web Vitals budget on the hero. |
| R7 | Search | 🟡 med | Typesense adds an external dependency to provision and keep indexed. | Ship the Directus _icontains fallback first; layer Typesense behind it; document reindex-on-publish. |
| R8 | Scope overlap | 🟢 low | Feedback overlaps ideas.nebius.com; admin console overlaps Directus Studio. | Decide build-vs-reuse per surface; admin console is partly optional vs Studio. |

## 8. Rollout plan

1. **v0.1** — apply the schema + load Part A content; ship the invisible foundation (data model, CMS catch-all, sitemap/SEO, feedback).
2. **v0.2–v0.4** — expose the content surfaces (library + product rails, community directories, events + a living homepage).
3. **v1.0** — search + finish the public chrome; the public hub is complete and crawlable.
4. **v1.1** — identity foundation on the lightest gate (office-hours booking reveal).
5. **v1.2** — builder portal + write-flows (submissions enter PENDING; interim processing via Directus Studio).
6. **v2.0** — admin console + review queues + leaderboard; the program economy made real.
- Each release: deploy to a preview, pass its acceptance gates, then promote. Keep ISR `revalidate: 60` to match the s-maxage=60 edge cache.

## 9. Acceptance & sign-off

A release is **Done** only when every card's acceptance criteria pass on a preview deploy (tracked in `KANBAN.md`).

| Role | Sign-off scope | Name | Date |
|---|---|---|---|
| Engineering lead | Architecture, data model, permissions |  |  |
| DevRel / Product | Content accuracy, program flows |  |  |
| Design | IA, nav, signature experiences |  |  |
| Security | Auth, UGC, money/points mutations |  |  |

## 10. References

- `ROADMAP.md` / `KANBAN.md` — the feature plan + board (generated).
- `roadmap.json` — canonical feature data (8 epics / 8 releases / 31 cards).
- `gap-analysis.md` / `gap-analysis.json` — the scored delta vs dev.nebius.com.
- `content-manifest.json` — content scope, tagging, migration, risks (source for Part A).
- `releases/<id>/PLAN.md` + `port-kit/` — per-release detail + reference source (branches `port/v0.1`…`port/v2.0`).
- `../content-expansion/` — the content catalog + ingest tooling (`state/ingest.mjs`, `verify.mjs`).

