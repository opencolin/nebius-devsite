#!/usr/bin/env node
// Imports library entries from nebius-builders-draft-a.vercel.app/library
// into the local library_articles collection.
//
// Strategy: SSR fetch the page, parse each card from the HTML, map upstream
// types (Repo/Video/Workshop/Webinar/Cookbook/Solution/Academy/Future/...)
// to our schema's REPO/VIDEO/WORKSHOP enum, and upsert by slug.
//
// External URLs aren't surfaced on the gallery card — set to a placeholder
// pointing back at the upstream slug. Team can fill the real URLs in via
// Directus admin or by scraping the detail pages.

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path: path.join(__dirname, '..', '..', '..', '.env')});

const SOURCE = 'https://nebius-builders-draft-a.vercel.app/library';
const URL_BASE = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
if (!TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN must be set.');
  process.exit(1);
}

console.log(`→ Fetching ${SOURCE}`);
const html = await (await fetch(SOURCE, {headers: {'user-agent': 'Mozilla/5.0'}})).text();
console.log(`  got ${html.length} bytes`);

// -----------------------------------------------------------------------------
// Parse one card per `<a ... href="/library/{slug}"`.
//
// Card markup (verified on the live page):
//   <a href="/library/{slug}">
//     <div ...><div class="pill-navy">{TYPE}</div>
//              <div class="pill-outline">{LEVEL}</div>...</div>
//     <div ...>
//       <p>Author · ★stars</p>
//       <h3>{title}</h3>
//       <p>{blurb}</p>
//       <span class="pill-outline">{tag1}</span>...
//     </div>
//   </a>
// -----------------------------------------------------------------------------

const cardRe =
  /<a class="[^"]*?" href="\/library\/([a-z0-9-]+)">([\s\S]*?)<\/a>/g;
const cards = [];
let m;
while ((m = cardRe.exec(html))) {
  const [, slug, body] = m;
  cards.push({slug, body});
}
console.log(`  parsed ${cards.length} cards`);

const TYPE_MAP = {
  Repo: 'REPO',
  Video: 'VIDEO',
  Webinar: 'VIDEO',
  Workshop: 'WORKSHOP',
  Cookbook: 'REPO',
  Solution: 'REPO',
  Academy: 'WORKSHOP',
  Future: 'REPO',
  Science: 'REPO',
};

const LEVELS = new Set(['Beginner', 'Intermediate', 'Advanced']);

function pickFirst(re, body) {
  const r = body.match(re);
  return r ? r[1].trim() : null;
}

function pickAll(re, body) {
  const out = [];
  let mm;
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  while ((mm = g.exec(body))) out.push(mm[1].trim());
  return out;
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

const entries = cards.map(({slug, body}) => {
  const upstreamType = pickFirst(/<div class="[^"]*pill-navy[^"]*">([^<]+)<\/div>/, body);
  const allPills = pickAll(/<(?:div|span) class="[^"]*pill-outline[^"]*">([^<]+)<\/[^>]+>/, body);
  const level = allPills.find((p) => LEVELS.has(p)) ?? null;
  const tags = allPills.filter((p) => !LEVELS.has(p));
  const title = decode(pickFirst(/<h3[^>]*>([^<]+)<\/h3>/, body) ?? slug);
  const blurb = decode(
    pickFirst(/<p class="mt-3[^"]*"[^>]*>([^<]+)<\/p>/, body) ?? '',
  );
  const author = pickFirst(/<p class="text-xs[^"]*">([^<]+)<\/p>/, body);
  // Type: prefer mapped upstream pill; fall back to slug-prefix heuristic
  const slugPrefix = slug.split('-')[0];
  let type = TYPE_MAP[upstreamType ?? ''] ?? null;
  if (!type) {
    if (slugPrefix === 'yt' || slugPrefix === 'webinar') type = 'VIDEO';
    else if (slugPrefix === 'repo' || slugPrefix === 'cookbook' || slugPrefix === 'solutions') type = 'REPO';
    else type = 'WORKSHOP';
  }
  // Product focus inferred from tags + slug
  const haystack = [...tags, slug, title].join(' ').toLowerCase();
  const product_focus = [];
  if (/token factory|tokenfactory|\btf\b/.test(haystack)) product_focus.push('tokenfactory');
  if (/ai cloud|aicloud/.test(haystack)) product_focus.push('aicloud');
  if (/openclaw/.test(haystack)) product_focus.push('openclaw');
  if (/soperator/.test(haystack)) product_focus.push('soperator');
  if (/k8s|kubernetes/.test(haystack)) product_focus.push('kubernetes');
  return {
    slug,
    type,
    title,
    blurb,
    level: level ? level.toUpperCase() : 'BEGINNER',
    duration_min: null,
    product_focus,
    body_md: null,
    external_url: `${SOURCE}/${slug}`, // placeholder — team can replace with real URL
    is_official: (author ?? '').toLowerCase().includes('nebius'),
    status: 'published',
  };
});

console.log(`  built ${entries.length} entries`);

// -----------------------------------------------------------------------------
// Upsert
// -----------------------------------------------------------------------------

async function api(method, p, body) {
  const r = await fetch(`${URL_BASE}${p}`, {
    method,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${p} → ${r.status}: ${await r.text()}`);
  return r.json().catch(() => ({}));
}

let created = 0, updated = 0;
for (const e of entries) {
  const existing = await api(
    'GET',
    `/items/library_articles?filter%5Bslug%5D%5B_eq%5D=${encodeURIComponent(e.slug)}&fields=id&limit=1`,
  );
  if (existing.data?.[0]) {
    await api('PATCH', `/items/library_articles/${existing.data[0].id}`, e);
    updated++;
  } else {
    await api('POST', '/items/library_articles', e);
    created++;
  }
}
console.log(`✓ ${created} created, ${updated} updated`);
