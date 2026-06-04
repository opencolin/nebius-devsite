// POST /api/portal/events
// Body: {title, format, starts_at, venue, expected_attendees, agenda,
//        needs_from_nebius, amount_usd?}
// Two-step write:
//   1. Create events row with status=DRAFT, builder=<session user id>.
//   2. Create credit_requests row kind=EVENT, event=<new event id>,
//      amount_usd=<requested>.
// If step 2 fails, best-effort delete of the event row so we don't leak
// a stranded DRAFT.

import type {NextApiRequest, NextApiResponse} from 'next';

import {getServerSession} from '@/lib/auth';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

interface Body {
  title?: unknown;
  format?: unknown;
  starts_at?: unknown;
  venue?: unknown;
  city?: unknown;
  country?: unknown;
  expected_attendees?: unknown;
  agenda?: unknown;
  needs_from_nebius?: unknown;
  amount_usd?: unknown;
}

const ALLOWED_FORMATS = new Set([
  'WORKSHOP',
  'TALK',
  'HACKATHON',
  'OFFICE_HOURS',
  'DEMO_NIGHT',
  'OTHER',
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ok: true; id: string; credit_request_id: string} | {error: string}>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed'});
  }

  const user = await getServerSession(req, res);
  if (!user) return res.status(401).json({error: 'auth required'});

  const body = (req.body ?? {}) as Body;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const format = typeof body.format === 'string' ? body.format.trim().toUpperCase() : '';
  const startsAtRaw = typeof body.starts_at === 'string' ? body.starts_at.trim() : '';
  const venue = typeof body.venue === 'string' ? body.venue.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const country = typeof body.country === 'string' ? body.country.trim() : '';
  const agenda = typeof body.agenda === 'string' ? body.agenda.trim() : '';
  const needsFromNebius =
    typeof body.needs_from_nebius === 'string' ? body.needs_from_nebius.trim() : '';

  // expected_attendees + amount_usd can come in as either string or number
  // (HTML number inputs serialize as strings when JSON.stringify-ed naively).
  const expectedAttendeesNum =
    typeof body.expected_attendees === 'number'
      ? body.expected_attendees
      : typeof body.expected_attendees === 'string' && body.expected_attendees.trim()
      ? Number(body.expected_attendees)
      : null;
  const amountUsdNum =
    typeof body.amount_usd === 'number'
      ? body.amount_usd
      : typeof body.amount_usd === 'string' && body.amount_usd.trim()
      ? Number(body.amount_usd)
      : 0;

  if (!title || !format || !startsAtRaw) {
    return res.status(400).json({error: 'title, format, and starts_at are required'});
  }
  if (!ALLOWED_FORMATS.has(format)) {
    return res.status(400).json({error: `format must be one of ${Array.from(ALLOWED_FORMATS).join(', ')}`});
  }

  // Accept either "2026-08-12T18:30" (datetime-local style) or a full ISO
  // string. Anything `new Date()` parses to a valid Date is fine.
  const startsAtDate = new Date(startsAtRaw);
  if (Number.isNaN(startsAtDate.getTime())) {
    return res.status(400).json({error: 'starts_at is not a valid date'});
  }
  const startsAt = startsAtDate.toISOString();
  // Default ends_at to +2h — admin can tighten this when reviewing.
  const endsAt = new Date(startsAtDate.getTime() + 2 * 3600_000).toISOString();

  const description = [agenda, needsFromNebius && `\n\nNeeds: ${needsFromNebius}`]
    .filter(Boolean)
    .join('')
    .trim();

  const eventRow = {
    title,
    description: description || `Draft event — submitted by ${user.email}.`,
    format,
    starts_at: startsAt,
    ends_at: endsAt,
    timezone: 'UTC',
    venue_name: venue || '—',
    city: city || '—',
    country: country || '—',
    is_online: false,
    product_focus: [],
    status: 'DRAFT',
    builder: user.id,
    is_official: false,
  };

  // Step 1 — create the events row.
  let eventId: string;
  try {
    const r = await fetch(`${DIRECTUS_URL}/items/events`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(eventRow),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error('[events] directus create failed', r.status, text);
      return res.status(500).json({error: `Event create failed (${r.status})`});
    }
    const json = (await r.json()) as {data: {id: string}};
    eventId = json.data.id;
  } catch (err) {
    console.error('[events] unexpected error creating event', err);
    return res.status(500).json({error: (err as Error).message});
  }

  // Step 2 — create the linked credit_requests row. If this fails, roll
  // back the events row best-effort so the DRAFT doesn't leak.
  const creditJustification = [
    `Event: ${title}`,
    `Format: ${format}`,
    `When: ${startsAt}`,
    expectedAttendeesNum ? `Expected attendees: ${expectedAttendeesNum}` : '',
    needsFromNebius ? `\nNeeds:\n${needsFromNebius}` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .trim();

  const creditRow = {
    status: 'PENDING',
    kind: 'EVENT',
    builder: user.id,
    amount_usd: amountUsdNum > 0 ? amountUsdNum : 100,
    justification: creditJustification,
    event: eventId,
  };

  try {
    const r = await fetch(`${DIRECTUS_URL}/items/credit_requests`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(creditRow),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error('[events] credit_requests create failed', r.status, text);
      // Rollback the events row — best-effort. Even if this delete fails
      // we still return the error so the user knows something went wrong.
      await fetch(`${DIRECTUS_URL}/items/events/${eventId}`, {
        method: 'DELETE',
        headers: {authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`},
      }).catch((e) => console.error('[events] rollback delete failed', e));
      return res.status(500).json({error: `Credit request create failed (${r.status})`});
    }
    const json = (await r.json()) as {data: {id: string}};
    return res.status(201).json({ok: true, id: eventId, credit_request_id: json.data.id});
  } catch (err) {
    console.error('[events] unexpected error creating credit_request', err);
    await fetch(`${DIRECTUS_URL}/items/events/${eventId}`, {
      method: 'DELETE',
      headers: {authorization: `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`},
    }).catch((e) => console.error('[events] rollback delete failed', e));
    return res.status(500).json({error: (err as Error).message});
  }
}
