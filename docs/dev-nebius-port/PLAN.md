# dev.nebius.com Port Roadmap — Master Plan

**Goal.** We over-built the Nebius **Builders** site (this repo → demo.buildspace.tv). It is now
too large to wholesale-*replace* dev.nebius.com. New strategy: keep dev.nebius.com as the base of
record and **port our features into it, one at a time**, until dev.nebius.com reaches the "final
state" our builders site already demonstrates.

This folder is the single source of truth for that port. Any agent can resume from `STATE.md`.

---

## What this produces

1. **`discovery/`** — machine inventories of both sides:
   - `our-features.json` — every feature in THIS repo (pages, components, data model, integrations).
   - `devnebius-surface.json` — dev.nebius.com's live URL surface (what pages exist today).
   - `devnebius-features.json` — dev.nebius.com's current feature set / content types / nav.
2. **`gap-analysis.json` + `gap-analysis.md`** — the delta: features we have that dev.nebius.com
   lacks, each scored `impact` / `effort` / `risk` and tagged with a category + our reference files.
3. **`council/pm-*.md`** — five PM perspectives (DevRel, Growth, Platform, Content/SEO, Design/UX),
   each proposing epics + release sequencing + reasoning. A "mode council of project managers."
4. **`roadmap.json`** — the synthesized plan: epics → phases → releases (v0.1 … v2.0), each a kanban
   card with `reasoning`, `acceptance`, `reference_files`, `epic`, `release`, `column`.
5. **`ROADMAP.md`** — human-readable roadmap (epics, phases, release table).
6. **`KANBAN.md`** — the board (Backlog / Ready / In Progress / Review / Done) with every feature card.
7. **`releases/<release>/`** — one **git worktree + branch per release up to v2.0**. Each holds a
   `PLAN.md` (detailed implementation plan for that release) and a `port-kit/` (the actual reference
   source files from this repo + `PORTING.md` notes) so the Nebius web team gets a reviewable,
   self-contained branch they can lift into dev.nebius.com.

---

## Method (how the plan was built)

Fan-out orchestration via the **Workflow** tool (`devnebius-port-roadmap` script under the session
dir). Four phases:

| Phase | Agents | Output |
|---|---|---|
| 1 Inventory | 3 parallel | `discovery/*.json` |
| 2 Gap | 1 | `gap-analysis.{json,md}` |
| 3 PM council | 5 parallel (diverse lenses) | `council/pm-*.md` |
| 4 Synthesis | 1 | `roadmap.json` + `ROADMAP.md`/`KANBAN.md` drafts |

Agents **write files and return a one-line status** (schema-mode StructuredOutput is unreliable in
this env — see content-expansion/STATE.md). Orchestrator assembles final docs + worktrees inline.

---

## Release worktree convention

```
git worktree add docs/dev-nebius-port/releases/<release> -b port/<release>
# each worktree: docs/dev-nebius-port/releases/<release>/PLAN.md  +  port-kit/<files> + PORTING.md
```
Releases are numbered v0.1 → v2.0. v0.x = foundation/low-risk wins, v1.x = core builder surface,
v2.0 = full parity. See `roadmap.json` → `releases[]` for the canonical list.

---

## Reference: our site's feature surface (high level)

- **Marketing homepage** sections: ActiveEvents, WorkshopSpotlight, Products, Programs, UseCases,
  CodingAgents, EcosystemPartners, BuilderSpotlight, BuildInPublic, Community, Contact.
- **Content & community**: `/library` (+ `/[slug]`), `/ecosystem` (mixed apps+integrations grid +
  R3F membrane hero), `/apps` (+ `/[slug]`), `/integrations` (Hero3D), `/events` (live map),
  `/builders` (+ `/all` leaderboard), `/office-hours`, `/team` (+ `/[slug]`), `/fellows` (hidden).
- **Product pages**: `/ai-cloud`, `/token-factory`, `/serverless` (already mirror dev.nebius.com).
- **Builder portal** (auth, role=builder): checklist, profile, activity log, credits claim (AI Cloud
  + Token Factory), ambassador apply, event create/RSVP, library submit, personal leaderboard.
- **Admin console** (auth, role=admin): activities, ambassador apps, builders, credit claims/requests,
  library, team.
- **Platform**: Directus CMS (pages, library_articles, projects, events, team_members, builders,
  activities, credit_requests, ambassador_applications, feedback), Directus-JWT auth (cookie
  sessions), Typesense search, GTM+consent, MockupBanner, ProductsMenu/DocsMenu nav.

dev.nebius.com today (to be confirmed by discovery): product marketing + docs, no community/portal/
events/library/leaderboard surface. The roadmap closes that gap.
