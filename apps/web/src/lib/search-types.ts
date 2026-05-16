// Shared types between /api/search and /search page consumers.
// Kept in lib (not in pages/api) because the tsconfig `@/` alias only
// covers src/* — page-to-page imports don't resolve cleanly otherwise.

export interface SearchHit {
  id: string;
  kind: 'event' | 'library' | 'app';
  title: string;
  blurb: string;
  url: string;
  meta?: string;
  tags?: string[];
}

export interface SearchResponse {
  hits: SearchHit[];
  counts: {event: number; library: number; app: number; total: number};
}
