# Content Expansion — Master Plan (handoff doc)

**Goal:** Find the best workshop videos, tutorials, integrations, community OSS
apps, and hackathon projects that use **Nebius AI Cloud**, **Token Factory**, or
**Tavily**, and add them to the site on the appropriate page with proper tagging.

**Owner:** automated session (opus-4-8, 1M ctx). **Started:** 2026-05-31.
**Process:** PM mode-council → fan-out discovery → dedup/placement → ingest
(Directus API + worktree code edits) → verify → handoff.

> Any agent picking this up: read `STATE.md` first for live status, then this
> file for conventions, then `releases/roadmap.json` for the ratified plan.

---

## Where content lands (the three targets + tagging rules)

### 1. `library_articles` (Directus) — workshops, videos, tutorials, docs, playlists
Inserted via Directus REST (`POST /items/library_articles`). Renders on `/library`.
| field | rule |
|---|---|
| `slug` | kebab-case, unique. Dedup against `state/existing-baseline.json:librarySlugs`. |
| `type` | one of `WORKSHOP` `VIDEO` `REPO` `BLOG` `DOCS` `PLAYLIST` |
| `title` | concise, source-faithful |
| `blurb` | 1–2 sentence summary |
| `level` | `beginner` `intermediate` `advanced` |
| `duration_min` | int, videos/workshops only |
| `product_focus` | subset of `tokenfactory` `aicloud` `openclaw` `soperator` `tavily` (single-word lowercase — NOT snake_case) |
| `surface` | subset of `ai-cloud` `token-factory` `serverless` `library` (drives Phase-2 product pages) |
| `pinned` | bool — floats to top of homepage WorkshopSpotlight + landing rails |
| `is_official` | true if produced by Nebius/Tavily; false for community |
| `external_url` | canonical source URL; dedup against `libraryExternalUrls` |

### 2. `projects` (Directus) — community OSS apps + hackathon projects
Inserted via Directus REST (`POST /items/projects`). Renders on `/apps` + `/ecosystem`.
| field | rule |
|---|---|
| `slug` | kebab-case, unique. Dedup vs `projectSlugs`. |
| `title` / `tagline` / `description` | tagline = 1 line; description = 2–3 sentences |
| `builder_handle` | GitHub/X handle, no `@` |
| `repo_url` | must be a live GitHub/GitLab repo (verify 200, not 404/private). Dedup vs `projectRepoUrls`. |
| `product_focus` | same enum as library |
| `tags` | free-form keywords |
| `hackathon` | `robotics` `jetbrains` `none` |
| `award` | `winner` `runner-up` `3rd` `finalist` or null |
| `stars` | GitHub stargazers count |
| `featured` | bool |
| forks | if `repo_url` is a fork, credit the original creator in the tagline (precedent: OpenClaw → @steipete) |

### 3. `ecosystem-partners.ts` (code) — partner integrations
Edited in `apps/web/src/lib/ecosystem-partners.ts` (**worktree-isolated**, since
it's a code edit that can conflict). Renders on `/integrations` + `/ecosystem`.
| field | rule |
|---|---|
| `name` | partner/product name |
| `blurb` | what it does + how it plugs into Nebius |
| `docsUrl` | canonical docs/integration page (verify 200). Dedup vs `integrationDocsUrls` + `integrationNames`. |
| `category` | one of `inference` `router` `agents` `coding` `nocode` `training` `orchestration` `mlops` `observability` `iac` `search` `tooling` |
| `products` | subset of `ai-cloud` `token-factory` `tavily` (hyphenated — different vocab from Directus!) |

> **Vocabulary gotcha:** Directus `product_focus` uses single-word lowercase
> (`tokenfactory`, `aicloud`); integration `products` uses hyphenated
> (`token-factory`, `ai-cloud`). `/ecosystem` bridges them in `PRODUCT_KEYS`.

---

## Discovery sources (what the fan-out searches)
- **Workshops/videos/playlists:** YouTube (Nebius, Token Factory channels), nebius.com/blog, academy.nebius.com, docs.tokenfactory.nebius.com, dev.nebius.com.
- **Tutorials/docs:** docs.nebius.com, docs.tokenfactory.nebius.com, docs.tavily.com, partner docs.
- **Integrations:** Token Factory integrations index, Tavily integrations, partner sites (LangChain, LlamaIndex, CrewAI, …), Mastra-style provider pages.
- **OSS apps + hackathon projects:** GitHub search (`nebius`, `token-factory`, `tavily` topics/keywords), Luma/Devpost hackathon galleries, the nebius-builders event recaps.

Each candidate must (a) actually use Nebius AI Cloud / Token Factory / Tavily,
(b) resolve to a live URL, (c) not already exist in the baseline.

---

## Release roadmap (SEED — council ratifies in `releases/roadmap.json`)
- **v0.1 Scaffold** — coordination docs + dedup baseline. *(done at bootstrap)*
- **v0.2 Library discovery** — best workshops/tutorials/videos/playlists → `library_articles`.
- **v0.3 Integrations discovery** — new partner integrations → `ecosystem-partners.ts` (worktree).
- **v0.4 Apps + hackathon discovery** — community OSS + hackathon projects → `projects`.
- **v1.0 Tagging + QA** — verify every new entry's tags/surface/links; pin the best; wire homepage/landing.
- **v2.0 Verify + handoff** — full link-check, dedup sweep, screenshots, final STATE handoff.

## Worktree strategy
- Directus-API ingestion (library, projects) needs **no** worktree — it's data, not code.
- Code edits (`ecosystem-partners.ts`, any page/UI) run in a **per-release worktree**
  (`isolation: 'worktree'` on the ingesting agent, or `EnterWorktree`), then merge to `main`.
- Each release that touches code gets its own worktree so parallel releases don't collide.

## Self-pacing
- 30s ticks requested; `ScheduleWakeup` floor is 60s → ticking at 60s.
- Background workflows auto-re-invoke this loop on completion, so the timer is a heartbeat/fallback.

## Resume pointers
- `STATE.md` — live status, in-flight workflow IDs, worktree paths, next action.
- `state/existing-baseline.json` — dedup baseline (repo URLs, library URLs, integration names/URLs).
- `candidates/*.json` — discovery output per stream.
- `releases/roadmap.json` — council-ratified roadmap.
- Ingest scripts get written to `state/` as they're authored (e.g. `state/ingest-library.mjs`).
