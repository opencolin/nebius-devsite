#!/usr/bin/env node
// Pulls the current Directus schema and writes it to snapshots/schema.yaml.

import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, '..', 'snapshots', 'schema.yaml');

dotenv.config({path: path.join(__dirname, '..', '..', '..', '.env')});

const URL_BASE = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
if (!TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN must be set.');
  process.exit(1);
}

const r = await fetch(`${URL_BASE}/schema/snapshot`, {
  headers: {authorization: `Bearer ${TOKEN}`},
});
if (!r.ok) {
  console.error(await r.text());
  process.exit(1);
}
const j = await r.json();
writeFileSync(SNAPSHOT_PATH, YAML.stringify(j.data));
console.log(`✓ Wrote ${SNAPSHOT_PATH}`);
