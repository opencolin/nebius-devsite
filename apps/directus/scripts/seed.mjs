#!/usr/bin/env node
// Idempotently seeds Directus with:
//  - 5 CMS pages (home, builders, office-hours, localhosts, signup)
//  - team_members (from content/advocates/seed.json)
//  - library_articles (from content/library/seed.json + workshop markdown)
//  - builders, projects, events, office_hours_sessions (from inline samples)
//
// Each upsert is idempotent: looks up by `slug` (or `title` for events) and
// PATCHes if found, POSTs otherwise. Re-running is safe.

import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path: path.join(__dirname, '..', '..', '..', '.env')});

const URL_BASE = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
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
  if (!r.ok) {
    throw new Error(`${method} ${p} → ${r.status}: ${await r.text()}`);
  }
  return r.json().catch(() => ({}));
}

function loadJson(rel) {
  return JSON.parse(readFileSync(path.join(__dirname, '..', 'seed', rel), 'utf8'));
}

/**
 * Generic upsert: look up the existing row by `lookupField`'s value matching
 * `row[lookupField]`. PATCH if it exists, POST otherwise.
 */
async function upsert(collection, lookupField, row) {
  const value = row[lookupField];
  if (!value) throw new Error(`row missing ${lookupField}`);
  const found = await api(
    'GET',
    `/items/${collection}?filter[${lookupField}][_eq]=${encodeURIComponent(value)}&fields=id&limit=1`,
  );
  if (found.data?.[0]) {
    await api('PATCH', `/items/${collection}/${found.data[0].id}`, row);
    return {action: 'updated', id: found.data[0].id};
  }
  const created = await api('POST', `/items/${collection}`, row);
  return {action: 'created', id: created.data?.id};
}

async function seedCmsPages() {
  const pages = loadJson('cms-pages.json');
  for (const p of pages) {
    const row = {...p, status: 'published'};
    const r = await upsert('pages', 'slug', row);
    console.log(`  pages/${p.slug}: ${r.action}`);
  }
}

async function seedTeam() {
  const data = loadJson('advocates.json');
  for (const a of data.advocates) {
    if (!a.active) continue; // skip placeholder rows
    const row = {
      slug: a.slug,
      name: a.name,
      title: a.title,
      bio: a.bio,
      region: a.region,
      timezone: a.timezone,
      expertise: a.expertise ?? [],
      languages: a.languages ?? ['en'],
      active: a.active,
      sort_order: a.sortOrder ?? 100,
      email: a.email ?? null,
      twitter_handle: a.twitterHandle ?? null,
      github_handle: a.githubHandle ?? null,
      linkedin_url: a.linkedinUrl ?? null,
      slack_handle: a.slackHandle ?? null,
      calendly_url: a.calendlyUrl ?? null,
    };
    const r = await upsert('team_members', 'slug', row);
    console.log(`  team_members/${a.slug}: ${r.action}`);
  }
}

async function seedLibrary() {
  const data = loadJson('library.json');
  const articleDir = path.join(__dirname, '..', 'seed', 'library-articles');
  for (const e of data.entries) {
    let bodyMd = null;
    // If the entry references a content file, inline it
    const slugMd = path.join(articleDir, `${e.slug}.md`);
    if (e.contentBodyPath || existsSync(slugMd)) {
      // Prefer slug-derived path; fall back to whatever contentBodyPath was set to
      const candidate = existsSync(slugMd)
        ? slugMd
        : path.join(__dirname, '..', 'seed', e.contentBodyPath);
      if (existsSync(candidate)) bodyMd = readFileSync(candidate, 'utf8');
    }
    const row = {
      status: 'published',
      slug: e.slug,
      type: e.type,
      title: e.title,
      blurb: e.blurb,
      level: e.level,
      duration_min: e.durationMin ?? null,
      product_focus: e.productFocus ?? [],
      body_md: bodyMd,
      external_url: e.externalUrl ?? null,
      is_official: e.isOfficial ?? false,
    };
    const r = await upsert('library_articles', 'slug', row);
    console.log(`  library_articles/${e.slug}: ${r.action}`);
  }
}

async function seedBuilders() {
  const builders = loadJson('builders.json');
  for (const b of builders) {
    const r = await upsert('builders', 'handle', b);
    console.log(`  builders/${b.handle}: ${r.action}`);
  }
}

async function seedProjects() {
  // Curated hand-written entries first (the 8 "showcase" projects), then the
  // ~110 hackathon submissions parsed from gallery-source/. Both sets get
  // upserted by slug so re-runs are idempotent and content edits in Directus
  // are NOT overwritten unless the seed JSON changed.
  const curated = loadJson('projects.json');
  const generated = (() => {
    try { return loadJson('projects.generated.json'); } catch { return []; }
  })();

  let created = 0, updated = 0;
  for (const p of [...curated, ...generated]) {
    const r = await upsert('projects', 'slug', p);
    if (r.action === 'created') created++; else updated++;
  }
  console.log(`  projects: ${created} created, ${updated} updated (${curated.length} curated + ${generated.length} hackathon)`);
}

async function seedEvents() {
  const events = loadJson('events.json');
  // Use title as the lookup key (events don't have slugs)
  for (const e of events) {
    const r = await upsert('events', 'title', e);
    console.log(`  events/${e.title}: ${r.action}`);
  }
}

async function seedOfficeHours() {
  // Tie sessions to seeded team_members by slug
  const team = await api('GET', '/items/team_members?fields=id,slug&limit=-1');
  const bySlug = Object.fromEntries(team.data.map((t) => [t.slug, t.id]));

  // Build a small rolling schedule: 6 upcoming sessions, varied formats
  const now = Date.now();
  const day = 86_400_000;
  const sessions = [
    {slug: 'colin', offset: day * 1, hh: 16, dur: 30, format: 'DROP_IN', topic: 'Drop-in office hours'},
    {slug: 'colin', offset: day * 2, hh: 17, dur: 30, format: 'ONE_ON_ONE', topic: '1-on-1 walkthroughs (book on Calendly)'},
    {slug: 'colin', offset: day * 7, hh: 18, dur: 60, format: 'GROUP_QA', topic: 'Token Factory deep-dive'},
  ];
  for (const s of sessions) {
    const advocateId = bySlug[s.slug];
    if (!advocateId) {
      console.log(`  office_hours: skipping ${s.slug} (not in team_members)`);
      continue;
    }
    const startsAt = new Date(now + s.offset);
    startsAt.setUTCHours(s.hh, 0, 0, 0);
    const row = {
      advocate: advocateId,
      starts_at: startsAt.toISOString(),
      duration_min: s.dur,
      format: s.format,
      topic: s.topic,
      bookable: s.format !== 'DROP_IN',
      booking_url: s.format === 'DROP_IN' ? null : 'https://lu.ma/nebius-office-hours',
    };
    // Idempotency: a (advocate, starts_at) tuple is the natural key. Look it up.
    const found = await api(
      'GET',
      `/items/office_hours_sessions?filter[advocate][_eq]=${advocateId}&filter[starts_at][_eq]=${encodeURIComponent(row.starts_at)}&fields=id&limit=1`,
    );
    if (found.data?.[0]) {
      await api('PATCH', `/items/office_hours_sessions/${found.data[0].id}`, row);
      console.log(`  office_hours/${s.slug}@${s.offset}d: updated`);
    } else {
      await api('POST', '/items/office_hours_sessions', row);
      console.log(`  office_hours/${s.slug}@${s.offset}d: created`);
    }
  }
}

console.log('→ Seeding CMS pages…');       await seedCmsPages();
console.log('→ Seeding team_members…');    await seedTeam();
console.log('→ Seeding library_articles…');await seedLibrary();
console.log('→ Seeding builders…');        await seedBuilders();
console.log('→ Seeding projects…');        await seedProjects();
console.log('→ Seeding events…');          await seedEvents();
console.log('→ Seeding office_hours_sessions…'); await seedOfficeHours();
console.log('✓ Seeded.');
