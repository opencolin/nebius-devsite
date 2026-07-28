// /serverless — product landing page for Nebius Serverless AI.
//
// Mirrors dev.nebius.com/serverless:
//   - Dark hero with the Jobs / Endpoints pitch
//   - Quickstarts (pinned)
//   - Jobs section
//   - Endpoints section
//   - Core patterns (repos)
//   - Video walkthroughs

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
  jobsDocs: ResourceEntry[];
  endpointsDocs: ResourceEntry[];
  repos: ResourceEntry[];
  videos: ResourceEntry[];
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
  const raw = allArticles.filter((r) => (r.surface ?? []).includes('serverless'));

  const pinned = raw.filter((r) => r.pinned).map(toEntry);

  // Split docs by keyword hint: anything with "job" in slug → Jobs section;
  // anything with "endpoint" → Endpoints; everything else in Jobs fallback.
  const allDocs = raw.filter((r) => !r.pinned && r.type === 'DOCS');
  const jobsDocs = allDocs
    .filter((r) => /job/.test(r.slug) || !/endpoint/.test(r.slug))
    .map(toEntry);
  const endpointsDocs = allDocs
    .filter((r) => /endpoint/.test(r.slug))
    .map(toEntry);

  const repos = raw.filter((r) => !r.pinned && r.type === 'REPO').map(toEntry);
  const videos = raw
    .filter((r) => !r.pinned && (r.type === 'VIDEO' || r.type === 'WORKSHOP'))
    .map(toEntry);

  return {props: {pinned, jobsDocs, endpointsDocs, repos, videos}, revalidate: 60};
};

export default function ServerlessPage({
  pinned, jobsDocs, endpointsDocs, repos, videos,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>Serverless AI · Nebius Builders</title>
        <meta
          name="description"
          content="Run containerized AI workloads on GPUs without managing infrastructure. Jobs run to completion; Endpoints serve real-time requests. Provision on demand, release automatically."
        />
      </Head>

      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.heroEyebrow}>Serverless AI</span>
          <h1 className={styles.heroTitle}>
            GPU workloads without managing infrastructure.
          </h1>
          <p className={styles.heroLede}>
            Two execution models: <strong style={{color: '#fff'}}>Jobs</strong> run
            workloads to completion. <strong style={{color: '#fff'}}>Endpoints</strong> serve
            real-time requests. Provision compute on demand, execute, release
            automatically.
          </p>
          <div className={styles.heroCtas}>
            <Button
              view="action"
              size="l"
              href="https://console.nebius.com/serverless"
              target="_blank"
              rel="noreferrer"
            >
              Open Console
            </Button>
            <Button
              view="outlined"
              size="l"
              href="https://docs.nebius.com/serverless/overview"
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
                Get to know Serverless.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                Understand how Jobs and Endpoints work — then run one.
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

      {/* ---- Jobs ---- */}
      {jobsDocs.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Jobs
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Execute workloads that run and stop.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                Training, fine-tuning, batch inference, simulations, and data
                processing pipelines — packaged as containers, scheduled on GPU.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {jobsDocs.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Endpoints ---- */}
      {endpointsDocs.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Endpoints
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Deploy long-running services.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                Inference APIs, internal tools, evaluation services, and model
                endpoints — exposed as a public URL with automatic scaling.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {endpointsDocs.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Core patterns / Repos ---- */}
      {repos.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Core patterns
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Reference implementations.
              </Text>
              <Text variant="body-2" color="secondary" className={styles.sectionLede}>
                LLM inference, training & fine-tuning, RAG pipelines, agentic
                workflows (OpenClaw), and life-science workloads — all in the
                Serverless AI cookbook.
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

      {/* ---- Videos ---- */}
      {videos.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                Video walkthroughs
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                See it in action.
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

      {/* ---- Console CTA ---- */}
      <div className={styles.consoleCta}>
        <div className={styles.consoleCtaInner}>
          <Text variant="header-1" as="h2">
            Launch your first Job or Endpoint.
          </Text>
          <Button
            view="action"
            size="l"
            href="https://console.nebius.com/serverless"
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
