# dev.nebius.com Port — Live State

> Resume point for any agent. Update this after every phase. Newest status at top.

## Status: ROADMAP COMPLETE — CUTTING RELEASE WORKTREES

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
- [ ] Create release worktrees (`port/v0.1` … `port/v2.0`) with `PLAN.md` + `port-kit/`
- [ ] Commit + push handoff docs (main) + release branches

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
