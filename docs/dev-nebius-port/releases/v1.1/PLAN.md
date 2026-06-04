# Release v1.1 — Identity foundation

Branch: `port/v1.1` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).

## Why this release

Introduce the Directus-JWT cookie/session/role layer — the keystone for everything stateful — on the lightest possible gate: the office-hours booking reveal (signed-out sees 'Sign in to book', signed-in gets the live Calendly link). Validates the auth surface in production before any high-stakes flow depends on it. Must reconcile with the existing Nebius SSO (auth.nebius.com) vs a parallel Directus identity — that decision blocks the release.

Builds on: `v0.1` → `v0.2` → `v0.3` → `v0.4` → `v1.0`.

## Cards in this release

### Builder auth + session/role gating (Directus-JWT cookies)  `auth-sessions`

- **Epic:** Platform foundation · **Impact:** 5/5 · **Effort:** 4/5 · **Risk:** 🔴 high
- **Depends on:** — none
- **Why:** dev.nebius.com has zero first-party auth — every 'Log in' bounces to auth.nebius.com / external consoles. Nothing stateful or personalized can exist without a session layer: forward to Directus /auth/login, store access+refresh in httpOnly cookies, rotate expired tokens, support ?next=, expose requireRole/enforceRole. The second independent foundation (with data-model). Introduced in v1.1 on the lightest gate (office-hours) to validate it before the portal depends on it. High risk: new identity surface, token storage, CSRF/session-fixation; may need reconciliation with Nebius SSO rather than a parallel Directus identity — that decision blocks the release.
- **Acceptance:**
  - [ ] Login sets httpOnly secure cookies; expired access tokens transparently refresh; logout clears session
  - [ ] requireRole gate redirects signed-out users to /login?next=... and 403s wrong-role users
  - [ ] Decision recorded: reuse auth.nebius.com SSO vs parallel Directus identity, with CSRF protection on auth POSTs
- **Reference implementation (port-kit):**
  - `apps/web/pages/login.tsx`
  - `apps/web/src/components/auth/LoginForm.tsx`
  - `apps/web/pages/api/auth/login.ts`
  - `apps/web/pages/api/auth/me.ts`
  - `apps/web/pages/api/auth/logout.ts`
  - `apps/web/src/lib/auth.ts`

### Office Hours booking (auth-gated Calendly reveal)  `office-hours`

- **Epic:** Community directories · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟡 med
- **Depends on:** `team-directory` (DevRel team people directory + member detail), `auth-sessions` (Builder auth + session/role gating (Directus-JWT cookies))
- **Why:** dev.nebius.com lists 'Builder Hours' as a marketing card with no booking surface. /office-hours combines recurring drop-in slots with per-advocate 1:1 slots and gates the booking reveal server-side: signed-out sees 'Sign in to book', signed-in gets the live Calendly link. Chosen as the FIRST auth-gated surface (v1.1) because it is the lowest-risk gate to validate the session layer in production — read-mostly, no money/points. Converts the existing 'Builder Hours' promise into a real funnel.
- **Acceptance:**
  - [ ] Signed-out visitors see 'Sign in to book'; signed-in users see the live Calendly link
  - [ ] Drop-in + per-advocate 1:1 slots render from team_members with calendly_url
  - [ ] Hero uses the brand navy (#061a26), not black; no auth leak in the static HTML for signed-out users
- **Reference implementation (port-kit):**
  - `apps/web/pages/office-hours.tsx`

## Port-kit

The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).

## Verification

- Type-check: `npx tsc --noEmit` in the target app.
- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.


