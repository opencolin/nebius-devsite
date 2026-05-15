#!/usr/bin/env node
// Applies snapshots/schema.yaml to a running Directus.
//
// The YAML is hand-authored in a friendlier nested shape (fields nested
// under their collection); this script flattens it into the
// {collections[], fields[], relations[]} shape Directus's /schema/diff
// endpoint expects.
//
// Requires DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN in env (or .env file at repo root).

import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, '..', 'snapshots', 'schema.yaml');

// Load env from the repo root .env regardless of cwd.
dotenv.config({path: path.join(__dirname, '..', '..', '..', '.env')});

const URL_BASE = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN must be set (create one in Directus → Settings → Access Tokens).');
  process.exit(1);
}

const raw = YAML.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
const snapshot = normalize(raw);

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
    const t = await r.text();
    throw new Error(`${method} ${p} → ${r.status}: ${t}`);
  }
  return r.json().catch(() => ({}));
}

// Apply (then re-verify) up to N times. Directus's /schema/apply on a
// freshly-installed instance has been observed to return 200 without
// actually persisting the directus_collections registry rows on the
// first call against Azure Postgres (theory: PostGIS connection-pool
// warmup timing makes the first geometry-column transaction roll back
// silently). The second apply lands cleanly. We verify by listing the
// expected custom collections after each apply and re-applying if any
// are still missing.
const expectedCollections = new Set(snapshot.collections.map((c) => c.collection));
const MAX_ATTEMPTS = 3;
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  console.log(`→ Computing schema diff (attempt ${attempt}/${MAX_ATTEMPTS})…`);
  const diff = await api('POST', '/schema/diff?force=true', snapshot);
  if (!diff.data) {
    console.log('  No changes — schema already matches.');
  } else {
    console.log('→ Applying schema diff…');
    await api('POST', '/schema/apply', diff.data);
  }

  // Verify the registry actually has all our collections. Without this,
  // /items/<X> returns 403 ("forbidden") because Directus's permission
  // resolver gates on directus_collections membership.
  const reg = await api(
    'GET',
    `/collections?fields=collection&limit=-1`,
  );
  const present = new Set((reg.data ?? []).map((c) => c.collection));
  const missing = [...expectedCollections].filter((c) => !present.has(c));
  if (missing.length === 0) {
    console.log('✓ Schema applied (all collections registered).');
    process.exit(0);
  }
  console.warn(
    `  ⚠ ${missing.length} collection(s) not in registry: ${missing.join(', ')}`,
  );
  if (attempt < MAX_ATTEMPTS) {
    console.warn('  Retrying in 3s…');
    await new Promise((r) => setTimeout(r, 3000));
  }
}
console.error('✗ Schema apply did not register all collections after retries.');
process.exit(1);

// ---------------------------------------------------------------------------
// Convert the human-authored nested form into Directus's canonical flat form.
// Input shape (per collection):
//   { collection, meta, schema, fields: [ { field, type, meta, schema } ... ] }
// Output:
//   { version, directus, vendor,
//     collections: [ { collection, meta, schema } ],
//     fields:      [ { collection, field, type, meta, schema } ],
//     relations:   [ ... ] }
// If the YAML is already flat, we pass it through.
// ---------------------------------------------------------------------------
function normalize(input) {
  const out = {
    version: input.version ?? 1,
    directus: input.directus ?? '11.4.1',
    vendor: input.vendor ?? 'postgres',
    collections: [],
    fields: input.fields ? [...input.fields] : [],
    relations: input.relations ? [...input.relations] : [],
  };
  for (const c of input.collections ?? []) {
    if (Array.isArray(c.fields)) {
      const {fields, ...rest} = c;
      out.collections.push(rest);
      for (const f of fields) {
        out.fields.push({...f, collection: c.collection});
      }
    } else {
      out.collections.push(c);
    }
  }
  return out;
}
