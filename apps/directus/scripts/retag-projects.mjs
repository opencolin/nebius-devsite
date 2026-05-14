#!/usr/bin/env node
// Re-tags every project in Directus by reading its GitHub README and matching
// against the specific Nebius products: Tavily, Token Factory, AI Cloud,
// Soperator, OpenClaw.
//
// For each project:
//   1. Pull repo URL from Directus.
//   2. Fetch the README via the GitHub raw API (no auth needed for public repos;
//      add GITHUB_TOKEN to env if you hit rate limits).
//   3. Match against keyword patterns.
//   4. Set product_focus = list of detected products.
//   5. Set category = "Other" if NONE of the products are detected.
//
// Runs sequentially with a small delay to stay under the 60-req/hr unauth
// rate limit. Set GITHUB_TOKEN to use the 5000-req/hr limit.

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path: path.join(__dirname, '..', '..', '..', '.env')});

const URL_BASE = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // optional but recommended
if (!TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN must be set.');
  process.exit(1);
}

const PRODUCT_PATTERNS = {
  tavily: /\btavily\b/i,
  token_factory: /token\s*factory|tokenfactory|nebius.{0,30}llama|nebius.{0,30}qwen|nebius.{0,30}deepseek|nebius.{0,30}mixtral|nebius.{0,30}gemma|nebius.{0,30}nemotron/i,
  ai_cloud: /\bai\s*cloud\b|aicloud|nebius.{0,30}h100|nebius.{0,30}gpu|nebius.{0,30}cluster|nebius.{0,30}l40/i,
  soperator: /\bsoperator\b/i,
  openclaw: /\bopenclaw\b/i,
};

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

function parseGithub(url) {
  if (!url) return null;
  const m = url.match(/github\.com\/([^/]+)\/([^/?#.]+)/i);
  if (!m) return null;
  return {owner: m[1], repo: m[2].replace(/\.git$/, '')};
}

async function fetchReadme(owner, repo) {
  // Try the GitHub readme endpoint (returns base64 + the active branch)
  const headers = {
    accept: 'application/vnd.github.v3.raw',
    ...(GITHUB_TOKEN ? {authorization: `token ${GITHUB_TOKEN}`} : {}),
  };
  const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {headers});
  if (r.status === 404 || r.status === 403) return '';
  if (!r.ok) throw new Error(`github ${owner}/${repo}: ${r.status}`);
  return await r.text();
}

function detectProducts(text) {
  const found = [];
  for (const [key, re] of Object.entries(PRODUCT_PATTERNS)) {
    if (re.test(text)) found.push(key);
  }
  return found;
}

console.log('→ Loading projects from Directus');
const all = await api(
  'GET',
  '/items/projects?fields=id,slug,title,repo_url,description,tagline&limit=-1',
);
const projects = all.data ?? [];
console.log(`  ${projects.length} projects`);

const stats = {
  scanned: 0,
  tagged: 0,
  other: 0,
  noRepo: 0,
  fetchFailed: 0,
};

const SPONSOR_PRODUCTS = new Set(['tavily', 'token_factory', 'ai_cloud', 'soperator', 'openclaw']);

let i = 0;
for (const p of projects) {
  i++;
  const ghRef = parseGithub(p.repo_url);
  let readme = '';
  if (ghRef) {
    try {
      readme = await fetchReadme(ghRef.owner, ghRef.repo);
    } catch (err) {
      stats.fetchFailed++;
      readme = '';
    }
  } else {
    stats.noRepo++;
  }
  // Combine README + Directus description for matching
  const haystack = `${readme}\n${p.description ?? ''}\n${p.tagline ?? ''}`;
  const products = detectProducts(haystack);
  const usesSponsor = products.some((x) => SPONSOR_PRODUCTS.has(x));
  const update = {
    product_focus: products,
    category: usesSponsor ? null : 'Other',
  };
  await api('PATCH', `/items/projects/${p.id}`, update);
  stats.scanned++;
  if (products.length > 0) stats.tagged++;
  if (update.category === 'Other') stats.other++;
  if (i % 10 === 0) console.log(`  ${i}/${projects.length} processed (${stats.tagged} tagged)`);
  // Tiny delay to stay polite — GitHub rate limits unauth at 60/hr
  await new Promise((r) => setTimeout(r, GITHUB_TOKEN ? 80 : 800));
}

console.log('');
console.log('=== Results ===');
console.log(`  scanned:      ${stats.scanned}`);
console.log(`  tagged:       ${stats.tagged}`);
console.log(`  Other:        ${stats.other}`);
console.log(`  no repo URL:  ${stats.noRepo}`);
console.log(`  fetch failed: ${stats.fetchFailed}`);
