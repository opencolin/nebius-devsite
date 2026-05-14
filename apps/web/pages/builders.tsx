// /builders — bespoke landing for the Builders Network.
//
// Order: leaderboard top → CMS-driven program-pitch content below.
// The pitch content is still authored in Directus (the `pages` row with
// slug='builders') and rendered through Page Constructor. This file shadows
// the catch-all (`pages/[[...slug]].tsx`) for the /builders URL only.
//
// Editors continue to update the marketing copy in the Directus admin; the
// leaderboard widget is owned by code and is always at the top.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';

import {Text} from '@gravity-ui/uikit';
import type {PageContent} from '@gravity-ui/page-constructor';

import {LeaderboardTable, type LeaderboardBuilder} from '@/components/builders/LeaderboardTable';
import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';
import type {PageRow} from '@/lib/types';

import page from '@/styles/page.module.scss';
import styles from './builders.module.scss';

const CmsRenderer = dynamic(() => import('@/components/CmsRenderer'), {ssr: true});

interface Props {
  builders: LeaderboardBuilder[];
  cms: PageRow | null;
}

const TOP_N = 10;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const directus = directusServer();
  const [builders, pages] = await Promise.all([
    directus.request(
      readItems('builders', {
        sort: ['-points_total'],
        fields: ['handle', 'name', 'city', 'country', 'tier', 'points_total'],
        limit: -1,
      }),
    ),
    directus.request(
      readItems('pages', {
        filter: {slug: {_eq: 'builders'}, status: {_eq: 'published'}},
        limit: 1,
      }),
    ),
  ]);
  return {
    props: {
      builders: builders as LeaderboardBuilder[],
      cms: ((pages as PageRow[])[0] ?? null) as PageRow | null,
    },
    revalidate: 60,
  };
};

export default function BuildersPage({
  builders,
  cms,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // The CMS row's first block is the program-pitch hero. Our bespoke
  // PageHeader above already serves that role, so we drop the duplicate to
  // avoid two stacked H1s.
  const allBlocks = (cms?.blocks?.blocks as Array<{type?: string}> | undefined) ?? [];
  const cmsContent: PageContent = {
    blocks: (allBlocks[0]?.type === 'header-block'
      ? allBlocks.slice(1)
      : allBlocks) as PageContent['blocks'],
  };
  const showCount = Math.min(TOP_N, builders.length);

  return (
    <PublicLayout>
      <Head>
        <title>Builders · Nebius Builders Network</title>
        <meta
          name="description"
          content={
            cms?.seo_description ??
            'The Nebius Builders Network: ambassadors, contributors, and hackathon winners shipping real work on Nebius.'
          }
        />
      </Head>

      <div className={page.container}>
        <PageHeader
          eyebrow="Builders Network"
          title={`Top ${showCount} this month`}
          description={`${builders.length} builders ranked by points from events, library submissions, attribution, and milestones.`}
          actions={
            <Link href="/leaderboard" className={styles.fullLeaderboardLink}>
              See the full leaderboard →
            </Link>
          }
        />
        <LeaderboardTable builders={builders} limit={TOP_N} />

        <div className={styles.divider}>
          <Text variant="caption-2" color="secondary">
            About the program
          </Text>
        </div>
      </div>

      <CmsRenderer content={cmsContent} />
    </PublicLayout>
  );
}
