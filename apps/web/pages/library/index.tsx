// /library — index of workshops, videos, and repos.
//
// Cards mirror the upstream nebius-builders-3 design: each entry shows a
// type-colored cover area at the top (with a play-button or repo-icon
// overlay), then the title + blurb + tags below. Type and "Official"
// pills sit on top of the cover so they're visible against the gradient.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';

import page from '@/styles/page.module.scss';
import styles from './library.module.scss';

interface LibraryEntry {
  slug: string;
  type: string;
  title: string;
  blurb: string;
  level: string;
  duration_min?: number | null;
  product_focus: string[];
  external_url?: string | null;
  is_official: boolean;
}

export const getStaticProps: GetStaticProps<{entries: LibraryEntry[]}> = async () => {
  const directus = directusServer();
  const entries = (await directus.request(
    readItems('library_articles', {
      filter: {status: {_eq: 'published'}},
      sort: ['-is_official', 'title'],
      fields: ['slug', 'type', 'title', 'blurb', 'level', 'duration_min', 'product_focus', 'external_url', 'is_official'],
      limit: -1,
    }),
  )) as LibraryEntry[];
  return {props: {entries}, revalidate: 60};
};

export default function LibraryPage({
  entries,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>{`Library · Nebius Builders`}</title>
        <meta
          name="description"
          content="Workshops, videos, and repos for getting productive on Nebius."
        />
      </Head>
      <div className={page.container}>
        <PageHeader
          eyebrow="Library"
          title="Workshops, videos, and code"
          description={`${entries.length} resources for getting productive on Nebius — from a 5-minute first-deploy walkthrough to deep training-job recipes.`}
        />

        <div className={page.grid3}>
          {entries.map((e) => (
            <Link key={e.slug} href={`/library/${e.slug}`} className={styles.cardLink}>
              <article className={styles.card}>
                <LibraryCover type={e.type} />
                <header className={styles.cardHead}>
                  <div className={styles.metaRow}>
                    <Label theme={typePillTheme(e.type)} size="xs">
                      {e.type}
                    </Label>
                    {e.is_official ? (
                      <Label theme="utility" size="xs">
                        Official
                      </Label>
                    ) : null}
                  </div>
                </header>
                <div className={styles.cardBody}>
                  <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                    {e.title}
                  </Text>
                  <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                    {e.blurb}
                  </Text>
                </div>
                <footer className={styles.cardFooter}>
                  <div className={styles.tagRow}>
                    {e.product_focus.slice(0, 3).map((t) => (
                      <Label key={t} theme="normal" size="xs">
                        {t}
                      </Label>
                    ))}
                  </div>
                  <Text variant="caption-2" color="secondary" className={styles.cardMeta}>
                    {e.level}
                    {e.duration_min ? ` · ${e.duration_min} min` : ''}
                  </Text>
                </footer>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

// -----------------------------------------------------------------------------
// Type-colored cover with overlaid icon. Mirrors upstream's gradient choices:
//   - WORKSHOP → navy → lime (the most "branded" gradient — these are the
//     hands-on Nebius DevRel sessions worth highlighting)
//   - VIDEO    → deep navy fade (YouTube tutorials, lighter touch)
//   - REPO     → cool gray with lime corner (code, treated as quieter)
// Icon overlay: triangular play for video/workshop, brackets for repo,
// document-fold for everything else.
// -----------------------------------------------------------------------------

function LibraryCover({type}: {type: string}) {
  const isPlayable = type === 'WORKSHOP' || type === 'VIDEO';
  return (
    <div
      className={`${styles.cover} ${
        type === 'WORKSHOP'
          ? styles.coverWorkshop
          : type === 'VIDEO'
            ? styles.coverVideo
            : styles.coverRepo
      }`}
      aria-hidden
    >
      <span className={styles.coverIcon}>
        {isPlayable ? <PlayIcon /> : <RepoIcon />}
      </span>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M7 4.5v13l11-6.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function RepoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function typePillTheme(type: string): 'info' | 'success' | 'normal' {
  if (type === 'WORKSHOP') return 'success';
  if (type === 'VIDEO') return 'info';
  return 'normal';
}
