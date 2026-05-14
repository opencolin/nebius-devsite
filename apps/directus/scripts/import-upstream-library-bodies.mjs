#!/usr/bin/env node
// Backfills body content + real external URLs for library_articles whose
// external_url currently points back at the upstream gallery
// (nebius-builders-draft-a.vercel.app/library/<slug>).
//
// For each such entry:
//   1. Fetch the upstream detail page.
//   2. Parse the primary external link (first http(s) href inside <main>
//      that isn't internal navigation).
//   3. Parse the prose body — everything between <h2>About this entry</h2>
//      and the next <h2>. Convert basic HTML → markdown.
//   4. PATCH the Directus row with body_md + external_url.
//
// Re-runnable. Polite to upstream — 250 ms delay between pages.

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path: path.join(__dirname, '..', '..', '..', '.env')});

const URL_BASE = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const UPSTREAM_HOST = 'nebius-builders-draft-a.vercel.app';

if (!TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN must be set.');
  process.exit(1);
}

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

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function htmlToMarkdown(html) {
  // Light HTML → markdown conversion. Handles the tags we actually see in
  // the upstream prose: <h1-3>, <p>, <ul>/<ol>/<li>, <strong>, <em>, <a>,
  // <code>, <pre>, <hr>. Anything else gets stripped.
  let s = html
    // Block-level structure
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, c) => `\n# ${stripTags(c)}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `\n## ${stripTags(c)}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `\n### ${stripTags(c)}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, c) => `\n#### ${stripTags(c)}\n\n`)
    .replace(/<hr\s*\/?>(?!\n)/gi, '\n\n---\n\n')
    .replace(/<br\s*\/?>(?!\n)/gi, '  \n')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
      (_, c) => `\n\n\`\`\`\n${stripTags(c)}\n\`\`\`\n\n`)
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi,
      (_, c) => `\n\n\`\`\`\n${stripTags(c)}\n\`\`\`\n\n`)
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => `\n${listItems(c, '- ')}\n\n`)
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => `\n${listItems(c, '1. ')}\n\n`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => `\n\n${inlineToMd(c)}\n\n`);
  // Strip everything else
  s = stripTags(s);
  s = decode(s);
  // Normalize blank lines
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

function listItems(html, marker) {
  return html
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `${marker}${inlineToMd(c).trim()}\n`)
    .replace(/<[^>]+>/g, '')
    .trim();
}

function inlineToMd(html) {
  return html
    .replace(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) =>
      `[${stripTags(text).trim()}](${href})`,
    )
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, c) => `**${stripTags(c)}**`)
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, c) => `**${stripTags(c)}**`)
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, c) => `*${stripTags(c)}*`)
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, c) => `*${stripTags(c)}*`)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => `\`${stripTags(c)}\``);
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '');
}

function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : '';
}

function extractFirstExternalLink(mainHtml) {
  // Return the first non-internal http(s) URL in <main>. Skip nav back
  // links and the upstream's own pages.
  const hrefs = Array.from(mainHtml.matchAll(/href="(https?:\/\/[^"]+)"/g)).map((m) => m[1]);
  for (const href of hrefs) {
    if (href.includes(UPSTREAM_HOST)) continue;
    if (/\/library(\/|$)/.test(href)) continue;
    return href;
  }
  return null;
}

function extractAboutSection(mainHtml) {
  // Body is between <h2>About this entry</h2> and the next <h2>.
  const start = mainHtml.search(/<h2[^>]*>\s*About this entry\s*<\/h2>/i);
  if (start === -1) return '';
  const after = mainHtml.slice(start);
  const stop = after.search(/<h2[^>]*>(?!\s*About this entry\s*<\/h2>)/i);
  const slice = stop === -1 ? after : after.slice(0, stop);
  return htmlToMarkdown(slice);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log('→ Loading library_articles');
const all = await api(
  'GET',
  '/items/library_articles?fields=id,slug,external_url,body_md&limit=-1',
);
const entries = (all.data ?? []).filter((e) =>
  (e.external_url ?? '').includes(UPSTREAM_HOST),
);
console.log(`  ${entries.length} entries with upstream placeholder URLs`);

const stats = {scanned: 0, updated: 0, noLink: 0, noBody: 0, fetchFailed: 0};

let i = 0;
for (const e of entries) {
  i++;
  let html;
  try {
    const r = await fetch(e.external_url, {headers: {'user-agent': 'Mozilla/5.0'}});
    if (!r.ok) {
      stats.fetchFailed++;
      console.log(`  ${e.slug}: HTTP ${r.status}`);
      continue;
    }
    html = await r.text();
  } catch (err) {
    stats.fetchFailed++;
    console.log(`  ${e.slug}: ${(err).message}`);
    continue;
  }
  stats.scanned++;
  const main = extractMain(html);
  const realLink = extractFirstExternalLink(main);
  const body = extractAboutSection(main);
  const update = {};
  if (realLink) {
    update.external_url = realLink;
  } else {
    stats.noLink++;
    // Clear the placeholder so users don't follow a meta-link back to upstream
    update.external_url = null;
  }
  if (body) update.body_md = body;
  else stats.noBody++;
  await api('PATCH', `/items/library_articles/${e.id}`, update);
  stats.updated++;
  if (i % 10 === 0) console.log(`  ${i}/${entries.length} processed`);
  await new Promise((r) => setTimeout(r, 250));
}

console.log('');
console.log('=== Results ===');
console.log(`  scanned:       ${stats.scanned}`);
console.log(`  updated:       ${stats.updated}`);
console.log(`  no real link:  ${stats.noLink}`);
console.log(`  no body found: ${stats.noBody}`);
console.log(`  fetch failed:  ${stats.fetchFailed}`);
