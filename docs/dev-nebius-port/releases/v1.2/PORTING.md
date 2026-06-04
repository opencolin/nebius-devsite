# Port-kit — v1.2 Builder Portal

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

### Builder Portal shell + dashboard + onboarding checklist + profile editor  `portal-shell`

Epic Builder portal · I5/E4/high. No signed-in builder portal exists on dev.nebius.com — dashboards/usage/account all live in external consoles. /portal is the authenticated program home: stat cards, Quick Actions, recent-activity feed, points-bearing onboarding checklist, and a profile editor that PATCHes the user row (email read-only). The container every other portal write-flow lives inside; leads v1.2. High risk: builder-gated server-side mutations to user records; dashboard stats start as sample data until the aggregation is wired.

- `port-kit/apps/web/pages/portal/index.tsx`
- `port-kit/apps/web/src/components/chrome/PortalLayout.tsx`
- `port-kit/apps/web/src/components/chrome/PortalSidebar.tsx`
- `port-kit/apps/web/pages/portal/checklist.tsx`
- `port-kit/apps/web/pages/portal/profile.tsx`
- `port-kit/apps/web/pages/api/portal/profile.ts`

### Portal activity log + self-report a win  `portal-activity-log`

Epic Builder portal · I3/E3/med. No points/activity tracking exists. The activity log lists points-bearing actions with status pills, plus /portal/activity/new to self-report a win (type, proof URL, details) into the activities collection. This is the ledger underpinning the gamified economy and the leaderboard (v2.0). v1.2 inside the portal; entries enter PENDING and are approved via Directus Studio until the admin activity queue ships in v2.0. Medium risk: user-submitted claims feed points → needs proof validation + abuse controls.

- `port-kit/apps/web/pages/portal/activity/index.tsx`
- `port-kit/apps/web/pages/portal/activity/new.tsx`
- `port-kit/apps/web/src/components/chrome/StubCallout.tsx`

### Portal library submission (community content for review)  `portal-library-submission`

Epic Builder portal · I3/E2/med. No path exists for builders to contribute content — all library material is first-party. A submit form (title, type, level, external URL, blurb, optional markdown) creates a PENDING library_articles row; accepted entries earn +50 pts and publish. Turns the library two-sided and feeds the points economy. v1.2; moderation happens via Directus Studio until the admin library queue ships in v2.0. Medium risk: UGC entering a published collection needs moderation + sanitization (smaller blast radius than credits/events).

- `port-kit/apps/web/pages/portal/library/submit.tsx`
- `port-kit/apps/web/pages/portal/library/index.tsx`
- `port-kit/apps/web/src/components/chrome/StubCallout.tsx`

### Portal Ambassador application  `portal-ambassador-apply`

Epic Builder portal · I3/E2/med. dev.nebius.com mentions programs but has no ambassador/advocate application funnel. A form (handle, email, city/country, what they've built, meetups to host, communities) creates a PENDING ambassador_applications row for monthly admin review — a clean, contained lead-gen flow for the community-leader pipeline. v1.2; reviewed via Directus Studio until the admin queue ships in v2.0. Medium risk: authenticated write with PII (location) → needs review queue + anti-spam.

- `port-kit/apps/web/pages/portal/ambassador/apply.tsx`
- `port-kit/apps/web/pages/api/portal/ambassador/apply.ts`

### Portal intro-credit claim flows (Token Factory + AI Cloud, $100)  `portal-credit-claims`

Epic Builder portal · I5/E3/high. The strongest acquisition lever a builder hub can own: two claim forms (claim-tf, claim-ai) POST to /api/portal/credits/claim, creating a credit_requests row (amount_usd=100, status=PENDING); AI Cloud requires justification, TF needs only the account email. Ships in v1.2 (not v2.0) to land acquisition value early — resolving the Growth-vs-Platform tension — with interim manual processing in Directus Studio; the automated approve/reject queue ships in v2.0. High risk: touches money → tightly auth-gated, rate-limited, one-claim-per-product-per-user.

- `port-kit/apps/web/pages/portal/credits/claim-tf.tsx`
- `port-kit/apps/web/pages/portal/credits/claim-ai.tsx`
- `port-kit/apps/web/pages/portal/credits/index.tsx`
- `port-kit/apps/web/pages/api/portal/credits/claim.ts`

### Portal host-an-event flow + my-events  `portal-event-hosting`

Epic Builder portal · I4/E3/high. No way exists for a builder to propose/host a community event or request event credits. /portal/events/new does a two-step write: create an events row (status=DRAFT, builder=session user), then a linked credit_requests row (kind=EVENT), rolling back the event if the credit request fails. v1.2 inside the portal. High risk: multi-collection transactional write tied to credits, and it injects DRAFT rows into the same events collection that powers the public directory — DRAFT must be filtered out of public /events.

- `port-kit/apps/web/pages/portal/events/index.tsx`
- `port-kit/apps/web/pages/portal/events/new.tsx`
- `port-kit/apps/web/pages/portal/events/[id].tsx`
- `port-kit/apps/web/pages/api/portal/events/index.ts`

