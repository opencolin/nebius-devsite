# dev.nebius.com Port — Live State

> Resume point for any agent. Update this after every phase. Newest status at top.

## Status: ✅ DONE — roadmap + kanban + 8 release worktrees shipped

Everything below is complete and pushed. Resume here only to revise the plan or start building
a release (check out `port/<id>`, work the cards in `releases/<id>/PLAN.md`, move cards in
`KANBAN.md` as they land).

### Release worktrees (branches off main)
Created by `node docs/dev-nebius-port/mk-worktrees.mjs`. Each `port/<id>` branch adds
`docs/dev-nebius-port/releases/<id>/` = `PLAN.md` + `PORTING.md` + `port-kit/` (reference source).

| Branch | Worktree path | Cards | Ref files |
|---|---|:--:|:--:|
| `port/v0.1` | `../nebius-homepage.worktrees/v0.1` | 4 | 8 |
| `port/v0.2` | `../nebius-homepage.worktrees/v0.2` | 4 | 9 |
| `port/v0.3` | `../nebius-homepage.worktrees/v0.3` | 4 | 12 |
| `port/v0.4` | `../nebius-homepage.worktrees/v0.4` | 4 | 18 |
| `port/v1.0` | `../nebius-homepage.worktrees/v1.0` | 2 | 10 |
| `port/v1.1` | `../nebius-homepage.worktrees/v1.1` | 2 | 7 |
| `port/v1.2` | `../nebius-homepage.worktrees/v1.2` | 6 | 21 |
| `port/v2.0` | `../nebius-homepage.worktrees/v2.0` | 5 | 20 |

`git worktree list` to see them. Remove one with `git worktree remove ../nebius-homepage.worktrees/<id>`.

---

## (history) ROADMAP COMPLETE — CUTTING RELEASE WORKTREES

Workflow `devnebius-port-roadmap` (run `wf_59ff0dee-f5f`) ran all 4 phases. The synthesis agent
died on a **transient API socket error**, so `roadmap.json` was produced **inline by the
orchestrator** from the (complete, validated) gap analysis + 5 PM proposals. `validate.mjs` passes.

**Outcome: 8 epics · 8 releases (v0.1 → v2.0) · 31 cards.** All deps resolve, no orphans.

### Checklist
- [x] Phase 1 — Inventory: `discovery/{our-features,devnebius-surface,devnebius-features}.json`
      (our site = 57 features; dev.nebius.com = 4-page first-party microsite)
- [x] Phase 2 — Gap: `gap-analysis.json` (30 gaps) + `gap-analysis.md`
- [x] Phase 3 — PM council: `council/pm-{devrel,growth,platform,content-seo,design-ux}.md`
- [x] Phase 4 — Synthesis: `roadmap.json` (done inline after agent socket error) — `validate.mjs` ✅
- [x] Assemble `ROADMAP.md` + `KANBAN.md` (via `gen.mjs`, regenerable)
- [x] Create release worktrees (`port/v0.1` … `port/v2.0`) with `PLAN.md` + `port-kit/`
- [x] Commit + push handoff docs (main) + release branches

### Tooling (all under docs/dev-nebius-port/)
- `validate.mjs` — checks roadmap.json integrity. `node docs/dev-nebius-port/validate.mjs`
- `gen.mjs` — regenerates ROADMAP.md + KANBAN.md; `node gen.mjs release <id>` prints a release PLAN.md
- `mk-worktrees.sh` — (created in worktree step) cuts `port/<release>` worktrees + port-kits

### How to resume
1. Read `PLAN.md` (method) + this file (status).
2. `roadmap.json` is canonical and validated → go straight to the worktree + commit steps.
3. To revise the plan: edit `roadmap.json`, run `validate.mjs`, then `gen.mjs`.

### Decisions / notes
- **Key tension (Growth vs Platform):** credit *claims* ship in v1.2 (acquisition value, interim
  Directus-Studio processing); automated approve/reject queue ships in v2.0. See roadmap.meta.
- **Chrome gap split** into `chrome-public-nav` (v1.0, no deps) + `chrome-portal-admin-shells`
  (v2.0, deps portal+admin) per the Design/UX PM's recommendation → 31 cards from 30 gaps.
- Two independent foundations gate everything: `directus-data-model` (v0.1) + `auth-sessions`
  (v1.1) — buildable in parallel.
