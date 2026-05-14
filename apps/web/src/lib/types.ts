// =============================================================================
// Directus collection schema (used to type the @directus/sdk client).
//
// Only the collections this app reads/writes are typed. Everything else is
// loosely typed via `unknown` rather than `any` so missing typings surface
// as compile errors instead of silent bugs.
// =============================================================================

export type DirectusStatus = 'draft' | 'published' | 'archived';
export type RoleName = 'public' | 'builder' | 'admin';

// Page Constructor's content shape is a tagged-union JSON. We keep the inner
// shape as `unknown` here — the @gravity-ui/page-constructor types are the
// source of truth at the render site.
export type PageConstructorContent = {
  blocks?: unknown[];
  background?: unknown;
  header?: unknown;
  footer?: unknown;
};

export interface PageRow {
  id: string;
  status: DirectusStatus;
  slug: string;
  title: string;
  seo_description?: string | null;
  seo_image?: string | null; // Directus file id
  blocks: PageConstructorContent;
  date_updated?: string;
}

export interface DirectusUserRow {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: {id: string; name: RoleName};
}

// =============================================================================
// Domain types — ported from the existing nebius-builders repo so the team can
// re-use them as Directus collections gain shape over time.
// =============================================================================

export type BuilderTier = 'BUILDER' | 'CONTRIBUTOR' | 'AMBASSADOR' | 'FOUNDING';

export type EventFormat =
  | 'WORKSHOP'
  | 'TALK'
  | 'HACKATHON'
  | 'OFFICE_HOURS'
  | 'DEMO_NIGHT'
  | 'OTHER';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export type LibraryEntryType = 'WORKSHOP' | 'VIDEO' | 'REPO';
export type LibraryLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface BuilderRow {
  id: string;
  handle: string;
  name: string;
  bio: string;
  city: string;
  country: string;
  tier: BuilderTier;
  points_total: number;
  twitter_handle?: string | null;
  github_handle: string;
  expertise: string[];
  signed_up_at: string;
  last_active_at: string;
  attribution_slug: string;
  wants_to_host: boolean;
}

export interface BuildersEventRow {
  id: string;
  title: string;
  description: string;
  format: EventFormat;
  starts_at: string;
  ends_at: string;
  timezone: string;
  venue_name: string;
  city: string;
  country: string;
  // Directus geometry.point — `[lng, lat]` (GeoJSON convention)
  location?: {type: 'Point'; coordinates: [number, number]} | null;
  is_online: boolean;
  product_focus: string[];
  status: EventStatus;
  builder?: string | null; // FK to builders.id
  is_official: boolean;
  official_url?: string | null;
  luma_url?: string | null;
}

export interface LibraryArticleRow {
  id: string;
  status: DirectusStatus;
  slug: string;
  type: LibraryEntryType;
  title: string;
  blurb: string;
  level: LibraryLevel;
  duration_min?: number | null;
  product_focus: string[];
  body_md?: string | null;
  external_url?: string | null;
  is_official: boolean;
  submitter?: string | null;
}

export interface TeamMemberRow {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  region: string;
  timezone: string;
  expertise: string[];
  languages: string[];
  active: boolean;
  sort_order: number;
  email?: string | null;
  twitter_handle?: string | null;
  github_handle?: string | null;
  linkedin_url?: string | null;
  slack_handle?: string | null;
  calendly_url?: string | null;
}

export interface OfficeHourSessionRow {
  id: string;
  advocate: string; // FK to team_members
  starts_at: string;
  duration_min: number;
  format: 'DROP_IN' | 'ONE_ON_ONE' | 'GROUP_QA';
  topic?: string | null;
  bookable: boolean;
  booking_url?: string | null;
}

export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  builder_handle: string;
  tags: string[];
  product_focus: string[];
  repo_url?: string | null;
  demo_url?: string | null;
  stars: number;
  featured: boolean;
}

// =============================================================================
// Schema map for @directus/sdk
// =============================================================================

export interface Schema {
  pages: PageRow[];
  builders: BuilderRow[];
  events: BuildersEventRow[];
  library_articles: LibraryArticleRow[];
  team_members: TeamMemberRow[];
  office_hours_sessions: OfficeHourSessionRow[];
  projects: ProjectRow[];
  directus_users: DirectusUserRow[];
}
