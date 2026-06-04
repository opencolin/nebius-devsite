# Release v0.3 — Community directories

Branch: `port/v0.3` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).

## Why this release

Read-only social-proof and people surfaces that give builders reasons to stay on-site instead of bouncing to Discord/GitHub. Low effort, low risk, all reading the v0.1 collections. Team directory is the prerequisite for the office-hours booking gate later.

Builds on: `v0.1` → `v0.2`.

## Cards in this release

### Community apps / 'built with Nebius' gallery (index + detail)  `apps-showcase`

- **Epic:** Community directories · **Impact:** 4/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** dev.nebius.com has no project showcase anywhere — social proof of what builders ship is entirely missing. /apps is a grid of community + hackathon projects with cover cards, award/featured pills, and a segmented filter, plus per-slug detail pages with repo/demo links and builder byline. Low effort/risk read-only projects collection; leads v0.3 as the anchor of the community surface.
- **Acceptance:**
  - [ ] /apps renders the projects collection as filterable cards (Featured / product / hackathon / other) with placeholder rows excluded
  - [ ] /apps/<slug> shows repo + demo links, tags, product focus, builder byline
  - [ ] Broken/private repo links are validated out (no dead 'View on GitHub')
- **Reference implementation (port-kit):**
  - `apps/web/pages/apps/index.tsx`
  - `apps/web/pages/apps/[slug].tsx`
  - `apps/web/src/lib/projects.ts`

### Ecosystem umbrella + standalone integrations directory  `ecosystem-integrations-directories`

- **Epic:** Community directories · **Impact:** 4/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `apps-showcase` (Community apps / 'built with Nebius' gallery (index + detail))
- **Why:** dev.nebius.com expresses integrations only as a static text matrix on the Token Factory page and a docs section — no browsable, filterable directory. /ecosystem is the canonical umbrella mixing community apps + ~85 partner integrations with a Kind+product filter and a 'Submit your project' GitHub-issue CTA; /integrations is the standalone partner directory. Grouped (same data + filter pattern) and placed in v0.3 next to apps; the R3F membrane hero is optional polish.
- **Acceptance:**
  - [ ] /ecosystem renders apps + integrations in one grid with a working Kind + product filter and live counts
  - [ ] /integrations renders the ~85-partner directory with product + category chips
  - [ ] 'Submit your project' opens a prefilled GitHub issue; the R3F hero degrades gracefully without WebGL
- **Reference implementation (port-kit):**
  - `apps/web/pages/ecosystem.tsx`
  - `apps/web/pages/integrations.tsx`
  - `apps/web/src/lib/ecosystem-partners.ts`
  - `apps/web/src/components/integrations/HeroSection.tsx`
  - `apps/web/src/components/integrations/Hero3D.tsx`

### DevRel team people directory + member detail  `team-directory`

- **Epic:** Community directories · **Impact:** 3/5 · **Effort:** 2/5 · **Risk:** 🟢 low
- **Depends on:** `directus-data-model` (Builder/program Directus collections + typed SDK access layer)
- **Why:** dev.nebius.com has no people/team page — builders can't see or reach the DevRel advocates, and there's no human face to 'Builder Hours'. /team is a grid of advocates (bio, region, expertise) with a 'Book office hours' CTA when calendly_url is set, plus per-slug profiles. Read-only team_members; placed in v0.3 because it is the natural prerequisite for the office-hours booking gate in v1.1.
- **Acceptance:**
  - [ ] /team renders active team_members with bio/region/expertise
  - [ ] /team/<slug> shows full profile with languages + social links
  - [ ] A member with calendly_url shows a 'Book office hours' CTA (links out for now; gated reveal arrives with office-hours in v1.1)
- **Reference implementation (port-kit):**
  - `apps/web/pages/team/index.tsx`
  - `apps/web/pages/team/[slug].tsx`

### Fellows / recognized community leaders roll-call  `fellows-directory`

- **Epic:** Community directories · **Impact:** 2/5 · **Effort:** 1/5 · **Risk:** 🟢 low
- **Depends on:** — none
- **Why:** No recognition surface for top community members exists. /fellows is a curated public roll-call from a static array, emitting noindex,nofollow while being curated. Lowest effort (static data, single page, no CMS/auth) and lowest impact (hidden, niche) — a cheap recognition lever bundled into the v0.3 community release. No hard dependency since it is fully static.
- **Acceptance:**
  - [ ] /fellows renders the curated roll-call with org/city/region + tagline per fellow
  - [ ] Page emits noindex,nofollow and is excluded from the sitemap while curated
  - [ ] No row-overlap / layout regressions in the featured + full grids
- **Reference implementation (port-kit):**
  - `apps/web/pages/fellows.tsx`
  - `apps/web/src/lib/fellows.ts`

## Port-kit

The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).

## Verification

- Type-check: `npx tsc --noEmit` in the target app.
- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.


