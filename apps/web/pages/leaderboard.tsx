import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';

import {LeaderboardTable, type LeaderboardBuilder} from '@/components/builders/LeaderboardTable';
import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';

import page from '@/styles/page.module.scss';

export const getStaticProps: GetStaticProps<{builders: LeaderboardBuilder[]}> = async () => {
  const directus = directusServer();
  const builders = (await directus.request(
    readItems('builders', {
      sort: ['-points_total'],
      fields: ['handle', 'name', 'city', 'country', 'tier', 'points_total'],
      limit: -1,
    }),
  )) as LeaderboardBuilder[];
  return {props: {builders}, revalidate: 60};
};

export default function LeaderboardPage({
  builders,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>Leaderboard · Nebius Builders</title>
        <meta
          name="description"
          content="The top builders in the Nebius Builders Network, sorted by points earned."
        />
      </Head>
      <div className={page.container}>
        <PageHeader
          eyebrow="Leaderboard"
          title="Top builders"
          description="Computed live from points earned through events hosted, library submissions, attribution, and milestone completions."
        />

        <LeaderboardTable builders={builders} />
      </div>
    </PublicLayout>
  );
}
