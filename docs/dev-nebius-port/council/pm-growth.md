# Council Proposal — Growth / Acquisition PM

**Lens:** Top-of-funnel signups, activation, and conversion to paid Nebius usage. I sequence by *what moves signup + first-token-fastest*. Every gap is judged on a single question: **does it create, capture, or convert a builder into a paying Nebius account?**

The synthesizer will hear other lenses argue for platform purity, ops tooling, and admin correctness. My job is to fight for the revenue line. The blunt truth about the current state (from the gap analysis summary): dev.nebius.com is a **4-page link-farm microsite** whose every conversion action — log in, claim credits, join the program, RSVP — **bounces the user off-site**. Every bounce is a leak. My entire proposal is about plugging leaks and building on-site funnels that we can instrument and own.

---

## 1) TOP PRIORITIES (my lens)

Ranked by acquisition/conversion leverage, not by build order. Build order is in §3.

### Tier S — the revenue spine. Non-negotiable, must land by v1.x.

1. **`portal-credit-claims`** (impact 5, effort 3, risk high) — *This is the single strongest acquisition lever a builder hub can own, and the gap analysis says so explicitly.* A signed-in builder clicking "Claim $100 Token Factory credits" and getting it **on-site** is the closest thing we have to a direct "create a paying-capable Nebius account" button. dev.nebius.com today just links the Startup Program card out into the void. Owning this flow means we own the credits funnel, the attribution, and the moment-of-activation. If I get only one stateful surface, it's this one.

2. **`signup-builder-program-landing`** (impact 3, effort 2, risk low) — Criminally underscored at impact 3. This is a **dedicated conversion landing** with a $100-credits persuasion hero and a hard CTA to `console.nebius.com/signup`. It is low-effort, low-risk, depends only on the CMS renderer, and it is *the* page I point every paid ad, every SEO result, and every Discord link at. This is my highest ROI item in the entire backlog. It should land in **v0.x** and I will fight anyone who defers it.

3. **`auth-sessions`** (impact 5, effort 4, risk high) — I don't *want* to build auth (it's the heaviest, highest-risk keystone), but every on-site conversion flow I care about — credits claims, the portal, office-hours reveal, gated leaderboard — is dead without it. It is the dependency tax I pay to stop bouncing users to auth.nebius.com. **Critical caveat I will not compromise on:** this must reconcile with existing Nebius SSO at auth.nebius.com, *not* fork a parallel Directus identity (see §4). A second identity silo would fracture attribution and create a worse signup experience than the bounce we have today.

### Tier A — top-of-funnel magnets and activation surfaces.

4. **`content-library`** (impact 5, effort 3, risk low) — The **SEO + activation engine**. A filterable, searchable, on-site index of workshops/videos/repos/blogs/docs is exactly the organic-traffic surface my lens lives for. Today this content is scattered as link cards and the canonical library is *off-site on GitHub* — i.e., Nebius is donating its long-tail search equity to github.com. Pulling it on-site, indexed and self-enumerated, is how we capture organic intent and feed it into signup. It's also the data backbone for product rails, search, and homepage spotlights — high leverage, low risk.

5. **`product-page-resource-rails`** (impact 4, effort 2, risk low) — Their three **highest-traffic pages** (/ai-cloud, /token-factory, /serverless) are where high-intent buyers land. Making the resource rails CMS-driven lets DevRel A/B and refresh quickstarts/CTAs **without a deploy**. Faster iteration on the highest-intent pages = faster first-token. Cheap, low-risk, enhances pages that already convert.

6. **`events-directory`** (impact 5, effort 3, risk med) — An on-site events directory **keeps builders in the funnel** instead of shipping them to nebius.com/events. Events are a proven acquisition channel (hackathons → signups). Owning the directory on-site means RSVP deep-links we can instrument and a reason for the dev hub to rank for "Nebius hackathon / AI events." Read-only, CMS-fed, slots into their existing stack.

7. **`ecosystem-integrations-directories`** (impact 4, effort 2, risk low) — ~85 partner integrations + community apps in one **SEO-rich, browsable grid** with a "Submit your project" CTA. This is precisely the "SEO-rich library/ecosystem pages that pull organic traffic" my mandate calls out. Every partner name (LangChain, LlamaIndex, CrewAI…) is a search term we can rank for. Low effort, mostly static — a pure organic-traffic win.

8. **`search`** (impact 4, effort 3, risk med) — Once we have library + events + apps indexed, **real on-site search** turns their dead header widget into a discovery engine that routes intent to conversion surfaces. The Directus fallback de-risks launch (no hard Typesense dependency at v1). Search reduces time-to-find-the-thing-that-makes-me-sign-up.

### Tier B — social proof and conversion-reinforcement.

9. **`apps-showcase`** (impact 4, effort 2, risk low) — "Built with Nebius" social proof is **entirely missing** today. Social proof is conversion fuel; low effort/low risk; also a dependency for ecosystem + search + homepage spotlight. Cheap credibility.

10. **`leaderboard`** (impact 4, effort 3, risk med) — The **public** top-10 + `/builders` landing is a competitive/recognition loop that drives engagement and return visits. I want the *public landing half* early (it's low-risk CMS content); the live-ranking half can wait on the activity ledger. A hollow leaderboard hurts trust, so I split it (see §3).

11. **`homepage-events-map-hero`** + **`homepage-dynamic-content-sections`** (impact 3 each) — A live, distinctive above-the-fold hero and fresh "active events / workshop / builder spotlight" sections raise the homepage's conversion ceiling and proof-of-activity. Medium-value polish that reinforces everything above; sequenced after the data they read from exists.

### Tier C — supporting / parity / defer.

- **`sitemap-seo-isr`** (impact 3, low risk) — I care about this *more* than its score implies, because their sitemap **does not enumerate their own pages** — first-party content is invisible to crawlers. As we go from 4 pages to dozens of SEO surfaces, this is the multiplier on all my organic-traffic work. Cheap. Land it alongside the first content surfaces.
- **`portal-shell`** (impact 5, effort 4, risk high) — Necessary *container* for credit-claims, but on its own it doesn't convert anyone; I value it strictly as the shell credits live in.
- **`team-directory`** / **`office-hours`** (impact 3) — Human-touch + a real booking funnel; nice activation assists, not top-of-funnel movers. Office-hours converts the existing "Builder Hours" promise into a funnel — modest but real.
- **`builders-program-landing`** (impact 4, low risk) — Front-door explainer; ships with the public leaderboard.
- **`cms-page-constructor`** (impact 3) — Enabler for signup + builders landings; pull it forward only because my high-value landings depend on it.
- **Deprioritized from my lens:** `events-refresh-scrape`, `portal-event-hosting`, `portal-library-submission`, `portal-ambassador-apply`, `portal-activity-log`, `admin-console`, `admin-review-queues`, `homepage-static-marketing-sections`, `fellows-directory`, `feedback-capture`, `chrome-portal-admin-nav`, `directus-data-model` (as a *visible* deliverable). These are ops/community-management/internal-tooling. They matter to other lenses; they do not directly move signup. I accept them as dependencies and back-office necessities, but I will not let them outrank a conversion surface in sequencing.

---

## 2) PROPOSED EPICS

I group by **funnel stage**, because that's how I reason about growth.

### EPIC G1 — "Stop the Bleak" (Direct Conversion Spine)
The on-site path from interest → account → claimed credits. **Highest revenue leverage.**
- `signup-builder-program-landing`, `auth-sessions`, `portal-shell`, `portal-credit-claims`
- *Outcome:* a builder can sign up and claim $100 in credits without ever leaving dev.nebius.com — fully instrumentable.

### EPIC G2 — "Organic Magnet" (SEO + Discovery)
Self-owned, indexable content surfaces that pull and route organic traffic.
- `content-library`, `ecosystem-integrations-directories`, `apps-showcase`, `events-directory`, `search`, `sitemap-seo-isr`
- *Outcome:* the dev hub ranks for builder/integration/event intent and routes it to G1.

### EPIC G3 — "Highest-Intent Pages" (Bottom-of-Funnel Optimization)
Make the product pages convert harder and iterate faster.
- `product-page-resource-rails`, `cms-page-constructor`
- *Outcome:* DevRel can tune the highest-intent pages without a deploy; CMS-managed CTAs.

### EPIC G4 — "Proof & Pull-Back" (Social Proof + Retention)
Surfaces that build credibility and bring builders back.
- `leaderboard` (public half), `builders-program-landing`, `homepage-events-map-hero`, `homepage-dynamic-content-sections`, `team-directory`, `office-hours`
- *Outcome:* fresh, credible, return-worthy homepage and community front door.

### EPIC G5 — "Two-Sided Economy" (Community Operating System) — *acknowledged, not owned by me*
The contribution + gamification + review machinery. I treat this as **necessary plumbing for parity**, sequenced late from my lens.
- `directus-data-model`, `portal-event-hosting`, `portal-library-submission`, `portal-ambassador-apply`, `portal-activity-log`, `admin-console`, `admin-review-queues`, `chrome-portal-admin-nav`, `fellows-directory`, `feedback-capture`, `homepage-static-marketing-sections`, `events-refresh-scrape`
- *Outcome:* full parity, real points economy, working review queues. Other lenses should own the prioritization *within* this epic.

---

## 3) RELEASE SEQUENCE v0.1 → v2.0

Principle: **v0.x = foundation + low-risk conversion wins that ship value immediately; v1.x = the core acquisition surface (the credits spine + the organic magnet); v2.0 = full parity (the community OS).** I deliberately pull the cheap, high-ROI conversion landing and the SEO content surfaces as early as possible, and I pay down auth in v1.0 because the revenue spine is worth the risk.

### v0.1 — Foundation + instant conversion landing (low-risk wins)
- `directus-data-model` — *Unavoidable data foundation; nearly every surface below reads it. Build the collections + role matrix once.*
- `cms-page-constructor` — *Generalize the rendering stack they already run; unblocks my signup + builders landings.*
- `signup-builder-program-landing` — *My single best ROI item: a dedicated $100-credits conversion landing, low-risk, ship it day one as the target for all paid + organic traffic.*
- `sitemap-seo-isr` — *Cheap, and it makes every subsequent content surface actually discoverable. Their current sitemap hides first-party pages — fix that before we publish content.*

### v0.2 — The Organic Magnet, part 1 (SEO content surfaces)
- `content-library` — *The SEO + activation engine and the data backbone for rails/search/spotlights. Highest-leverage low-risk content surface.*
- `product-page-resource-rails` — *Turn the three highest-intent pages into CMS-managed, deploy-free surfaces. Depends on the library.*
- `apps-showcase` — *Cheap "built with Nebius" social proof; also a dependency for ecosystem + search.*

### v0.3 — The Organic Magnet, part 2 (directories that rank)
- `ecosystem-integrations-directories` — *~85 partner names = ~85 search terms; browsable grid + "Submit your project" CTA. Pure organic win.*
- `events-directory` — *Keep event traffic in our funnel with instrumentable RSVP deep-links instead of bouncing to nebius.com/events.*
- `team-directory` — *Low-risk human-face surface; prerequisite for the office-hours funnel. Slot it in while it's cheap.*

### v1.0 — The Conversion Spine (pay down auth, own the credits funnel)
- `auth-sessions` — *The keystone. Worth the high risk now because nothing below converts without it. Hard requirement: reconcile with auth.nebius.com SSO, not a parallel identity (see §4).*
- `portal-shell` — *The authenticated container the credits flow lives in.*
- `portal-credit-claims` — *THE acquisition lever. On-site $100 credit claims, fully owned and instrumented. This release is the whole point of the port from my lens.*
- `search` — *With library/events/apps indexed, make the dead header widget real — route discovery to conversion. Directus fallback keeps launch de-risked.*

### v1.1 — Proof, pull-back, and the office-hours funnel
- `leaderboard` (**public half**: `/builders` top-10 widget + `/builders/all`) — *Public recognition loop drives return visits; the public landing ships now even though live ranking waits on the activity ledger.*
- `builders-program-landing` — *Front-door explainer for the program; ships with the public leaderboard (same CMS route).*
- `office-hours` — *Convert the "Builder Hours" marketing promise into a real, auth-gated booking funnel. Depends on team-directory + auth (now present).*
- `homepage-events-map-hero` + `homepage-dynamic-content-sections` — *Raise the homepage conversion ceiling with live proof-of-activity now that events/library/apps data exists.*

### v1.2 — Begin the two-sided economy (contribution funnels that also feed engagement)
- `portal-library-submission` — *Two-sided content + the cheapest portal write-flow; grows the SEO library with community content. (Needs moderation — pairs with the library queue in v2.0, or a minimal interim review.)*
- `portal-ambassador-apply` — *Clean, contained community-leader lead-gen funnel.*
- `portal-activity-log` — *The points ledger that makes the leaderboard "real" and unlocks retention loops.*
- `feedback-capture` — *One endpoint; useful during the beta/port phase to catch funnel friction. Trivial.*

### v2.0 — Full parity (community OS + ops back office)
- `portal-event-hosting` — *Builder-hosted events + linked event-credit requests; transactional, higher-risk write. Full community self-serve.*
- `events-refresh-scrape` — *Keep the now-load-bearing events directory current without manual entry.*
- `admin-console` — *Make the program operable by DevRel without raw Directus access.*
- `admin-review-queues` — *The privileged approve/reject mutations that make the entire portal economy (credits, content, points, ambassadors, event credits) actually function. This is the "make it real" capstone.*
- `leaderboard` (**live-ranking half**) — *Now backed by a populated activity ledger — turn the public widget from sample data into a trustworthy ranking.*
- `homepage-static-marketing-sections` — *Coding-agents section, ecosystem marquee, real program metrics — parity completeness.*
- `chrome-portal-admin-nav` — *Portal/admin navigation shells; depends on those areas existing.*
- `fellows-directory` — *Cheap hidden recognition lever; layer in last.*

---

## 4) RISKS / DEPENDENCIES I WILL NOT COMPROMISE ON

1. **Auth MUST reconcile with Nebius SSO (auth.nebius.com), not fork a parallel Directus identity.** This is my #1 hill. A second identity silo means a builder has one account for the console/credits and a *different* account for the dev hub — that is a worse signup experience than today's bounce, it shatters attribution (I can't tie a dev-hub signup to a paying console account), and it duplicates PII. The whole revenue thesis of this port is *unified, instrumented, on-site conversion*. A forked identity destroys that thesis. (Ref: `auth-sessions` reasoning explicitly flags this reconciliation need.)

2. **The credits claim flow is financial — it cannot ship without rate-limiting, tight auth-gating, and at minimum a manual review path.** `portal-credit-claims` touches money. I want it badly and early (v1.0), but a credits endpoint that can be hammered anonymously or farmed is a fraud vector that will get the whole funnel shut down. If `admin-review-queues` won't be ready until v2.0, then **TF claims need a documented manual-fulfillment SOP and AI Cloud claims a minimal interim review** in v1.0. I will not ship "claim → silent stub" with real credits attached. (The gap analysis notes approve/reject handlers are currently no-ops — that is unacceptable for the credits queue specifically.)

3. **Attribution/instrumentation is a launch requirement, not a follow-up.** Every conversion surface I'm prioritizing — signup landing, credit claims, event RSVPs, product-page CTAs — must emit analytics events from day one (UTM capture on `signup-builder-program-landing`, claim-funnel events, RSVP click tracking). Shipping these surfaces "blind" wastes the entire reason for owning them on-site. I would block any of these going live without basic funnel instrumentation wired.

4. **Self-enumerating SEO (`sitemap-seo-isr`) must land before we publish the content surfaces, and every content surface must emit per-page OG/SEO meta.** Their current sitemap delegates only to nebius.com/docs.nebius.com — if we publish library/events/apps without first-party sitemap + meta, we are building organic-traffic surfaces that **crawlers can't see**. That is wasted effort. Cheap to do right; expensive to retrofit after we've trained crawlers to ignore us.

5. **The public leaderboard must not ship with hollow/sample data.** A ranking that's visibly fake undercuts trust in the whole program. I split `leaderboard` deliberately: public landing/explainer early (v1.1), *real* ranking only after the activity ledger exists (v2.0). I will not let a "top builders" board go live ranked by placeholder points — it's worse than no board.

6. **Drafts/UGC must never leak into public conversion surfaces.** When community write-flows arrive (`portal-event-hosting` injecting DRAFT events, `portal-library-submission` feeding the SEO library), status-filtering is mandatory so unreviewed user content can't appear on the public directories that carry our brand and our SEO. A spammy public library/events page poisons the exact organic-traffic asset G2 exists to build.

---

### One-paragraph closing argument
The other lenses will rightly push for the community operating system, schema rigor, and admin correctness. I'm not against any of it — but **the reason to port this site at all, from a business standpoint, is to convert builders into paying Nebius accounts on surfaces we own and measure.** That means: ship the dirt-cheap conversion landing (`signup-builder-program-landing`) and the SEO content magnet (`content-library`, directories, rails) in **v0.x** where they pay off immediately; pay down auth and stand up the **on-site $100 credits funnel** (`portal-credit-claims`) in **v1.0** as the centerpiece; and let the community-OS plumbing (`portal-*` writes, `admin-*` queues, live leaderboard) land in **v1.2–v2.0**. Front-load revenue, back-load back-office. If we sequence the heavy community machinery ahead of the conversion spine, we will have spent the most effort on the surfaces that move signup the least.
