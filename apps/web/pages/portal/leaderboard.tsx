// /portal/leaderboard — auth-gated full builder leaderboard.
//
// Public visitors used to land on /leaderboard; we moved it under /portal
// because (a) the row links go to per-builder profile pages we don't
// currently host for the 100+ imported builders, and (b) it's more useful
// for signed-in builders comparing their own rank against the field than
// as a public marketing surface.

import {readItems} from '@directus/sdk';
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';

import {LeaderboardTable, type LeaderboardBuilder} from '@/components/builders/LeaderboardTable';
import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {enforceRole} from '@/lib/auth';
import {directusServer} from '@/lib/directus';

import page from '@/styles/page.module.scss';

interface Props {
  builders: LeaderboardBuilder[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const guard = await enforceRole('builder', ctx);
  if (guard) return guard;
  const directus = directusServer();
  const builders = (await directus.request(
    readItems('builders', {
      sort: ['-points_total'],
      fields: ['handle', 'name', 'city', 'country', 'tier', 'points_total', 'github_handle'],
      limit: -1,
    }),
  )) as LeaderboardBuilder[];
  return {props: {builders}};
};

export default function PortalLeaderboardPage({
  builders,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <PortalLayout>
      <Head>
        <title>{`Leaderboard · Builder portal`}</title>
      </Head>
      <div className={page.container}>
        <PageHeader
          eyebrow="Leaderboard"
          title="Top builders"
          description="Computed live from points earned through events hosted, library submissions, attribution, and milestone completions."
        />
        <LeaderboardTable builders={builders} />
      </div>
    </PortalLayout>
  );
}
