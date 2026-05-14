// GET /api/search?q=…&limit=20&kinds=library,project,team,event
// Server-side proxy to Typesense. The search-only API key never reaches
// the browser, which keeps options open for IP throttling, per-role
// projection, and audit logging.

import type {NextApiRequest, NextApiResponse} from 'next';

import {TYPESENSE_COLLECTION, typesenseSearch} from '@/lib/typesense';

interface Hit {
  id: string;
  kind: string;
  title: string;
  blurb?: string;
  url: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{hits: Hit[]} | {error: string}>,
) {
  const q = String(req.query.q ?? '').trim();
  const perPage = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
  const kinds = String(req.query.kinds ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  if (!q) return res.status(200).json({hits: []});

  const filter = kinds.length ? `kind:=[${kinds.join(',')}]` : undefined;

  try {
    const result = await typesenseSearch()
      .collections(TYPESENSE_COLLECTION)
      .documents()
      .search({
        q,
        query_by: 'title,blurb,tags',
        per_page: perPage,
        filter_by: filter,
      });
    const hits: Hit[] = (result.hits ?? []).map((h) => {
      const doc = h.document as Record<string, unknown>;
      return {
        id: String(doc.id ?? ''),
        kind: String(doc.kind ?? ''),
        title: String(doc.title ?? ''),
        blurb: typeof doc.blurb === 'string' ? doc.blurb : undefined,
        url: String(doc.url ?? '/'),
      };
    });
    return res.status(200).json({hits});
  } catch (err) {
    return res.status(500).json({error: (err as Error).message});
  }
}
