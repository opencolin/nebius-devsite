// GET /api/search?q=…&limit=24
//
// Primary path: Typesense (`nebius_builders` collection), populated by
// infra/typesense/sync.mjs from Directus. Fast, typo-tolerant, faceted.
//
// Fallback path: Directus `_icontains` across events + library_articles +
// projects. Slower but always available — used when Typesense env vars
// aren't set (local dev without TS_HOST) or when the Typesense query
// throws (collection missing, network blip, etc.).
//
// Each hit carries enough shape to render a uniform card on /search:
//   { id, kind: 'event'|'library'|'app', title, blurb, url, meta, tags }

import {readItems} from '@directus/sdk';
import type {NextApiRequest, NextApiResponse} from 'next';

import {directusServer} from '@/lib/directus';
import {eventHref} from '@/lib/event-url';
import type {SearchHit, SearchResponse} from '@/lib/search-types';
import {TYPESENSE_COLLECTION, typesenseConfigured, typesenseSearch} from '@/lib/typesense';

export type {SearchHit, SearchResponse};

// Typesense returns "kind" values matching our SearchHit.kind union plus
// `builder` (team_member) which we surface as `library` for the homepage
// search (those entries don't have their own page). Anything else is
// dropped.
type TsKind = SearchHit['kind'] | 'builder';
const KIND_PASSTHROUGH: Record<TsKind, SearchHit['kind']> = {
  event: 'event',
  library: 'library',
  app: 'app',
  // Builders surface under "library" for now since /team isn't part of
  // the requested search corpus. If we ever add team to the chip filter,
  // remap this to its own 'team' kind.
  builder: 'library',
};

async function searchTypesense(q: string, limit: number): Promise<SearchResponse> {
  const result = await typesenseSearch()
    .collections(TYPESENSE_COLLECTION)
    .documents()
    .search({
      q,
      query_by: 'title,blurb,tags',
      per_page: limit,
    });

  const counts = {event: 0, library: 0, app: 0, total: 0};
  const hits: SearchHit[] = [];

  for (const h of result.hits ?? []) {
    const doc = h.document as Record<string, unknown>;
    const rawKind = String(doc.kind ?? '') as TsKind;
    const kind = KIND_PASSTHROUGH[rawKind];
    if (!kind) continue;

    hits.push({
      id: String(doc.id ?? ''),
      kind,
      title: String(doc.title ?? ''),
      blurb: typeof doc.blurb === 'string' ? doc.blurb : '',
      url: String(doc.url ?? '/'),
      tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : undefined,
    });
    counts[kind] += 1;
  }
  counts.total = hits.length;
  return {hits, counts};
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | {error: string}>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({error: 'GET only'});
  }

  const q = String(req.query.q ?? '').trim();
  const limit = Math.min(60, Math.max(1, Number(req.query.limit ?? 24)));

  // Empty query → empty result. Lets the search bar render "no input yet"
  // states without an extra round-trip.
  if (!q) {
    return res
      .status(200)
      .json({hits: [], counts: {event: 0, library: 0, app: 0, total: 0}});
  }

  // Primary: Typesense. Throws if collection missing, network unavailable,
  // or env unset — caught below and we fall back to Directus.
  if (typesenseConfigured()) {
    try {
      const ts = await searchTypesense(q, limit);
      return res.status(200).json(ts);
    } catch (err) {
      // Log but don't fail the request — Directus fallback below.
      console.warn('[search] Typesense failed, falling back to Directus:', (err as Error).message);
    }
  }

  try {
    const directus = directusServer();

    // Directus `_icontains` is case-insensitive substring match — good
    // enough for a marketing search across small collections. If/when
    // the collections grow past a few hundred rows each, swap to
    // Typesense (the wiring is still in @/lib/typesense, just unused).
    const [eventsRaw, libraryRaw, appsRaw] = await Promise.all([
      directus
        .request(
          readItems('events', {
            fields: [
              'id',
              'title',
              'description',
              'format',
              'city',
              'starts_at',
              'luma_url',
              'official_url',
            ],
            filter: {
              status: {_eq: 'PUBLISHED'},
              _or: [
                {title: {_icontains: q}},
                {description: {_icontains: q}},
                {city: {_icontains: q}},
              ],
            },
            limit,
          }),
        )
        .catch(() => [] as unknown[]),
      directus
        .request(
          readItems('library_articles', {
            fields: ['id', 'slug', 'title', 'blurb', 'type', 'level', 'product_focus'],
            filter: {
              status: {_eq: 'published'},
              _or: [
                {title: {_icontains: q}},
                {blurb: {_icontains: q}},
              ],
            },
            limit,
          }),
        )
        .catch(() => [] as unknown[]),
      directus
        .request(
          readItems('projects', {
            fields: [
              'id',
              'slug',
              'title',
              'tagline',
              'description',
              'tags',
              'builder_handle',
            ],
            filter: {
              _or: [
                {title: {_icontains: q}},
                {tagline: {_icontains: q}},
                {description: {_icontains: q}},
                {builder_handle: {_icontains: q}},
              ],
            },
            limit,
          }),
        )
        .catch(() => [] as unknown[]),
    ]);

    const eventHits: SearchHit[] = (eventsRaw as Array<Record<string, unknown>>).map(
      (e) => ({
        id: String(e.id),
        kind: 'event',
        title: String(e.title ?? 'Untitled event'),
        blurb: String(e.description ?? '').slice(0, 200),
        // Events without a luma/official URL stay on the events page;
        // the /events index doesn't deep-link per id today, so this is
        // the best fallback. eventHref() is the same chain used by every
        // other event-link surface (see src/lib/event-url.ts).
        url:
          eventHref({
            luma_url: e.luma_url as string | null | undefined,
            official_url: e.official_url as string | null | undefined,
          }) ?? '/events',
        meta: [e.format ? String(e.format) : null, e.city ? String(e.city) : null]
          .filter(Boolean)
          .join(' · '),
      }),
    );

    const libraryHits: SearchHit[] = (libraryRaw as Array<Record<string, unknown>>).map(
      (l) => ({
        id: String(l.id),
        kind: 'library',
        title: String(l.title ?? 'Untitled'),
        blurb: String(l.blurb ?? ''),
        url: `/library/${l.slug}`,
        meta: [l.type ? String(l.type) : null, l.level ? String(l.level) : null]
          .filter(Boolean)
          .join(' · '),
        tags: Array.isArray(l.product_focus) ? (l.product_focus as string[]) : undefined,
      }),
    );

    const appHits: SearchHit[] = (appsRaw as Array<Record<string, unknown>>).map((p) => ({
      id: String(p.id),
      kind: 'app',
      title: String(p.title ?? 'Untitled project'),
      blurb: String(p.tagline ?? p.description ?? ''),
      url: `/apps/${p.slug}`,
      meta: p.builder_handle ? `by @${p.builder_handle}` : undefined,
      tags: Array.isArray(p.tags) ? (p.tags as string[]) : undefined,
    }));

    // Interleave: 1 event, 1 library, 1 app, repeat — gives a balanced
    // first row in the grid regardless of which collection has the most
    // matches. Trim to `limit` total.
    const hits: SearchHit[] = [];
    const maxLen = Math.max(eventHits.length, libraryHits.length, appHits.length);
    for (let i = 0; i < maxLen && hits.length < limit; i++) {
      if (eventHits[i]) hits.push(eventHits[i]);
      if (libraryHits[i] && hits.length < limit) hits.push(libraryHits[i]);
      if (appHits[i] && hits.length < limit) hits.push(appHits[i]);
    }

    return res.status(200).json({
      hits,
      counts: {
        event: eventHits.length,
        library: libraryHits.length,
        app: appHits.length,
        total: hits.length,
      },
    });
  } catch (err) {
    return res.status(500).json({error: (err as Error).message});
  }
}
