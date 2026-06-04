// CMS catch-all — the same shape as nebius.com's `/[[...slug]]` route.
//
// Every URL that isn't matched by a more specific page (e.g. /portal/*,
// /admin/*, /api/*) lands here. We look up a `pages` row in Directus by
// slug, pass its `blocks` JSON to Page Constructor, and let the renderer
// instantiate the configured Gravity UI blocks.
//
// `revalidate: 60` matches the s-maxage=60 served by nebius.com.

import {readItems} from '@directus/sdk';
import type {GetStaticPaths, GetStaticProps, InferGetStaticPropsType} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import type {PageContent} from '@gravity-ui/page-constructor';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {assetUrl, directusServer} from '@/lib/directus';
import type {PageRow} from '@/lib/types';

// Page Constructor 6.x transitively imports swiper@6, which uses an older
// ESM resolution scheme Node refuses during `Collecting page data`. Loading
// the renderer through next/dynamic defers resolution to webpack at runtime
// while still SSRing the markup.
const CmsRenderer = dynamic(() => import('@/components/CmsRenderer'), {
  ssr: true,
});

interface CmsPageProps {
  page: PageRow;
}

// Slugs that have a dedicated Pages Router file (e.g. pages/builders.tsx).
// We skip them here so the catch-all doesn't try to pre-render the same path
// — Next refuses to build when two routes claim the same URL.
const RESERVED_SLUGS = new Set(['builders', 'office-hours', 'home', 'signup']);

export const getStaticPaths: GetStaticPaths = async () => {
  const directus = directusServer();
  let rows: Array<Pick<PageRow, 'slug'>> = [];
  try {
    rows = (await directus.request(
      readItems('pages', {
        fields: ['slug'],
        filter: {status: {_eq: 'published'}},
        limit: -1,
      }),
    )) as Array<Pick<PageRow, 'slug'>>;
  } catch (err) {
    // First-boot: Directus might not be running yet. Ship the catch-all with
    // no pre-rendered paths and let `fallback: 'blocking'` try the lookup at
    // request time.
    console.warn('[pages] could not read pages collection at build time:', err);
  }
  return {
    paths: rows
      .filter((p) => !RESERVED_SLUGS.has(p.slug))
      .map((p) => ({
        params: {slug: p.slug.split('/')},
      })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<CmsPageProps> = async ({params}) => {
  const slugParts = (params?.slug as string[] | undefined) ?? [];
  const slug = slugParts.join('/');

  const directus = directusServer();
  let rows: PageRow[] = [];
  try {
    rows = (await directus.request(
      readItems('pages', {
        filter: {slug: {_eq: slug}, status: {_eq: 'published'}},
        limit: 1,
      }),
    )) as PageRow[];
  } catch (err) {
    console.error('[pages] Directus read failed for slug:', slug, err);
    return {notFound: true, revalidate: 30};
  }
  const page = rows[0];
  if (!page) return {notFound: true, revalidate: 60};

  return {props: {page}, revalidate: 60};
};

export default function CmsPage({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const ogImage = assetUrl(page.seo_image, {width: 1280, height: 640, format: 'auto'});

  const content: PageContent = {
    blocks: (page.blocks?.blocks as PageContent['blocks']) ?? [],
  };

  return (
    <PublicLayout>
      <Head>
        <title>{page.title}</title>
        {page.seo_description ? (
          <meta name="description" content={page.seo_description} />
        ) : null}
        <meta property="og:title" content={page.title} />
        {page.seo_description ? (
          <meta property="og:description" content={page.seo_description} />
        ) : null}
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      </Head>

      <CmsRenderer content={content} />
    </PublicLayout>
  );
}
