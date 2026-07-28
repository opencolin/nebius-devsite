import {readItems} from '@directus/sdk';
import type {GetStaticPaths, GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Button, Card, Label, Text} from '@gravity-ui/uikit';

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
  timezone: string;
  expertise: string[];
  languages: string[];
  email?: string | null;
  twitter_handle?: string | null;
  github_handle?: string | null;
  linkedin_url?: string | null;
  slack_handle?: string | null;
  calendly_url?: string | null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('team_members', {
      filter: {active: {_eq: true}},
      fields: ['slug'],
      limit: -1,
    }),
  )) as Array<{slug: string}>;
  return {
    paths: rows.map((r) => ({params: {slug: r.slug}})),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<{member: TeamMember}> = async ({params}) => {
  const slug = params?.slug as string;
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('team_members', {
      filter: {slug: {_eq: slug}},
      limit: 1,
    }),
  )) as TeamMember[];
  if (!rows[0]) return {notFound: true, revalidate: 60};
  return {props: {member: rows[0]}, revalidate: 60};
};

export default function TeamMemberPage({
  member,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>{`${member.name} · Nebius Builders`}</title>
        <meta name="description" content={member.bio.slice(0, 160)} />
      </Head>
      <div className={page.containerNarrow}>
        <Link href="/team" className={styles.backLink}>
          ← Team
        </Link>

        <header className={styles.detailHeader}>
          <Text variant="caption-2" className={styles.title}>
            {member.title}
          </Text>
          <Text variant="display-2" as="h1">
            {member.name}
          </Text>
          <Text variant="body-2" color="secondary">
            {member.region} · {member.timezone}
          </Text>
          <div className={page.tagRow} style={{marginTop: 12}}>
            {member.expertise.map((e) => (
              <Label key={e} theme="normal" size="s">
                {e}
              </Label>
            ))}
          </div>
          <Text variant="body-2" className={styles.detailBio}>
            {member.bio}
          </Text>
        </header>

        <div className={page.grid2} style={{marginTop: 32}}>
          <Card view="filled" className={page.cardBody}>
            <Text variant="caption-2" color="secondary" className={styles.contactHead}>
              Get in touch
            </Text>
            <ul className={styles.list}>
              {member.calendly_url ? (
                <li>
                  <a href={member.calendly_url} target="_blank" rel="noopener noreferrer">
                    Book 15-min office hours ↗
                  </a>
                </li>
              ) : null}
              {member.email ? (
                <li>
                  <a href={`mailto:${member.email}`}>{member.email}</a>
                </li>
              ) : null}
              {member.slack_handle ? <li>Slack: {member.slack_handle}</li> : null}
            </ul>
          </Card>

          <Card view="filled" className={page.cardBody}>
            <Text variant="caption-2" color="secondary" className={styles.contactHead}>
              Online
            </Text>
            <ul className={styles.list}>
              {member.twitter_handle ? (
                <li>
                  <a
                    href={`https://twitter.com/${member.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter @{member.twitter_handle} ↗
                  </a>
                </li>
              ) : null}
              {member.github_handle ? (
                <li>
                  <a
                    href={`https://github.com/${member.github_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub @{member.github_handle} ↗
                  </a>
                </li>
              ) : null}
              {member.linkedin_url ? (
                <li>
                  <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                    LinkedIn ↗
                  </a>
                </li>
              ) : null}
              {member.languages?.length ? (
                <li>Languages: {member.languages.join(', ')}</li>
              ) : null}
            </ul>
          </Card>
        </div>

        <div className={styles.cta}>
          <Button view="action" size="xl" href="/office-hours">
            Book office hours →
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
