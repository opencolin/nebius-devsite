#!/usr/bin/env node
// Generate human-readable docs from roadmap.json (single source of truth).
//   node gen.mjs            -> writes ROADMAP.md + KANBAN.md
//   node gen.mjs release v0.1 -> prints that release's PLAN.md to stdout
//   node gen.mjs cr         -> writes CHANGE-REQUEST.md (roadmap.json + content-manifest.json)
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const rm = JSON.parse(readFileSync(join(HERE, 'roadmap.json'), 'utf8'));
const manifestPath = join(HERE, 'content-manifest.json');
const cm = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
const epicById = Object.fromEntries(rm.epics.map((e) => [e.id, e]));
const cardById = Object.fromEntries(rm.cards.map((c) => [c.id, c]));
const sev = (r) => ({low: '🟢 low', med: '🟡 med', high: '🔴 high'}[r] ?? r);
const title = (id) => cardById[id]?.title ?? id;

function roadmapMd() {
  const L = [];
  L.push(`# ${rm.meta.title}`, '', `_${rm.meta.subtitle}_`, '');
  L.push('> Generated from `roadmap.json` — edit that file and re-run `node gen.mjs`, do not hand-edit this file.', '');
  L.push('## Guiding principle', '', rm.meta.principle, '');
  L.push('## Key tension resolved', '', rm.meta.key_tension_resolved, '');
  L.push('## Epics', '');
  for (const e of rm.epics) {
    const n = rm.cards.filter((c) => c.epic === e.id).length;
    L.push(`- **${e.name}** (\`${e.id}\`, ${n} cards) — ${e.goal}`);
  }
  L.push('');
  L.push('## Release sequence', '');
  L.push('| Release | Theme | Cards | Top risk |', '|---|---|:--:|---|');
  for (const r of rm.releases) {
    const risks = r.card_ids.map((id) => cardById[id].risk);
    const top = risks.includes('high') ? 'high' : risks.includes('med') ? 'med' : 'low';
    L.push(`| **${r.id}** | ${r.theme} | ${r.card_ids.length} | ${sev(top)} |`);
  }
  L.push('');
  for (const r of rm.releases) {
    L.push(`### ${r.id} — ${r.theme}`, '');
    L.push(`_${r.rationale}_`, '');
    L.push('| Card | Epic | I | E | Risk | Depends on |', '|---|---|:--:|:--:|---|---|');
    for (const id of r.card_ids) {
      const c = cardById[id];
      const deps = c.dependencies.length ? c.dependencies.map((d) => `\`${d}\``).join(', ') : '—';
      L.push(`| **${c.title}** (\`${c.id}\`) | ${epicById[c.epic].name} | ${c.impact} | ${c.effort} | ${sev(c.risk)} | ${deps} |`);
    }
    L.push('');
    for (const id of r.card_ids) {
      const c = cardById[id];
      L.push(`- **${c.title}** — ${c.reasoning}`);
    }
    L.push('');
  }
  return L.join('\n') + '\n';
}

function kanbanMd() {
  const L = [];
  L.push('# Kanban board — dev.nebius.com port', '');
  L.push('> Generated from `roadmap.json`. Move a card by changing its `column` field and re-running `node gen.mjs`.', '');
  L.push(`Columns: ${rm.meta.columns.map((c) => `\`${c}\``).join(' · ')}. All cards start in **Backlog**.`, '');
  // Board by column
  for (const col of rm.meta.columns) {
    const inCol = rm.cards.filter((c) => c.column === col);
    L.push(`## ${col} (${inCol.length})`, '');
    if (!inCol.length) {
      L.push('_empty_', '');
      continue;
    }
    for (const c of inCol) {
      L.push(`- \`${c.id}\` **${c.title}** — ${epicById[c.epic].name} · ${c.release} · I${c.impact}/E${c.effort}/${c.risk}`);
    }
    L.push('');
  }
  // Swimlanes by release
  L.push('---', '', '## Swimlanes by release', '');
  for (const r of rm.releases) {
    L.push(`### ${r.id} — ${r.theme}`, '');
    for (const id of r.card_ids) {
      const c = cardById[id];
      L.push(`- [ ] \`${c.id}\` **${c.title}** _(${c.column})_ — I${c.impact}/E${c.effort}/${c.risk}`);
    }
    L.push('');
  }
  return L.join('\n') + '\n';
}

function releaseMd(relId) {
  const r = rm.releases.find((x) => x.id === relId);
  if (!r) throw new Error(`unknown release ${relId}`);
  const idx = rm.releases.findIndex((x) => x.id === relId);
  const prior = rm.releases.slice(0, idx).map((x) => x.id);
  const L = [];
  L.push(`# Release ${r.id} — ${r.theme}`, '');
  L.push(`Branch: \`port/${r.id}\` · part of the [dev.nebius.com port roadmap](../../ROADMAP.md).`, '');
  L.push('## Why this release', '', r.rationale, '');
  L.push(`Builds on: ${prior.length ? prior.map((p) => `\`${p}\``).join(' → ') : '_nothing (first release)_'}.`, '');
  L.push('## Cards in this release', '');
  for (const id of r.card_ids) {
    const c = cardById[id];
    L.push(`### ${c.title}  \`${c.id}\``, '');
    L.push(`- **Epic:** ${epicById[c.epic].name} · **Impact:** ${c.impact}/5 · **Effort:** ${c.effort}/5 · **Risk:** ${sev(c.risk)}`);
    const deps = c.dependencies.length ? c.dependencies.map((d) => `\`${d}\` (${title(d)})`).join(', ') : '— none';
    L.push(`- **Depends on:** ${deps}`);
    L.push(`- **Why:** ${c.reasoning}`);
    L.push(`- **Acceptance:**`);
    for (const a of c.acceptance) L.push(`  - [ ] ${a}`);
    L.push(`- **Reference implementation (port-kit):**`);
    for (const f of c.reference_files) L.push(`  - \`${f}\``);
    L.push('');
  }
  L.push('## Port-kit', '', 'The `port-kit/` folder in this worktree contains copies of the reference files above, lifted from the Builders repo, plus `PORTING.md` with notes on adapting each to dev.nebius.com. These are reference implementations to port, not drop-in files (dev.nebius.com has its own routing/theme conventions).', '');
  L.push('## Verification', '', '- Type-check: `npx tsc --noEmit` in the target app.', '- Each acceptance checkbox above must pass on a preview deploy before the release is marked Done in `KANBAN.md`.', '');
  return L.join('\n') + '\n';
}

function crMd() {
  if (!cm) throw new Error('content-manifest.json missing — required for the change request');
  const c = cm.cr;
  const L = [];

  // Header
  L.push(`# Change Request — ${c.title}`, '');
  L.push('> Generated from `roadmap.json` + `content-manifest.json` — edit those and re-run `node gen.mjs cr`. Do not hand-edit.', '');
  L.push('| Field | Value |', '|---|---|');
  L.push(`| CR ID | ${c.id} |`);
  L.push(`| Status | ${c.status} |`);
  L.push(`| Date | ${c.date} |`);
  L.push(`| Requestor | ${c.requestor} |`);
  L.push(`| Target system | ${c.target} |`);
  L.push(`| Reference build | ${c.reference_build} |`);
  L.push('');

  // 1. Summary
  const totalContent = cm.content.reduce((n, x) => n + (typeof x.count === 'number' ? x.count : 0), 0);
  L.push('## 1. Summary', '');
  L.push(
    'Bring dev.nebius.com from a 4-page product microsite up to the full Nebius Builders surface ' +
      'already demonstrated on the reference build. Land **content first** (read-only, crawlable, ' +
      'low-risk), then **features** (search, identity, the builder portal, and the admin/economy ' +
      'console), across eight releases (v0.1 → v2.0).',
    '',
  );
  L.push(
    `- **Content:** ${totalContent}+ catalogued items across ${cm.content.length} collections ` +
      '(library, community apps, integrations, events, team, fellows, CMS pages).',
  );
  L.push(
    `- **Features:** ${rm.epics.length} epics · ${rm.releases.length} releases · ${rm.cards.length} ` +
      'kanban cards, each with reasoning + acceptance criteria + reference files.',
  );
  L.push('');

  // 2. Background
  L.push('## 2. Background & rationale', '');
  L.push(rm.meta.principle, '');
  L.push(
    'dev.nebius.com today is a deliberately thin first-party microsite (home + /ai-cloud + ' +
      '/token-factory + /serverless) on the exact stack this CR targets: ' +
      cm.target.stack +
      '. ' +
      cm.target.note +
      ' Every dynamic builder surface is currently absent or offloaded off-site (events → ' +
      'nebius.com/events, community → Discord, portal → external consoles). This CR closes that gap ' +
      'on-site. Full gap analysis: `gap-analysis.md`.',
    '',
  );

  // 3. Scope
  L.push('## 3. Scope', '');
  L.push('**In scope**');
  L.push('- Part A: migrate all catalogued content into Directus collections on dev.nebius.com.');
  L.push(`- Part B: build the ${rm.epics.length} feature epics (${rm.cards.length} cards), v0.1 → v2.0.`);
  L.push('');
  L.push('**Out of scope** (called out so the team is not surprised)');
  L.push('- Backend credit/grant *fulfillment* — this CR covers the request + approval flow, not the disbursement system.');
  L.push('- The final identity decision is a prerequisite, not a deliverable here (see Risk R1).');
  L.push('- Licensed media / non-Nebius brand assets used as placeholders on the reference build.');
  L.push('');

  // 4. Part A — Content
  L.push('## 4. Part A — Content additions (land first)', '');
  L.push(
    'Read-only, crawlable, and low-risk. All of Part A hangs off one foundation: the program data ' +
      'model (`directus-data-model`, release v0.1). Nothing here needs auth.',
    '',
  );
  L.push('### Content inventory', '');
  L.push('| Content | Collection | Items | Notes |', '|---|---|:--:|---|');
  for (const x of cm.content) {
    const items =
      typeof x.count === 'number'
        ? String(x.count)
        : x.items
        ? `${x.items.length} pages`
        : x.count || '—';
    L.push(`| **${x.name}** | \`${x.collection}\` | ${items} | ${x.notes} |`);
  }
  L.push('');
  L.push('### Per-collection detail', '');
  for (const x of cm.content) {
    L.push(`#### ${x.name} — \`${x.collection}\``, '');
    if (x.count) {
      L.push(
        `- **Volume:** ${typeof x.count === 'number' ? x.count + ' items' : x.count}` +
          (x.count_basis ? ` (${x.count_basis})` : ''),
      );
    }
    if (x.items) L.push(`- **Pages:** ${x.items.join(', ')}`);
    if (x.types) L.push(`- **Types:** ${x.types.join(', ')}`);
    if (x.key_fields) L.push(`- **Key fields:** ${x.key_fields.map((f) => '`' + f + '`').join(', ')}`);
    L.push(`- **Notes:** ${x.notes}`);
    L.push('');
  }
  L.push('### Tagging', '');
  L.push('- **Library surface:** ' + cm.tagging.library_surface.map((s) => '`' + s + '`').join(', ') + ' — controls product-page rails.');
  L.push('- **Library types:** ' + cm.tagging.library_types.map((s) => '`' + s + '`').join(', ') + '.');
  L.push('- **`product_focus` enum:** ' + cm.tagging.product_focus.map((s) => '`' + s + '`').join(', ') + '.');
  L.push('- **Integration `products`:** ' + cm.tagging.integration_products.map((s) => '`' + s + '`').join(', ') + ' (hyphenated).');
  L.push('');
  L.push('### Migration mechanism', '');
  L.push('- **How:** ' + cm.migration.mechanism);
  L.push('- **Tooling:** ' + cm.migration.tooling);
  L.push('- **Dedup:** ' + cm.migration.dedup);
  L.push('- **Rollback:** ' + cm.migration.rollback);
  L.push('- **Verification:** ' + cm.migration.verification);
  L.push('');

  // 5. Part B — Features
  L.push('## 5. Part B — Feature additions', '');
  L.push(
    'Two independent foundations gate everything and can be built in parallel: `directus-data-model` ' +
      '(v0.1, also powers all of Part A) and `auth-sessions` (v1.1). ' +
      rm.meta.key_tension_resolved,
    '',
  );
  L.push('### Epics', '');
  for (const e of rm.epics) {
    const n = rm.cards.filter((cc) => cc.epic === e.id).length;
    L.push(`- **${e.name}** (\`${e.id}\`, ${n} cards) — ${e.goal}`);
  }
  L.push('');
  L.push('### Releases', '');
  L.push('| Release | Theme | Cards | Top risk |', '|---|---|:--:|---|');
  for (const r of rm.releases) {
    const risks = r.card_ids.map((id) => cardById[id].risk);
    const top = risks.includes('high') ? 'high' : risks.includes('med') ? 'med' : 'low';
    L.push(`| **${r.id}** | ${r.theme} | ${r.card_ids.length} | ${sev(top)} |`);
  }
  L.push('');
  L.push('### Change items by release', '');
  for (const r of rm.releases) {
    L.push(`#### ${r.id} — ${r.theme}`, '');
    L.push(`_${r.rationale}_`, '');
    for (const id of r.card_ids) {
      const cc = cardById[id];
      const deps = cc.dependencies.length
        ? ` · depends on ${cc.dependencies.map((d) => '`' + d + '`').join(', ')}`
        : '';
      L.push(`- **${cc.title}** (\`${cc.id}\`) — ${epicById[cc.epic].name} · I${cc.impact}/E${cc.effort}/${sev(cc.risk)}${deps}`);
      L.push(`  - **Why:** ${cc.reasoning}`);
      L.push(`  - **Acceptance:** ${cc.acceptance.join('; ')}`);
      L.push(`  - **Reference:** ${cc.reference_files.map((f) => '`' + f + '`').join(', ')}`);
    }
    L.push('');
  }

  // 6. Dependencies & sequencing
  L.push('## 6. Dependencies & sequencing', '');
  L.push('- **Part A (content)** depends only on `directus-data-model` (v0.1). Once the schema is applied, all content can load.');
  L.push('- **Part B (features)** follows the release order; each release is independently shippable.');
  L.push('- Order: ' + rm.releases.map((r) => '`' + r.id + '`').join(' → ') + '.');
  L.push('');

  // 7. Risk
  L.push('## 7. Risk assessment', '');
  L.push('| # | Area | Level | Risk | Mitigation |', '|---|---|---|---|---|');
  for (const r of cm.risks) {
    L.push(`| ${r.id} | ${r.area} | ${sev(r.level)} | ${r.risk} | ${r.mitigation} |`);
  }
  L.push('');

  // 8. Rollout
  L.push('## 8. Rollout plan', '');
  L.push('1. **v0.1** — apply the schema + load Part A content; ship the invisible foundation (data model, CMS catch-all, sitemap/SEO, feedback).');
  L.push('2. **v0.2–v0.4** — expose the content surfaces (library + product rails, community directories, events + a living homepage).');
  L.push('3. **v1.0** — search + finish the public chrome; the public hub is complete and crawlable.');
  L.push('4. **v1.1** — identity foundation on the lightest gate (office-hours booking reveal).');
  L.push('5. **v1.2** — builder portal + write-flows (submissions enter PENDING; interim processing via Directus Studio).');
  L.push('6. **v2.0** — admin console + review queues + leaderboard; the program economy made real.');
  L.push('- Each release: deploy to a preview, pass its acceptance gates, then promote. Keep ISR `revalidate: 60` to match the s-maxage=60 edge cache.');
  L.push('');

  // 9. Acceptance & sign-off
  L.push('## 9. Acceptance & sign-off', '');
  L.push("A release is **Done** only when every card's acceptance criteria pass on a preview deploy (tracked in `KANBAN.md`).", '');
  L.push('| Role | Sign-off scope | Name | Date |', '|---|---|---|---|');
  for (const s of cm.signoff) L.push(`| ${s.role} | ${s.scope} |  |  |`);
  L.push('');

  // 10. References
  L.push('## 10. References', '');
  L.push('- `ROADMAP.md` / `KANBAN.md` — the feature plan + board (generated).');
  L.push(`- \`roadmap.json\` — canonical feature data (${rm.epics.length} epics / ${rm.releases.length} releases / ${rm.cards.length} cards).`);
  L.push('- `gap-analysis.md` / `gap-analysis.json` — the scored delta vs dev.nebius.com.');
  L.push('- `content-manifest.json` — content scope, tagging, migration, risks (source for Part A).');
  L.push('- `releases/<id>/PLAN.md` + `port-kit/` — per-release detail + reference source (branches `port/v0.1`…`port/v2.0`).');
  L.push('- `../content-expansion/` — the content catalog + ingest tooling (`state/ingest.mjs`, `verify.mjs`).');
  L.push('');
  return L.join('\n') + '\n';
}

const mode = process.argv[2];
if (mode === 'release') {
  process.stdout.write(releaseMd(process.argv[3]));
} else if (mode === 'cr') {
  writeFileSync(join(HERE, 'CHANGE-REQUEST.md'), crMd());
  console.log('wrote CHANGE-REQUEST.md');
} else {
  writeFileSync(join(HERE, 'ROADMAP.md'), roadmapMd());
  writeFileSync(join(HERE, 'KANBAN.md'), kanbanMd());
  console.log('wrote ROADMAP.md + KANBAN.md');
}
