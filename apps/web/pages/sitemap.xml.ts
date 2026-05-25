// Dynamic sitemap.
//
// Pages Router pattern: an empty default-export component plus a
// getServerSideProps that writes XML directly to the response and
// returns notFound to prevent Next from also trying to render the
// (empty) React tree. This is the standard idiom — see Next.js docs
// "Static File Serving" + "Custom server rendering".
//
// Sources:
//  - Hardcoded static routes (all the top-level pages with their own .tsx).
//  - Directus `pages` rows for the CMS catch-all (/about-this-build,
//    /localhosts, /builders, /signup, /home, /office-hours).
//  - Directus `library_articles` slugs (published only).
//  - Directus `projects` slugs.
//  - Directus `team_members` handles (if any — currently empty so the
//    lookup just returns []).
//
// Cache: edge-cached for 1 hour, SWR for a day. The sitemap doesn't need
// to be perfectly fresh — a new library entry showing up an hour later
// in the sitemap is fine. The Directus → ISR path still surfaces the
// page itself within 60 seconds.

import {readItems} from '@directus/sdk';
import type {GetServerSideProps} from 'next';

import {directusServer} from '@/lib/directus';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://demo.buildspace.sh';

// Hardcoded routes that have their own pages/*.tsx file. Slug-driven
// CMS routes are pulled live from Directus below. Keep this list in
// sync with pages/ — anything new gets added here.
const STATIC_ROUTES: Array<{path: string; changefreq: string; priority: number}> = [
  {path: '/', changefreq: 'daily', priority: 1.0},
  {path: '/events', changefreq: 'daily', priority: 0.9},
  {path: '/library', changefreq: 'daily', priority: 0.9},
  {path: '/apps', changefreq: 'daily', priority: 0.9},
  {path: '/integrations', changefreq: 'weekly', priority: 0.8},
  {path: '/team', changefreq: 'weekly', priority: 0.7},
  {path: '/builders/all', changefreq: 'weekly', priority: 0.6},
  {path: '/search', changefreq: 'monthly', priority: 0.4},
  // /signup and /office-hours are ALSO served by the CMS catch-all, but
  // because there are sibling pages/*.tsx files those .tsx wins. Include
  // them here so they appear regardless of which path serves them.
  {path: '/signup', changefreq: 'monthly', priority: 0.7},
  {path: '/office-hours', changefreq: 'weekly', priority: 0.7},
];

interface Url {
  loc: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderUrl(u: Url): string {
  const parts = [`  <url>`, `    <loc>${escapeXml(u.loc)}</loc>`];
  if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
  if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
  if (u.priority !== undefined) parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
  parts.push(`  </url>`);
  return parts.join('\n');
}

async function safeRead<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (err) {
    console.warn('[sitemap] directus fetch failed:', (err as Error).message);
    return fallback;
  }
}

export const getServerSideProps: GetServerSideProps = async ({res}) => {
  const directus = directusServer();

  // Pull every dynamic slug source in parallel. Each is wrapped in
  // safeRead so a missing collection / network blip degrades gracefully
  // to "sitemap has the static routes only" instead of returning 500.
  const [pagesRows, libraryRows, projectRows, teamRows] = await Promise.all([
    safeRead(
      directus.request(
        readItems('pages', {
          filter: {status: {_eq: 'published'}},
          fields: ['slug', 'date_updated'],
          limit: -1,
        }),
      ) as Promise<Array<{slug: string; date_updated?: string | null}>>,
      [],
    ),
    safeRead(
      directus.request(
        readItems('library_articles', {
          filter: {status: {_eq: 'published'}},
          fields: ['slug', 'date_updated'],
          limit: -1,
        }),
      ) as Promise<Array<{slug: string; date_updated?: string | null}>>,
      [],
    ),
    safeRead(
      directus.request(
        readItems('projects', {
          fields: ['slug', 'date_updated'],
          limit: -1,
        }),
      ) as Promise<Array<{slug: string; date_updated?: string | null}>>,
      [],
    ),
    safeRead(
      directus.request(
        readItems('builders', {
          fields: ['handle'],
          limit: -1,
        }),
      ) as Promise<Array<{handle: string}>>,
      [],
    ),
  ]);

  const urls: Url[] = [];

  // Static routes.
  for (const r of STATIC_ROUTES) {
    urls.push({loc: `${SITE_ORIGIN}${r.path}`, changefreq: r.changefreq, priority: r.priority});
  }

  // CMS pages served by the catch-all. `home` is already at `/` via the
  // static list; skip duplicates of static routes to keep one entry per
  // canonical URL.
  const staticPaths = new Set(STATIC_ROUTES.map((r) => r.path));
  for (const p of pagesRows) {
    if (!p.slug) continue;
    const path = p.slug === 'home' ? '/' : `/${p.slug}`;
    if (staticPaths.has(path)) continue;
    urls.push({
      loc: `${SITE_ORIGIN}${path}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: p.date_updated ? new Date(p.date_updated).toISOString() : undefined,
    });
  }

  // Library articles.
  for (const a of libraryRows) {
    if (!a.slug) continue;
    urls.push({
      loc: `${SITE_ORIGIN}/library/${a.slug}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: a.date_updated ? new Date(a.date_updated).toISOString() : undefined,
    });
  }

  // Apps (projects).
  for (const pr of projectRows) {
    if (!pr.slug) continue;
    urls.push({
      loc: `${SITE_ORIGIN}/apps/${pr.slug}`,
      changefreq: 'monthly',
      priority: 0.5,
      lastmod: pr.date_updated ? new Date(pr.date_updated).toISOString() : undefined,
    });
  }

  // Team members (builders collection currently empty; safe-read returns
  // [] so this loop is a no-op until the collection gets seeded).
  for (const t of teamRows) {
    if (!t.handle) continue;
    urls.push({
      loc: `${SITE_ORIGIN}/team/${t.handle}`,
      changefreq: 'monthly',
      priority: 0.4,
    });
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(renderUrl).join('\n') +
    `\n</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  // 1h edge cache; serve stale for a day on error. Matches the rhythm of
  // CMS updates without making us re-query Directus on every crawler hit.
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=604800',
  );
  res.write(body);
  res.end();

  // notFound stops Next from also trying to render the React tree — the
  // response is already sent. Returning {props:{}} would error because
  // res.end was already called.
  return {notFound: true};
};

// Empty component — required by Next, never rendered (getServerSideProps
// closes the response before React gets a chance).
export default function Sitemap() {
  return null;
}
