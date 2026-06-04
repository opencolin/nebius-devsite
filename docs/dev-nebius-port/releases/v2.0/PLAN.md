# Release v2.0 — Admin & economy — full parity

Branch: `port/v2.0` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).

## Why this release

The release that makes the program economy real and reaches parity with the Builders site. The first-party admin console + review queues close every portal loop (approve/reject credits, publish submissions, grant points), the portal/admin layout shells land, the live leaderboard goes up now that the activity ledger has real data, and automated events refresh keeps the directory current. These are the privileged money/points/publish mutations — they ship last, with the most review and an audit trail.

Builds on: `v0.1` → `v0.2` → `v0.3` → `v0.4` → `v1.0` → `v1.1` → `v1.2`.

## Cards in this release

### Admin operations console (exec dashboard + builders/team management)  `admin-console`

- **Epic:** Admin & program economy · **Impact:** 4/5 · **Effort:** 4/5 · **Risk:** 🔴 high
- **Depends on:** `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** dev.nebius.com has no admin/program-ops surface (Directus Studio is the only back office today). /admin is a dedicated console: exec dashboard with program metric cards + an open-queues list, plus live management tables for builders and team_members. Makes the program operable by DevRel without raw Directus access. Leads v2.0 as the shell every review queue plugs into. High risk: elevated privileges over user + program data; somewhat optional vs using Directus Studio directly, which is why it is sequenced last.
- **Acceptance:**
  - [ ] /admin is reachable only with role=admin; builders/public are redirected/403
  - [ ] Builders + team_members management tables support the documented edits with an audit trail
  - [ ] Exec dashboard shows real pending counts per queue (links to the queues shipping in this release)
- **Reference implementation (port-kit):**
  - `apps/web/pages/admin/index.tsx`
  - `apps/web/pages/admin/builders.tsx`
  - `apps/web/pages/admin/team.tsx`
  - `apps/web/src/components/chrome/AdminLayout.tsx`
  - `apps/web/src/components/chrome/AdminSidebar.tsx`
  - `apps/web/src/components/chrome/QueueTable.tsx`

### Admin review queues (library, credits, per-event credits, ambassador, activities)  `admin-review-queues`

- **Epic:** Admin & program economy · **Impact:** 4/5 · **Effort:** 4/5 · **Risk:** 🔴 high
- **Depends on:** `admin-console` (Admin operations console (exec dashboard + builders/team management)), `portal-credit-claims` (Portal intro-credit claim flows (Token Factory + AI Cloud, $100)), `portal-event-hosting` (Portal host-an-event flow + my-events), `portal-library-submission` (Portal library submission (community content for review)), `portal-ambassador-apply` (Portal Ambassador application), `portal-activity-log` (Portal activity log + self-report a win)
- **Why:** Every portal write-flow produces a PENDING record needing human review; this is the single biggest 'make it real' task — until the approve/reject handlers write back (they are no-ops today), the whole portal economy is non-functional. Grouped: queues for library submissions, intro credit claims (TF auto-approvable, AI Cloud needs review), per-event TF credit requests, ambassador apps, and self-reported activities, all via the shared QueueTable. v2.0 because it depends on the admin console plus every portal flow that feeds a queue. Highest-privilege mutations (approve money, publish content, grant points) → most review + audit trail.
- **Acceptance:**
  - [ ] Each queue lists PENDING records and supports approve/reject that actually writes status + side-effects (publish entry / grant points / mark credit approved)
  - [ ] Approvals are idempotent and audit-logged (who/when); rejecting requires a reason
  - [ ] Approving a credit claim transitions it out of PENDING and is reflected in the builder's /portal/credits
- **Reference implementation (port-kit):**
  - `apps/web/pages/admin/library.tsx`
  - `apps/web/pages/admin/credit-claims.tsx`
  - `apps/web/pages/admin/credit-requests.tsx`
  - `apps/web/pages/admin/ambassador-applications.tsx`
  - `apps/web/pages/admin/activities.tsx`
  - `apps/web/src/components/chrome/QueueTable.tsx`

### Authenticated layout shells (PortalLayout/Sidebar + AdminLayout/Sidebar)  `chrome-portal-admin-shells`

- **Epic:** Site chrome · **Impact:** 2/5 · **Effort:** 1/5 · **Risk:** 🟢 low
- **Depends on:** `portal-shell` (Builder Portal shell + dashboard + onboarding checklist + profile editor), `admin-console` (Admin operations console (exec dashboard + builders/team management))
- **Why:** Second half of the split chrome gap: the authenticated navigation shells that don't exist on dev.nebius.com at all. Sequenced after the portal + admin areas exist (depends on both). Lands in v2.0 to finalize the authenticated IA once all gated surfaces are present. Low risk: presentational.
- **Acceptance:**
  - [ ] PortalLayout + PortalSidebar wrap all /portal/* routes with consistent nav
  - [ ] AdminLayout + AdminSidebar wrap all /admin/* routes with consistent nav + queue links
  - [ ] Authenticated chrome never renders for signed-out users
- **Reference implementation (port-kit):**
  - `apps/web/src/components/chrome/PortalLayout.tsx`
  - `apps/web/src/components/chrome/AdminLayout.tsx`
  - `apps/web/src/components/chrome/PortalSidebar.tsx`
  - `apps/web/src/components/chrome/AdminSidebar.tsx`

### Builder leaderboard (public top-10 widget + full gated leaderboard)  `leaderboard`

- **Epic:** Admin & program economy · **Impact:** 4/5 · **Effort:** 3/5 · **Risk:** 🟡 med
- **Depends on:** `directus-data-model` (Builder/program Directus collections + typed SDK access layer), `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `portal-activity-log` (Portal activity log + self-report a win)
- **Why:** dev.nebius.com has no leaderboard/ranking — no competitive/recognition loop. A public /builders top-10 widget, a /builders/all roster, and an auth-gated /portal/leaderboard ranked by points_total (shared LeaderboardTable). Strong engagement/retention driver. v2.0 because a meaningful ranking depends on the activities/points ledger being populated and accurate — a hollow leaderboard on sample data undercuts trust, so it ships only after v1.2's activity log + v2.0's approval queues produce real points.
- **Acceptance:**
  - [ ] /builders shows a top-10 widget; /builders/all shows the full roster; /portal/leaderboard is auth-gated
  - [ ] Rankings are computed from real approved points (not sample data) — verified non-empty before launch
  - [ ] Ties + zero-point builders handled sensibly; no PII beyond handle/name/location
- **Reference implementation (port-kit):**
  - `apps/web/pages/builders.tsx`
  - `apps/web/pages/builders/all.tsx`
  - `apps/web/pages/portal/leaderboard.tsx`
  - `apps/web/src/components/builders/LeaderboardTable.tsx`

### Admin events refresh (Luma + nebius.com Tavily scrape)  `events-refresh-scrape`

- **Epic:** Admin & program economy · **Impact:** 3/5 · **Effort:** 3/5 · **Risk:** 🟡 med
- **Depends on:** `events-directory` (On-site events directory with live map + city filter), `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `admin-console` (Admin operations console (exec dashboard + builders/team management))
- **Why:** Keeps the events directory current without manual entry: an admin-only Refresh hits /api/events/refresh, which uses Tavily Extract to scrape lu.ma/nebiusAI + nebius.com/events, parses titles/dates/cities, dedupes by normalized title, and upserts into events. Valuable ops once the directory + admin console exist; lands in v2.0 with the rest of the admin surface. Medium risk: writes to events, calls an external scraping API with its own key/rate limits, must be admin-gated; parser brittleness is an ongoing maintenance cost.
- **Acceptance:**
  - [ ] Admin-only Refresh upserts scraped events deduped by normalized title (no duplicate rows)
  - [ ] Tavily key stays server-side; the endpoint is admin-gated and rate-limited
  - [ ] Scrape failures degrade gracefully (existing events untouched; error surfaced to admin)
- **Reference implementation (port-kit):**
  - `apps/web/pages/api/events/refresh.ts`
  - `apps/web/pages/api/scrape-events.ts`
  - `apps/web/pages/events/index.tsx`

## Port-kit

The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).

## Verification

- Type-check: `npx tsc --noEmit` in the target app.
- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.


