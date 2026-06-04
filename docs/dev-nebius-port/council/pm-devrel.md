# Council Proposal — DevRel / Community PM Lens

**Author:** DevRel / Community PM
**Mandate:** Optimize for developer adoption, community growth, and ambassador/builder engagement. Seed content/community surfaces before gated ones. Treat empty-state cold-start as a first-class risk: a portal with no users, a leaderboard with no points, an events map with no pins — these are *worse than not shipping*, because they signal a dead program to the exact early adopters we are trying to win.

---

## 0. The thesis I will not let the council forget

dev.nebius.com today is a 4-page marketing shell whose every dynamic surface is *outbound*: events bounce to nebius.com/events, community bounces to Discord, learning bounces to GitHub + YouTube, recognition does not exist at all. **Every bounce is a builder we lose from the funnel.** The strategic prize is not "add auth so we can have a portal" — it is **giving the dev hub its own reason to exist as the gravitational center of the Nebius builder community.**

That reframes the whole sequencing debate. The platform/security lens will argue (correctly) that `auth-sessions` and `directus-data-model` are the keystone dependencies. They are — for the *gated* half. But the half that drives adoption (events, library, apps, ecosystem, team, builders landing) is **read-only CMS content that needs no auth at all.** We can and must ship the community magnet *first*, populate it with real content, and only then layer in the authenticated economy on top of an audience that already exists.

**Cold-start is the dependency nobody put in the JSON.** I am adding it explicitly: no gated/gamified surface ships until its underlying content corpus is seeded. A leaderboard (`leaderboard`) ranking three test accounts, a portal dashboard (`portal-shell`) showing sample stats, an events map (`homepage-events-map-hero`) with two pins — each of these actively *damages* trust. Content surfaces are the seed; gated surfaces are the harvest. We do not harvest before we plant.

---

## 1. My TOP priorities (gap ids, in my lens)

Ranked by *community adoption value*, not raw impact score. I am deliberately re-weighting some gaps the platform lens would rank lower.

| Rank | Gap id | Why it tops my list |
|---|---|---|
| 1 | `content-library` | The single highest-leverage adoption surface. Today learning content is scattered across YouTube/blogs/GitHub with no filterable on-site index — every builder who wants to learn leaves the hub. The library is also the *data backbone* that feeds product-page rails, search, workshop spotlight, and the contribution loop. Low risk, read-only. This is my #1. |
| 2 | `events-directory` | Keeps builders *in the funnel*. "Hackathons & Events" and "Builder Hours" are currently pure outbound links. An on-site directory with the live map is our most distinctive proof-of-activity and the thing that makes the hub feel *alive*. It also seeds the homepage hero and search. |
| 3 | `apps-showcase` | Social proof is oxygen for a builder community. "Built with Nebius" is *entirely missing* today — we show zero evidence that anyone ships on the platform. Lowest effort (2), low risk, huge psychological signal: "people like you build real things here." Seeds ecosystem + builder spotlight + search. |
| 4 | `team-directory` | Puts a *human face* on the program. Right now "Builder Hours" links to nothing and no builder can see or reach a DevRel advocate. Community is people; an anonymous program is a dead program. Cheap (effort 2), and a hard prerequisite for office-hours booking. |
| 5 | `ecosystem-integrations-directories` | Turns a static text matrix into a browsable directory with a "Submit your project" CTA — the first *two-sided* surface, and a low-effort one (2). Builders discovering 85 integrations on-site is far stickier than a docs link. |
| 6 | `directus-data-model` | The enabling foundation under everything above. I rank it 6th not because it is unimportant but because I want the council to understand: we design the **read-only content collections first** (events, library_articles, projects, team_members, pages) and defer the auth-coupled program collections (credit_requests, ambassador_applications, activities) until the audience exists. Phasing the schema is how we de-risk cold-start. |
| 7 | `product-page-resource-rails` | Converts their three highest-traffic pages into CMS surfaces DevRel can edit without a deploy. This is *operational velocity* for my team — every quickstart/video I can add without an eng deploy is a content win shipped same-day. Depends only on the library. |
| 8 | `builders-program-landing` | The on-site *front door* explaining the program — today the only "community" surface is a Discord invite. The CMS-authored explainer half is low-risk and shippable immediately, **independent of whether live points ranking is ready.** Critical that we ship the explainer *without* the hollow leaderboard. |
| 9 | `search` | Makes the hub navigable once there's enough content to search. Explicitly ranked *after* the content surfaces because — per its own reasoning — it is "only worth building once there is indexed content." The Directus fallback de-risks launch (no Typesense provisioning needed on day one). |
| 10 | `office-hours` | The first place I *want* auth, because it converts the "Builder Hours" marketing promise into a real, gated funnel. But it is a *light* gate (reveal a Calendly link), not a money/PII gate — the perfect first authenticated surface to prove the session layer on something low-stakes. |

**Gaps I am deliberately re-weighting UP from their raw scores:** `apps-showcase` (impact 4 but I treat it as top-3 — social proof is disproportionately important for cold-start), `team-directory` (impact 3, but humanizing the program is foundational to community), `builders-program-landing` (impact 4, but the *explainer-without-leaderboard* framing makes it a v0 win).

**Gaps I am deliberately re-weighting DOWN / pushing late:** `portal-shell`, `portal-credit-claims`, `leaderboard`, `admin-review-queues` — all high-impact, but **every one of them is a cold-start trap if shipped before the audience and the content/points corpus exist.** A credits claim form with no approval queue behind it (the approve/reject handlers are currently no-ops) is a promise we break. I would rather ship these *late and real* than *early and hollow*.

---

## 2. Proposed EPICS (themed groupings)

I group by *community function*, not by technical layer — because the adoption story is told surface-by-surface, and each epic should be independently shippable and independently *valuable to a builder*.

### EPIC A — "The hub has a reason to exist" (Content & Discovery)
The read-only community magnet. Zero auth. Ships first, gets seeded with real content, becomes the thing we drive traffic to.
- `directus-data-model` *(content collections subset only: events, library_articles, projects, team_members, pages)*
- `content-library`
- `events-directory`
- `apps-showcase`
- `team-directory`
- `ecosystem-integrations-directories`
- `fellows-directory`
- `product-page-resource-rails`
- `cms-page-constructor`
- `sitemap-seo-isr`

### EPIC B — "The hub is alive and discoverable" (Homepage Liveness & Search)
Makes the content corpus *feel* dynamic and findable. Depends on Epic A having real data to plot/index — explicitly gated on cold-start.
- `homepage-dynamic-content-sections`
- `homepage-events-map-hero`
- `homepage-static-marketing-sections`
- `search`
- `builders-program-landing` *(explainer half)*
- `signup-builder-program-landing`

### EPIC C — "Ops keeps the hub current" (Content Operations)
DevRel/ops tooling so content stays fresh without manual data entry or eng deploys. Needs a thin auth/admin gate but touches no money or user PII.
- `auth-sessions` *(introduced here, on the lowest-stakes surface)*
- `events-refresh-scrape`
- `feedback-capture`

### EPIC D — "Builders have an identity and a home" (Light Gated Surfaces)
First real builder-facing authenticated surfaces — but only the *light* gates: reveal-a-link and contribute-content, not money or rankings.
- `office-hours`
- `portal-shell`
- `portal-library-submission`

### EPIC E — "The program has a self-serve economy" (Heavy Write-Flows)
The money + PII + points machinery. Ships last, only after the audience is real, the content corpus is seeded, and the admin review queues exist to honor every PENDING record. **No flow in this epic ships without its corresponding review queue live.**
- `directus-data-model` *(program collections: credit_requests, ambassador_applications, activities, feedback_items)*
- `portal-credit-claims`
- `portal-event-hosting`
- `portal-ambassador-apply`
- `portal-activity-log`
- `leaderboard` *(real points ranking half)*
- `admin-console`
- `admin-review-queues`
- `chrome-portal-admin-nav`

---

## 3. RELEASE SEQUENCE v0.1 → v2.0

**Sequencing principle:** v0.x = read-only content magnet (foundation/low-risk, seed the audience). v1.x = liveness, search, and the *light* gated surfaces once content exists. v2.0 = the heavy authenticated economy, shipped real with its review queues. Each item: gap id → one-line reasoning from my lens.

### v0.1 — Content foundation (the seed)
- `directus-data-model` *(content subset)* → Stand up only the read-only collections first; defer auth-coupled schema. Foundation for everything, lowest-risk slice of it.
- `content-library` → My #1 adoption surface; the data backbone other surfaces read from. Ship it first so there is something to link, rail, and search.
- `apps-showcase` → Cheapest high-signal social proof (effort 2, low risk); "people build real things here" must be true on day one of the hub.

### v0.2 — People & places (the community magnet fills in)
- `events-directory` → Keep builders in the funnel instead of bouncing to nebius.com/events; our most distinctive surface, and it must have real events seeded before any map hero.
- `team-directory` → Humanize the program; a face behind "Builder Hours." Prereq for office-hours.
- `ecosystem-integrations-directories` → First two-sided surface ("Submit your project" CTA); turns a static matrix into a browsable directory at effort 2.

### v0.3 — Operability & discoverability of the static hub
- `product-page-resource-rails` → Make their three highest-traffic pages DevRel-editable without a deploy; pure ops velocity, depends only on the library.
- `cms-page-constructor` → Let DevRel spin up arbitrary marketing/community pages by slug (e.g. program explainers) without eng.
- `fellows-directory` → Cheapest recognition lever (effort 1, fully static); a quiet community-appreciation win with no dependencies.
- `sitemap-seo-isr` → As the hub grows from 4 pages to dozens, self-enumerate so our first-party content is discoverable as its own surface, not invisible behind nebius.com.

### v1.0 — The hub comes alive (liveness + search, gated on seeded content)
- `homepage-dynamic-content-sections` → Thread live events/library/apps through the homepage so it stays fresh without manual edits — **only now that those collections hold real, plentiful data** (cold-start gate).
- `homepage-events-map-hero` → The distinctive proof-of-activity globe above the fold — **only after the events directory has enough geocoded pins to not look empty** (this is the canonical cold-start risk; a 2-pin map is anti-marketing).
- `search` → Make the existing header widget real now that library + events + apps are indexable; launch on the Directus fallback to avoid Typesense provisioning risk.

### v1.1 — Program front door + first conversion paths
- `builders-program-landing` *(explainer half)* → The on-site home that explains the program — ships now with CMS content, **explicitly without the live leaderboard**, so the front door exists before the economy does.
- `signup-builder-program-landing` → A dedicated Builder Program join page with a real conversion CTA; assembled from existing CMS blocks, low risk.
- `homepage-static-marketing-sections` → Port the remaining static blocks (CodingAgents, ecosystem marquee) for completeness; no data dependency.

### v1.2 — Content operations & the FIRST auth surface (lowest stakes)
- `auth-sessions` → Introduce the session layer **here, on the lowest-stakes surfaces**, not under the credits economy — prove identity/CSRF/token-rotation on link-reveal and content-contribution before anything touches money. *(This is my key disagreement with a "build auth first" instinct: build auth first, but* ship *it first against trivial gates.)*
- `office-hours` → First builder-facing gate: sign-in reveals the Calendly link. Converts the "Builder Hours" promise into a real funnel at the lightest possible risk. Depends on team-directory (already shipped) + auth.
- `events-refresh-scrape` → Now that an admin session exists, give ops the Tavily refresh button so the events directory stays current without manual entry.
- `feedback-capture` → One unauthenticated endpoint; useful during the beta/port phase to capture builder reactions as we roll surfaces out.

### v1.3 — Builders get a home + can contribute (light writes only)
- `portal-shell` → Stand up the authenticated builder home **but with the dashboard stats wired to real reads where they exist and honest empty-states where they don't** — no sample-data theater. This is the container; ship it lean.
- `portal-library-submission` → First contribution loop: builders submit library entries for review. Smaller blast radius than credits/events, and it makes the library two-sided. **Requires the admin library queue to be real, not a no-op** — so it co-ships with that one queue (see below).
- *(co-requisite)* `admin-console` *(minimal shell)* + `admin-review-queues` *(library queue only)* → Just enough admin to honor library submissions; we do not light up a contribution path we cannot review.

### v2.0 — The self-serve economy, shipped real (full parity)
The heavy write-flows. Sequenced so **no claim flow goes live without its review queue**, and the leaderboard only turns "real" once the points ledger is populated.
- `directus-data-model` *(program collections)* → Now add credit_requests, ambassador_applications, activities; design per-user role-permission scoping carefully (data-exposure vector).
- `portal-activity-log` → Ship the points ledger *first* within v2.0 — it underpins the entire economy and the leaderboard. Self-report writes must be real, not stubs.
- `admin-review-queues` *(activities, ambassador)* → The approval surfaces that turn PENDING records into points/decisions; the single biggest "make it real" task.
- `portal-ambassador-apply` → Contained lead-gen for the community-leader pipeline; lowest-risk of the PII write-flows, paired with its review queue.
- `portal-credit-claims` → The strongest acquisition lever, but it touches *money* — ships only with rate-limiting, tight auth-gating, and the credit-claims review queue live (TF auto-approvable, AI Cloud use-case review).
- `portal-event-hosting` → Multi-collection transactional write (event + linked credit request) with DRAFT status-filtering so user rows never leak into the public directory; paired with the per-event credit queue.
- `admin-review-queues` *(credit-claims, per-event credits)* → Complete the queue set covering every money-bearing flow.
- `admin-console` *(full)* → The full exec dashboard + builders/team management tables so DevRel can operate the program without raw Directus access.
- `leaderboard` → **Turn on the real points ranking only now**, once the activity ledger is populated and accurate — a hollow leaderboard undercuts trust, so this is intentionally the *last* engagement surface, not the first.
- `chrome-portal-admin-nav` → The portal/admin navigation shells that tie the authenticated areas together; presentational, ships alongside the surfaces it serves.

---

## 4. Risks / dependencies I will NOT compromise on

These are my red lines. The synthesizer can re-order within them, but crossing them damages the community we are trying to build.

1. **COLD-START IS A HARD GATE. No gamified or stateful surface ships before its content/points corpus is seeded.**
   - `homepage-events-map-hero` does NOT ship before `events-directory` has enough real, geocoded events to look populated. A 2-pin globe is worse than the current static hero.
   - `leaderboard`'s *real ranking* does NOT ship before `portal-activity-log` is populated with genuine activity. Sample-data rankings are a trust-killer with exactly the early adopters we need.
   - `portal-shell` does NOT ship dashboards full of sample stats. Honest empty-states ("Host your first event") beat fake numbers, every time.
   - **Non-negotiable: plant before you harvest. Content surfaces (Epic A) precede gated surfaces (Epics D/E) in every release.**

2. **NO PROMISE WITHOUT A FULFILLMENT PATH. Every PENDING-creating flow co-ships with its live review queue.**
   - `portal-library-submission` requires the real library queue (no no-op approve/reject).
   - `portal-credit-claims` requires the credit-claims queue AND rate-limiting AND tight auth — it touches *money*; a claim that silently goes nowhere is a broken trust contract with a builder we just acquired.
   - `portal-event-hosting`, `portal-ambassador-apply`, `portal-activity-log` likewise each pair with their queue. We do not light up a funnel we cannot honor.

3. **AUTH IS INTRODUCED ON THE LOWEST-STAKES SURFACE FIRST.** `auth-sessions` is the keystone, but I will not let the first thing it gates be money. Prove the session/CSRF/token-rotation layer on `office-hours` (reveal a link) and `portal-library-submission` (contribute content) *before* `portal-credit-claims`. This sequencing is itself a risk control — we find auth bugs on link-reveals, not on credit grants. (And reconcile with the existing auth.nebius.com SSO rather than standing up a parallel Directus identity if at all feasible — a second login is itself an adoption tax.)

4. **DRAFT/USER-GENERATED ROWS MUST NEVER LEAK INTO PUBLIC DIRECTORIES.** `portal-event-hosting` injects builder DRAFT rows into the same `events` collection that powers the public directory and the homepage map. Status-filtering on every public read is a hard requirement, owned in `directus-data-model`'s permission matrix, *before* event hosting ships. A builder's half-finished draft appearing on the public map is an embarrassment we cannot have.

5. **PER-USER PERMISSION SCOPING IS A DATA-EXPOSURE VECTOR, NOT A POLISH ITEM.** The three Directus access modes (server/admin, as-user, public) and the role-permission matrix must be designed correctly when the *program* collections land (v2.0 schema slice), because that is when authenticated users start reading/writing records that include other people's PII (ambassador locations, emails). I will not let the economy ship on a permission model that was only validated against read-only content.

6. **CONTENT VELOCITY FOR DEVREL IS A FIRST-CLASS REQUIREMENT.** `product-page-resource-rails` and `cms-page-constructor` are not "nice to have" — they are what let my team add a quickstart, spotlight a workshop, or launch a program page *without an eng deploy*. If the port re-hardcodes these as static cards, we have regressed the operating model even if the pixels match. The library being the single source of truth for resource rails is non-negotiable.

7. **THE HUB MUST BE DISCOVERABLE AS ITS OWN SURFACE.** `sitemap-seo-isr` is low-impact-scored but I will not let it slip indefinitely: today the sitemap only delegates to nebius.com, so every data-backed surface we build is invisible to crawlers. As we grow from 4 pages to dozens, self-enumeration is how the community *finds* us. Ship it by end of v0.x.

---

## 5. Where I expect to fight the other lenses (and my counter)

- **Platform/security will want `auth-sessions` + full `directus-data-model` in v0.1 as "the foundation."** My counter: the foundation for the *gated* half, yes — but ~10 of the highest-adoption surfaces need *zero* auth. Phasing the schema (content collections in v0.1, program collections in v2.0) lets us ship the community magnet immediately and introduce auth on a trivial gate, which is *safer*, not riskier. Build the keystone early; load-bear it late.
- **A "ship the portal, it's high-impact" instinct will want `portal-shell` + `leaderboard` + `portal-credit-claims` pulled forward.** My counter: impact score measures the value *when populated*. Shipped into a cold start, these are net-negative — they advertise a dead program. The audience must exist first. Every one of these stays in v1.3/v2.0 behind the content seed and the review queues.
- **Marketing may want `homepage-events-map-hero` early as the showpiece.** My counter: I want it too — but only once the events directory has real pins. An empty globe is the most expensive way to say "nobody comes here." It is gated on `events-directory` having seeded data, full stop.

**Bottom line:** Seed the community before you gate it. Ship content surfaces (Epic A) in v0.x to build the audience, make the hub feel alive (Epic B) in v1.0, introduce auth on the lightest gate (Epic C/D) in v1.x, and only stand up the self-serve economy (Epic E) in v2.0 — real, queued, and honest. A builder hub earns the right to gate by first being worth showing up to.
