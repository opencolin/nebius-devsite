// /apps — index of community + hackathon projects.
//
// Cards mirror the upstream nebius-builders-3 design: each project has a
// gradient cover area at the top (different look per hackathon / award),
// then title + tagline + tag chips below, with a builder footer. Award
// and product-focus pills are positioned over the cover so they read
// against the colored backdrop instead of competing with the title.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {useMemo, useState} from 'react';

import {Label, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';
import {formatNumber} from '@/lib/format';

import page from '@/styles/page.module.scss';
import styles from './apps.module.scss';

interface Project {
  slug: string;
  title: string;
  tagline: string;
  builder_handle: string;
  tags: string[];
  product_focus: string[];
  stars: number;
  featured: boolean;
  hackathon: 'robotics' | 'jetbrains' | 'none';
  award?: 'winner' | 'runner-up' | '3rd' | 'finalist' | null;
  category?: 'Other' | null;
}

const FILTERS = [
  'All',
  'Featured',
  'Token Factory',
  'AI Cloud',
  'OpenClaw',
  'Soperator',
  'Tavily',
  'Robotics',
  'JetBrains',
  'Other',
] as const;
type Filter = (typeof FILTERS)[number];

const PRODUCT_FILTER_KEY: Record<string, string> = {
  'Token Factory': 'token_factory',
  'AI Cloud': 'ai_cloud',
  'OpenClaw': 'openclaw',
  'Soperator': 'soperator',
  'Tavily': 'tavily',
};

const PRODUCT_LABEL: Record<string, string> = {
  token_factory: 'Token Factory',
  ai_cloud: 'AI Cloud',
  openclaw: 'OpenClaw',
  soperator: 'Soperator',
  tavily: 'Tavily',
};

export const getStaticProps: GetStaticProps<{projects: Project[]}> = async () => {
  const directus = directusServer();
  const projects = (await directus.request(
    readItems('projects', {
      sort: ['-featured', '-stars', 'title'],
      fields: ['slug', 'title', 'tagline', 'builder_handle', 'tags', 'product_focus', 'stars', 'featured', 'hackathon', 'award', 'category'],
      limit: -1,
    }),
  )) as Project[];
  return {props: {projects}, revalidate: 60};
};

export default function ProjectsPage({
  projects,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return projects;
    if (filter === 'Featured') return projects.filter((p) => p.featured || p.award);
    if (filter === 'Robotics') return projects.filter((p) => p.hackathon === 'robotics');
    if (filter === 'JetBrains') return projects.filter((p) => p.hackathon === 'jetbrains');
    if (filter === 'Other') return projects.filter((p) => p.category === 'Other');
    const key = PRODUCT_FILTER_KEY[filter];
    if (key) return projects.filter((p) => (p.product_focus ?? []).includes(key));
    return projects;
  }, [projects, filter]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {} as Record<Filter, number>;
    c.All = projects.length;
    c.Featured = projects.filter((p) => p.featured || p.award).length;
    c.Robotics = projects.filter((p) => p.hackathon === 'robotics').length;
    c.JetBrains = projects.filter((p) => p.hackathon === 'jetbrains').length;
    c.Other = projects.filter((p) => p.category === 'Other').length;
    for (const [label, key] of Object.entries(PRODUCT_FILTER_KEY)) {
      c[label as Filter] = projects.filter((p) => (p.product_focus ?? []).includes(key)).length;
    }
    return c;
  }, [projects]);

  return (
    <PublicLayout>
      <Head>
        <title>{`Apps · Nebius Builders`}</title>
        <meta
          name="description"
          content="Open-source apps built on Nebius by the community."
        />
      </Head>
      <div className={page.container}>
        <PageHeader
          eyebrow="Apps"
          title="Built on Nebius"
          description={`${projects.length} community apps. Featured + award-winning entries surface first.`}
        />
      </div>

      {/* Sticky filter strip — full-width wrapper outside page.container so
          bg + border-bottom span the viewport when pinned. Inner container
          re-centers the chip row at the 1240px max. */}
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
          {filtered.map((p) => (
            <Link key={p.slug} href={`/apps/${p.slug}`} className={styles.cardLink}>
              <article className={styles.card}>
                <ProjectCover project={p} />
                <div className={styles.cardBody}>
                  <header className={styles.cardHead}>
                    <Text variant="caption-2" color="secondary" className={styles.byline}>
                      by @{p.builder_handle}
                      {p.hackathon !== 'none'
                        ? ` · ${p.hackathon === 'robotics' ? 'Robotics hack' : 'JetBrains hack'}`
                        : ''}
                    </Text>
                    <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                      {p.title}
                    </Text>
                  </header>
                  <Text variant="body-2" color="secondary" className={styles.cardTagline}>
                    {p.tagline}
                  </Text>
                  {(p.product_focus?.length ?? 0) > 0 || (p.tags?.length ?? 0) > 0 ? (
                    <div className={styles.tagRow}>
                      {(p.product_focus ?? []).map((pf) => (
                        <Label key={`pf-${pf}`} theme="info" size="xs">
                          {PRODUCT_LABEL[pf] ?? pf}
                        </Label>
                      ))}
                      {(p.tags ?? []).slice(0, Math.max(0, 4 - (p.product_focus?.length ?? 0))).map((t) => (
                        <Label key={`tag-${t}`} theme="normal" size="xs">
                          {t}
                        </Label>
                      ))}
                    </div>
                  ) : null}
                </div>
                {p.stars > 0 ? (
                  <footer className={styles.cardFooter}>
                    <Text variant="caption-2" color="secondary">
                      ★ {formatNumber(p.stars)} stars
                    </Text>
                  </footer>
                ) : null}
              </article>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

// -----------------------------------------------------------------------------
// ProjectCover — gradient cover area with optional award/featured pill.
//
// Gradient choice mirrors upstream's "color codes the kind of work":
//   - winner / runner-up / 3rd → lime peak (matches the trophy)
//   - featured                  → cool blue → navy
//   - robotics hack             → teal → forest
//   - jetbrains hack            → purple → magenta (JetBrains brand)
//   - everything else           → muted navy
// -----------------------------------------------------------------------------

function ProjectCover({project}: {project: Project}) {
  const variantClass = coverVariant(project);
  return (
    <div className={`${styles.cover} ${variantClass}`} aria-hidden>
      {/* Top-left award/featured */}
      <div className={styles.coverTopLeft}>
        <AwardPill award={project.award} featured={project.featured} category={project.category} />
      </div>
      {/* Top-right primary product focus */}
      {project.product_focus?.[0] ? (
        <div className={styles.coverTopRight}>
          <span className={styles.coverPill}>
            {PRODUCT_LABEL[project.product_focus[0]] ?? project.product_focus[0]}
          </span>
        </div>
      ) : null}
      {/* Watermark — first letter of the title in a translucent oversize glyph */}
      <span className={styles.coverGlyph}>{project.title.charAt(0).toUpperCase()}</span>
    </div>
  );
}

function coverVariant(p: Project): string {
  if (p.award === 'winner' || p.award === 'runner-up' || p.award === '3rd') {
    return styles.coverAward;
  }
  if (p.featured) return styles.coverFeatured;
  if (p.hackathon === 'robotics') return styles.coverRobotics;
  if (p.hackathon === 'jetbrains') return styles.coverJetbrains;
  return styles.coverDefault;
}

function AwardPill({
  award,
  featured,
  category,
}: {
  award?: Project['award'];
  featured?: boolean;
  category?: Project['category'];
}) {
  if (award === 'winner') {
    return <span className={`${styles.coverPill} ${styles.coverPillAward}`}>★ Winner</span>;
  }
  if (award === 'runner-up') {
    return <span className={`${styles.coverPill} ${styles.coverPillAward}`}>★ Runner-up</span>;
  }
  if (award === '3rd') {
    return <span className={`${styles.coverPill} ${styles.coverPillAward}`}>★ 3rd</span>;
  }
  if (award === 'finalist') {
    return <span className={`${styles.coverPill}`}>Finalist</span>;
  }
  if (featured) {
    return <span className={`${styles.coverPill} ${styles.coverPillFeatured}`}>Featured</span>;
  }
  if (category === 'Other') {
    return <span className={`${styles.coverPill}`}>Other</span>;
  }
  return null;
}
