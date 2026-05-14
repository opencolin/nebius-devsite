// GET /api/scrape-events
// Mirrors the upstream endpoint that re-scrapes Luma for the latest official
// Nebius events and refreshes the events collection. In this mockup it's a
// stub — production wiring would call out to a Luma scraper or webhook
// receiver and PATCH the events collection.

import type {NextApiRequest, NextApiResponse} from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  }

  return res.status(200).json({
    ok: true,
    note: 'stubbed — wire up a real scraper or webhook receiver to populate the events collection',
    last_run: new Date().toISOString(),
  });
}
