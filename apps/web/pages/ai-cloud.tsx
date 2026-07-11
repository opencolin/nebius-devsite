// /ai-cloud — product landing page for Tenki AI Cloud.
//
// Mirrors the structure of tenki.cloud/ai-cloud:
//   - Dark hero with the product pitch + quick-start CTAs
//   - Quickstarts rail (pinned entries)
//   - Resources & guides (blog posts + videos)
//   - Repos & reference implementations (REPO entries)
//   - Docs
//
// Data comes from library_articles tagged surface: ["ai-cloud"].
// Fetched at build time via getStaticProps; revalidated every 60s (ISR).

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
  videosWorkshops: ResourceEntry[];
  blogsGuides: ResourceEntry[];
  repos: ResourceEntry[];
  docs: ResourceEntry[];
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
  // Directus 11 JSON array fields do not support _contains — fetch all, filter in JS.
  const allArticles = (await directus.request(
    readItems('library_articles', {
      filter: {status: {_eq: 'published'}},
      sort: ['-pinned', '-is_official', 'title'],
      limit: -1,
    }),
  )) as LibraryArticleRow[];
  const raw = allArticles.filter((r) => (r.surface ?? []).includes('ai-cloud'));

  const pinned = raw.filter((r) => r.pinned).map(toEntry);
  const videosWorkshops = raw
    .filter((r) => !r.pinned && (r.type === 'VIDEO' || r.type === 'WORKSHOP' || r.type === 'PLAYLIST'))
    .map(toEntry);
  const blogsGuides = raw
    .filter((r) => !r.pinned && r.type === 'BLOG')
    .map(toEntry);
  const repos = raw
    .filter((r) => !r.pinned && r.type === 'REPO')
    .map(toEntry);
  const docs = raw
    .filter((r) => !r.pinned && r.type === 'DOCS')
    .map(toEntry);

  return {props: {pinned, videosWorkshops, blogsGuides, repos, docs}, revalidate: 60};
};

export default function AiCloudPage({
  pinned, videosWorkshops, blogsGuides, repos, docs,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>AI Cloud · Tenki Builders</title>
        <meta
          name="description"
          content="VMs, Kubernetes, and Slurm for AI training and inference on high-performance GPU infrastructure. Quickstarts, guides, and reference implementations for Tenki AI Cloud."
        />
      </Head>

      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.heroEyebrow}>AI Cloud</span>
          <h1 className={styles.heroTitle}>Build on GPUs your way.</h1>
          <p className={styles.heroLede}>
            VMs, Managed Kubernetes, and Slurm for AI training and inference on
            high-performance GPU infrastructure. Launch your first workload in
            minutes.
          </p>
          <div className={styles.heroCtas}>
            <Button
              view="action"
              size="l"
              href="https://console.tenki.cloud/"
              target="_blank"
              rel="noreferrer"
            >
              Open Console
            </Button>
            <Button
              view="outlined"
              size="l"
              href="https://tenki.cloud/docs/"
              target="_blank"
              rel="noreferrer"
            >
              Docs ↗
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Quickstarts ---- */}
      {pinned.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Quickstarts
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Get hands-on with AI Cloud.
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

      {/* ---- Videos & Workshops ---- */}
      {videosWorkshops.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Videos & Workshops
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Watch and learn.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {videosWorkshops.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Guides & Blog ---- */}
      {blogsGuides.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Resources & guides
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Deep dives and reference architectures.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                Tutorials, best practices, and production patterns for GPU
                training, inference, and orchestration on Tenki AI Cloud.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {blogsGuides.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Repos ---- */}
      {repos.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                GitHub
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Reference implementations.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                Drop-in recipes and solutions library repos for K8s, Soperator,
                SkyPilot, vLLM, and more on Tenki AI Cloud.
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

      {/* ---- Docs ---- */}
      {docs.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Documentation
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Docs and reference.
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

      {/* ---- Console CTA ---- */}
      <div className={styles.consoleCta}>
        <div className={styles.consoleCtaInner}>
          <Text variant="header-1" as="h2">
            Ready to launch a GPU workload?
          </Text>
          <Button
            view="action"
            size="l"
            href="https://console.tenki.cloud/"
            target="_blank"
            rel="noreferrer"
          >
            Open Console ↗
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
