// Shared project utilities. Currently just the placeholder filter, kept
// in lib/ so /apps/index, /apps/[slug], and the sitemap all use the same
// definition — pasting it in three places guaranteed drift the first
// time someone added a fourth surface.

export interface PlaceholderProjectShape {
  title?: string | null;
  tagline?: string | null;
}

// Placeholder submissions that slipped through the form (someone hit
// "submit" with the title "Test" and the tagline "Test entry"). Live
// Directus has delete actions disabled so we filter at read time; this
// also catches future garbage submissions of the same shape.
//
// If you find a new placeholder pattern, add it here — every surface
// that lists or links to projects routes through this helper.
export function isPlaceholderProject(p: PlaceholderProjectShape): boolean {
  const title = (p.title ?? '').trim().toLowerCase();
  const tagline = (p.tagline ?? '').trim().toLowerCase();
  if (title === 'test' || title === 'untitled') return true;
  if (tagline.startsWith('test entry')) return true;
  return false;
}
