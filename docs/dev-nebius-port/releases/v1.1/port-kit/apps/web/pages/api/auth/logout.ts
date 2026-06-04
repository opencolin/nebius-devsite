// POST /api/auth/logout
// Clears cookies and best-effort calls Directus's logout endpoint.

import type {NextApiRequest, NextApiResponse} from 'next';

import {
  clearSessionCookies,
  logoutDirectus,
  readSessionCookies,
} from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const {refreshToken} = readSessionCookies(req);
  if (refreshToken) await logoutDirectus(refreshToken);
  clearSessionCookies(res);
  return res.status(204).end();
}
