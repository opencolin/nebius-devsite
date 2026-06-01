// Verify every discovered candidate URL is actually live before ingest.
// (Roadmap invariant: curl-200 at INGEST time, not just discovery.)
//
// - YouTube watch URLs: use the oEmbed endpoint — returns 200 + the REAL
//   title if the video exists, 404/401 if it's dead/private. (Plain curl on
//   youtube.com returns 200 even for non-existent videos, so it can't be
//   trusted.) We also surface the real title so a hallucinated-but-live ID
//   pointing at the wrong video can be caught by eye.
// - Everything else: GET with redirect follow; ok = final status 200-399.
//
// Writes verified-<id>.json (ok-only) for each input + verify-report.json.

import {readFileSync, writeFileSync} from 'node:fs';

const DIR = '/Users/colin/Code/nebius-homepage/docs/content-expansion/candidates';
const FILES = {
  'library-yt': 'external_url',
  'library-blog': 'external_url',
  'integrations-tf': 'docsUrl',
  'integrations-tavily': 'docsUrl',
  'apps-gh': 'repo_url',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ytId(u) {
  try {
    const url = new URL(u);
    const h = url.hostname.replace(/^www\./, '');
    if (h === 'youtu.be') return url.pathname.slice(1).split('/')[0];
    if (h.endsWith('youtube.com') && url.searchParams.get('v')) return url.searchParams.get('v');
  } catch {}
  return null;
}

async function checkYouTube(u) {
  const oe = `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json`;
  try {
    const r = await fetch(oe, {signal: AbortSignal.timeout(15000)});
    if (r.status === 200) {
      const j = await r.json();
      return {ok: true, status: 200, realTitle: j.title || null};
    }
    return {ok: false, status: r.status};
  } catch (e) {
    return {ok: false, status: 'error', err: String(e.message || e)};
  }
}

async function checkHttp(u) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(u, {method, redirect: 'follow', signal: AbortSignal.timeout(15000), headers: {'user-agent': 'Mozilla/5.0 (content-expansion verifier)'}});
      if (r.ok || (r.status >= 200 && r.status < 400)) return {ok: true, status: r.status};
      if (method === 'GET') return {ok: false, status: r.status};
    } catch (e) {
      if (method === 'GET') return {ok: false, status: 'error', err: String(e.message || e)};
    }
  }
  return {ok: false, status: 'error'};
}

const report = {};
for (const [id, field] of Object.entries(FILES)) {
  let items;
  try {
    items = JSON.parse(readFileSync(`${DIR}/${id}.json`, 'utf8'));
  } catch (e) {
    report[id] = {error: `read/parse failed: ${e.message}`};
    continue;
  }
  const checked = [];
  for (const it of items) {
    const u = it[field];
    const label = it.slug || it.name || u;
    const res = ytId(u) ? await checkYouTube(u) : await checkHttp(u);
    checked.push({label, url: u, ...res, candidateTitle: it.title || it.name});
    await sleep(150);
  }
  const ok = items.filter((it, i) => checked[i].ok);
  writeFileSync(`${DIR}/verified-${id}.json`, JSON.stringify(ok, null, 2));
  report[id] = {
    total: items.length, ok: ok.length, dead: checked.length - ok.length,
    results: checked,
  };
  console.error(`${id}: ${ok.length}/${items.length} live`);
}

writeFileSync(`${DIR}/verify-report.json`, JSON.stringify(report, null, 2));
// Print dead + YouTube title mismatches for eyeballing.
for (const [id, r] of Object.entries(report)) {
  if (!r.results) continue;
  for (const x of r.results) {
    if (!x.ok) console.log(`DEAD  ${id}  ${x.label}  [${x.status}]  ${x.url}`);
    else if (x.realTitle) console.log(`YT-OK ${id}  realTitle="${x.realTitle}"  vs candidate="${x.candidateTitle}"`);
  }
}
