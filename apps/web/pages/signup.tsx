// /signup — CMS-only page that renders the Directus `pages` row at slug
// `home`. Previously had a full-bleed map hero on top, removed per UX
// pass — Page Constructor blocks (including the authored header-block)
// now render edge-to-edge, no chrome competing for attention.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import type {PageContent} from '@gravity-ui/page-constructor';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {assetUrl, directusServer} from '@/lib/directus';
import type {PageRow} from '@/lib/types';

// Page Constructor body loaded through the dynamic CmsRenderer to keep
// the swiper-resolution workaround in place.
const CmsRenderer = dynamic(() => import('@/components/CmsRenderer'), {ssr: true});

interface Props {
  cms: PageRow | null;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const directus = directusServer();
  const pages = await directus.request(
    readItems('pages', {
      filter: {slug: {_eq: 'home'}, status: {_eq: 'published'}},
      limit: 1,
    }),
  );
  return {
    props: {
      cms: ((pages as PageRow[])[0] ?? null) as PageRow | null,
    },
    revalidate: 60,
  };
};

export default function SignupPage({
  cms,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // All blocks render — no slicing now that the map hero is gone. The
  // authored header-block is the page's actual hero.
  const cmsContent: PageContent = {
    blocks: (cms?.blocks?.blocks ?? []) as PageContent['blocks'],
  };
  const ogImage = assetUrl(cms?.seo_image ?? null, {width: 1280, height: 640, format: 'auto'});

  return (
    <PublicLayout>
      <Head>
        <title>{cms?.title ?? 'Nebius for AI Builders'}</title>
        {cms?.seo_description ? (
          <meta name="description" content={cms.seo_description} />
        ) : null}
        <meta property="og:title" content={cms?.title ?? 'Nebius for AI Builders'} />
        {cms?.seo_description ? (
          <meta property="og:description" content={cms.seo_description} />
        ) : null}
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      </Head>

      <CmsRenderer content={cmsContent} />
    </PublicLayout>
  );
}
