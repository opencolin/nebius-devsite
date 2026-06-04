# Council Proposal — Content / SEO PM

**Lens:** Organic discovery and content depth. I optimize for crawlable, indexable, structured content surfaces that compound over time. I sequence by SEO payoff and content readiness, not by engineering elegance or program mechanics.

**One-sentence thesis:** dev.nebius.com today is a 4-page microsite whose own sitemap doesn't even enumerate its own pages — it delegates to nebius.com and docs.nebius.com (`sitemap-seo-isr`). That means the dev hub is **invisible to crawlers as a first-party surface**. The single highest-leverage move in this entire port is to turn dev.nebius.com from 4 indexable URLs into dozens of crawlable, internally-linked, structured-data-rich content surfaces *before* we sink quarters into auth and a points economy that Google will never see. Content compounds; portals don't rank.

---

## 1. Top Priorities (my lens)

Ranked by organic/content payoff, with gap ids:

### P0 — `sitemap-seo-isr` (impact 3, effort 2, risk low)
This is mis-scored as a "3" from a generic lens, but from mine it is the **single most important gap in the document**. Their sitemap is a `sitemapindex` that enumerates *zero* first-party URLs — it only points at nebius.com and docs.nebius.com. Every content surface we build below is worth a fraction of its potential until this exists, because crawlers cannot discover or attribute them to dev.nebius.com. Per-page `<Head>`/OG meta, `noindex` handling, and ISR (60s) revalidation are table stakes. **This must land in the very first release, and every subsequent content surface must register itself into the sitemap as an acceptance criterion.** I will not accept a single new public route that isn't enumerated here.

### P1 — `content-library` (impact 5, effort 3, risk low)
The crown jewel. Today learning content is scattered as ad-hoc link cards across product pages, and the canonical library lives **off-site on GitHub** (`solutions-library`) — meaning all that content equity accrues to github.com, not dev.nebius.com. A typed, filterable, searchable `/library` index plus per-slug `/library/[slug]` detail pages with embedded video and markdown bodies gives us:
- A scalable URL namespace (`/library/*`) that grows linearly with content — every workshop, video, repo, and blog becomes its own indexable page.
- The content backbone that `product-page-resource-rails`, `search`, and the homepage spotlights all read from. It is a dependency for half the high-value content surfaces.
- Genuine content depth (markdown bodies, embedded players) that earns dwell time and ranks for long-tail developer queries ("nebius llama fine-tuning workshop", etc.).
Low risk, read-only CMS. **This is the highest impact-per-risk gap on the board and I want it in v0.x.**

### P2 — `product-page-resource-rails` (impact 4, effort 2, risk low)
Their three highest-traffic pages (`/ai-cloud`, `/token-factory`, `/serverless`) already exist and already rank. Converting their static link cards into CMS-driven rails fed by `surface`-tagged `library_articles` means DevRel can add quickstarts/videos/guides **without a deploy**, continuously deepening the most valuable pages we own. From an SEO lens, enriching existing high-authority pages with fresh, relevant internal links beats spinning up new orphan pages. Cheap (effort 2), low risk, huge content-velocity unlock. Hard-depends on `content-library`.

### P3 — `apps-showcase` (impact 4, effort 2, risk low)
A `/apps` + `/apps/[slug]` "built with Nebius" gallery is pure crawlable social proof with its own URL namespace. Every project is an indexable page with repo/demo links, tags, and a builder byline — exactly the kind of long-tail, keyword-rich content that ranks and that AI answer engines cite. Effort 2, risk low, no auth. It also unblocks `ecosystem-integrations-directories` and feeds `search` and the homepage `BuilderSpotlight`.

### P4 — `ecosystem-integrations-directories` (impact 4, effort 2, risk low)
`/ecosystem` and `/integrations` are ~85 partner integrations each rendered as **pure SSG** (the analysis explicitly says "pure SSG" for `/integrations`). That is the ideal SEO artifact: static, fast, fully crawlable, keyword-dense ("LiteLLM Nebius", "LangChain Nebius", "CrewAI integration"). Today integrations exist only as a static text matrix on one page and as off-site docs — we capture all of that latent search demand on-site. The R3F/Hero3D membrane is optional polish I'd happily cut to protect Core Web Vitals (see Risks). Depends on `apps-showcase` (shared data/filter pattern).

### P5 — `search` (impact 4, effort 3, risk med)
Their header `SearchProposal` widget is a hollow shell with no index and no results page. A real `/search?q=` grid that server-fetches hits (so they're in the HTML — note this carefully: `getServerSideProps` means hits are crawlable, not JS-injected) makes on-site content discoverable and creates indexable internal-link hubs. **But search is worthless until there's content to search** — it hard-depends on `content-library`, `events-directory`, and `apps-showcase`. The Directus fallback de-risks launch (we don't need Typesense provisioned on day one). I sequence this *after* the content surfaces it indexes.

### Honorable mentions in my lens
- `events-directory` (impact 5): an on-site `/events` directory with crawlable event pages keeps builders in the funnel instead of bouncing to nebius.com/events, and adds a fresh-content signal. Strong SEO value, but I rank it just below the library because its content is more transient (events expire) and it carries a Leaflet SSR caveat. Still a v0.x/v1.x must.
- `cms-page-constructor` (impact 3): the `[...slug]` catch-all lets DevRel spin up arbitrary indexable marketing pages by slug with SEO/OG meta and no deploy. This is a **content-velocity multiplier** — it's how `/builders`, `/signup`, `/localhosts` etc. get authored. I value it highly as infrastructure for content, not as a destination itself.
- `team-directory` (impact 3): `/team` + `/team/[slug]` adds crawlable E-E-A-T signal (real DevRel humans with bios, expertise, social links) — Google and answer engines reward author/entity pages. Cheap, low risk.

### What I explicitly DEPRIORITIZE (from my lens only)
- The **entire portal stack** (`portal-shell`, `portal-credit-claims`, `portal-event-hosting`, `portal-library-submission`, `portal-ambassador-apply`, `portal-activity-log`) is **auth-gated and therefore `noindex` by nature — zero organic value.** It is product/growth surface, not content surface. It should land *after* the crawlable content layer is mature.
- `admin-console` and `admin-review-queues` are internal tooling — no SEO value whatsoever. Could even be replaced by Directus Studio (the analysis says as much).
- `auth-sessions` and `directus-data-model` I depend on *operationally* (the library/events/apps collections need the data model), but I want only the **read-side** of the data model early. The auth foundation can lag the content surfaces, because all my surfaces are read-only/public. **I will fight any sequencing that puts the heavy auth/portal lift ahead of the crawlable content layer.**
- `fellows-directory` emits `noindex,nofollow` by design — explicitly zero organic value; pure recognition. Defer to whenever.
- `office-hours` booking reveal is auth-conditional — the page can be public but the value is gated; low organic priority (though the public `/team` half matters).

---

## 2. Proposed Epics

**EPIC A — "Make the hub crawlable" (SEO foundation)**
The non-negotiable substrate. Without this, everything else is invisible.
- `sitemap-seo-isr` (self-enumerating sitemap + per-page OG/meta + ISR)
- `directus-data-model` — **read-side only** (the collections + typed read SDK that the content surfaces fetch from; auth/write-side role matrix deferred to the Portal epic)
- `cms-page-constructor` (`[...slug]` data-driven indexable pages — the content-velocity engine)

**EPIC B — "Content Library & Product Depth" (the compounding core)**
The URL-namespace surfaces that grow with content and deepen pages we already rank for.
- `content-library` (`/library` index + `/library/[slug]` detail)
- `product-page-resource-rails` (CMS rails on `/ai-cloud`, `/token-factory`, `/serverless`)
- `team-directory` (`/team` + `/team/[slug]`, E-E-A-T author entities)

**EPIC C — "Community Showcase & Directories" (long-tail crawl surface)**
Keyword-dense, mostly-static directories that capture latent integration/project search demand.
- `apps-showcase` (`/apps` + `/apps/[slug]`)
- `ecosystem-integrations-directories` (`/ecosystem`, `/integrations` — pure SSG)
- `builders-program-landing` (`/builders` CMS program pitch — the front door, indexable via `cms-page-constructor`)

**EPIC D — "Events as Content"**
On-site, crawlable event surfaces + the ops to keep them fresh.
- `events-directory` (`/events` with live map + city filter)
- `events-refresh-scrape` (admin refresh — *fresh-content engine*, keeps the directory from going stale, an SEO freshness signal even though the button itself is internal)

**EPIC E — "Unified Search"**
The discovery layer over Epics B/C/D content.
- `search` (`/search?q=` server-rendered grid + header autocomplete)

**EPIC F — "Homepage Freshness & Marketing"**
Dynamic + static homepage sections that thread live content and signal freshness above the fold.
- `homepage-dynamic-content-sections` (active events, workshop + builder spotlight)
- `homepage-events-map-hero` (live events-map hero — *perf-budgeted*, see Risks)
- `homepage-static-marketing-sections` (coding-agents, ecosystem marquee, etc.)
- `signup-builder-program-landing` (`/signup` conversion landing)

**EPIC G — "Authenticated Program OS" (the non-content tier — explicitly last for SEO)**
All `noindex` by nature. Real product value, zero organic value. Sequenced after the crawlable layer is mature. I list these for completeness but defer to the Growth/Platform PM lens on internal ordering.
- `auth-sessions`, write-side of `directus-data-model`
- `portal-shell`, `portal-credit-claims`, `portal-event-hosting`, `portal-library-submission`, `portal-ambassador-apply`, `portal-activity-log`
- `leaderboard`, `office-hours`
- `admin-console`, `admin-review-queues`
- `chrome-portal-admin-nav`, `feedback-capture`, `fellows-directory`

---

## 3. Release Sequence (v0.1 → v2.0)

Principle: **crawlable content first, because it compounds and starts earning organic traffic the day it ships. Auth/portal/admin last, because Google never sees it.** Every public route below ships *with* its sitemap entry and OG meta — that's a release gate, not a nice-to-have.

### v0.1 — SEO Foundation (low-risk, unblocks everything)
| Gap id | One-line reasoning |
|---|---|
| `sitemap-seo-isr` | Make the hub crawlable at all — self-enumerate first-party URLs; gate every later route on registering here. |
| `directus-data-model` (read-side) | Stand up the content collections + typed *read* SDK so library/events/apps have a source of truth; defer the auth/write role matrix. |
| `cms-page-constructor` | The `[...slug]` engine lets DevRel publish indexable pages by slug with SEO/OG meta and no deploy — content velocity from day one. |

### v0.2 — The Compounding Library
| Gap id | One-line reasoning |
|---|---|
| `content-library` | Highest impact-per-risk on the board; creates the `/library/*` namespace and the backbone other surfaces read from — bring all that GitHub content equity *on-site*. |
| `product-page-resource-rails` | Cheaply deepen the 3 highest-traffic pages we already rank for, with CMS-fed fresh internal links — no deploy to update. |

### v0.3 — Long-tail Directories (cheap, static, keyword-dense)
| Gap id | One-line reasoning |
|---|---|
| `apps-showcase` | Effort-2 crawlable social proof; every project is an indexable, citable long-tail page; unblocks ecosystem + search. |
| `ecosystem-integrations-directories` | Pure-SSG ~85-partner directories capture massive latent "X + Nebius" integration search demand on-site (3D membrane deferred as optional polish). |
| `team-directory` | Cheap E-E-A-T: real author/entity pages with bios + expertise that answer engines reward. |

*Rationale for v0.x as a whole:* by end of v0.3 dev.nebius.com has gone from 4 indexable URLs to a self-enumerating site with `/library/*`, `/apps/*`, `/ecosystem`, `/integrations`, `/team/*`, enriched product pages, and a CMS page engine — all read-only, low-risk, and **already accruing organic traffic** before we've touched a single line of auth code.

### v1.0 — Events as Content + the Front Door
| Gap id | One-line reasoning |
|---|---|
| `events-directory` | On-site `/events` with crawlable event listings keeps builders in-funnel and adds a recurring fresh-content signal (SSR-guard the Leaflet map). |
| `builders-program-landing` | The `/builders` CMS program pitch — the indexable front door to the whole program, shippable now via the page engine, independent of any live points ranking. |
| `signup-builder-program-landing` | `/signup` conversion landing assembled from CMS blocks — gives the program a real, indexable conversion page. |

### v1.1 — Discovery + Freshness
| Gap id | One-line reasoning |
|---|---|
| `search` | Now that library + events + apps exist, make search real — server-rendered `/search?q=` hits in the HTML; Directus fallback de-risks launch (Typesense optional). |
| `events-refresh-scrape` | Keep `/events` from going stale automatically — freshness is a ranking signal; admin-gated, depends on events + (minimal) auth. |
| `homepage-dynamic-content-sections` | Thread live events/workshop/builder spotlights through the homepage so the top page never looks stale to crawlers or users. |
| `homepage-static-marketing-sections` | Port the remaining marketing blocks (coding-agents, ecosystem marquee) for completeness/parity of the landing page. |

### v1.2 — Above-the-fold polish + auth foundation begins
| Gap id | One-line reasoning |
|---|---|
| `homepage-events-map-hero` | Distinctive live-map hero as proof-of-activity — **only if** it passes the Core Web Vitals budget (lazy/SSR-guarded; otherwise cut). |
| `auth-sessions` | The keystone for everything `noindex` — begin here precisely because nothing above it needed auth, so the crawlable layer was never blocked on this high-risk lift. |
| `directus-data-model` (write-side / role-permission matrix) | Now wire per-user permission scoping for the portal write-flows — the data-exposure-sensitive half, done deliberately after the read surfaces are stable. |

### v1.3 — Authenticated Program OS (core)
| Gap id | One-line reasoning |
|---|---|
| `portal-shell` | The signed-in container; `noindex`, zero organic value, but the home of the program economy. |
| `portal-credit-claims` | Strongest acquisition lever once auth exists; money-touching, tightly gated. |
| `team-directory` already shipped → `office-hours` | Turn the "Builder Hours" promise into a real auth-gated booking funnel (public `/team` half already ranks from v0.3). |
| `leaderboard` (public half) | The public `/builders` top-10 widget can ship as recognition content; the *live ranking* waits on the activity ledger. |

### v1.4 — Portal write-flows + the queues that make them real
| Gap id | One-line reasoning |
|---|---|
| `portal-event-hosting` | Builder-hosted events (with DRAFT status-filtering so drafts never leak into the public `/events` index — an SEO/data-hygiene must). |
| `portal-library-submission` | Two-sided library contribution feeding the points economy (moderated via the admin queue). |
| `portal-ambassador-apply` | Contained lead-gen application funnel. |
| `portal-activity-log` | The points ledger underpinning the leaderboard. |
| `admin-console` | The ops shell that makes the program operable without raw Directus access. |
| `admin-review-queues` | The privileged approve/reject mutations that make every portal write-flow *real* (the single biggest "make it functional" task). |

### v2.0 — Full Parity / Cleanup
| Gap id | One-line reasoning |
|---|---|
| `leaderboard` (live ranking) | Flip the leaderboard from sample data to real `points_total` once the activity ledger is populated — a hollow leaderboard undercuts trust. |
| `chrome-portal-admin-nav` | The portal/admin sidebars + mega-menus + theme toggle once those areas exist (public nav/footer largely at parity already). |
| `feedback-capture` | Lightweight on-site feedback endpoint — useful in beta, low priority. |
| `fellows-directory` | `noindex,nofollow` recognition roll-call — cheap, niche, last. |

---

## 4. Risks / Dependencies I Will NOT Compromise On

1. **Self-enumerating sitemap is a v0.1 hard gate, and every subsequent public route must register into it (and ship valid OG/canonical meta) as an acceptance criterion.** A content surface Google can't discover or attribute to dev.nebius.com is wasted engineering. No public page merges without its sitemap entry. (`sitemap-seo-isr` blocks the value of B/C/D entirely.)

2. **Crawlable content surfaces (Epics A–D) must ship BEFORE the auth/portal stack (Epic G).** This is my line in the sand. All my surfaces are read-only and do not depend on `auth-sessions`; sequencing the high-risk auth keystone first would delay every compounding content win for zero organic benefit. The portal is `noindex` — it can wait. I will argue this hard against any lens that front-loads auth.

3. **Server-rendered content is non-negotiable for indexability.** `content-library`, `apps-showcase`, `ecosystem/integrations`, and `search` must keep their SSG/`getServerSideProps`/ISR rendering so hits and content land **in the HTML**, not injected client-side. If any of these regress to client-only rendering, they lose their organic value and I'll block them. (The analysis confirms `/search` server-fetches hits and `/integrations` is pure SSG — preserve that.)

4. **Core Web Vitals budget on the heavy client pieces.** The Leaflet maps (`events-directory`, `homepage-events-map-hero`) and the R3F/Hero3D membrane (`ecosystem-integrations-directories`) are above-the-fold JS-weight risks. They must be SSR-guarded, lazy/dynamically imported, and perf-budgeted. The Hero3D membrane and the homepage map hero are **optional polish I will trade away** rather than tank LCP/INP on the pages that carry our organic traffic. Distinctiveness never beats Core Web Vitals on a page that ranks.

5. **DRAFT/PENDING user-generated content must never leak into public indexed collections.** When `portal-event-hosting` and `portal-library-submission` land, status-filtering must keep DRAFT events and unapproved library submissions out of `/events`, `/library`, the sitemap, and search results. A spam-submitted or half-finished page getting indexed is both an SEO-quality and a brand risk. This is why I'm comfortable deferring those write-flows to v1.4 — but when they ship, the filtering is mandatory.

6. **`directus-data-model` read-side is a dependency I need early; the write-side/role matrix I deliberately want late.** Splitting this gap is critical: the content collections + read SDK unblock all of Epic B/C/D in v0.x, while the per-user permission scoping (the data-exposure vector) is sequenced with the portal in v1.2. Do not let "the data model is one gap" force the risky write-side scoping to land before the safe read surfaces.

7. **Canonicalization and content-equity reclamation.** As we bring library/integrations content on-site that currently lives on github.com / docs.nebius.com, we must set canonical tags correctly and avoid duplicate-content traps with the off-site originals. This is a cross-cutting concern I want owned explicitly in Epic A so we *gain* equity rather than split it.

**Bottom line for the synthesizer:** front-load the crawlable content layer (sitemap → library → directories → events → search). It is cheap, low-risk, and starts compounding organic traffic in v0.x while the auth/portal work — which is genuinely higher-impact for *converting* builders but invisible to discovery — proceeds behind it from v1.2 onward. Don't let the keystone-dependency framing of `auth-sessions` reorder the content surfaces that never needed it.
