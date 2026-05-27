// /ecosystem — unified directory of community apps + partner integrations.
//
// Surfaces both data sources in one mixed grid with a Kind filter chip,
// so visitors can browse the full Nebius ecosystem in one place. The
// canonical pages for each source still exist:
//
//   /apps          → community-built projects only (Directus `projects`)
//   /integrations  → partner integrations only (ecosystem-partners.ts)
//   /ecosystem     → the union of the two, mixed in one grid
//
// Filter chips: All / Community / Integration (kind axis) plus the
// product chips that apply to both kinds (Token Factory, AI Cloud,
// OpenClaw, Soperator, Tavily). Apps-only chips like Featured /
// Robotics / JetBrains stay on /apps; integration-only category chips
// (Agents, No-code, Coding, etc.) stay on /integrations.
//
// Renders two card components in the same grid:
//   - ProjectCard:     rich cover-gradient card for community apps
//   - IntegrationCard: simpler text card with "INTEGRATION" eyebrow
// CSS grid's align-items: stretch makes them same height within a row;
// the visual difference signals the kind without breaking the rhythm.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {useMemo, useState} from 'react';

import {Label, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';
import {
  CATEGORY_LABEL,
  ECOSYSTEM_PARTNERS,
  PRODUCT_LABEL as PARTNER_PRODUCT_LABEL,
  type EcosystemPartner,
} from '@/lib/ecosystem-partners';
import {formatNumber} from '@/lib/format';
import {isPlaceholderProject} from '@/lib/projects';

import page from '@/styles/page.module.scss';
// Reuses /apps card SCSS so the visual rhythm matches between /apps
// (community-only) and /ecosystem (mixed). New integration-specific
// classes (.integrationCard, .integrationBody, .integrationKind) live
// in apps.module.scss alongside the project card classes.
import styles from './apps/apps.module.scss';

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
  'Community',
  'Integration',
  'Token Factory',
  'AI Cloud',
  'OpenClaw',
  'Soperator',
  'Tavily',
] as const;
type Filter = (typeof FILTERS)[number];

// Two product vocabularies need bridging:
//   - Directus `product_focus` enum: tokenfactory / aicloud / openclaw / soperator / tavily
//   - Partner data:                  token-factory / ai-cloud / tavily (hyphenated)
// PRODUCT_KEYS holds the matching value in each so a single chip can
// filter both data sources without duplication.
const PRODUCT_KEYS: Record<string, {apps: string; integrations: string | null}> = {
  'Token Factory': {apps: 'tokenfactory', integrations: 'token-factory'},
  'AI Cloud': {apps: 'aicloud', integrations: 'ai-cloud'},
  OpenClaw: {apps: 'openclaw', integrations: null}, // no integration partner uses openclaw
  Soperator: {apps: 'soperator', integrations: null},
  Tavily: {apps: 'tavily', integrations: 'tavily'},
};

// Apps store the apps-vocabulary value; render-time label lookup.
const APPS_PRODUCT_LABEL: Record<string, string> = {
  tokenfactory: 'Token Factory',
  aicloud: 'AI Cloud',
  openclaw: 'OpenClaw',
  soperator: 'Soperator',
  tavily: 'Tavily',
};

export const getStaticProps: GetStaticProps<{
  projects: Project[];
  partners: EcosystemPartner[];
}> = async () => {
  const directus = directusServer();
  const raw = (await directus.request(
    readItems('projects', {
      sort: ['-featured', '-stars', 'title'],
      fields: ['slug', 'title', 'tagline', 'builder_handle', 'tags', 'product_focus', 'stars', 'featured', 'hackathon', 'award', 'category'],
      limit: -1,
    }),
  )) as Project[];
  const projects = raw.filter((p) => !isPlaceholderProject(p));
  return {props: {projects, partners: ECOSYSTEM_PARTNERS}, revalidate: 60};
};

export default function EcosystemPage({
  projects,
  partners,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [filter, setFilter] = useState<Filter>('All');

  const filteredProjects = useMemo(() => {
    if (filter === 'All' || filter === 'Community') return projects;
    if (filter === 'Integration') return [];
    const key = PRODUCT_KEYS[filter]?.apps;
    if (!key) return projects;
    return projects.filter((p) => (p.product_focus ?? []).includes(key));
  }, [projects, filter]);

  const filteredPartners = useMemo(() => {
    if (filter === 'All' || filter === 'Integration') return partners;
    if (filter === 'Community') return [];
    const key = PRODUCT_KEYS[filter]?.integrations;
    if (!key) return [];
    return partners.filter((p) =>
      p.products.includes(key as EcosystemPartner['products'][number]),
    );
  }, [partners, filter]);

  // Per-chip counts use the full datasets, not filtered ones, so each
  // chip shows "if I pick this, here's what I'll get" rather than zeros.
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {} as Record<Filter, number>;
    c.All = projects.length + partners.length;
    c.Community = projects.length;
    c.Integration = partners.length;
    for (const [label, keys] of Object.entries(PRODUCT_KEYS)) {
      const appsCount = projects.filter((p) =>
        (p.product_focus ?? []).includes(keys.apps),
      ).length;
      const intCount = keys.integrations
        ? partners.filter((p) =>
            p.products.includes(keys.integrations as EcosystemPartner['products'][number]),
          ).length
        : 0;
      c[label as Filter] = appsCount + intCount;
    }
    return c;
  }, [projects, partners]);

  const totalVisible = filteredProjects.length + filteredPartners.length;
  const totalAll = projects.length + partners.length;

  return (
    <PublicLayout>
      <Head>
        <title>{`Ecosystem · Nebius Builders`}</title>
        <meta
          name="description"
          content="The Nebius ecosystem — community apps built on Nebius plus partner integrations that plug into our products."
        />
      </Head>
      <div className={page.container}>
        <PageHeader
          eyebrow="Ecosystem"
          title="The Nebius ecosystem"
          description={`${totalAll} entries — ${projects.length} community apps and ${partners.length} partner integrations. For community apps only, see /apps. For integrations only, see /integrations.`}
        />
      </div>

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
        {totalVisible === 0 ? (
          <Text
            color="secondary"
            style={{display: 'block', padding: '48px 0', textAlign: 'center'}}
          >
            No entries match this filter. Pick a different one.
          </Text>
        ) : (
          <div className={page.grid3}>
            {filteredProjects.map((p) => (
              <ProjectCard key={`p-${p.slug}`} project={p} />
            ))}
            {filteredPartners.map((p) => (
              <IntegrationCard key={`i-${p.docsUrl}`} partner={p} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

// -----------------------------------------------------------------------------
// ProjectCard — community app card with cover gradient + builder byline.
// Mirrors the inline rendering on /apps so the visual treatment matches.
// -----------------------------------------------------------------------------

function ProjectCard({project: p}: {project: Project}) {
  return (
    <Link href={`/apps/${p.slug}`} className={styles.cardLink}>
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
                  {APPS_PRODUCT_LABEL[pf] ?? pf}
                </Label>
              ))}
              {(p.tags ?? [])
                .slice(0, Math.max(0, 4 - (p.product_focus?.length ?? 0)))
                .map((t) => (
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
  );
}

// -----------------------------------------------------------------------------
// IntegrationCard — partner integration card. No cover area (integrations
// don't have hackathon/award gradients to differentiate them). External
// link opens in a new tab. The "INTEGRATION" eyebrow distinguishes it
// from community-built apps when both render in the same grid.
// -----------------------------------------------------------------------------

function IntegrationCard({partner: p}: {partner: EcosystemPartner}) {
  return (
    <a
      href={p.docsUrl}
      target="_blank"
      rel="noreferrer"
      className={styles.cardLink}
      aria-label={`${p.name} — view integration docs`}
    >
      <article className={`${styles.card} ${styles.integrationCard}`}>
        <div className={styles.integrationBody}>
          <Text variant="caption-2" color="secondary" className={styles.integrationKind}>
            INTEGRATION
          </Text>
          <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
            {p.name}
          </Text>
          <Text variant="body-2" color="secondary" className={styles.cardTagline}>
            {p.blurb}
          </Text>
          <div className={styles.tagRow}>
            {p.products.map((prod) => (
              <Label key={prod} theme="info" size="xs">
                {PARTNER_PRODUCT_LABEL[prod]}
              </Label>
            ))}
            <Label theme="utility" size="xs">
              {CATEGORY_LABEL[p.category]}
            </Label>
          </div>
        </div>
        <footer className={styles.cardFooter}>
          <Text variant="caption-2" color="info">
            View docs ↗
          </Text>
        </footer>
      </article>
    </a>
  );
}

// -----------------------------------------------------------------------------
// ProjectCover — gradient cover area with award/featured/hackathon pill.
// Same shape as the cover used on /apps; kept inline because it depends on
// the apps CSS module that this file already imports.
// -----------------------------------------------------------------------------

function ProjectCover({project}: {project: Project}) {
  const variantClass = coverVariant(project);
  return (
    <div className={`${styles.cover} ${variantClass}`} aria-hidden>
      <div className={styles.coverTopLeft}>
        <AwardPill
          award={project.award}
          featured={project.featured}
          category={project.category}
        />
      </div>
      {project.product_focus?.[0] ? (
        <div className={styles.coverTopRight}>
          <span className={styles.coverPill}>
            {APPS_PRODUCT_LABEL[project.product_focus[0]] ?? project.product_focus[0]}
          </span>
        </div>
      ) : null}
      <span className={styles.coverGlyph}>
        {project.title.charAt(0).toUpperCase()}
      </span>
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
