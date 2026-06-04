# Port-kit — v1.1 Identity foundation

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

### Builder auth + session/role gating (Directus-JWT cookies)  `auth-sessions`

Epic Platform foundation · I5/E4/high. dev.nebius.com has zero first-party auth — every 'Log in' bounces to auth.nebius.com / external consoles. Nothing stateful or personalized can exist without a session layer: forward to Directus /auth/login, store access+refresh in httpOnly cookies, rotate expired tokens, support ?next=, expose requireRole/enforceRole. The second independent foundation (with data-model). Introduced in v1.1 on the lightest gate (office-hours) to validate it before the portal depends on it. High risk: new identity surface, token storage, CSRF/session-fixation; may need reconciliation with Nebius SSO rather than a parallel Directus identity — that decision blocks the release.

- `port-kit/apps/web/pages/login.tsx`
- `port-kit/apps/web/src/components/auth/LoginForm.tsx`
- `port-kit/apps/web/pages/api/auth/login.ts`
- `port-kit/apps/web/pages/api/auth/me.ts`
- `port-kit/apps/web/pages/api/auth/logout.ts`
- `port-kit/apps/web/src/lib/auth.ts`

### Office Hours booking (auth-gated Calendly reveal)  `office-hours`

Epic Community directories · I3/E2/med. dev.nebius.com lists 'Builder Hours' as a marketing card with no booking surface. /office-hours combines recurring drop-in slots with per-advocate 1:1 slots and gates the booking reveal server-side: signed-out sees 'Sign in to book', signed-in gets the live Calendly link. Chosen as the FIRST auth-gated surface (v1.1) because it is the lowest-risk gate to validate the session layer in production — read-mostly, no money/points. Converts the existing 'Builder Hours' promise into a real funnel.

- `port-kit/apps/web/pages/office-hours.tsx`

