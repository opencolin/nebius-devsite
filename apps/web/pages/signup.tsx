// /signup — the page that USED to live at `/`. When the homepage was
// rebuilt around the new marketing composition, this map-hero + CMS-body
// shape moved here. Still pulls from Directus `pages` — slug `home` is the
// authored data (rename pending; the CMS entry's content is the right one
// for the signup-ish call-to-action page). Same full-bleed map hero, same
// Page Constructor body below.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import {Button} from '@gravity-ui/uikit';
import type {PageContent} from '@gravity-ui/page-constructor';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {assetUrl, directusServer} from '@/lib/directus';
import type {PageRow} from '@/lib/types';

import styles from './signup.module.scss';

// Hero map is client-only (Leaflet touches `window`).
const HeroEventsMap = dynamic(() => import('@/components/hero/HeroEventsMap'), {
  ssr: false,
});

// Page Constructor body still loaded through the dynamic CmsRenderer to keep
// the swiper-resolution workaround in place.
const CmsRenderer = dynamic(() => import('@/components/CmsRenderer'), {ssr: true});

interface HeroEvent {
  id: string;
  title: string;
  location?: {type: 'Point'; coordinates: [number, number]} | null;
}

interface Props {
  cms: PageRow | null;
  events: HeroEvent[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const directus = directusServer();
  const [pages, events] = await Promise.all([
    directus.request(
      readItems('pages', {
        filter: {slug: {_eq: 'home'}, status: {_eq: 'published'}},
        limit: 1,
      }),
    ),
    directus.request(
      readItems('events', {
        filter: {status: {_eq: 'PUBLISHED'}},
        fields: ['id', 'title', 'location'],
        limit: -1,
      }),
    ),
  ]);
  return {
    props: {
      cms: ((pages as PageRow[])[0] ?? null) as PageRow | null,
      events: events as HeroEvent[],
    },
    revalidate: 60,
  };
};

export default function SignupPage({
  cms,
  events,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // Drop the first CMS block (it's a header-block hero — we replace it with
  // our map hero). The rest of the marketing content renders below.
  const allBlocks = (cms?.blocks?.blocks as Array<{type?: string}> | undefined) ?? [];
  const cmsContent: PageContent = {
    blocks: (allBlocks[0]?.type === 'header-block'
      ? allBlocks.slice(1)
      : allBlocks) as PageContent['blocks'],
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

      <section className={styles.hero}>
        <HeroEventsMap events={events} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {cms?.title ?? 'Nebius for AI Builders'}
          </h1>
          <p className={styles.heroDescription}>
            From training and fine-tuning to production inference at scale.
            Plus a community of builders shipping real work — workshops, demos,
            hackathons, office hours.
          </p>
          <div className={styles.heroActions}>
            <Button view="action" size="xl" href="/signup">
              Start building
            </Button>
            <Button view="outlined" size="xl" href="https://docs.nebius.com" target="_blank">
              Read the docs
            </Button>
          </div>
          <div className={styles.heroFootnote}>
            Live map · {events.filter((e) => e.location?.coordinates?.length === 2).length}{' '}
            event locations across the network
          </div>
        </div>
      </section>

      <CmsRenderer content={cmsContent} />
    </PublicLayout>
  );
}
