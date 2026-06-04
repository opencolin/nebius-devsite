import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Card, Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';

import page from '@/styles/page.module.scss';
import styles from './team.module.scss';

interface TeamMember {
  slug: string;
  name: string;
  title: string;
  bio: string;
  region: string;
  expertise: string[];
  calendly_url?: string | null;
  github_handle?: string | null;
}

export const getStaticProps: GetStaticProps<{members: TeamMember[]}> = async () => {
  const directus = directusServer();
  const members = (await directus.request(
    readItems('team_members', {
      filter: {active: {_eq: true}},
      sort: ['sort_order', 'name'],
      fields: ['slug', 'name', 'title', 'bio', 'region', 'expertise', 'calendly_url', 'github_handle'],
      limit: -1,
    }),
  )) as TeamMember[];
  return {props: {members}, revalidate: 60};
};

export default function TeamPage({
  members,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>Team · Nebius Builders</title>
        <meta
          name="description"
          content="Meet the Nebius DevRel team. Office hours, no gatekeeping."
        />
      </Head>
      <div className={page.container}>
        <PageHeader
          eyebrow="Team"
          title="Meet the Nebius DevRel team"
          description="Reach the right person on the Nebius DevRel team directly — dev advocates, engineers, program leads. 15-minute office hours, no gatekeeping. Cover questions about events, content, infrastructure, hiring leads — whatever helps you ship."
        />

        <div className={page.grid3}>
          {members.map((m) => (
            <Link key={m.slug} href={`/team/${m.slug}`} className={styles.cardLink}>
              <Card view="filled" className={styles.card}>
                <div className={styles.head}>
                  <Text variant="subheader-2" as="h3">
                    {m.name}
                  </Text>
                  <Text variant="caption-2" color="secondary" className={styles.title}>
                    {m.title.replace(', Nebius', '')}
                  </Text>
                  <Text variant="caption-2" color="secondary">
                    {m.region}
                  </Text>
                </div>
                <Text variant="body-2" color="secondary" className={styles.bio}>
                  {m.bio.length > 220 ? m.bio.slice(0, 220) + '…' : m.bio}
                </Text>
                <div className={page.tagRow}>
                  {m.expertise.slice(0, 4).map((e) => (
                    <Label key={e} theme="normal" size="xs">
                      {e}
                    </Label>
                  ))}
                </div>
                {m.calendly_url ? (
                  <Text variant="body-2" color="info" className={styles.cta}>
                    Book office hours →
                  </Text>
                ) : null}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
