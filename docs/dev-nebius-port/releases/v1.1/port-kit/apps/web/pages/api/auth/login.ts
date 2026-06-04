// POST /api/auth/login
// Body: { email, password }
// Sets httpOnly cookies and returns the current user.
//
// Note we can't call getServerSession(req,res) right after setSessionCookies:
// req.headers.cookie still reflects the *incoming* request's cookies (the
// new ones we just set are only on the outgoing response). Instead we hit
// Directus's /users/me directly with the freshly-issued access token.

import type {NextApiRequest, NextApiResponse} from 'next';

import {
  loginWithDirectus,
  setSessionCookies,
  type SessionUser,
} from '@/lib/auth';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

interface Body {
  email: unknown;
  password: unknown;
}

interface DirectusMeResponse {
  data: {
    id: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    role?: {name: string};
  };
}

function normalizeRole(name?: string | null) {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes('admin')) return 'admin' as const;
  return 'builder' as const;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{user: SessionUser} | {error: string}>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed'});
  }

  const {email, password} = (req.body ?? {}) as Body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({error: 'email and password required'});
  }

  try {
    const auth = await loginWithDirectus(email, password);
    setSessionCookies(
      res,
      auth.data.access_token,
      auth.data.refresh_token,
      auth.data.expires,
    );

    // Fetch the user directly with the new access token (cookies aren't
    // visible to this same request).
    const meRes = await fetch(
      `${DIRECTUS_URL}/users/me?fields=id,email,first_name,last_name,role.name`,
      {headers: {authorization: `Bearer ${auth.data.access_token}`}},
    );
    if (!meRes.ok) {
      return res.status(500).json({error: 'session lookup failed after login'});
    }
    const me = (await meRes.json()) as DirectusMeResponse;
    const user: SessionUser = {
      id: me.data.id,
      email: me.data.email,
      firstName: me.data.first_name ?? null,
      lastName: me.data.last_name ?? null,
      role: normalizeRole(me.data.role?.name),
    };
    return res.status(200).json({user});
  } catch (err) {
    return res.status(401).json({error: (err as Error).message});
  }
}
