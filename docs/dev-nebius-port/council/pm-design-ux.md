# Council Proposal — Design / UX PM

**Lens:** Coherent UX, navigation information architecture, visual polish matching dev.nebius.com.
**My non-negotiable:** the site must look finished and feel coherent **at every single release**. A
half-built surface in the nav is worse than no surface at all. I will fight any sequence that ships a
menu item leading to sample data, an empty grid, a 404-adjacent stub, or a "Sign in to book" wall
behind a feature we haven't actually wired.

dev.nebius.com today is *small but tight*: 4 pages, a strong product-router IA, Gravity UI theming,
one clean public nav + footer, a header search box. That tightness is an asset. My job is to grow it
to parity **without ever making it feel like a construction site**. Every release I sign off on must
be demoable end-to-end with real content and no dead ends.

---

## 1. Top priorities (my lens)

Ranked by what protects UX coherence, IA legibility, and the signature visual experiences.

### P0 — The two signature experiences are the whole reason a dev hub earns its own domain
- **`events-directory`** (impact 5) — the **live Leaflet map with city-pin filtering** is the single
  most distinctive, "this is alive" surface we have. dev.nebius.com currently throws "Hackathons &
  Events" *off-site* to nebius.com/events; clawing that back on-domain with a map is the strongest
  proof-of-activity moment in the entire port. This is my #1.
- **`ecosystem-integrations-directories`** (impact 4, effort 2) — the **~85-partner ecosystem grid**
  with Kind + product filters is the second signature experience. dev.nebius.com only has a static
  text matrix (LiteLLM, LangChain, CrewAI…) buried on the Token Factory page. A browsable, filterable
  grid is a polish-forward, low-effort win that makes the hub feel like a real ecosystem rather than a
  link list. The R3F/Hero3D membrane is *optional* polish — I want the grid first, the 3D later.

### P0 — IA / chrome is the connective tissue; without it, every new surface is orphaned
- **`chrome-portal-admin-nav`** (the **public** half: Products/Docs mega-menus, footer, theme toggle).
  The gap analysis scores this impact 2 and gates it behind portal/admin existing — **I push back on
  that sequencing.** The *public* nav + footer + theme work is the IA spine that every directory I add
  needs in order to be reachable and not orphaned. Every time I add `/events`, `/library`, `/apps`,
  `/team`, those pages need a home in the nav and footer or they become unreachable islands. The
  portal/admin sidebars genuinely do depend on those areas — but the public chrome must come **early**,
  decoupled from the authenticated shells. I am formally splitting this gap (see Epics).

### P1 — Content directories that make the hub feel substantive (and are low-risk, demoable today)
- **`content-library`** (impact 5, effort 3, **low risk**) — typography-first filterable grid;
  the content backbone several other surfaces read from. Pure read-only CMS. Ships clean.
- **`apps-showcase`** (impact 4, effort 2, **low risk**) — "built with Nebius" social proof; gradient
  cover cards, award/featured pills. dev.nebius.com has *zero* project showcase today. Cheap, polished,
  high narrative value.
- **`team-directory`** (impact 3, effort 2, **low risk**) — puts a human face on "Builder Hours."
  Low-risk read-only grid and the natural prerequisite for office-hours.

### P1 — Product-page enhancement that respects their existing IA
- **`product-page-resource-rails`** (impact 4, effort 2, low risk) — this is the most *respectful*
  port we can do: it upgrades their three existing highest-traffic pages (`/ai-cloud`,
  `/token-factory`, `/serverless`) in place, swapping hand-curated static cards for CMS-driven rails.
  No new routes, no new nav, no risk of an empty surface. From a coherence standpoint this is almost
  free and it makes the pages they already love editable by DevRel without a deploy.

### P2 — Signature homepage moments, but only *after* their data source is real
- **`homepage-events-map-hero`** (impact 3) and **`homepage-dynamic-content-sections`** (impact 3).
  The events-map hero is a gorgeous above-the-fold moment — but it is **strictly downstream of
  `events-directory`**. I will not plot an empty globe. These land only once events data is live.

### What I deprioritize (from my lens specifically)
- **`fellows-directory`** — it's `noindex,nofollow`, hidden from nav and sitemap. By construction it
  has **zero IA or visual-coherence impact**. It can land literally whenever (it's a 1-effort static
  array); I have no opinion on its timing beyond "don't let it block anything."
- **`portal-*`, `admin-*`, `auth-sessions`** — these matter enormously to the program, but from a
  *visual/IA coherence* lens they are **back-of-house**. My only hard requirement here is: **do not
  surface a portal/admin nav entry, a "Log in" affordance that leads somewhere stateful, or any
  "claim credits / host event / submit" CTA until the flow behind it is real and the review queue
  that processes it exists.** A button that creates a PENDING row no human can approve is a broken
  promise to the user. More on this in Risks.

---

## 2. Proposed epics

I group by **UX coherence units** — bundles that can be designed, themed, and shipped as one
self-consistent experience, never leaving a partial surface.

### EPIC A — IA & Chrome Foundation (the spine)
*Make the site navigable and on-brand before adding rooms to the house.*
- `chrome-portal-admin-nav` **(public half only)** — Products/Docs mega-menus, richer footer, theme
  toggle. (The authenticated sidebars split out to Epic G.)
- `sitemap-seo-isr` — self-enumerating sitemap so new first-party surfaces are discoverable as their
  own pages (today their sitemap only delegates to nebius.com/docs.nebius.com). IA hygiene.
- `cms-page-constructor` — the `[...slug]` catch-all so DevRel can spin up arbitrary on-brand pages
  without a deploy. Same Gravity Page Constructor stack they already run; pure generalization.

### EPIC B — Signature Experiences (the showpieces)
*The two surfaces that justify the domain's existence; maximum visual distinctiveness.*
- `events-directory` — live map + city filter.
- `ecosystem-integrations-directories` — the ~85-partner filterable grid (+ `/integrations` standalone).
  3D membrane treated as a polish toggle inside this epic, deferred to v2.0.

### EPIC C — Content & Social Proof Directories (the substance)
*Read-only, low-risk, polished grids that make the hub feel full and credible.*
- `content-library` (+ detail pages, YouTube embeds).
- `apps-showcase` (+ detail pages).
- `team-directory` (+ member detail).
- `product-page-resource-rails` (enhances existing product pages from the library source of truth).

### EPIC D — Search (the connective utility)
*Make their existing-but-hollow header search box actually work — but only once there's content.*
- `search` — Typesense primary + Directus fallback; real `/search?q=` results grid + header dropdown.

### EPIC E — Homepage Liveness (the front-door upgrade)
*Thread real data through the landing page once the sources exist.*
- `homepage-events-map-hero`
- `homepage-dynamic-content-sections` (ActiveEvents, WorkshopSpotlight, BuilderSpotlight)
- `homepage-static-marketing-sections` (CodingAgents, EcosystemPartners marquee — the deltas vs theirs)

### EPIC F — Platform Foundation (invisible but required)
*The data + identity substrate. Back-of-house; must precede any stateful surface.*
- `directus-data-model` — collections + typed SDK + role/permission matrix.
- `auth-sessions` — Directus-JWT cookie sessions, role gates.
- `feedback-capture` — cheap unauthenticated endpoint, useful during the porting/beta phase.

### EPIC G — Builder Program Operating System (the stateful program)
*The authenticated portal + admin. Ships as a coherent bloc, never piecemeal into the nav.*
- `builders-program-landing` + `leaderboard` (public landing/explainer can lead; "real" ranking waits
  on the activity ledger).
- `portal-shell`, `portal-credit-claims`, `portal-event-hosting`, `portal-library-submission`,
  `portal-ambassador-apply`, `portal-activity-log`.
- `office-hours` (auth-gated Calendly reveal; depends on team-directory + auth).
- `signup-builder-program-landing`.
- `admin-console`, `admin-review-queues`.
- `chrome-portal-admin-nav` **(authenticated half: PortalLayout/Sidebar, AdminLayout/Sidebar).**

---

## 3. Release sequence v0.1 → v2.0

Guiding rule for **every** release: *demoable end-to-end, real content, no dead ends, no orphaned nav
items, no stubs surfaced to users.* v0.x = foundation/low-risk wins, v1.x = core surface, v2.0 = full
parity.

### v0.1 — IA spine + data substrate (foundation, zero user-facing risk)
| gap id | one-line reasoning |
|---|---|
| `directus-data-model` | Everything downstream needs the collections + typed SDK; design nothing on top until the schema exists. |
| `chrome-portal-admin-nav` *(public half)* | Build the Products/Docs mega-menus + footer + theme toggle **first** so every later directory has a home in the IA and is never orphaned. |
| `sitemap-seo-isr` | Self-enumerating sitemap from day one so each surface we add is discoverable as its own page, not invisible. |
| `feedback-capture` | One unauthenticated endpoint; lets us collect beta feedback throughout the port. Cheap, safe. |

*Why this is coherent:* no new visible rooms yet — we've laid the hallway (nav/footer/theme) and the
foundation (data model). The site still looks exactly like dev.nebius.com, just wired for growth.

### v0.2 — First content directories (low-risk, high-polish, demoable)
| gap id | one-line reasoning |
|---|---|
| `content-library` | Read-only typography-first grid; the content backbone; lands clean with real CMS data. |
| `apps-showcase` | "Built with Nebius" social proof; lowest effort/risk visible win; fills an obvious credibility gap. |
| `team-directory` | Human face on the program; read-only; prerequisite for office-hours later. |
| `product-page-resource-rails` | Upgrades their 3 existing product pages in place from the library — no new nav, no empty-surface risk. |

*Why this is coherent:* three new nav entries, all backed by real CMS content, all polished grids.
The hub now feels substantive. Nothing here is stateful or behind auth, so nothing can half-fail.

### v0.3 — Signature experience #1 + CMS page engine
| gap id | one-line reasoning |
|---|---|
| `events-directory` | The live map is the showpiece; SSR-guard the Leaflet dynamic import; read-only data means low risk despite high impact. |
| `ecosystem-integrations-directories` | Signature grid #2 (sans 3D); mostly bundled static + read-only projects; pairs naturally with apps-showcase. |
| `cms-page-constructor` | The `[...slug]` engine so DevRel can author on-brand pages (e.g. /about-this-build) without deploys. |

*Why this is coherent:* the two signature visual experiences are now live with real data, on the same
Gravity theme. This is the release where the hub stops looking like a 4-page microsite. **Hard
constraint: `events-directory` ships its map populated from real events before I sign off — no empty
globe.**

### v0.4 — Search + homepage liveness (now that content exists to power them)
| gap id | one-line reasoning |
|---|---|
| `search` | Their header search box becomes real *only now* that library/events/apps are indexed content to search. |
| `homepage-dynamic-content-sections` | ActiveEvents / WorkshopSpotlight / BuilderSpotlight thread live data through the landing page; sources now exist. |
| `homepage-static-marketing-sections` | CodingAgents + EcosystemPartners marquee — the homepage deltas vs theirs; no data dependency. |
| `homepage-events-map-hero` | The above-the-fold globe; gorgeous, but strictly downstream of events data, so it lands here. |

*Why this is coherent:* the homepage now feels alive and the search box finally does something. We've
reached a fully polished, coherent **marketing + content hub** — and we've done it with **zero auth
surface exposed**. This is a natural "v0 done" demo milestone: everything public, everything real.

### v1.0 — Auth + portal shell + public program front door (core builder surface begins)
| gap id | one-line reasoning |
|---|---|
| `auth-sessions` | The keystone; introduce the login affordance only now, when there's an actual signed-in destination to land in. |
| `portal-shell` | The authenticated home (dashboard, checklist, profile editor) — the container every write-flow lives in. |
| `chrome-portal-admin-nav` *(portal half)* | PortalLayout/Sidebar now have a real area to navigate; this is why the authed chrome was split to here. |
| `builders-program-landing` | Public CMS-authored program explainer — the on-brand front door to the program; low risk, ships with the portal. |
| `office-hours` | Auth-gated Calendly reveal; team-directory + auth now both exist, so "Sign in to book" leads somewhere real. |

*Why this is coherent:* the moment we expose "Log in," there is a genuine, populated portal behind it.
**Constraint: the portal-shell dashboard must NOT ship visibly with sample-data stat cards. Either wire
the aggregation or render honest empty/zero states — no fake numbers in a shipped UI.**

### v1.1 — Portal write-flows + their matching admin queues (always paired)
| gap id | one-line reasoning |
|---|---|
| `admin-console` | Stand up the ops shell first so every write-flow below has a place to be reviewed. |
| `portal-credit-claims` | Highest-value builder flow; ships **with** its admin queue so a claim is never a dead PENDING row. |
| `portal-ambassador-apply` | Contained lead-gen flow; ships with its review queue. |
| `portal-library-submission` | Two-sided library contribution; ships with its review queue + moderation. |
| `admin-review-queues` | The approve/reject surfaces for the above — these are currently no-ops; making them real is the single biggest "make it real" task, and I will not let a portal CTA ship without its queue working. |

*Why this is coherent:* **every user-facing "submit/claim/apply" CTA in this release has a working
admin approval path on the other side.** No broken promises. This is my hardest sequencing rule.

### v1.2 — Gamification surfaces (only once the ledger is real)
| gap id | one-line reasoning |
|---|---|
| `portal-event-hosting` | Multi-collection transactional flow (event DRAFT + linked credit request); ships with its per-event credit queue (part of admin-review-queues) and proper status filtering so DRAFTs never leak into the public directory. |
| `portal-activity-log` | The points ledger that underpins everything gamified; ships with its activity-approval queue. |
| `leaderboard` | The public top-10 + gated full board land **only now**, because a leaderboard ranked by sample data destroys trust — it needs the activity ledger populated to be honest. |
| `signup-builder-program-landing` | Dedicated join/credits landing assembled from existing CMS blocks; rounds out the conversion funnel. |

*Why this is coherent:* the competitive/recognition loop only appears once it can show *real* numbers.
A hollow leaderboard is the exact kind of half-built surface I exist to prevent.

### v2.0 — Full parity + polish toggles
| gap id | one-line reasoning |
|---|---|
| `events-refresh-scrape` | Admin-only ops automation to keep the events directory fresh; not user-facing, so it lands at parity rather than gating the directory. |
| `ecosystem-integrations-directories` *(R3F/Hero3D membrane)* | The optional 3D polish layer turned on now that the core grid has proven itself — pure visual upgrade, perf-budgeted. |
| `fellows-directory` | Hidden, `noindex`, curated recognition roll-call; zero IA impact so it slots in last with no consequence. |
| *(verify)* `homepage-events-map-hero` perf budget, theme parity audit, full nav/footer link audit | Final coherence pass: every nav item resolves, light/dark parity holds, above-the-fold JS weight is within budget. |

*Why this is coherent:* v2.0 is parity **plus** the deferred polish (3D, scrape automation) — nothing
load-bearing, all upside. The final release is a polish-and-audit pass, not a scramble.

---

## 4. Risks & dependencies I will not compromise on

1. **No half-built surface ever reaches the nav.** This is my prime directive. A menu entry, a CTA, or
   a "Log in" affordance that leads to sample data, an empty grid, a stub, or an un-processable PENDING
   row is a UX failure worse than the feature's absence. Concretely: `leaderboard` does **not** ship
   until `portal-activity-log` populates real points; `portal-shell` stat cards do **not** ship with
   the documented sample data (honest zero/empty states or nothing); every `portal-*` submit flow ships
   **in the same release** as its slice of `admin-review-queues`.

2. **Public chrome must be decoupled from authed chrome and come first.** I formally split
   `chrome-portal-admin-nav`: the public mega-menus/footer/theme go in **v0.1** (they're the IA spine
   every directory needs), the PortalLayout/AdminLayout sidebars go in **v1.0/v1.1** with their areas.
   Treating the whole gap as one unit (and gating it on portal/admin) would orphan every v0.x directory
   in an un-themed, un-navigable shell. I won't accept that.

3. **The two signature experiences must ship with real data, SSR-safe, perf-budgeted.**
   `events-directory` and `homepage-events-map-hero` both touch `window` (Leaflet/mesh) and add
   above-the-fold JS weight. Non-negotiables: dynamic import with `ssr:false`, a real populated dataset
   before launch (no empty globe), and an above-the-fold weight budget on the homepage hero. The map is
   our best "this is alive" moment — shipping it janky or empty would squander it.

4. **Theme + Gravity parity is a release gate, not a nicety.** dev.nebius.com is Gravity UI with a
   coherent theme. Every surface I add must pass light/dark parity and use their design tokens. The
   `ThemeToggle` lands in v0.1 specifically so we never accumulate theme debt across the directories.
   A final theme-parity audit is an explicit v2.0 acceptance item.

5. **Respect their strong product-router IA — enhance, don't replace.** Their product-router homepage
   and `/ai-cloud` `/token-factory` `/serverless` pages are *good*. `product-page-resource-rails`
   upgrades them **in place** (CMS rails swapped for static cards) rather than re-architecting. I will
   resist any proposal that rebuilds those pages from scratch; the lowest-coherence-risk path is
   in-place enhancement.

6. **Search ships only after there's content to search.** `search` is sequenced to **v0.4**, after
   library/events/apps exist. Making their hollow header box "work" while it returns nothing is a
   confidence-eroding dead end. The Directus fallback de-risks the Typesense provisioning, but the
   content dependency is hard.

7. **DRAFT/PENDING content must never leak into public surfaces.** `portal-event-hosting` injects
   user DRAFT rows into the *same* `events` collection that powers the public map. Status filtering on
   the public directory is a correctness gate I will not waive — a half-typed builder draft appearing
   on the public events map is a coherence and trust break.

8. **`auth-sessions` must reconcile with existing Nebius SSO (auth.nebius.com), not blindly fork a
   parallel Directus identity.** From a UX standpoint, two competing "log in" experiences on the same
   domain is incoherent. I flag this as a dependency to resolve before v1.0 — defer to Platform PM on
   the mechanism, but I hold the line that the *user-facing* login experience must be singular and
   consistent.

---

### One-paragraph argument to the synthesizer
Sequence by **coherence, not just by impact or unblocking-order.** The cheapest, most respectful wins
(content directories, in-place product rails) and the two signature visual experiences (events map,
ecosystem grid) should fill out a **fully polished public hub through all of v0.x with zero auth
surface exposed** — that's a clean, demoable "v0 done" the moment we'd want to show anyone. Auth and
the entire portal/admin program form a **back-of-house bloc that only becomes visible in v1.x**, and
every stateful CTA must ship **in lockstep with the admin queue that fulfills it**. Above all: split
the chrome gap so the public IA spine comes first, and never, ever let a half-built surface — empty
grid, sample-data dashboard, hollow leaderboard, un-processable claim — reach the navigation. A site
that is small and coherent beats a site that is large and broken at every release on the way to v2.0.
