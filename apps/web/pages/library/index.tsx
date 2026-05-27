// /library — index of workshops, videos, and repos.
//
// Cards are typography-first: a small pill row (TYPE + Official) at the
// top, then title + blurb in the middle, then a footer with product
// tags + a type icon next to level/duration. Earlier versions led with
// a heavy aspect-video gradient cover ("coverWorkshop / coverVideo /
// coverRepo") that doubled the card height and let one card dominate
// a row — dropped in favor of letting the title do the work. The
// content-type signal moves into the footer as a leading SVG icon
// (Play for video/workshop, brackets for repo) so the card still
// telegraphs what it is at a glance.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {useMemo, useState} from 'react';

import {Label, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';

import page from '@/styles/page.module.scss';
import styles from './library.module.scss';

// Mixed-axis filter row (matches /apps): All / type / product. A single
// segmented group keeps state model trivial — pick one, everything else
// clears. PRODUCT_FILTER_KEY maps display labels to Directus product_focus
// enum values so the filter matches the chips on each card.
const FILTERS = [
  'All',
  'Workshop',
  'Video',
  'Repo',
  'Token Factory',
  'AI Cloud',
  'OpenClaw',
  'Soperator',
  'Tavily',
] as const;
type Filter = (typeof FILTERS)[number];

const TYPE_FILTER_KEY: Record<string, string> = {
  Workshop: 'WORKSHOP',
  Video: 'VIDEO',
  Repo: 'REPO',
};

// Directus product_focus enum is single-word lowercase (tokenfactory, aicloud).
// Was previously token_factory / ai_cloud here, silently returning 0 for both
// chips even though the data carries many matches. Verified against the live
// product_focus arrays — the underscore form never appears.
const PRODUCT_FILTER_KEY: Record<string, string> = {
  'Token Factory': 'tokenfactory',
  'AI Cloud': 'aicloud',
  OpenClaw: 'openclaw',
  Soperator: 'soperator',
  Tavily: 'tavily',
};

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
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return entries;
    const typeKey = TYPE_FILTER_KEY[filter];
    if (typeKey) return entries.filter((e) => e.type === typeKey);
    const productKey = PRODUCT_FILTER_KEY[filter];
    if (productKey) {
      return entries.filter((e) => (e.product_focus ?? []).includes(productKey));
    }
    return entries;
  }, [entries, filter]);

  // Counts computed off the full set so each chip's number is a stable
  // "if I pick this, here's what I get" preview, not a post-filter total.
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {} as Record<Filter, number>;
    c.All = entries.length;
    for (const [label, key] of Object.entries(TYPE_FILTER_KEY)) {
      c[label as Filter] = entries.filter((e) => e.type === key).length;
    }
    for (const [label, key] of Object.entries(PRODUCT_FILTER_KEY)) {
      c[label as Filter] = entries.filter((e) => (e.product_focus ?? []).includes(key)).length;
    }
    return c;
  }, [entries]);

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
      </div>

      {/* Sticky filter strip — full-width wrapper outside page.container so
          bg + border-bottom span the viewport when pinned. Same pattern as
          /apps and /integrations. */}
      <div className={styles.filterBar}>
        <div className={page.container}>
          <div className={styles.filterChips}>
            <SegmentedRadioGroup
              value={filter}
              onUpdate={(v) => setFilter(v as Filter)}
              size="m"
            >
              {FILTERS.map((f) => (
                <SegmentedRadioGroup.Option key={f} value={f}>
                  {f} ({counts[f]})
                </SegmentedRadioGroup.Option>
              ))}
            </SegmentedRadioGroup>
          </div>
        </div>
      </div>

      <div className={page.container}>
        <div className={page.grid3}>
          {filtered.map((e) => (
            <Link key={e.slug} href={`/library/${e.slug}`} className={styles.cardLink}>
              <article className={styles.card}>
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
                  {e.product_focus.length > 0 ? (
                    <div className={styles.tagRow}>
                      {e.product_focus.slice(0, 3).map((t) => (
                        <Label key={t} theme="normal" size="xs">
                          {t}
                        </Label>
                      ))}
                    </div>
                  ) : null}
                  {/* Type icon + meta on one row. Icon sits on the left as
                      a visual indicator of content kind, meta text on the
                      right with level + duration. */}
                  <div className={styles.cardMetaRow}>
                    <span className={styles.cardTypeIcon} aria-hidden>
                      <TypeIcon type={e.type} />
                    </span>
                    <Text variant="caption-2" color="secondary" className={styles.cardMeta}>
                      {e.level}
                      {e.duration_min ? ` · ${e.duration_min} min` : ''}
                    </Text>
                  </div>
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
// Footer type icon. Replaces the prior top-of-card gradient cover. Same SVG
// shapes as before (triangular play for workshops + videos, code-brackets
// for repos) — the cover wrapper just got stripped. Rendered at footer
// size (14px) inside .cardTypeIcon so it reads as a small visual indicator
// next to the level/duration meta line, not a hero element.
// -----------------------------------------------------------------------------

function TypeIcon({type}: {type: string}) {
  const isPlayable = type === 'WORKSHOP' || type === 'VIDEO';
  return isPlayable ? <PlayIcon /> : <RepoIcon />;
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
      <path d="M7 4.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

function RepoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
