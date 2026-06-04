// POST /api/feedback
// Tiny inbound feedback endpoint mirrored from opencolin/nebius-builders.
// Body: { kind: 'mockup-review' | 'bug' | 'idea', message: string, page?: string }
// Persists to Directus feedback_items collection if it exists; falls back to
// console.log so dev still works without that collection set up.

import type {NextApiRequest, NextApiResponse} from 'next';

interface Body {
  kind?: string;
  message?: string;
  page?: string;
  email?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ok: true} | {error: string}>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed'});
  }

  const {kind, message, page, email} = (req.body ?? {}) as Body;
  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({error: 'message required'});
  }

  const row = {
    kind: kind ?? 'general',
    message: message.trim(),
    page: page ?? null,
    email: email ?? null,
    user_agent: req.headers['user-agent'] ?? null,
  };

  // Best-effort: if the feedback_items collection exists in Directus, write
  // to it. If not (or Directus is unreachable), log and still return ok —
  // we never want to drop user feedback because of an infra issue.
  try {
    const r = await fetch(`${process.env.DIRECTUS_URL}/items/feedback_items`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(row),
    });
    if (r.status === 403 || r.status === 404) {
      console.warn('[feedback] feedback_items collection not set up; logging:', row);
    } else if (!r.ok) {
      console.warn('[feedback] persist failed; logging:', row, await r.text());
    }
  } catch (err) {
    console.warn('[feedback] persist failed; logging:', row, err);
  }

  return res.status(200).json({ok: true});
}
