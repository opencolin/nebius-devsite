// POST /api/portal/ambassador/apply
// Body: {handle, email, city, country, one_thing_built, meetups_to_host, communities}
// Creates an ambassador_applications row with status=PENDING and
// builder=<session user id>. Reviewed monthly via /admin/ambassador-applications.

import type {NextApiRequest, NextApiResponse} from 'next';

import {getServerSession} from '@/lib/auth';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

interface Body {
  handle?: unknown;
  email?: unknown;
  city?: unknown;
  country?: unknown;
  one_thing_built?: unknown;
  meetups_to_host?: unknown;
  communities?: unknown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ok: true; id: string} | {error: string}>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed'});
  }

  const user = await getServerSession(req, res);
  if (!user) return res.status(401).json({error: 'auth required'});

  const body = (req.body ?? {}) as Body;
  const handle = typeof body.handle === 'string' ? body.handle.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const country = typeof body.country === 'string' ? body.country.trim() : '';
  const oneThingBuilt =
    typeof body.one_thing_built === 'string' ? body.one_thing_built.trim() : '';
  const meetupsToHost =
    typeof body.meetups_to_host === 'string' ? body.meetups_to_host.trim() : '';
  const communities =
    typeof body.communities === 'string' ? body.communities.trim() : '';

  if (!handle || !email || !city || !oneThingBuilt) {
    return res.status(400).json({
      error: 'handle, email, city, and one_thing_built are required',
    });
  }

  const row = {
    status: 'PENDING',
    builder: user.id,
    handle,
    email,
    city,
    country,
    one_thing_built: oneThingBuilt,
    meetups_to_host: meetupsToHost,
    communities,
  };

  try {
    const r = await fetch(`${DIRECTUS_URL}/items/ambassador_applications`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error('[ambassador/apply] directus create failed', r.status, text);
      return res.status(500).json({error: `Directus create failed (${r.status})`});
    }
    const json = (await r.json()) as {data: {id: string}};
    return res.status(201).json({ok: true, id: json.data.id});
  } catch (err) {
    console.error('[ambassador/apply] unexpected error', err);
    return res.status(500).json({error: (err as Error).message});
  }
}
