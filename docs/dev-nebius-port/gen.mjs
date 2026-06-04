#!/usr/bin/env node
// Generate human-readable docs from roadmap.json (single source of truth).
//   node gen.mjs            -> writes ROADMAP.md + KANBAN.md
//   node gen.mjs release v0.1 -> prints that release's PLAN.md to stdout
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const rm = JSON.parse(readFileSync(join(HERE, 'roadmap.json'), 'utf8'));
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

const mode = process.argv[2];
if (mode === 'release') {
  process.stdout.write(releaseMd(process.argv[3]));
} else {
  writeFileSync(join(HERE, 'ROADMAP.md'), roadmapMd());
  writeFileSync(join(HERE, 'KANBAN.md'), kanbanMd());
  console.log('wrote ROADMAP.md + KANBAN.md');
}
