// Typed Directus SDK clients.
//
// Two flavors:
//  - `directusServer()`  — uses the static admin token (server-only). For
//                          getStaticProps / getServerSideProps / API routes
//                          that need full read access.
//  - `directusAsUser(t)` — uses the current user's session token. For API
//                          routes that proxy authenticated requests through
//                          Directus's per-role permissions.
//
// These mirror the pattern Nebius's own site uses to fetch CMS pages from
// nebius.directus.app at build/revalidate time.

import {
  authentication,
  createDirectus,
  rest,
  staticToken,
  type DirectusClient,
  type RestClient,
  type AuthenticationClient,
} from '@directus/sdk';

import type {Schema} from './types';

const DIRECTUS_URL =
  process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN ?? '';

let _serverClient:
  | (DirectusClient<Schema> & RestClient<Schema>)
  | undefined;

export function directusServer() {
  if (!_serverClient) {
    if (!DIRECTUS_ADMIN_TOKEN) {
      // Don't throw at import time — only when something actually tries to
      // use it without configuration. Lets the dev server start cleanly.
      console.warn(
        '[directus] DIRECTUS_ADMIN_TOKEN not set; server queries will fail.',
      );
    }
    _serverClient = createDirectus<Schema>(DIRECTUS_URL)
      .with(staticToken(DIRECTUS_ADMIN_TOKEN))
      .with(rest());
  }
  return _serverClient;
}

export function directusAsUser(accessToken: string) {
  return createDirectus<Schema>(DIRECTUS_URL)
    .with(staticToken(accessToken))
    .with(rest());
}

/** Anonymous client — only safe for public-permission-marked operations. */
export function directusPublic(): DirectusClient<Schema> &
  RestClient<Schema> &
  AuthenticationClient<Schema> {
  return createDirectus<Schema>(DIRECTUS_URL)
    .with(authentication('json', {credentials: 'include'}))
    .with(rest());
}

/** Browser-facing public origin used when constructing asset URLs in <Image>. */
export const directusPublicOrigin =
  process.env.NEXT_PUBLIC_DIRECTUS_PUBLIC_URL ?? DIRECTUS_URL;

/** Build a public asset URL: assetUrl('uuid-1234', { width: 1280, format: 'webp' }) */
export function assetUrl(
  id: string | null | undefined,
  opts: {width?: number; height?: number; format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg'} = {},
): string | null {
  if (!id) return null;
  const params = new URLSearchParams();
  if (opts.width) params.set('width', String(opts.width));
  if (opts.height) params.set('height', String(opts.height));
  if (opts.format) params.set('format', opts.format);
  const qs = params.toString();
  return `${directusPublicOrigin}/assets/${id}${qs ? `?${qs}` : ''}`;
}
