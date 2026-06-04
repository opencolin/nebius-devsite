# Release v1.2 — Builder Portal

Branch: `port/v1.2` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).

## Why this release

Stand up the authenticated portal shell and all its write-flows. Submissions (library, ambassador, activity) and applications (credit claims, hosted events) enter PENDING/DRAFT and are processed via Directus Studio in the interim — the dedicated on-site admin queues come in v2.0. Credit claims ship here (not v2.0) for acquisition value, with manual interim processing, resolving the Growth-vs-Platform tension. Hard requirement: DRAFT user events must be status-filtered out of the public directory.

Builds on: `v0.1` → `v0.2` → `v0.3` → `v0.4` → `v1.0` → `v1.1`.

## Cards in this release

### Builder Portal shell + dashboard + onboarding checklist + profile editor  `portal-shell`

- **Epic:** Builder portal · **Impact:** 5/5 · **Effort:** 4/5 · **Risk:** 🔴 high
- **Depends on:** `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** No signed-in builder portal exists on dev.nebius.com — dashboards/usage/account all live in external consoles. /portal is the authenticated program home: stat cards, Quick Actions, recent-activity feed, points-bearing onboarding checklist, and a profile editor that PATCHes the user row (email read-only). The container every other portal write-flow lives inside; leads v1.2. High risk: builder-gated server-side mutations to user records; dashboard stats start as sample data until the aggregation is wired.
- **Acceptance:**
  - [ ] /portal is reachable only when signed in as a builder; redirects to /login?next=/portal otherwise
  - [ ] Profile editor PATCHes the directus_users row pinned to the session user id (cannot edit other users; email read-only)
  - [ ] Checklist persists completion and dashboard cards render (sample-data items clearly flagged until aggregation lands)
- **Reference implementation (port-kit):**
  - `apps/web/pages/portal/index.tsx`
  - `apps/web/src/components/chrome/PortalLayout.tsx`
  - `apps/web/src/components/chrome/PortalSidebar.tsx`
  - `apps/web/pages/portal/checklist.tsx`
  - `apps/web/pages/portal/profile.tsx`
  - `apps/web/pages/api/portal/profile.ts`

### Portal activity log + self-report a win  `portal-activity-log`

- **Epic:** Builder portal · **Impact:** 3/5 · **Effort:** 3/5 · **Risk:** 🟡 med
- **Depends on:** `portal-shell` (Builder Portal shell + dashboard + onboarding checklist + profile editor), `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** No points/activity tracking exists. The activity log lists points-bearing actions with status pills, plus /portal/activity/new to self-report a win (type, proof URL, details) into the activities collection. This is the ledger underpinning the gamified economy and the leaderboard (v2.0). v1.2 inside the portal; entries enter PENDING and are approved via Directus Studio until the admin activity queue ships in v2.0. Medium risk: user-submitted claims feed points → needs proof validation + abuse controls.
- **Acceptance:**
  - [ ] /portal/activity lists the signed-in builder's activities with status pills
  - [ ] /portal/activity/new writes a PENDING activities row scoped to the session user
  - [ ] Points are not granted until an activity is approved (no self-grant); interim approval path via Directus Studio documented
- **Reference implementation (port-kit):**
  - `apps/web/pages/portal/activity/index.tsx`
  - `apps/web/pages/portal/activity/new.tsx`
  - `apps/web/src/components/chrome/StubCallout.tsx`

### Portal library submission (community content for review)  `portal-library-submission`

- **Epic:** Builder portal · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟡 med
- **Depends on:** `portal-shell` (Builder Portal shell + dashboard + onboarding checklist + profile editor), `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `content-library` (Typed content library index + detail)
- **Why:** No path exists for builders to contribute content — all library material is first-party. A submit form (title, type, level, external URL, blurb, optional markdown) creates a PENDING library_articles row; accepted entries earn +50 pts and publish. Turns the library two-sided and feeds the points economy. v1.2; moderation happens via Directus Studio until the admin library queue ships in v2.0. Medium risk: UGC entering a published collection needs moderation + sanitization (smaller blast radius than credits/events).
- **Acceptance:**
  - [ ] /portal/library/submit creates a PENDING (unpublished) library_articles row; it does NOT appear on public /library until approved
  - [ ] Inputs are sanitized; external URL is validated
  - [ ] Approval grants +50 pts via the activity ledger (interim: manual approve in Directus Studio)
- **Reference implementation (port-kit):**
  - `apps/web/pages/portal/library/submit.tsx`
  - `apps/web/pages/portal/library/index.tsx`
  - `apps/web/src/components/chrome/StubCallout.tsx`

### Portal Ambassador application  `portal-ambassador-apply`

- **Epic:** Builder portal · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟡 med
- **Depends on:** `portal-shell` (Builder Portal shell + dashboard + onboarding checklist + profile editor), `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** dev.nebius.com mentions programs but has no ambassador/advocate application funnel. A form (handle, email, city/country, what they've built, meetups to host, communities) creates a PENDING ambassador_applications row for monthly admin review — a clean, contained lead-gen flow for the community-leader pipeline. v1.2; reviewed via Directus Studio until the admin queue ships in v2.0. Medium risk: authenticated write with PII (location) → needs review queue + anti-spam.
- **Acceptance:**
  - [ ] /portal/ambassador/apply writes a PENDING ambassador_applications row scoped to the session user
  - [ ] Form validates required fields; PII is stored only in the gated collection (not exposed publicly)
  - [ ] Basic anti-spam (one open application per user / rate limit)
- **Reference implementation (port-kit):**
  - `apps/web/pages/portal/ambassador/apply.tsx`
  - `apps/web/pages/api/portal/ambassador/apply.ts`

### Portal intro-credit claim flows (Token Factory + AI Cloud, $100)  `portal-credit-claims`

- **Epic:** Builder portal · **Impact:** 5/5 · **Effort:** 3/5 · **Risk:** 🔴 high
- **Depends on:** `portal-shell` (Builder Portal shell + dashboard + onboarding checklist + profile editor), `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** The strongest acquisition lever a builder hub can own: two claim forms (claim-tf, claim-ai) POST to /api/portal/credits/claim, creating a credit_requests row (amount_usd=100, status=PENDING); AI Cloud requires justification, TF needs only the account email. Ships in v1.2 (not v2.0) to land acquisition value early — resolving the Growth-vs-Platform tension — with interim manual processing in Directus Studio; the automated approve/reject queue ships in v2.0. High risk: touches money → tightly auth-gated, rate-limited, one-claim-per-product-per-user.
- **Acceptance:**
  - [ ] Signed-in builders can submit a TF or AI Cloud claim; a PENDING credit_requests row (amount_usd=100) is created
  - [ ] AI Cloud claim requires a justification; duplicate claims per product per user are blocked
  - [ ] Claims are processable in the interim via Directus Studio; the card explicitly notes the automated queue lands in v2.0 (no false 'approved' state shown to users before then)
- **Reference implementation (port-kit):**
  - `apps/web/pages/portal/credits/claim-tf.tsx`
  - `apps/web/pages/portal/credits/claim-ai.tsx`
  - `apps/web/pages/portal/credits/index.tsx`
  - `apps/web/pages/api/portal/credits/claim.ts`

### Portal host-an-event flow + my-events  `portal-event-hosting`

- **Epic:** Builder portal · **Impact:** 4/5 · **Effort:** 3/5 · **Risk:** 🔴 high
- **Depends on:** `portal-shell` (Builder Portal shell + dashboard + onboarding checklist + profile editor), `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies)), `directus-data-model` (Builder/program Directus collections + typed SDK access layer), `events-directory` (On-site events directory with live map + city filter)
- **Why:** No way exists for a builder to propose/host a community event or request event credits. /portal/events/new does a two-step write: create an events row (status=DRAFT, builder=session user), then a linked credit_requests row (kind=EVENT), rolling back the event if the credit request fails. v1.2 inside the portal. High risk: multi-collection transactional write tied to credits, and it injects DRAFT rows into the same events collection that powers the public directory — DRAFT must be filtered out of public /events.
- **Acceptance:**
  - [ ] /portal/events/new creates a DRAFT events row + linked EVENT credit_requests row atomically (event rolled back if the credit write fails)
  - [ ] DRAFT/user-submitted events never appear on the public /events directory or homepage hero
  - [ ] /portal/events lists the builder's own hosted events with status
- **Reference implementation (port-kit):**
  - `apps/web/pages/portal/events/index.tsx`
  - `apps/web/pages/portal/events/new.tsx`
  - `apps/web/pages/portal/events/[id].tsx`
  - `apps/web/pages/api/portal/events/index.ts`

## Port-kit

The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).

## Verification

- Type-check: `npx tsc --noEmit` in the target app.
- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.


