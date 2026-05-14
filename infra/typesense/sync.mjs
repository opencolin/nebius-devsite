#!/usr/bin/env node
// Directus → Typesense indexer.
//
// Pulls library_articles, projects, team_members, and events from Directus
// and upserts them into a single `nebius_builders` Typesense collection
// with a stable `kind` field.
//
// Run from CI on Directus webhook (or manually after seeding).

import {fileURLToPath} from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import Typesense from 'typesense';

// Load env from the repo root .env regardless of cwd.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path: path.join(__dirname, '..', '..', '.env')});

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const TS_HOST = process.env.TYPESENSE_HOST ?? 'localhost';
const TS_PORT = Number(process.env.TYPESENSE_PORT ?? 8108);
const TS_PROTOCOL = process.env.TYPESENSE_PROTOCOL ?? 'http';
const TS_KEY = process.env.TYPESENSE_ADMIN_KEY;

if (!DIRECTUS_TOKEN || !TS_KEY) {
  console.error('Need DIRECTUS_ADMIN_TOKEN and TYPESENSE_ADMIN_KEY.');
  process.exit(1);
}

const ts = new Typesense.Client({
  nodes: [{host: TS_HOST, port: TS_PORT, protocol: TS_PROTOCOL}],
  apiKey: TS_KEY,
});

const COLLECTION = 'nebius_builders';

const SCHEMA = {
  name: COLLECTION,
  fields: [
    {name: 'kind', type: 'string', facet: true},
    {name: 'title', type: 'string'},
    {name: 'blurb', type: 'string', optional: true},
    {name: 'tags', type: 'string[]', optional: true, facet: true},
    {name: 'url', type: 'string'},
    // Default sorting field — must be non-optional in Typesense.
    {name: 'sort', type: 'int32'},
  ],
  default_sorting_field: 'sort',
};

async function ensureCollection() {
  const cols = await ts.collections().retrieve();
  if (!cols.find((c) => c.name === COLLECTION)) {
    console.log(`→ Creating Typesense collection ${COLLECTION}`);
    await ts.collections().create(SCHEMA);
  }
}

async function fetchAll(collection, fields) {
  const r = await fetch(
    `${DIRECTUS_URL}/items/${collection}?fields=${encodeURIComponent(fields.join(','))}&limit=-1`,
    {headers: {authorization: `Bearer ${DIRECTUS_TOKEN}`}},
  );
  if (!r.ok) {
    if (r.status === 403 || r.status === 404) return [];
    throw new Error(`Directus ${collection}: ${r.status}`);
  }
  return (await r.json()).data ?? [];
}

await ensureCollection();

const docs = [];

for (const a of await fetchAll('library_articles', ['id', 'slug', 'title', 'blurb', 'product_focus'])) {
  docs.push({
    id: `library_${a.id}`,
    kind: 'library',
    title: a.title,
    blurb: a.blurb,
    tags: a.product_focus ?? [],
    url: `/library/${a.slug}`,
    sort: 0,
  });
}

for (const e of await fetchAll('events', ['id', 'title', 'description', 'product_focus', 'starts_at'])) {
  docs.push({
    id: `event_${e.id}`,
    kind: 'event',
    title: e.title,
    blurb: e.description,
    tags: e.product_focus ?? [],
    url: `/events#${e.id}`,
    sort: e.starts_at ? Math.floor(new Date(e.starts_at).getTime() / 1000) : 0,
  });
}

for (const t of await fetchAll('builders', ['id', 'handle', 'name', 'bio', 'expertise'])) {
  docs.push({
    id: `builder_${t.id}`,
    kind: 'builder',
    title: t.name,
    blurb: t.bio,
    tags: t.expertise ?? [],
    url: `/team/${t.handle}`,
    sort: 0,
  });
}

if (docs.length === 0) {
  console.log('No documents to index — Directus is empty.');
  process.exit(0);
}

console.log(`→ Upserting ${docs.length} docs into ${COLLECTION}…`);
const result = await ts.collections(COLLECTION).documents().import(docs, {action: 'upsert'});
const failed = result.split('\n').filter((l) => {
  try {
    return !JSON.parse(l).success;
  } catch {
    return true;
  }
});
console.log(`✓ Indexed (${docs.length - failed.length} ok, ${failed.length} failed).`);
