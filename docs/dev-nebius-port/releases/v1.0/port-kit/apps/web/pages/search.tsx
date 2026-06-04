// /search?q=… — full-grid search results across events + library + apps.
// Server-fetches /api/search at getServerSideProps so the page renders
// with hits already in the HTML (good for SEO + paste-bar URLs). Filter
// chips at the top let the visitor narrow to a single kind without
// re-issuing the query.

import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import {useMemo, useState} from 'react';

import {Button, Label, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import type {SearchHit, SearchResponse} from '@/lib/search-types';

import page from '@/styles/page.module.scss';
import styles from './search.module.scss';

interface Props {
  q: string;
  hits: SearchHit[];
  counts: SearchResponse['counts'];
  error: string | null;
}

const KIND_LABEL: Record<SearchHit['kind'], string> = {
  event: 'Event',
  library: 'Library',
  app: 'App',
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const q = typeof ctx.query.q === 'string' ? ctx.query.q.trim() : '';
  if (!q) {
    return {props: {q: '', hits: [], counts: {event: 0, library: 0, app: 0, total: 0}, error: null}};
  }

  // Build the absolute URL to /api/search. In dev this is localhost;
  // in prod it's behind Front Door — both reachable from the Node
  // server via the request's host header.
  const proto = (ctx.req.headers['x-forwarded-proto'] as string) || 'http';
  const host = ctx.req.headers.host;
  const url = `${proto}://${host}/api/search?q=${encodeURIComponent(q)}&limit=48`;

  try {
    const r = await fetch(url);
    if (!r.ok) {
      return {
        props: {q, hits: [], counts: {event: 0, library: 0, app: 0, total: 0}, error: `Search returned ${r.status}`},
      };
    }
    const j = (await r.json()) as SearchResponse;
    return {props: {q, hits: j.hits, counts: j.counts, error: null}};
  } catch (err) {
    return {
      props: {q, hits: [], counts: {event: 0, library: 0, app: 0, total: 0}, error: (err as Error).message},
    };
  }
};

export default function SearchPage({
  q,
  hits,
  counts,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [activeKind, setActiveKind] = useState<SearchHit['kind'] | null>(null);

  const visible = useMemo(
    () => (activeKind ? hits.filter((h) => h.kind === activeKind) : hits),
    [hits, activeKind],
  );

  return (
    <PublicLayout>
      <Head>
        <title>{q ? `“${q}” · Search` : 'Search'}</title>
      </Head>

      <section className={styles.hero}>
        <div className={page.container}>
          <Text variant="caption-2" className={styles.heroEyebrow}>
            Search
          </Text>
          <Text variant="display-2" as="h1" className={styles.heroTitle}>
            {q ? (
              <>
                Results for <span className={styles.queryHighlight}>&ldquo;{q}&rdquo;</span>
              </>
            ) : (
              'What are you looking for?'
            )}
          </Text>
          {q ? (
            <Text variant="body-2" color="secondary" className={styles.heroLede}>
              {counts.total === 0
                ? 'No matches. Try a shorter query, or check the navigation for the section you want.'
                : `${counts.total} match${counts.total === 1 ? '' : 'es'} across events, library, and apps.`}
            </Text>
          ) : (
            <Text variant="body-2" color="secondary" className={styles.heroLede}>
              Use the search bar in the header to look across events, library
              entries, and community apps in one place.
            </Text>
          )}
        </div>
      </section>

      {q && counts.total > 0 ? (
        <div className={styles.filters}>
          <div className={page.container}>
            <div className={styles.chips}>
              <Button
                view={activeKind == null ? 'action' : 'outlined'}
                size="m"
                onClick={() => setActiveKind(null)}
              >
                All ({counts.total})
              </Button>
              {(Object.keys(KIND_LABEL) as SearchHit['kind'][]).map((k) => (
                <Button
                  key={k}
                  view={activeKind === k ? 'action' : 'outlined'}
                  size="m"
                  disabled={counts[k] === 0}
                  onClick={() => setActiveKind((cur) => (cur === k ? null : k))}
                >
                  {KIND_LABEL[k]} ({counts[k]})
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <main className={page.container} style={{paddingTop: 24, paddingBottom: 80}}>
        {error ? (
          <Text color="danger" className={styles.error}>
            Search failed: {error}
          </Text>
        ) : null}

        {q && visible.length > 0 ? (
          <div className={styles.grid}>
            {visible.map((h) => (
              <a
                key={`${h.kind}-${h.id}`}
                href={h.url}
                {...(h.url.startsWith('http')
                  ? {target: '_blank', rel: 'noreferrer'}
                  : {})}
                className={styles.card}
              >
                <Label theme="utility" size="s">
                  {KIND_LABEL[h.kind]}
                </Label>
                <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                  {h.title}
                </Text>
                {h.meta ? (
                  <Text variant="caption-2" color="hint" className={styles.cardMeta}>
                    {h.meta}
                  </Text>
                ) : null}
                {h.blurb ? (
                  <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                    {h.blurb}
                  </Text>
                ) : null}
                {h.tags && h.tags.length > 0 ? (
                  <div className={styles.tagRow}>
                    {h.tags.slice(0, 4).map((t) => (
                      <Label key={t} theme="normal" size="xs">
                        {t}
                      </Label>
                    ))}
                  </div>
                ) : null}
                <span className={styles.cardCta}>Open &rarr;</span>
              </a>
            ))}
          </div>
        ) : null}
      </main>
    </PublicLayout>
  );
}
