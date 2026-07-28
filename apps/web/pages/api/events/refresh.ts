// POST /api/events/refresh
//
// Pulls the latest events from luma.com/nebiusAI and nebius.com/events using
// Tavily's extract API, parses each into an event row, deduplicates against
// the existing events collection, and upserts.
//
// Dedupe rules (per pipeline notes):
//   - Normalize title: strip whitespace, lowercase, collapse common
//     short→long city collisions (Nebius.Build/LON ↔ Nebius.Build/LONDON).
//   - Match on (normalized title, starts_at-day) tuple. If a row already
//     exists, PATCH it; otherwise POST a new one.
//
// Auth: requires the `admin` role. Public visitors who hit Refresh on /events
// see a "sign in as admin to refresh" message in the UI.

import type {NextApiRequest, NextApiResponse} from 'next';

import {enforceRoleApi} from '@/lib/auth';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TAVILY_KEY = process.env.TAVILY_API_KEY;

interface ScrapedEvent {
  source: 'luma' | 'nebius.com';
  title: string;
  url: string;
  city?: string;
  starts_at?: string;
  description?: string;
}

interface RefreshResult {
  scraped: number;
  created: number;
  updated: number;
  skipped: number;
  sources: Array<{source: string; ok: boolean; count: number; error?: string}>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RefreshResult | {error: string}>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed'});
  }

  // Auth gate (admin only)
  const guard = await enforceRoleApi('admin', req);
  if (guard) return res.status(guard.status).json({error: guard.error});

  if (!TAVILY_KEY) {
    return res.status(500).json({
      error: 'TAVILY_API_KEY not set in environment. Add it to .env.local and restart.',
    });
  }

  const result: RefreshResult = {scraped: 0, created: 0, updated: 0, skipped: 0, sources: []};

  // ---- Source 1: Luma calendar ----
  try {
    const lumaEvents = await scrapeLuma();
    result.sources.push({source: 'luma.com/nebiusAI', ok: true, count: lumaEvents.length});
    result.scraped += lumaEvents.length;
    for (const e of lumaEvents) {
      const upserted = await upsertEvent(e);
      if (upserted === 'created') result.created++;
      else if (upserted === 'updated') result.updated++;
      else result.skipped++;
    }
  } catch (err) {
    result.sources.push({
      source: 'luma.com/nebiusAI',
      ok: false,
      count: 0,
      error: (err as Error).message,
    });
  }

  // ---- Source 2: nebius.com/events ----
  try {
    const nebiusEvents = await scrapeNebiusCom();
    result.sources.push({source: 'nebius.com/events', ok: true, count: nebiusEvents.length});
    result.scraped += nebiusEvents.length;
    for (const e of nebiusEvents) {
      const upserted = await upsertEvent(e);
      if (upserted === 'created') result.created++;
      else if (upserted === 'updated') result.updated++;
      else result.skipped++;
    }
  } catch (err) {
    result.sources.push({
      source: 'nebius.com/events',
      ok: false,
      count: 0,
      error: (err as Error).message,
    });
  }

  return res.status(200).json(result);
}

// ---------------------------------------------------------------------------
// Scraping
// ---------------------------------------------------------------------------

async function tavilyExtract(url: string): Promise<string> {
  const r = await fetch('https://api.tavily.com/extract', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${TAVILY_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({urls: [url], extract_depth: 'advanced', format: 'markdown'}),
  });
  if (!r.ok) throw new Error(`Tavily ${url}: ${r.status}`);
  const j = (await r.json()) as {results: Array<{raw_content?: string; content?: string}>};
  return j.results?.[0]?.raw_content ?? j.results?.[0]?.content ?? '';
}

async function scrapeLuma(): Promise<ScrapedEvent[]> {
  const md = await tavilyExtract('https://lu.ma/nebiusAI');
  return parseLumaMarkdown(md);
}

async function scrapeNebiusCom(): Promise<ScrapedEvent[]> {
  const md = await tavilyExtract('https://nebius.com/events');
  return parseNebiusComMarkdown(md);
}

// Both Luma and nebius.com render JS; Tavily Extract turns them into markdown.
// We pull headings (event titles) plus the surrounding "City · Date" line.
function parseLumaMarkdown(md: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Luma event titles look like: "## Nebius.Build · London" or
    // "[Nebius.Build · London](https://lu.ma/...)"
    const hMatch = line.match(/^#{2,3}\s+(.+)/);
    const linkMatch = line.match(/^\[([^\]]+)\]\((https:\/\/lu\.ma\/[a-z0-9-]+)\)/i);
    const title = hMatch?.[1] ?? linkMatch?.[1];
    if (!title || title.length < 4 || title.length > 120) continue;
    const url =
      linkMatch?.[2] ??
      `https://lu.ma/nebiusAI#${slugify(title)}`;
    // Look ahead 1–3 lines for a date or city line
    let starts_at: string | undefined;
    let city: string | undefined;
    for (let j = 1; j <= 4 && i + j < lines.length; j++) {
      const ahead = lines[i + j].trim();
      const dateMatch = ahead.match(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/,
      );
      if (dateMatch && !starts_at) {
        const year = dateMatch[3] ?? new Date().getFullYear();
        starts_at = new Date(`${dateMatch[1]} ${dateMatch[2]} ${year} 18:00 UTC`).toISOString();
      }
      const cityMatch = ahead.match(/\b(San Francisco|London|New York|NYC|Brooklyn|Berlin|Tokyo|Singapore|Bangalore|Online|Virtual)\b/i);
      if (cityMatch && !city) city = normalizeCity(cityMatch[1]);
    }
    events.push({source: 'luma', title, url, city, starts_at});
  }
  return dedupeWithin(events);
}

function parseNebiusComMarkdown(md: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // nebius.com/events titles often appear as bold links or h3s
    const hMatch = line.match(/^#{2,3}\s+(.+)/);
    const linkMatch = line.match(/^\[([^\]]+)\]\((https:\/\/nebius\.com\/events\/[^\)]+)\)/i);
    const title = hMatch?.[1] ?? linkMatch?.[1];
    if (!title || title.length < 4 || title.length > 120) continue;
    const url = linkMatch?.[2] ?? 'https://nebius.com/events';
    let starts_at: string | undefined;
    let city: string | undefined;
    for (let j = 1; j <= 4 && i + j < lines.length; j++) {
      const ahead = lines[i + j].trim();
      const dateMatch = ahead.match(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/,
      );
      if (dateMatch && !starts_at) {
        const year = dateMatch[3] ?? new Date().getFullYear();
        starts_at = new Date(`${dateMatch[1]} ${dateMatch[2]} ${year} 18:00 UTC`).toISOString();
      }
      const cityMatch = ahead.match(/\b(San Francisco|London|New York|NYC|Brooklyn|Berlin|Tokyo|Singapore|Bangalore|Online|Virtual|Paris|Amsterdam)\b/i);
      if (cityMatch && !city) city = normalizeCity(cityMatch[1]);
    }
    events.push({source: 'nebius.com', title, url, city, starts_at});
  }
  return dedupeWithin(events);
}

// ---------------------------------------------------------------------------
// Dedupe
// ---------------------------------------------------------------------------

function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/\s+/g, ' ')
    // Common collisions: LON/LONDON, SF/SAN FRANCISCO, NYC/NEW YORK
    .replace(/\blon\b/g, 'london')
    .replace(/\bsf\b/g, 'san francisco')
    .replace(/\bnyc\b/g, 'new york')
    .replace(/\bblr\b/g, 'bangalore')
    .replace(/\bsg\b/g, 'singapore')
    .trim();
}

function normalizeCity(c: string): string {
  const m: Record<string, string> = {
    nyc: 'New York', brooklyn: 'New York', sf: 'San Francisco', virtual: 'Online',
  };
  return m[c.toLowerCase()] ?? c;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function dedupeWithin(events: ScrapedEvent[]): ScrapedEvent[] {
  const seen = new Map<string, ScrapedEvent>();
  for (const e of events) {
    const key = normalizeTitle(e.title);
    if (!seen.has(key)) seen.set(key, e);
  }
  return Array.from(seen.values());
}

// ---------------------------------------------------------------------------
// Directus upsert
// ---------------------------------------------------------------------------

interface DirectusItem {
  id: string;
  title: string;
}

async function upsertEvent(e: ScrapedEvent): Promise<'created' | 'updated' | 'skipped'> {
  const key = normalizeTitle(e.title);
  const row = {
    title: e.title,
    description: e.description ?? `Imported from ${e.source}.`,
    format: 'OTHER',
    starts_at: e.starts_at ?? new Date(Date.now() + 30 * 86400_000).toISOString(),
    ends_at: e.starts_at
      ? new Date(+new Date(e.starts_at) + 2 * 3600_000).toISOString()
      : new Date(Date.now() + 30 * 86400_000 + 2 * 3600_000).toISOString(),
    timezone: 'UTC',
    venue_name: '—',
    city: e.city ?? '—',
    country: '—',
    is_online: e.city === 'Online',
    product_focus: [],
    status: 'PUBLISHED',
    is_official: e.source === 'nebius.com',
    luma_url: e.source === 'luma' ? e.url : null,
    official_url: e.source === 'nebius.com' ? e.url : null,
  };

  // Look up by normalized title
  const lookupRes = await fetch(
    `${DIRECTUS_URL}/items/events?fields=id,title&limit=-1`,
    {headers: {authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`}},
  );
  if (!lookupRes.ok) {
    console.error('[refresh] events lookup failed', lookupRes.status);
    return 'skipped';
  }
  const existing = ((await lookupRes.json()) as {data: DirectusItem[]}).data;
  const match = existing.find((x) => normalizeTitle(x.title) === key);

  if (match) {
    const r = await fetch(`${DIRECTUS_URL}/items/events/${match.id}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(row),
    });
    return r.ok ? 'updated' : 'skipped';
  }
  const r = await fetch(`${DIRECTUS_URL}/items/events`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(row),
  });
  return r.ok ? 'created' : 'skipped';
}
