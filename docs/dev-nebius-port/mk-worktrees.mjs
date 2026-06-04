#!/usr/bin/env node
// Cut one git worktree + branch (port/<release>) per release, each carrying that
// release's PLAN.md + a self-contained port-kit/ (reference files + PORTING.md).
// Re-runnable: skips branches/worktrees that already exist.
//
//   node docs/dev-nebius-port/mk-worktrees.mjs
//
// Worktrees are created OUTSIDE the main tree (../nebius-homepage.worktrees/<id>)
// so they never show up in the main repo's `git status`.
//
// Uses execFileSync with argument arrays (no shell) — safe against metacharacters.
import {execFileSync} from 'node:child_process';
import {readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));            // docs/dev-nebius-port
const git = (args, opts = {}) => execFileSync('git', args, {stdio: 'pipe', ...opts}).toString().trim();
const REPO = git(['rev-parse', '--show-toplevel']);
const WT_ROOT = join(REPO, '..', 'nebius-homepage.worktrees');
const GEN = join(HERE, 'gen.mjs');
const rm = JSON.parse(readFileSync(join(HERE, 'roadmap.json'), 'utf8'));
const cardById = Object.fromEntries(rm.cards.map((c) => [c.id, c]));
const epicById = Object.fromEntries(rm.epics.map((e) => [e.id, e]));

const branchExists = (b) => {
  try { git(['show-ref', '--verify', '--quiet', `refs/heads/${b}`]); return true; } catch { return false; }
};

const ADAPT = [
  'dev.nebius.com is already Next.js Pages Router + Gravity UI + Page Constructor + Directus, so the',
  'component structure ports closely. When adapting each reference file:',
  '- Keep Gravity UI primitives + their theme tokens; drop our bespoke CSS-module classnames where they have an equivalent.',
  '- Repoint data reads at their Directus instance + the collections from the `directus-data-model` card.',
  '- Preserve ISR `revalidate: 60` to match their `s-maxage=60` edge cache.',
  '- Gate any authenticated surface behind the `auth-sessions` card (reconcile with auth.nebius.com SSO first).',
  '- Strip demo-only bits (MockupBanner, sample/placeholder data) before shipping.',
].join('\n');

let made = 0, skipped = 0;
const summary = [];

for (const r of rm.releases) {
  const id = r.id;                       // e.g. v0.1
  const branch = `port/${id}`;
  const wt = join(WT_ROOT, id);
  const relDir = join('docs', 'dev-nebius-port', 'releases', id);

  if (existsSync(wt)) {
    skipped++;
    summary.push(`${id}: worktree exists at ${wt} — skipped`);
    continue;
  }
  mkdirSync(WT_ROOT, {recursive: true});
  if (branchExists(branch)) {
    git(['worktree', 'add', wt, branch]);
  } else {
    git(['worktree', 'add', '-b', branch, wt, 'main']);
  }

  // PLAN.md (generated)
  const planAbs = join(wt, relDir, 'PLAN.md');
  mkdirSync(dirname(planAbs), {recursive: true});
  writeFileSync(planAbs, execFileSync('node', [GEN, 'release', id]).toString() + '\n');

  // port-kit: copy reference files (deduped) preserving apps/web/... path
  const refs = [...new Set(r.card_ids.flatMap((cid) => cardById[cid].reference_files))].sort();
  const kit = join(wt, relDir, 'port-kit');
  const copied = [], missing = [];
  for (const f of refs) {
    const src = join(REPO, f);
    if (existsSync(src)) {
      const dst = join(kit, f);
      mkdirSync(dirname(dst), {recursive: true});
      copyFileSync(src, dst);
      copied.push(f);
    } else {
      missing.push(f);
    }
  }

  // PORTING.md
  const P = [];
  P.push(`# Port-kit — ${id} ${r.theme}`, '');
  P.push('Reference implementations lifted from the Builders repo for this release. These are', 'snapshots to PORT, not drop-in files.', '');
  P.push('## How to adapt', '', ADAPT, '');
  P.push('## Files by card', '');
  for (const cid of r.card_ids) {
    const c = cardById[cid];
    P.push(`### ${c.title}  \`${c.id}\``, '');
    P.push(`Epic ${epicById[c.epic].name} · I${c.impact}/E${c.effort}/${c.risk}. ${c.reasoning}`, '');
    for (const f of c.reference_files) {
      const tag = copied.includes(f) ? '' : ' _(referenced but not present in repo — implement fresh)_';
      P.push(`- \`port-kit/${f}\`${tag}`);
    }
    P.push('');
  }
  if (missing.length) {
    P.push('## Missing references (implement fresh on dev.nebius.com)', '');
    for (const f of missing) P.push(`- \`${f}\``);
    P.push('');
  }
  writeFileSync(join(wt, relDir, 'PORTING.md'), P.join('\n') + '\n');

  // commit on the branch
  git(['-C', wt, 'add', relDir]);
  git(['-C', wt, 'commit', '-q', '-m',
    `port(${id}): ${r.theme} — plan + port-kit (${copied.length} ref files, ${r.card_ids.length} cards)\n\n` +
    `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`]);
  made++;
  summary.push(`${id}: branch ${branch} @ ${wt} — ${copied.length} files, ${missing.length} missing`);
}

console.log(`\nworktrees made: ${made}, skipped: ${skipped}`);
for (const s of summary) console.log('  ' + s);
console.log('\nlist: git worktree list');
