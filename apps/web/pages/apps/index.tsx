// /apps — the Nebius Ecosystem directory.
//
// Combines two data sources into a single grid:
//
//   1. Community projects from the Directus `projects` collection (cards
//      with a colored cover, builder byline, stars footer — the original
//      /apps card shape, unchanged).
//   2. Partner integrations from src/lib/ecosystem-partners.ts (cards
//      with a simpler text-only shape — what used to live at the now-
//      decommissioned /integrations route).
//
// Filter row: All + Community / Integration (kind), then product chips
// (Token Factory, AI Cloud, OpenClaw, Soperator, Tavily) that apply to
// both kinds. The old apps-only chips (Featured / Robotics / JetBrains /
// Other) were dropped to keep the chip row manageable — they'd only
// make sense when Kind=Community anyway. Easy to re-add as a second
// chip row if curation needs it.
//
// URL stays /apps (label says "Ecosystem"). Renaming the URL would
// break every /apps/<slug> deep link, the sitemap entries, and the
// project detail page (OpenClaw, etc.) — all of which now serve as
// canonical URLs for community projects. /integrations 301-redirects
// to /apps via next.config.js.

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
// Filter rows above use a single display label; PRODUCT_KEYS holds the
// matching value in each vocabulary so a single chip can filter both
// data sources without duplication.
const PRODUCT_KEYS: Record<string, {apps: string; integrations: string | null}> = {
  'Token Factory': {apps: 'tokenfactory', integrations: 'token-factory'},
  'AI Cloud': {apps: 'aicloud', integrations: 'ai-cloud'},
  OpenClaw: {apps: 'openclaw', integrations: null}, // no integration partner uses openclaw
  Soperator: {apps: 'soperator', integrations: null},
  Tavily: {apps: 'tavily', integrations: 'tavily'},
};

// Label for the small product chips that appear ON each card. Apps store
// the apps-vocabulary value (tokenfactory) but we want to render
// "Token Factory" — same mapping the old PRODUCT_LABEL did.
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

  // Apply the active filter to each data source independently. Kind
  // filters (Community / Integration) zero out the other source entirely.
  // Product filters narrow each source by its own vocabulary.
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
    return partners.filter((p) => p.products.includes(key as EcosystemPartner['products'][number]));
  }, [partners, filter]);

  // Per-chip counts use the full datasets (not the currently-filtered
  // ones) so each chip's number is a stable "if I pick this, here's
  // what I'll get" preview, not a post-filter total.
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {} as Record<Filter, number>;
    c.All = projects.length + partners.length;
    c.Community = projects.length;
    c.Integration = partners.length;
    for (const [label, keys] of Object.entries(PRODUCT_KEYS)) {
      const appsCount = projects.filter((p) => (p.product_focus ?? []).includes(keys.apps)).length;
      const intCount = keys.integrations
        ? partners.filter((p) => p.products.includes(keys.integrations as EcosystemPartner['products'][number])).length
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
          title="Built on Nebius"
          description={`${totalAll} entries — ${projects.length} community apps and ${partners.length} partner integrations. Filter by product or by kind.`}
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
        {/* Single grid hosting both kinds. Projects render as the rich
            ProjectCard with a cover gradient; integrations render as the
            simpler IntegrationCard with a "View docs" CTA. CSS grid's
            align-items: stretch keeps cards in the same row at the same
            height, so the visual difference signals kind without
            breaking the rhythm. */}
        {totalVisible === 0 ? (
          <Text color="secondary" style={{display: 'block', padding: '48px 0', textAlign: 'center'}}>
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
// Existing visual treatment, just extracted into its own component so the
// grid loop above stays readable when paired with IntegrationCard.
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
  );
}

// -----------------------------------------------------------------------------
// IntegrationCard — partner integration card. Shorter than ProjectCard
// (no cover area, no builder byline). Always opens external docs in a
// new tab. The "Integration" label at the top distinguishes it from
// community-built apps in the mixed grid.
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
            {APPS_PRODUCT_LABEL[project.product_focus[0]] ?? project.product_focus[0]}
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
