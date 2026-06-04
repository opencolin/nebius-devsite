// GET /api/auth/me
// Returns the current session user, or { user: null } if signed out.

import type {NextApiRequest, NextApiResponse} from 'next';

import {getServerSession, type SessionUser} from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{user: SessionUser | null}>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }
  const user = await getServerSession(req, res);
  return res.status(200).json({user});
}
