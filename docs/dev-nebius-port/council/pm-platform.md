# Council Proposal — Platform / Infra PM

**Lens:** Technical soundness. Sequence by dependency and risk, not by demo appeal. Auth and the data model land before anything that writes. Low-risk static/CMS surfaces ship first to validate the pipeline. The Directus schema, role-permission matrix, Typesense index, and ISR caching must be *right* before they carry user data or money.

**One-sentence thesis:** dev.nebius.com is a 4-page marketing shell on *our exact stack* (Next.js Pages Router + Gravity Page Constructor + Directus + HubSpot). The port is therefore not a rebuild — it is (a) standing up a **schema + identity foundation** that does not exist yet, then (b) hanging **read-only CMS surfaces** off the pipeline they already run, and only then (c) opening **authenticated write-flows** that touch credits, content, and points. Sequence violations here are not cosmetic; getting per-user Directus permissions or a credit-claim mutation wrong is a **data-exposure / money-loss incident**, not a bug.

---

## 1) TOP priorities (my lens)

Ranked by *foundational leverage and blast radius*, not by impact score alone.

### P0 — `directus-data-model` (the keystone; cited as a dependency by ~18 of 28 gaps)
This is the single highest-leverage item on the board and I will not let it be treated as "medium effort, do it alongside." `effort:3 / risk:med` undersells it. dev.nebius.com runs Directus **only as a headless image/content store** (72 `directus_files` refs, zero program collections). Almost everything else — events, library, apps, ecosystem, team, sitemap, feedback, every portal flow, every admin queue — has `directus-data-model` in its `dependencies` array. Our `apps/web/src/lib/directus.ts` already encodes the correct access model and we must port it verbatim: three clients —
- `directusServer()` (static admin token, server-only, for SSG/SSR/API),
- `directusAsUser(token)` (per-request user token routed through **role permissions**),
- `directusPublic()` (anon, only for public-permission-marked ops),
plus `assetUrl()` for transformed assets.

The risk is **not** writing the SDK — it's the **role-permission matrix**. Get per-user scoping wrong and `directusAsUser()` becomes a data-exfiltration vector (a builder reading another builder's `credit_requests`). This must be designed, written down, and **permission-tested** before any write-flow exists. This is my non-negotiable #1.

### P0 — `auth-sessions` (the identity keystone; gates the entire portal + admin)
`impact:5 / effort:4 / risk:high`, and correctly so. Today every "Log in" on dev.nebius.com bounces to `auth.nebius.com` / external consoles — there is **zero first-party session layer**. Our `apps/web/src/lib/auth.ts` forwards to Directus `/auth/login`, stores access+refresh in **httpOnly cookies**, **transparently rotates** expired access tokens via the refresh token, supports `?next=` redirects, and exposes `requireRole`/`enforceRole` getServerSideProps gates. Nothing stateful or personalized can exist without it.

**The risk I will not wave through:** the gap analysis flags it explicitly — *"may need reconciliation with the existing Nebius SSO at auth.nebius.com rather than a parallel Directus identity."* This is a **decision that must be made before v1.x**, not discovered mid-portal-build. Standing up a parallel Directus identity that later has to be migrated onto corporate SSO is the worst outcome. I am pushing for a spike in v0.x (see §4 R1) that answers: *do builders authenticate against Directus, or does Directus trust an OIDC/SSO assertion from auth.nebius.com?* The cookie/refresh/role machinery is identical either way; the **identity source** is the fork.

### P1 — `content-library` (the content backbone that 4+ surfaces read from)
`impact:5 / effort:3 / risk:low`. Low risk, high leverage — exactly what should anchor the first real surface. `library_articles` is the source of truth for `product-page-resource-rails`, the search index, `homepage-dynamic-content-sections` (WorkshopSpotlight), and `portal-library-submission`. Building it early means we **exercise the schema + ISR pipeline on a read-only surface** before betting auth on it. It is the cheapest way to prove the data model is shaped right.

### P1 — `events-directory` (highest-impact read-only surface; second backbone)
`impact:5 / effort:3 / risk:med`. The risk is purely **client-only Leaflet touching `window`** — a solved problem (SSR-safe `dynamic()` import, already done in our `EventsMap.tsx`). Data is read-only. This is a top-impact surface that does *not* require auth, so it belongs early. It also unblocks `search`, `homepage-events-map-hero`, and `homepage-dynamic-content-sections`.

### P2 — guard the write-flow cluster (`portal-*`, `admin-*`, `portal-credit-claims`)
I am flagging these as the **highest-risk region of the entire board** and insisting they land last and together. `portal-credit-claims` (`risk:high`) touches **money** ($100 grants), `portal-event-hosting` does a **multi-collection transactional write** with rollback into the *same* `events` collection that feeds the public directory, and `admin-review-queues` are the **privileged mutations** that approve credits and grant points. Per the gap analysis, the approve/reject handlers are **currently no-ops** — the entire portal economy is non-functional until these write back. That is fine: it means we ship the *shell* read-only first and wire mutations only when the data model, auth, rate-limiting, and audit trail are all proven.

**Effort trap I'm calling out now:** the dashboards/leaderboard/activity log are full of **sample data**. "Porting the portal" is *not* done when the UI renders — it's done when **points/credits/events aggregation is real**. The gap analysis says this for `portal-shell`, `leaderboard`, `portal-activity-log`. A hollow leaderboard "undercuts trust." I'd rather ship the public top-10 widget late-but-real than early-and-fake.

---

## 2) Proposed EPICS

Themed by **shared foundation and risk class**, which is the only grouping that makes sequencing safe.

### EPIC A — Foundation: Identity & Data Model *(blocks everything stateful)*
- `auth-sessions`, `directus-data-model`
- Plus the SSO-reconciliation spike (sub-task of `auth-sessions`).
- **Exit criterion:** schema migrations applied to dev.nebius.com's Directus, role-permission matrix documented + tested, cookie/refresh/role gates working against the chosen identity source.

### EPIC B — Read-Only Surfaces on the Existing Pipeline *(low-risk, no auth, validates the schema)*
- `content-library`, `events-directory`, `apps-showcase`, `team-directory`, `ecosystem-integrations-directories`, `fellows-directory`
- These all slot into the **Page Constructor + Directus + ISR** pipeline dev.nebius.com already runs. Pure reads.

### EPIC C — CMS Routing & Discoverability *(generalizing the stack they already have)*
- `cms-page-constructor`, `sitemap-seo-isr`, `signup-builder-program-landing`, `builders-program-landing`
- Generalizes their fixed-4-page Page Constructor into data-driven `[...slug]` routes; makes first-party content crawlable (their sitemap today only delegates to nebius.com/docs.nebius.com).

### EPIC D — Search *(thin layer, but only meaningful once there's content)*
- `search`
- Depends on B existing (`content-library`, `events-directory`, `apps-showcase`). The **Directus `_icontains` fallback de-risks launch**; Typesense is an *optional* provisioned dependency gated by `typesenseConfigured()`. Ship on fallback, add the index when content volume justifies it.

### EPIC E — Homepage Enrichment *(read-only, depends on B)*
- `homepage-dynamic-content-sections`, `homepage-events-map-hero`, `homepage-static-marketing-sections`
- Threads live data (next-3 events, workshop/builder spotlight) through the landing page. `homepage-events-map-hero` carries an **above-the-fold JS-weight / perf-budget** caveat (Leaflet + mesh) — `risk:med`.

### EPIC F — Builder Portal *(auth-gated; container + write-flows)*
- `portal-shell` (the container), then `portal-credit-claims`, `portal-event-hosting`, `portal-library-submission`, `portal-ambassador-apply`, `portal-activity-log`
- **All depend on EPIC A.** This is where the points/credits/events aggregation must become real, not sample data.

### EPIC G — Admin Operations & Review Queues *(privileged mutations; closes the loop)*
- `admin-console` (the shell), then `admin-review-queues`
- `admin-review-queues` depends on **every** portal flow that feeds a queue. This is the "make it real" capstone — without it the portal economy is decorative.

### EPIC H — Platform Cross-Cuts *(small, slot in opportunistically)*
- `feedback-capture` (1 endpoint + 1 collection, fails safe to console.log — useful during the beta port), `chrome-portal-admin-nav` (presentational; depends on portal/admin existing), `events-refresh-scrape` (admin-gated ops automation; brittle Tavily parser, depends on events + auth).

---

## 3) RELEASE SEQUENCE (v0.1 → v2.0)

Principle: **v0.x = foundation + low-risk reads that prove the pipeline. v1.x = core authenticated surface, mutations wired for real. v2.0 = full parity + ops automation.** Every release is independently shippable to dev.nebius.com and reviewable as its own branch.

| Release | Gap ids | One-line reasoning (my lens) |
|---|---|---|
| **v0.1 — Data foundation** | `directus-data-model` | The keystone ~18 gaps depend on. Schema + 3-mode SDK + role-permission matrix first, or everything downstream is built on sand. **No UI, all infra.** |
| **v0.2 — Identity foundation** | `auth-sessions` (incl. SSO-reconciliation spike) | Resolve Directus-identity-vs-`auth.nebius.com`-SSO **before** any portal work. Cookie/refresh/`requireRole` gates land here. Highest-risk foundation — isolate it. |
| **v0.3 — First read surfaces** | `content-library`, `apps-showcase`, `team-directory` | Lowest-risk, highest-leverage reads. Exercise schema + ISR on real content before betting auth on it. `content-library` is the backbone 4 later surfaces read. |
| **v0.4 — More read surfaces + CMS routing** | `events-directory`, `ecosystem-integrations-directories`, `cms-page-constructor`, `fellows-directory` | `events-directory` = top-impact read (SSR-guard Leaflet, the only risk). `cms-page-constructor` generalizes their existing stack so DevRel ships pages without a deploy. `fellows` is a free static win. |
| **v0.5 — Discoverability + search-on-fallback** | `sitemap-seo-isr`, `product-page-resource-rails`, `search` (Directus fallback only) | Self-enumerating sitemap (theirs only delegates offsite). Resource rails turn their 3 highest-traffic pages CMS-managed. Ship `search` on the **`_icontains` fallback** — no Typesense provisioning yet. |
| **v1.0 — Core surface complete + homepage** | `signup-builder-program-landing`, `builders-program-landing`, `homepage-dynamic-content-sections`, `homepage-static-marketing-sections` | The public builder hub is now a real destination: program front doors + live homepage data. All read-only. Marks "core surface" parity sans auth-gated features. |
| **v1.1 — Search hardening + hero polish** | `search` (Typesense index + sync), `homepage-events-map-hero` | Provision Typesense + indexer **only now**, when content volume justifies it; `typesenseConfigured()` flips the path with zero app changes. Events-map hero last in the read-only set — it's the heaviest above-the-fold JS, perf-budget it. |
| **v1.2 — Portal shell (read-only)** | `portal-shell`, `chrome-portal-admin-nav` | Stand up the authenticated container, profile editor, onboarding checklist, sidebars. **Dashboards stay read-only/sample** — no money or points mutations yet. Proves the auth-gated area + per-user PATCH path. |
| **v1.3 — Low-blast-radius portal writes** | `portal-library-submission`, `portal-ambassador-apply`, `feedback-capture` | Wire the **least dangerous** writes first: UGC into a review queue (not published live) + a contained application form + the fail-safe feedback endpoint. Build the mutation/rate-limit/sanitization muscle on items that don't touch money. |
| **v1.4 — Admin console + first real queues** | `admin-console`, `admin-review-queues` (library + ambassador slices only) | The approval surface must exist **before** we open money flows. Make the library + ambassador queues' approve/reject **actually write back** (currently no-ops) — this is the first "make it real" slice and proves the audit-trail pattern. |
| **v1.5 — Activity ledger + points become real** | `portal-activity-log`, `leaderboard` | The hardest "make it real": points aggregation across events/library/self-reports. Only once the ledger is populated does the leaderboard rank truthfully. **A hollow leaderboard is worse than none** — gate the public top-10 on real data. |
| **v2.0 — Money flows + full parity** | `portal-credit-claims`, `portal-event-hosting`, `admin-review-queues` (credit + per-event-credit slices), `events-refresh-scrape` | The **money/transactional** cluster lands last, on a fully-proven foundation: tight auth-gating, rate-limiting, audit trail, working approval queues. `portal-event-hosting`'s DRAFT-status filtering must keep user rows out of the public directory. `events-refresh-scrape` automates ops to close parity. |

**Why this ordering and not impact-descending:** four of the five `impact:5` gaps (`portal-shell`, `portal-credit-claims`, plus the high-risk admin items) are **late** here on purpose. They sit atop the longest dependency chains and carry the highest blast radius. Shipping them early would mean shipping sample-data shells or unguarded money endpoints. Conversely I pull `directus-data-model` and `auth-sessions` to the very front even though one is "only" `effort:3` — leverage and dependency fan-out, not score, drive foundation ordering.

---

## 4) Risks / dependencies I will NOT compromise on

**R1 — Identity source decided before any portal code (blocks EPIC F entirely).**
The gap analysis explicitly flags `auth-sessions` may need to reconcile with `auth.nebius.com` SSO vs. a parallel Directus identity. **This decision happens in v0.2 as a spike, full stop.** Building the portal against a throwaway Directus identity that later migrates to corporate SSO is rework we can see coming. The cookie/refresh/`requireRole` plumbing is identical either way — only the *identity provider* forks — so the spike is cheap and the cost of skipping it is enormous.

**R2 — Role-permission matrix is designed, documented, and permission-tested before any `directusAsUser()` write ships.**
`directus-data-model`'s `risk:med` is entirely concentrated here: *"getting per-user permission scoping wrong is a data-exposure vector."* A builder must not be able to read another builder's `credit_requests`, `ambassador_applications` (PII: location), or `activities`. I require an explicit permission test suite (per-role, per-collection read/write assertions) as an **acceptance gate on v0.1**, not a v2.0 afterthought.

**R3 — Money and points mutations land last, on proven rails — never co-shipped with the shell.**
`portal-credit-claims` ($100 grants) and `admin-review-queues` (credit approval) are the only places real value moves. They require, as hard preconditions: auth (R1), permissions (R2), **rate-limiting**, an **audit trail**, and a **working approval queue**. Hence v2.0. I will block any attempt to ship a credit-claim endpoint before its approval queue writes back — an auto-approving or unreviewed money flow is an incident waiting to happen.

**R4 — DRAFT/PENDING status filtering on shared collections is non-negotiable.**
`portal-event-hosting` injects user-generated `status=DRAFT` rows into the **same `events` collection that powers the public directory**, and `portal-library-submission` feeds the same `library_articles` that renders on `/library`. The public read queries **must** filter `status=published` (or equivalent) from day one of those collections existing, or user drafts/unmoderated content leak to production. This is a schema + query-contract requirement that ships *with* the data model (v0.1), not patched in when the write-flow arrives.

**R5 — "Done" means data is real, not that the UI renders.**
Per the gap analysis, dashboards, leaderboard, and activity log currently run on **sample data**, and queue approve/reject are **no-ops**. I will not let a portal release be marked done on UI render alone. The points/credits/events **aggregation** is the actual work (v1.5 / v2.0). A leaderboard or dashboard that looks alive but isn't erodes builder trust more than a missing feature.

**R6 — Search ships on the Directus fallback; Typesense is deferred and gated.**
`search`'s `_icontains` fallback across events + library_articles + projects de-risks launch (v0.5). Provisioning/indexing/syncing Typesense (`nebius_builders` collection) is an **operational dependency** — a service to run and keep in sync — and is pulled forward only to v1.1 when content volume justifies it. `typesenseConfigured()` already flips primary-vs-fallback with **zero app-code change**, so this staging is free. Do not let "we need search" pull a stateful Typesense cluster into the foundation phase.

**R7 — Preserve their ISR + Page Constructor pipeline; don't re-architect what works.**
dev.nebius.com's IA (product-router pages, Gravity Page Constructor, Directus content, ISR-friendly Next.js) is **strong and on our exact stack**. Every read surface (EPIC B/C/E) must render through *their* existing pipeline with ISR revalidation (our public/CMS pages already set `revalidate`), not a parallel rendering path. The port is **additive** — new collections + new routes on the same engine — and I'll push back on any proposal that reaches for a different framework or rendering model for surfaces the existing stack already serves.

**R8 — `events-refresh-scrape` is ops-automation, not a launch dependency, and is a standing maintenance cost.**
It calls an **external Tavily API (own key + rate limits)** and **parses upstream HTML** that will drift. Useful once the directory is live (v2.0), but its parser brittleness is an ongoing cost, not a one-time build. The events directory must be **manually maintainable** without it — the scrape is a convenience, never a hard dependency of the public surface.

---

### Where I expect to argue with other lenses
- **Growth/DevRel will want `portal-credit-claims` and the leaderboard early** (they're the strongest acquisition/engagement levers). I'll hold the line: those are the **highest-blast-radius** items and depend on the longest chains. Early = sample-data theater or unguarded money. Ship the read-only program landings (`builders-program-landing`, `signup-builder-program-landing`) in v1.0 to capture intent *now*, and make the money flow *real* in v2.0.
- **Content/SEO will want sitemap + rails immediately.** Agreed in spirit, but they depend on `directus-data-model` (rails read `library_articles`) and on knowing which CMS pages exist — so v0.5, right after the first read surfaces, not v0.1.
- **Design/UX will want the homepage events-map hero up front.** It's `risk:med` for above-the-fold JS weight and depends on `events-directory`. It lands v1.1 after the events data and perf budget are proven — not in the foundation.
