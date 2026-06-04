// /token-factory — product landing page for Nebius Token Factory.
//
// Mirrors dev.nebius.com/token-factory:
//   - Dark hero with OpenAI-compatible API pitch + quick-start CTAs
//   - Quickstarts & pinned entries
//   - Playlists (official YouTube series)
//   - Build / integrate section (docs + API refs)
//   - Framework + agent integrations (docs)
//   - Post-training & customization
//   - Blog & deep-dive guides

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';

import {Button, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {ResourceCard, type ResourceEntry} from '@/components/product/ResourceCard';
import {directusServer} from '@/lib/directus';
import type {LibraryArticleRow} from '@/lib/types';

import styles from '@/styles/product-page.module.scss';

interface Props {
  pinned: ResourceEntry[];
  playlists: ResourceEntry[];
  docs: ResourceEntry[];
  videos: ResourceEntry[];
  blogs: ResourceEntry[];
  repos: ResourceEntry[];
}

function toEntry(r: LibraryArticleRow): ResourceEntry {
  return {
    slug: r.slug,
    title: r.title,
    blurb: r.blurb,
    type: r.type,
    level: r.level,
    duration_min: r.duration_min ?? null,
    external_url: r.external_url ?? null,
    is_official: r.is_official,
    pinned: r.pinned ?? false,
  };
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const directus = directusServer();
  const raw = (await directus.request(
    readItems('library_articles', {
      filter: {
        status: {_eq: 'published'},
        // @ts-expect-error — Directus JSON-array _contains filter
        surface: {_contains: 'token-factory'},
      },
      sort: ['-pinned', '-is_official', 'title'],
      limit: -1,
    }),
  )) as LibraryArticleRow[];

  const pinned = raw.filter((r) => r.pinned).map(toEntry);
  const playlists = raw.filter((r) => !r.pinned && r.type === 'PLAYLIST').map(toEntry);
  const docs = raw.filter((r) => !r.pinned && r.type === 'DOCS').map(toEntry);
  const videos = raw
    .filter((r) => !r.pinned && (r.type === 'VIDEO' || r.type === 'WORKSHOP'))
    .map(toEntry);
  const blogs = raw.filter((r) => !r.pinned && r.type === 'BLOG').map(toEntry);
  const repos = raw.filter((r) => !r.pinned && r.type === 'REPO').map(toEntry);

  return {props: {pinned, playlists, docs, videos, blogs, repos}, revalidate: 60};
};

export default function TokenFactoryPage({
  pinned, playlists, docs, videos, blogs, repos,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>Token Factory · Nebius Builders</title>
        <meta
          name="description"
          content="OpenAI-compatible inference API for open models. Start in minutes, scale to dedicated GPUs with post-training and workload optimization."
        />
      </Head>

      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.heroEyebrow}>Token Factory</span>
          <h1 className={styles.heroTitle}>
            Inference API for open models.
          </h1>
          <p className={styles.heroLede}>
            OpenAI-compatible API to start fast. Dedicated GPUs,
            post-training, and workload optimization when you scale.
            Start in minutes; engineer for production when it matters.
          </p>
          <div className={styles.heroCtas}>
            <Button
              view="action"
              size="l"
              href="https://tokenfactory.nebius.com/playground"
              target="_blank"
              rel="noreferrer"
            >
              Open Playground
            </Button>
            <Button
              view="outlined"
              size="l"
              href="https://docs.tokenfactory.nebius.com/quickstart"
              target="_blank"
              rel="noreferrer"
            >
              Quickstart ↗
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Pinned / Quickstarts ---- */}
      {pinned.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Quickstarts
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Build, customize, and deploy.
              </Text>
            </div>
            <div className={styles.featuredGrid}>
              {pinned.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Official Playlists ---- */}
      {playlists.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                YouTube
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Video walkthroughs.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                Official Token Factory playlist on YouTube — architecture, deep
                dives, and live demos from the team — plus a curated
                Build-with-Token-Factory series.
              </Text>
            </div>
            <div className={styles.featuredGrid}>
              {playlists.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Videos & Workshops ---- */}
      {videos.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Videos & Workshops
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Learn from live builds.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {videos.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Docs / API references ---- */}
      {docs.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Docs & reference
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Integrate with your stack.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                API reference, framework integrations (LangChain, LlamaIndex),
                agent frameworks (Agno, CrewAI, Pydantic AI), and post-training
                guides.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {docs.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- In-depth guides ---- */}
      {blogs.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                In-depth technical resources
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Production inference is more than serving a model.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                Architecture breakdowns for routing, MoE latency, speculative
                decoding, chat app design, and more.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {blogs.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Repos / Cookbooks ---- */}
      {repos.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                GitHub
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Cookbooks and examples.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {repos.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Console CTA ---- */}
      <div className={styles.consoleCta}>
        <div className={styles.consoleCtaInner}>
          <Text variant="header-1" as="h2">
            Ready to make your first API call?
          </Text>
          <Button
            view="action"
            size="l"
            href="https://docs.tokenfactory.nebius.com/quickstart"
            target="_blank"
            rel="noreferrer"
          >
            Quickstart ↗
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
