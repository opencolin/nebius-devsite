// Single source of truth for "where should the RSVP link on an event card go?"
//
// Events have two possible URLs in Directus: `luma_url` (Luma listing — what
// the events refresher writes when source=luma) and `official_url` (the
// Nebius webinar page — what the refresher writes when source=nebius.com).
// Most events have exactly one of the two; the rendering needs to pick
// whichever is present.
//
// Previously each surface inlined its own fallback chain and at least three
// (homepage map, /events page, ActiveEvents marketing block) only checked
// `luma_url`, silently dropping the link for any nebius.com-sourced event.
// The user-reported bug: "Calculating the total cost of a GPU cluster |
// Nebius × SemiAnalysis" was source=nebius.com so `luma_url` was null,
// `official_url` had the correct webinar URL, but the card rendered with
// no link.
//
// Use this helper whenever you render an event link. Returns the best URL
// or null when neither is present — callers decide whether to render an
// `<a>` or fall back to /events#id internal anchor.

export interface EventLinkSource {
  luma_url?: string | null;
  official_url?: string | null;
}

export function eventHref(e: EventLinkSource): string | null {
  return e.luma_url || e.official_url || null;
}
