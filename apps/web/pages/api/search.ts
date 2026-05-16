// GET /api/search?q=…&limit=24
//
// Fans out to Directus for events + library_articles + projects in parallel
// and returns a unified hit list. Replaces an earlier Typesense-backed
// implementation — Typesense isn't deployed in this stack, and the
// browser was getting a 500 here that bubbled up as the "client-side
// exception" the user saw in the header search bar.
//
// Each hit carries enough shape to render a uniform card on /search:
//   { id, kind: 'event'|'library'|'app', title, blurb, url, meta, tags }

import {readItems} from '@directus/sdk';
import type {NextApiRequest, NextApiResponse} from 'next';

import {directusServer} from '@/lib/directus';
import type {SearchHit, SearchResponse} from '@/lib/search-types';

export type {SearchHit, SearchResponse};

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
        // the best fallback.
        url:
          (e.luma_url as string | undefined) ||
          (e.official_url as string | undefined) ||
          '/events',
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
