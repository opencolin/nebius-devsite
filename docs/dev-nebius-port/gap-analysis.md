# Feature Gap: Nebius Builders site → dev.nebius.com

**30 gaps.** dev.nebius.com is a deliberately thin 4-page builder-marketing microsite (home + `/ai-cloud` + `/token-factory` + `/serverless`) on the exact stack our site targets: **Next.js Pages Router + Gravity UI + Page Constructor blocks + Directus CMS + HubSpot forms.** Its only first-party surfaces are product-router landing pages that aggregate outbound links to docs, consoles, GitHub cookbooks, YouTube, and Discord; every dynamic builder surface is either absent or offloaded to another subdomain (events → `nebius.com/events`, community → Discord, portal/dashboards → console + tokenfactory, ideas → `ideas.nebius.com`, academy → `academy.nebius.com`).

Our Builders site adds an entire data-backed community + program operating system on top of that marketing shell: an on-site events directory with live map and scrape-refresh, a typed content library with product/type filters, community apps + ecosystem + integrations directories, a DevRel team/office-hours surface, unified search (Typesense + Directus fallback), Directus-JWT auth, a full builder Portal (credits claims, event hosting, library submission, ambassador apply, activity log, leaderboard), and a mirror Admin review-queue console — all reading and writing Directus collections that do not yet exist on dev.nebius.com.

The gap is therefore less about marketing polish (their product-router IA is strong and worth preserving) and more about adding **stateful, authenticated, CMS-and-search-backed surfaces.** The heaviest lifts are the **auth foundation** and the **portal/admin write-flows** that depend on it; the cheapest wins are **static or CMS-fed directories** (events, library, ecosystem, team, product-page rails) that slot directly into their existing Page Constructor + Directus pipeline.

## Scored gaps

Sorted by **impact (desc), then effort (asc)**. Status = how dev.nebius.com stands today (absent / partial). Impact & effort 1–5.

| # | Gap | Cat | Status | Impact | Effort | Risk | Depends on |
|---|-----|-----|--------|:------:|:------:|:----:|------------|
| 1 | Builder/program Directus collections + typed SDK layer | platform | partial | 5 | 3 | med | — |
| 2 | On-site events directory (live map + city filter) | content | absent | 5 | 3 | med | directus-data-model |
| 3 | Typed content library index + detail | content | partial | 5 | 3 | low | directus-data-model |
| 4 | Portal intro-credit claim flows (TF + AI Cloud, $100) | portal | absent | 5 | 3 | high | portal-shell, auth-sessions, directus-data-model |
| 5 | Builder auth + session/role gating (Directus-JWT cookies) | platform | absent | 5 | 4 | high | — |
| 6 | Builder Portal shell + dashboard + checklist + profile | portal | absent | 5 | 4 | high | auth-sessions, directus-data-model |
| 7 | Community apps / "built with Nebius" gallery | community | absent | 4 | 2 | low | directus-data-model |
| 8 | Ecosystem + integrations directories | product | partial | 4 | 2 | low | apps-showcase |
| 9 | CMS-driven resource rails on product pages | product | partial | 4 | 2 | low | content-library |
| 10 | Builders Network program landing (CMS pitch) | community | absent | 4 | 2 | low | cms-page-constructor |
| 11 | Unified search page + header autocomplete | search | partial | 4 | 3 | med | content-library, events-directory, apps-showcase |
| 12 | Portal host-an-event flow + my-events | portal | absent | 4 | 3 | high | portal-shell, auth-sessions, directus-data-model, events-directory |
| 13 | Builder leaderboard (public top-10 + gated full) | community | absent | 4 | 3 | med | directus-data-model, auth-sessions, portal-activity-log |
| 14 | Admin ops console (dashboard + builders/team mgmt) | admin | absent | 4 | 4 | high | auth-sessions, directus-data-model |
| 15 | Admin review queues (library, credits, ambassador, activities) | admin | absent | 4 | 4 | high | admin-console + all portal write-flows |
| 16 | DevRel team people directory + member detail | content | absent | 3 | 2 | low | directus-data-model |
| 17 | Office Hours booking (auth-gated Calendly reveal) | community | absent | 3 | 2 | med | team-directory, auth-sessions |
| 18 | Homepage live events-map hero | marketing | absent | 3 | 2 | med | events-directory |
| 19 | Homepage dynamic content sections (active events, spotlights) | marketing | partial | 3 | 2 | low | events-directory, content-library, apps-showcase |
| 20 | Signup / Builder Program join landing | marketing | partial | 3 | 2 | low | cms-page-constructor |
| 21 | CMS catch-all pages via Page Constructor (`[...slug]`) | content | partial | 3 | 2 | low | directus-data-model |
| 22 | Portal library submission (community content for review) | portal | absent | 3 | 2 | med | portal-shell, auth-sessions, content-library |
| 23 | Portal Ambassador application | portal | absent | 3 | 2 | med | portal-shell, auth-sessions, directus-data-model |
| 24 | First-party dynamic sitemap + per-page SEO/OG + ISR | platform | partial | 3 | 2 | low | directus-data-model |
| 25 | Admin events refresh (Luma + nebius.com Tavily scrape) | platform | absent | 3 | 3 | med | events-directory, auth-sessions |
| 26 | Portal activity log + self-report a win | portal | absent | 3 | 3 | med | portal-shell, auth-sessions, directus-data-model |
| 27 | Fellows / recognized community leaders roll-call | community | absent | 2 | 1 | low | — |
| 28 | Feedback / mockup-review capture API | platform | absent | 2 | 1 | low | directus-data-model |
| 29 | Homepage static marketing sections (coding-agents, marquee, etc.) | marketing | partial | 2 | 2 | low | — |
| 30 | Expanded chrome (mega-menus, portal/admin sidebars, theme, footer) | nav | partial | 2 | 2 | low | portal-shell, admin-console |

## Dependency structure (build order)

Two foundations gate most of the backlog, and they're independent of each other so they can be built in parallel:

- **`directus-data-model`** (#1) — the program collections + typed SDK. Read-only directories hang off this: events, library, apps, ecosystem, team, CMS pages, sitemap, feedback.
- **`auth-sessions`** (#5) — the Directus-JWT cookie/session/role layer. Everything authenticated hangs off this.

The **Portal** is a second tier that needs *both* foundations: `portal-shell` (#6) is the container, and the write-flows (credits #4, event-hosting #12, library-submission #22, ambassador #23, activity-log #26) live inside it. The **Admin review queues** (#15) sit at the bottom of the dependency graph because each one closes the loop on a portal write-flow — they depend on `admin-console` (#14) *plus* every portal flow that produces a PENDING record. The **leaderboard** (#13) is only meaningful once `portal-activity-log` (#26) is populating real points.

### Suggested sequencing

1. **Foundations (parallel):** `directus-data-model`, `auth-sessions`.
2. **Cheap read-only wins (high ROI, low risk):** content-library, events-directory, apps-showcase, ecosystem/integrations, team-directory, product-page-resource-rails, cms-page-constructor, builders-program-landing, sitemap-seo. These make the dev hub a real destination using only their existing stack, no new privileged surface.
3. **Search + homepage dynamics:** search, homepage-events-map-hero, homepage-dynamic-content-sections — layered once the underlying collections have data.
4. **Portal tier:** portal-shell → credit-claims, event-hosting, library-submission, ambassador-apply, activity-log, office-hours.
5. **Admin tier + leaderboard:** admin-console → admin-review-queues (makes the portal economy real — the approve/reject handlers are currently no-ops), then the live leaderboard once the activity ledger is populated.

## Risk notes

- **High-risk gaps all cluster in auth + portal + admin** (#4, #5, #6, #12, #14, #15): new identity surface, token storage, money/credits mutations, user-generated content entering published collections, and elevated-privilege admin actions. These deserve the most review and an audit trail.
- **The single biggest "make it real" task** is wiring the admin approve/reject handlers (#15) and the portal stub writes (#4 credits, #12 events partially, #22 library, #26 activities) — much of the portal/admin economy is currently sample data and no-op handlers.
- **Possible duplication to resolve before building:** auth (#5) may need to reconcile with the existing Nebius SSO at `auth.nebius.com` rather than standing up a parallel Directus identity; feedback (#28) overlaps their existing `ideas.nebius.com`; the admin console (#14) partially overlaps using Directus Studio directly.
- **Client-only/perf watch items:** Leaflet maps (#2, #18) and the R3F/Hero3D membrane (#8) are client-only and need SSR-safe dynamic imports + perf budgeting, especially above the fold.

## Reference files carried forward

Full per-gap `our_reference_files` (paths under `apps/web/…`) are in [`gap-analysis.json`](./gap-analysis.json), alongside category, dev_nebius_status, scores, dependencies, and per-gap reasoning.
