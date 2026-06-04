#!/usr/bin/env node
// Validate roadmap.json integrity. Run: node docs/dev-nebius-port/validate.mjs
// Exit 0 = clean, 1 = problems. Also prints a release/epic/card summary.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const path = join(HERE, 'roadmap.json');

let data;
try {
  data = JSON.parse(readFileSync(path, 'utf8'));
} catch (e) {
  console.error('FAIL: cannot read/parse roadmap.json:', e.message);
  process.exit(1);
}

const epics = data.epics ?? [];
const releases = data.releases ?? [];
const cards = data.cards ?? [];
const epicIds = new Set(epics.map((e) => e.id));
const releaseIds = new Set(releases.map((r) => r.id));
const cardIds = cards.map((c) => c.id);
const cardIdSet = new Set(cardIds);
const issues = [];

// dupe card ids
const seen = new Set();
for (const id of cardIds) {
  if (seen.has(id)) issues.push(`duplicate card id: ${id}`);
  seen.add(id);
}

// per-card integrity
for (const c of cards) {
  if (!c.id) issues.push(`card missing id: ${JSON.stringify(c).slice(0, 80)}`);
  if (!c.title) issues.push(`card ${c.id}: missing title`);
  if (!c.epic || !epicIds.has(c.epic)) issues.push(`card ${c.id}: epic "${c.epic}" not in epics[]`);
  if (!c.release || !releaseIds.has(c.release)) issues.push(`card ${c.id}: release "${c.release}" not in releases[]`);
  if (!c.reasoning || c.reasoning.length < 10) issues.push(`card ${c.id}: missing/thin reasoning`);
  if (!Array.isArray(c.acceptance) || c.acceptance.length < 2) issues.push(`card ${c.id}: <2 acceptance criteria`);
  if (!c.column) issues.push(`card ${c.id}: missing column`);
  for (const dep of c.dependencies ?? []) {
    if (!cardIdSet.has(dep)) issues.push(`card ${c.id}: dependency "${dep}" is not a card id`);
  }
}

// orphans + dangling release.card_ids: each card in exactly one release.card_ids
const inRelease = new Map();
for (const r of releases) {
  for (const cid of r.card_ids ?? []) {
    if (!cardIdSet.has(cid)) issues.push(`release ${r.id}: card_id "${cid}" is not a card`);
    inRelease.set(cid, (inRelease.get(cid) ?? 0) + 1);
  }
}
for (const id of cardIds) {
  const n = inRelease.get(id) ?? 0;
  if (n === 0) issues.push(`orphan card (in no release.card_ids): ${id}`);
  if (n > 1) issues.push(`card ${id} listed in ${n} releases`);
}

// release ordering sanity
const order = releases.map((r) => r.id);
console.log('--- roadmap.json summary ---');
console.log(`epics:    ${epics.length}`);
console.log(`releases: ${releases.length}  [${order.join(', ')}]`);
console.log(`cards:    ${cards.length}`);
for (const r of releases) {
  console.log(`  ${r.id.padEnd(6)} ${(r.card_ids ?? []).length} cards  — ${r.theme ?? ''}`);
}
console.log('');
if (issues.length === 0) {
  console.log('OK: roadmap.json is internally consistent.');
  process.exit(0);
} else {
  console.log(`PROBLEMS (${issues.length}):`);
  for (const i of issues) console.log('  - ' + i);
  process.exit(1);
}
