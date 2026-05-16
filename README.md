# nebius-builders

A Nebius Builders site built following **Nebius.com's exact tech stack** so the web team can adopt and maintain it without context-switching.

## The stack (mirrors nebius.com)

| Layer | Choice |
|---|---|
| Framework | Next.js (Pages Router, webpack) |
| UI | `@gravity-ui/uikit` + `@gravity-ui/page-constructor` (Yandex's open-source design system) |
| Styles | CSS Modules + Gravity tokens (no Tailwind) |
| CMS | Directus (self-hosted) |
| Search | Typesense |
| Auth | Directus built-in JWT, three roles (`public` / `builder` / `admin`) |
| Hosting (prod) | Azure Container Apps + Azure Front Door |
| Hosting (dev) | Docker Compose |
| Marketing | GTM bootstrap with consent gating |

See `/Users/colin/.claude/plans/research-nebius-com-and-how-dreamy-seal.md` for the
research that produced this stack and the full plan.

## Repo layout

```
apps/
  web/          Next.js Pages Router app
  directus/     Directus schema, seed content, custom hooks
infra/
  docker-compose.yml    Local dev: web + directus + postgres + redis + typesense + mailcatcher
  Dockerfile.web        Multi-stage Next standalone build for prod
  azure/                Bicep + deployment notes for Azure Container Apps + Front Door
  typesense/sync.ts     Directus → Typesense indexer (run from CI)
.env.example
```

## Quick start (local dev)

Prereqs: Docker, Node 20+, npm.

```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d   # directus, postgres, redis, typesense
cd apps/web && npm install && npm run dev          # Next on :3000
```

Then:

- Directus admin: <http://localhost:8055> (admin@example.com / password from `.env`)
- Web app: <http://localhost:3000>
- Typesense health: <http://localhost:8108/health>
- Mailcatcher: <http://localhost:1080>

To apply the Directus schema and seed CMS pages:

```bash
cd apps/directus && npm install && npm run apply-schema && npm run seed
```

## Production deploy (Azure)

See `infra/azure/README.md` for `az login` + `az deployment sub create -f main.bicep`
walkthrough. Mirrors Nebius.com's `x-azure-ref` topology.

## Build order (status)

- [x] Monorepo skeleton + Docker Compose
- [x] Next.js Pages Router + Gravity UI + Page Constructor wired
- [x] `/[[...slug]]` CMS catch-all
- [x] Directus schema + seed scaffolding
- [x] Auth API routes (login / logout / me) backed by Directus
- [x] Typesense client + `/api/search` proxy
- [x] GTM + consent gating in `_app.tsx`
- [x] Azure Front Door deploy notes
- [ ] Port public data-driven pages (events, leaderboard, library, projects, team)
- [ ] Port portal pages (14)
- [ ] Port admin pages (8)
- [ ] Migrate `content/**` from `opencolin/nebius-builders` into Directus
