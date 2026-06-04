// POST /api/portal/credits/claim
// Body: {kind: 'AI' | 'TF', account_email?: string, justification?: string}
// Creates a credit_requests row with amount_usd=100, status=PENDING, and
// builder=<session user id>. Reviewed in /admin/credit-claims.

import type {NextApiRequest, NextApiResponse} from 'next';

import {getServerSession} from '@/lib/auth';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

interface Body {
  kind?: unknown;
  account_email?: unknown;
  justification?: unknown;
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
  const kind = typeof body.kind === 'string' ? body.kind.trim().toUpperCase() : '';
  if (kind !== 'AI' && kind !== 'TF') {
    return res.status(400).json({error: 'kind must be AI or TF'});
  }

  const accountEmail =
    typeof body.account_email === 'string' ? body.account_email.trim() : '';
  const justification =
    typeof body.justification === 'string' ? body.justification.trim() : '';

  // AI Cloud claims require a justification (fraud prevention); TF claims
  // only need the account email. Keep the validation aligned with the UI.
  if (!accountEmail) {
    return res.status(400).json({error: 'account_email is required'});
  }
  if (kind === 'AI' && !justification) {
    return res.status(400).json({error: 'justification is required for AI claims'});
  }

  // Fold the account email into the justification body so the admin
  // reviewer sees both pieces of context in one field. The Directus
  // collection has a generic `justification` column, not a separate
  // account_email column.
  const justificationParts = [
    `Account email: ${accountEmail}`,
    justification ? `\n${justification}` : '',
  ];

  const row = {
    status: 'PENDING',
    kind,
    builder: user.id,
    amount_usd: 100,
    justification: justificationParts.join('').trim(),
  };

  try {
    const r = await fetch(`${DIRECTUS_URL}/items/credit_requests`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error('[credits/claim] directus create failed', r.status, text);
      return res.status(500).json({error: `Directus create failed (${r.status})`});
    }
    const json = (await r.json()) as {data: {id: string}};
    return res.status(201).json({ok: true, id: json.data.id});
  } catch (err) {
    console.error('[credits/claim] unexpected error', err);
    return res.status(500).json({error: (err as Error).message});
  }
}
