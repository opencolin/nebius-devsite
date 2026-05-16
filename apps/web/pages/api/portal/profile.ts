// PATCH /api/portal/profile
// Body: {first_name?, last_name?}
// Updates the session user's directus_users row. Email is read-only on
// this endpoint — only first/last name pass through. Uses the admin token
// against /users/<id> so the call doesn't depend on per-user policy perms.

import type {NextApiRequest, NextApiResponse} from 'next';

import {getServerSession} from '@/lib/auth';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

interface Body {
  first_name?: unknown;
  last_name?: unknown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ok: true; id: string} | {error: string}>,
) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({error: 'Method not allowed'});
  }

  const user = await getServerSession(req, res);
  if (!user) return res.status(401).json({error: 'auth required'});

  const body = (req.body ?? {}) as Body;
  // Coerce + trim, but only forward fields that were actually provided
  // so a request that only sets first_name doesn't clobber last_name.
  const patch: {first_name?: string; last_name?: string} = {};
  if (typeof body.first_name === 'string') {
    patch.first_name = body.first_name.trim();
  }
  if (typeof body.last_name === 'string') {
    patch.last_name = body.last_name.trim();
  }
  if (Object.keys(patch).length === 0) {
    return res.status(400).json({error: 'first_name or last_name required'});
  }

  try {
    // PATCH /users/<id> with the admin token — works regardless of the
    // builder policy's update perms on directus_users. We pin the id to
    // the session user, so the caller can only ever edit themselves.
    const r = await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(patch),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error('[profile] directus patch failed', r.status, text);
      return res.status(500).json({error: `Directus update failed (${r.status})`});
    }
    return res.status(200).json({ok: true, id: user.id});
  } catch (err) {
    console.error('[profile] unexpected error', err);
    return res.status(500).json({error: (err as Error).message});
  }
}
