// Generic Directus ingester for the content-expansion goal.
//
// Usage:
//   DIRECTUS_URL=... DIRECTUS_STATIC_TOKEN=... \
//     node ingest.mjs <library|projects> <candidates.json> [--apply]
//
// Default is DRY RUN (prints what it WOULD insert + what it skips as dupes).
// Pass --apply to actually POST. Dedups live against Directus by slug and by
// the canonical URL (external_url for library, repo_url for projects), so it's
// safe to re-run — already-present entries are skipped.
//
// Candidate JSON shape (array). Library:
//   {slug,title,blurb,type,level,duration_min?,product_focus[],surface[],
//    pinned?,is_official,external_url}
// Projects:
//   {slug,title,tagline,description,builder_handle,tags[],product_focus[],
//    repo_url,stars?,featured?,hackathon,award?}

import {readFileSync} from 'node:fs';

const [, , collection, file] = process.argv;
const APPLY = process.argv.includes('--apply');
const DIRECTUS_URL = process.env.DIRECTUS_URL;
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

if (!collection || !file || !DIRECTUS_URL || !TOKEN) {
  console.error('usage: DIRECTUS_URL=.. DIRECTUS_STATIC_TOKEN=.. node ingest.mjs <library|projects> <candidates.json> [--apply]');
  process.exit(1);
}
const target = collection === 'library' ? 'library_articles' : collection === 'projects' ? 'projects' : null;
if (!target) {
  console.error(`unknown collection "${collection}" (use: library | projects)`);
  process.exit(1);
}
const urlField = target === 'library_articles' ? 'external_url' : 'repo_url';

// URL canonicalizer for dedup. YouTube identity lives in the QUERY STRING
// (?v=<id>, ?list=<id>), so we must NOT blindly strip queries — doing that
// collapses every watch?v=… to "youtube.com/watch" and falsely dedups all
// videos against each other. Canonicalize YouTube to yt:<id> / ytlist:<id>;
// strip query+hash for everything else (docs/repos identify by path).
const norm = (u) => {
  if (!u) return '';
  try {
    const url = new URL(u);
    const h = url.hostname.replace(/^www\./, '');
    if (h === 'youtu.be') return 'yt:' + url.pathname.slice(1).split('/')[0];
    if (h.endsWith('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v) return 'yt:' + v;
      const list = url.searchParams.get('list');
      if (list) return 'ytlist:' + list;
    }
  } catch {}
  return String(u).split('?')[0].split('#')[0].replace(/\/$/, '').toLowerCase();
};

async function dx(path, init) {
  const r = await fetch(`${DIRECTUS_URL}${path}`, {
    ...init,
    headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(init?.headers || {})},
  });
  if (!r.ok) throw new Error(`${init?.method || 'GET'} ${path} → ${r.status} ${await r.text()}`);
  return r.json();
}

const candidates = JSON.parse(readFileSync(file, 'utf8'));
console.error(`Loaded ${candidates.length} candidates for ${target} (apply=${APPLY}).`);

// Live dedup sets.
const existing = (await dx(`/items/${target}?fields=slug,${urlField}&limit=-1`)).data;
const haveSlug = new Set(existing.map((e) => e.slug));
const haveUrl = new Set(existing.map((e) => norm(e[urlField])).filter(Boolean));

const toInsert = [];
const skipped = [];
const seenInBatch = new Set();
for (const c of candidates) {
  const slug = c.slug;
  const u = norm(c[urlField]);
  if (!slug) { skipped.push({c, why: 'no slug'}); continue; }
  if (haveSlug.has(slug)) { skipped.push({slug, why: 'slug exists'}); continue; }
  if (u && haveUrl.has(u)) { skipped.push({slug, why: `${urlField} exists`}); continue; }
  if (seenInBatch.has(slug) || (u && seenInBatch.has(u))) { skipped.push({slug, why: 'dup within batch'}); continue; }
  seenInBatch.add(slug); if (u) seenInBatch.add(u);
  toInsert.push({...c, status: 'published'});
}

console.error(`\nWould insert ${toInsert.length}; skip ${skipped.length}.`);
for (const s of skipped) console.error(`  skip ${s.slug || '?'} — ${s.why}`);

if (!APPLY) {
  console.log(JSON.stringify({dryRun: true, wouldInsert: toInsert.map((t) => t.slug), skipped}, null, 2));
  process.exit(0);
}
if (!toInsert.length) {
  console.log(JSON.stringify({inserted: 0, skipped: skipped.length}, null, 2));
  process.exit(0);
}
const created = (await dx(`/items/${target}`, {method: 'POST', body: JSON.stringify(toInsert)})).data;
console.log(JSON.stringify({inserted: created.length, slugs: created.map((c) => c.slug), skipped: skipped.length}, null, 2));
