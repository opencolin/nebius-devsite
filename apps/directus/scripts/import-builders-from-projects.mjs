#!/usr/bin/env node
// Imports a builder profile for every unique GitHub owner across the
// projects collection. For each unique handle:
//   1. Fetch GitHub user (name, bio, location, blog, twitter, avatar).
//   2. Compute points from project count + awards.
//   3. Aggregate tags from their projects' product_focus + tags.
//   4. Upsert into builders by handle.
//
// Skips:
//   - Projects with non-GitHub repo URLs (gitlab, etc.)
//   - Owners that look like an org rather than a person? (treat all the same
//     for now — Nebius hackathon submissions are mostly individual repos)
//
// Re-runnable: builds upsert by handle, so editing the script and re-running
// patches existing rows instead of duplicating.

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path: path.join(__dirname, '..', '..', '..', '.env')});

const URL_BASE = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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

function ghOwnerFromUrl(url) {
  if (!url) return null;
  const m = url.match(/github\.com\/([^/?#.]+)/i);
  if (!m) return null;
  const owner = m[1];
  // Skip junk like ".git" or empty
  if (!owner || owner.length < 2) return null;
  return owner;
}

async function fetchGithubUser(handle) {
  const headers = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    ...(GITHUB_TOKEN ? {authorization: `token ${GITHUB_TOKEN}`} : {}),
  };
  const r = await fetch(`https://api.github.com/users/${handle}`, {headers});
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`github user ${handle}: ${r.status}`);
  return r.json();
}

// ---------- Pull projects, group by owner ----------

console.log('→ Loading projects');
const projectsRes = await api(
  'GET',
  '/items/projects?fields=id,slug,title,repo_url,tagline,description,product_focus,tags,award&limit=-1',
);
const projects = projectsRes.data ?? [];
console.log(`  ${projects.length} projects`);

const byOwner = new Map();
let skipped = 0;
for (const p of projects) {
  const owner = ghOwnerFromUrl(p.repo_url);
  if (!owner) {
    skipped++;
    continue;
  }
  const list = byOwner.get(owner) ?? [];
  list.push(p);
  byOwner.set(owner, list);
}
console.log(`  ${byOwner.size} unique GitHub owners (skipped ${skipped} non-github)`);

// ---------- Compute builder rows ----------

const AWARD_POINTS = {
  winner: 500,
  'runner-up': 300,
  '3rd': 200,
  finalist: 100,
};

function inferCityCountry(location) {
  // Best-effort split on the last comma. Many GitHub locations are like
  // "San Francisco, CA" or "Berlin, Germany"; just use what's there.
  if (!location) return {city: '', country: ''};
  const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return {city: parts[0], country: parts[parts.length - 1]};
  return {city: parts[0] ?? '', country: ''};
}

// ---------- Fetch user info + upsert ----------

const stats = {created: 0, updated: 0, ghMissing: 0, fetchFailed: 0};

let i = 0;
for (const [owner, theirProjects] of byOwner) {
  i++;
  let gh;
  try {
    gh = await fetchGithubUser(owner);
  } catch (err) {
    stats.fetchFailed++;
    gh = null;
  }
  if (!gh) {
    stats.ghMissing++;
    // Still create a minimal row so the builder appears
  }

  // Aggregate from their projects
  const points =
    theirProjects.length * 100 +
    theirProjects.reduce((s, p) => s + (AWARD_POINTS[p.award] ?? 0), 0);
  const expertise = Array.from(
    new Set(
      theirProjects
        .flatMap((p) => [...(p.product_focus ?? []), ...(p.tags ?? [])])
        .filter(Boolean)
        .slice(0, 30),
    ),
  ).slice(0, 8);
  const {city, country} = inferCityCountry(gh?.location);

  // Tier from points
  let tier = 'BUILDER';
  if (points >= 700) tier = 'AMBASSADOR';
  else if (points >= 300) tier = 'CONTRIBUTOR';

  const row = {
    handle: owner,
    name: gh?.name?.trim() || owner,
    bio:
      gh?.bio?.trim() ||
      `Shipped ${theirProjects.length} project${theirProjects.length === 1 ? '' : 's'} on Nebius${
        theirProjects.length > 0 ? `: ${theirProjects.slice(0, 3).map((p) => p.title).join(', ')}` : ''
      }.`,
    city,
    country,
    tier,
    points_total: points,
    twitter_handle: gh?.twitter_username ?? null,
    github_handle: owner,
    expertise,
    signed_up_at: gh?.created_at ?? new Date().toISOString(),
    last_active_at: gh?.updated_at ?? new Date().toISOString(),
    attribution_slug: owner.toLowerCase(),
    wants_to_host: false,
  };

  const existing = await api(
    'GET',
    `/items/builders?filter%5Bhandle%5D%5B_eq%5D=${encodeURIComponent(owner)}&fields=id&limit=1`,
  );
  if (existing.data?.[0]) {
    await api('PATCH', `/items/builders/${existing.data[0].id}`, row);
    stats.updated++;
  } else {
    await api('POST', '/items/builders', row);
    stats.created++;
  }
  if (i % 10 === 0) console.log(`  ${i}/${byOwner.size} processed`);
  // Rate limit polite
  await new Promise((r) => setTimeout(r, GITHUB_TOKEN ? 80 : 800));
}

console.log('');
console.log('=== Results ===');
console.log(`  created:        ${stats.created}`);
console.log(`  updated:        ${stats.updated}`);
console.log(`  GH user missing: ${stats.ghMissing}`);
console.log(`  fetch failed:   ${stats.fetchFailed}`);
