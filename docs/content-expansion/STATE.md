# Content Expansion — Live State (read me first)

**Updated:** 2026-06-01 (complete)
**Phase:** v2.0 verified live
**Status:** 🟢 COMPLETE — 45 new items live (21 library + 17 apps + 7 integrations)

## Verified live on demo.buildspace.tv (deploy 7b01886)
- /library: **133** cards (was 112). New YT entry renders with "Watch on YouTube ↗".
- /apps: **111** (was 94).
- /integrations: **71** (was 64) — all 7 new partners render.
- /ecosystem: **All (182) · Community (111) · Integration (71)**.
- Homepage WorkshopSpotlight: pinned the RAG-in-production webinar (+ existing Slack-bot).

> **Council outcome:** the PM mode-council ran (2 attempts). Schema-mode synthesis
> failed both times (subagents won't emit StructuredOutput in this env), BUT the
> Risk PM wrote a strong `releases/roadmap.json` to disk as a side-effect — that
> is the ADOPTED ratified roadmap (9 releases + 6 invariants). Lesson baked into
> all downstream agents: **no schema mode; agents write JSON files instead.**

## Done
- [x] v0.1 Coordination scaffold (`docs/content-expansion/{state,candidates,releases}`)
- [x] Dedup baseline → `state/existing-baseline.json` (94 projects / 112 library / 64 integrations)
- [x] `PLAN.md` master handoff doc (targets + tagging rules + sources + worktree strategy)

## INGESTED (live in Directus / pushed to main)
- [x] **v0.2 Library** — 21 entries (7 YouTube workshops/videos + 14 blog/docs/medium tutorials). Library 112 → **133**. Rollback: `state/rollback-library.json`.
- [x] **v0.4 Projects** — 17 community OSS apps. Projects 94 → **111**. Rollback: `state/rollback-projects.json`.
- [x] **v0.3 Integrations** — 7 partners (OpenCode, smolagents, LLM Gateway, Pipecat, Devin, ElevenLabs, Gradium). 64 → **71**. Built in worktree `content/integrations-expansion`, fast-forward merged → main `7b01886`, pushed. Worktree removed.
- Discovery: `wf_c25835a1-8ad` (5 streams, 45 candidates, all curl/oEmbed-verified live). Bug found+fixed in `state/ingest.mjs` norm() — was collapsing all youtube watch?v= URLs to one key; now canonicalizes to `yt:<id>`.

## Remaining
- [ ] **v1.0** — pin the best new workshop(s) to homepage; spot-check tags/surface on /library + /apps + /integrations.
- [ ] **v2.0** — verify all new content renders live on demo.buildspace.tv (after deploy 7b01886), final handoff.
- Deploy `7b01886` in flight → rebuilds SSG so library+projects additions render too. Purge FD `/library /apps /ecosystem /integrations` after.

## In-flight (council — DONE, archived)
- [x] PM mode-council workflow (v2, hardened) — ratify roadmap → `releases/roadmap.json`
  - runId: `wf_7d052821-b0b` (4 PM **prose** takes, try/catch per PM → structured synthesis, try/catch with seed fallback)
  - **superseded** runId `wf_ae81be79-32d` — FAILED: a schema-mode PM agent never called StructuredOutput and the error propagated. Fix: PMs now return prose (can't fail schema), each wrapped in try/catch; only the chair uses a schema, also wrapped.
  - on completion: if `decided` present → persist to `releases/roadmap.json`; if `synthesisFailed` → fall back to the SEED roadmap in PLAN.md. Then launch v0.2 discovery fan-out.

## Tooling ready
- `state/ingest.mjs` — generic Directus ingester (library|projects), live dedup by slug + URL, dry-run by default, `--apply` to POST. Reusable across all ingest phases.

## Next (in order)
1. Council ratifies roadmap → persist to `releases/roadmap.json`.
2. v0.2 discovery fan-out (library: workshops/tutorials/videos/playlists) → `candidates/library.json`.
3. v0.3 discovery fan-out (integrations) → `candidates/integrations.json`.
4. v0.4 discovery fan-out (apps + hackathon) → `candidates/apps.json`.
5. Dedup + placement pass → write ingest scripts to `state/`.
6. Ingest: Directus API (library + projects), worktree edit (`ecosystem-partners.ts`).
7. v1.0 tagging QA + pin best + wire homepage/landing.
8. v2.0 link-check + dedup sweep + verify on demo.buildspace.tv + commit.

## Worktrees
- none yet. Code-edit releases (v0.3 integrations, v1.0 wiring) will each get one.

## Prior-session content already added (do NOT re-add)
- 55 dev.nebius.com resources → library (Phase 1 migration)
- Mastra integration → ecosystem-partners.ts
- Claude Code Proxy for Nebius → projects
- 2 Luma events → events

## Key facts for whoever resumes
- Directus base: `https://nbdevsite-directus.salmonriver-a8462200.westeurope.azurecontainerapps.io`
- Token: `.azure-secrets.local` → `DIRECTUS_STATIC_TOKEN` (gitignored; `set -a && source`).
- Deploy = push to `main` → GitHub Actions `deploy-web.yml` → Azure → purge Front Door (`az afd endpoint purge ... --content-paths`).
- `product_focus` enum: `tokenfactory aicloud openclaw soperator tavily` (Directus). Integration `products`: `token-factory ai-cloud tavily` (hyphenated).
- Type-check before commit: `cd apps/web && npx tsc --noEmit`. Stage specific files only.
