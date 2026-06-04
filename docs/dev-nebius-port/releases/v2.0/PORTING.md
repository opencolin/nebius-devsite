# Port-kit — v2.0 Admin & economy — full parity

Reference implementations lifted from the Builders repo for this release. These are
snapshots to PORT, not drop-in files.

## How to adapt

dev.nebius.com is already Next.js Pages Router + Gravity UI + Page Constructor + Directus, so the
component structure ports closely. When adapting each reference file:
- Keep Gravity UI primitives + their theme tokens; drop our bespoke CSS-module classnames where they have an equivalent.
- Repoint data reads at their Directus instance + the collections from the `directus-data-model` card.
- Preserve ISR `revalidate: 60` to match their `s-maxage=60` edge cache.
- Gate any authenticated surface behind the `auth-sessions` card (reconcile with auth.nebius.com SSO first).
- Strip demo-only bits (MockupBanner, sample/placeholder data) before shipping.

## Files by card

### Admin operations console (exec dashboard + builders/team management)  `admin-console`

Epic Admin & program economy · I4/E4/high. dev.nebius.com has no admin/program-ops surface (Directus Studio is the only back office today). /admin is a dedicated console: exec dashboard with program metric cards + an open-queues list, plus live management tables for builders and team_members. Makes the program operable by DevRel without raw Directus access. Leads v2.0 as the shell every review queue plugs into. High risk: elevated privileges over user + program data; somewhat optional vs using Directus Studio directly, which is why it is sequenced last.

- `port-kit/apps/web/pages/admin/index.tsx`
- `port-kit/apps/web/pages/admin/builders.tsx`
- `port-kit/apps/web/pages/admin/team.tsx`
- `port-kit/apps/web/src/components/chrome/AdminLayout.tsx`
- `port-kit/apps/web/src/components/chrome/AdminSidebar.tsx`
- `port-kit/apps/web/src/components/chrome/QueueTable.tsx`

### Admin review queues (library, credits, per-event credits, ambassador, activities)  `admin-review-queues`

Epic Admin & program economy · I4/E4/high. Every portal write-flow produces a PENDING record needing human review; this is the single biggest 'make it real' task — until the approve/reject handlers write back (they are no-ops today), the whole portal economy is non-functional. Grouped: queues for library submissions, intro credit claims (TF auto-approvable, AI Cloud needs review), per-event TF credit requests, ambassador apps, and self-reported activities, all via the shared QueueTable. v2.0 because it depends on the admin console plus every portal flow that feeds a queue. Highest-privilege mutations (approve money, publish content, grant points) → most review + audit trail.

- `port-kit/apps/web/pages/admin/library.tsx`
- `port-kit/apps/web/pages/admin/credit-claims.tsx`
- `port-kit/apps/web/pages/admin/credit-requests.tsx`
- `port-kit/apps/web/pages/admin/ambassador-applications.tsx`
- `port-kit/apps/web/pages/admin/activities.tsx`
- `port-kit/apps/web/src/components/chrome/QueueTable.tsx`

### Authenticated layout shells (PortalLayout/Sidebar + AdminLayout/Sidebar)  `chrome-portal-admin-shells`

Epic Site chrome · I2/E1/low. Second half of the split chrome gap: the authenticated navigation shells that don't exist on dev.nebius.com at all. Sequenced after the portal + admin areas exist (depends on both). Lands in v2.0 to finalize the authenticated IA once all gated surfaces are present. Low risk: presentational.

- `port-kit/apps/web/src/components/chrome/PortalLayout.tsx`
- `port-kit/apps/web/src/components/chrome/AdminLayout.tsx`
- `port-kit/apps/web/src/components/chrome/PortalSidebar.tsx`
- `port-kit/apps/web/src/components/chrome/AdminSidebar.tsx`

### Builder leaderboard (public top-10 widget + full gated leaderboard)  `leaderboard`

Epic Admin & program economy · I4/E3/med. dev.nebius.com has no leaderboard/ranking — no competitive/recognition loop. A public /builders top-10 widget, a /builders/all roster, and an auth-gated /portal/leaderboard ranked by points_total (shared LeaderboardTable). Strong engagement/retention driver. v2.0 because a meaningful ranking depends on the activities/points ledger being populated and accurate — a hollow leaderboard on sample data undercuts trust, so it ships only after v1.2's activity log + v2.0's approval queues produce real points.

- `port-kit/apps/web/pages/builders.tsx`
- `port-kit/apps/web/pages/builders/all.tsx`
- `port-kit/apps/web/pages/portal/leaderboard.tsx`
- `port-kit/apps/web/src/components/builders/LeaderboardTable.tsx`

### Admin events refresh (Luma + nebius.com Tavily scrape)  `events-refresh-scrape`

Epic Admin & program economy · I3/E3/med. Keeps the events directory current without manual entry: an admin-only Refresh hits /api/events/refresh, which uses Tavily Extract to scrape lu.ma/nebiusAI + nebius.com/events, parses titles/dates/cities, dedupes by normalized title, and upserts into events. Valuable ops once the directory + admin console exist; lands in v2.0 with the rest of the admin surface. Medium risk: writes to events, calls an external scraping API with its own key/rate limits, must be admin-gated; parser brittleness is an ongoing maintenance cost.

- `port-kit/apps/web/pages/api/events/refresh.ts`
- `port-kit/apps/web/pages/api/scrape-events.ts`
- `port-kit/apps/web/pages/events/index.tsx`

