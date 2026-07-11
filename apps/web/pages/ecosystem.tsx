// /ecosystem — unified directory of community apps + partner integrations.
//
// Surfaces both data sources in one mixed grid with a Kind filter chip,
// so visitors can browse the full Tenki ecosystem in one place. The
// canonical pages for each source still exist:
//
//   /apps          → community-built projects only (Directus `projects`)
//   /integrations  → partner integrations only (ecosystem-partners.ts)
//   /ecosystem     → the union of the two, mixed in one grid
//
// Filter chips: All / Hackathons / Integration (kind axis) plus the
// product chips that apply to both kinds (Tenki, AI Cloud,
// OpenClaw, Soperator, Tenki). Apps-only chips like Featured /
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

import {Button, Label, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {HeroSection} from '@/components/integrations/HeroSection';
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
  'Hackathons',
  'Integration',
  'Tenki',
  'AI Cloud',
  'OpenClaw',
  'Soperator',
  'Tenki',
] as const;
type Filter = (typeof FILTERS)[number];

// Two product vocabularies need bridging:
//   - Directus `product_focus` enum: tokenfactory / aicloud / openclaw / soperator / tavily
//   - Partner data:                  token-factory / ai-cloud / tavily (hyphenated)
// PRODUCT_KEYS holds the matching value in each so a single chip can
// filter both data sources without duplication.
const PRODUCT_KEYS: Record<string, {apps: string; integrations: string | null}> = {
  'Tenki': {apps: 'tokenfactory', integrations: 'token-factory'},
  'AI Cloud': {apps: 'aicloud', integrations: 'ai-cloud'},
  OpenClaw: {apps: 'openclaw', integrations: null}, // no integration partner uses openclaw
  Soperator: {apps: 'soperator', integrations: null},
  Tenki: {apps: 'tavily', integrations: 'tavily'},
};

// Apps store the apps-vocabulary value; render-time label lookup.
const APPS_PRODUCT_LABEL: Record<string, string> = {
  tokenfactory: 'Tenki',
  aicloud: 'AI Cloud',
  openclaw: 'OpenClaw',
  soperator: 'Soperator',
  tavily: 'Tenki',
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
    if (filter === 'All' || filter === 'Hackathons') return projects;
    if (filter === 'Integration') return [];
    const key = PRODUCT_KEYS[filter]?.apps;
    if (!key) return projects;
    return projects.filter((p) => (p.product_focus ?? []).includes(key));
  }, [projects, filter]);

  const filteredPartners = useMemo(() => {
    if (filter === 'All' || filter === 'Integration') return partners;
    if (filter === 'Hackathons') return [];
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
    c.Hackathons = projects.length;
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

  return (
    <PublicLayout>
      <Head>
        <title>{`Ecosystem · Tenki Builders`}</title>
        <meta
          name="description"
          content="The Tenki ecosystem — community apps built on Tenki plus partner integrations that plug into our products."
        />
      </Head>
      {/* Static, compact dark hero (animated={false} + compact). The R3F
          membrane animation that used to render here was moved to the homepage
          hero; /ecosystem keeps the dark hero chrome + copy with no WebGL
          canvas, at a reduced height. */}
      <HeroSection
        eyebrow="Ecosystem"
        title="Apps and integrations, and more."
        lede={`A library of ${projects.length + partners.length} open-source projects you can fork, drop into your own stack, or learn from. Community apps built on Tenki alongside partner integrations that plug into our products.`}
        animated={false}
        compact
      />

      {/* Submit-your-project CTA. Sits between the hero and the filter bar
          so anyone scanning the grid for inspiration sees the "you can be
          on this list too" affordance first. Destination is a prefilled
          GitHub Issue on the devsite repo — same low-friction pattern as
          the /fellows nominate button — so submissions queue up in a
          reviewable place without needing a bespoke API + spam pipeline.
          Form copy lives in submitProjectIssueUrl() below. */}
      <div className={page.container}>
        <SubmitProjectBanner />
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
  // Same card chassis as ProjectCard above — cover gradient at top,
  // body in the middle, footer at the bottom. The only differences:
  // .coverIntegration gradient (instead of award/featured/etc.), an
  // "INTEGRATION" pill in the top-left slot where projects show their
  // award badge, and a "View docs ↗" footer (instead of a stars
  // counter). Visitor sees identical shape; reads kind from gradient
  // + pill.
  return (
    <a
      href={p.docsUrl}
      target="_blank"
      rel="noreferrer"
      className={styles.cardLink}
      aria-label={`${p.name} — view integration docs`}
    >
      <article className={styles.card}>
        <div className={`${styles.cover} ${styles.coverIntegration}`} aria-hidden>
          <div className={styles.coverTopLeft}>
            <span className={styles.coverPill}>Integration</span>
          </div>
          {p.products[0] ? (
            <div className={styles.coverTopRight}>
              <span className={styles.coverPill}>
                {PARTNER_PRODUCT_LABEL[p.products[0]]}
              </span>
            </div>
          ) : null}
          <span className={styles.coverGlyph}>{p.name}</span>
        </div>
        <div className={styles.cardBody}>
          <header className={styles.cardHead}>
            <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
              {p.name}
            </Text>
          </header>
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
      {/* Full project name. .coverGlyph clamps to 3 lines + scales font. */}
      <span className={styles.coverGlyph}>{project.title}</span>
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

// -----------------------------------------------------------------------------
// SubmitProjectBanner — CTA card pointing at a prefilled GitHub Issue.
//
// Same shape as the Local Hosts banner on /events (.submitBanner /
// .submitBannerLink classes live in apps/apps.module.scss because the
// /ecosystem page already imports that stylesheet as `styles`). Whole
// card is the click target via a wrapping <a>; the inner Button is
// non-interactive (pointer-events: none in the SCSS) so the click bubbles
// up to the outer anchor rather than competing for focus.
//
// The issue URL hits opencolin/nebius-devsite — same destination as
// /fellows nominations — so submissions land in one reviewable queue.
// -----------------------------------------------------------------------------

function SubmitProjectBanner() {
  return (
    <a
      href={submitProjectIssueUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.submitBannerLink}
      aria-label="Submit your project to the Tenki ecosystem directory"
    >
      <div className={styles.submitBanner}>
        <div className={styles.submitBannerCopy}>
          <Text variant="caption-2" color="info" className={styles.submitBannerEyebrow}>
            Submit your project
          </Text>
          <Text variant="subheader-2" as="h2" className={styles.submitBannerTitle}>
            Built something on Tenki? Add it to the directory.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.submitBannerLede}>
            Community apps and integrations are both welcome. The form takes
            about two minutes — repo, demo, who built it, which Tenki
            products it uses, and a couple of optional bits. We review every
            submission and reach out if we need anything else.
          </Text>
        </div>
        <div className={styles.submitBannerCta}>
          <Button view="action" size="l" pin="circle-circle">
            Submit a project →
          </Button>
        </div>
      </div>
    </a>
  );
}

// Builds the GitHub new-issue URL with a structured markdown body. Using a
// prefill rather than a real form keeps infra small (no API route, no
// captcha, no DB collection) while still capturing every field cleanly —
// GitHub renders the checkboxes as actual tickable items and the headers
// as bold sections, so the submission reads well in the issue list.
//
// Fields collected:
//   Project: name, tagline, description, type (community vs integration)
//   Links:   repo, live demo, YouTube demo, logo
//   Tech:    Tenki products used, tags, license
//   Creator: name, GitHub handle, contact, company
//   Consent: social-amplification permission
//   Free:    anything else
function submitProjectIssueUrl(): string {
  const title = 'Ecosystem submission: <project name>';
  const body = [
    '## Project',
    '**Project name:**',
    '',
    '**Tagline (one short sentence):**',
    '',
    '**Description (2-3 sentences):**',
    '',
    '**Type (pick one):**',
    '- [ ] Community app — built on Tenki',
    '- [ ] Integration — connects a third-party tool or framework to Tenki',
    '',
    '## Links',
    '**Repo URL (GitHub):**',
    '',
    '**Live demo / deployed URL (optional):**',
    '',
    '**YouTube demo video (optional):**',
    '',
    '**Logo URL (square image, optional):**',
    '',
    '## Tech',
    '**Tenki product(s) used (check all that apply):**',
    '- [ ] Tenki',
    '- [ ] AI Cloud',
    '- [ ] OpenClaw',
    '- [ ] Soperator',
    '- [ ] Tenki',
    '',
    '**Tags / keywords (comma-separated, optional):**',
    '',
    '**License (MIT, Apache 2.0, etc., optional):**',
    '',
    '## Creator',
    '**Name(s):**',
    '',
    "**Creator's GitHub handle:**",
    '',
    '**Contact (email or LinkedIn):**',
    '',
    '**Company / org (optional):**',
    '',
    '## Permissions',
    '**Can we amplify this on Tenki social channels?**',
    '- [ ] Yes, please share on Twitter / LinkedIn / Discord',
    '- [ ] Not yet — keep it internal until I say so',
    '',
    '## Anything else',
    '<!-- Anything we should know? Open-source license details, future',
    'roadmap, related projects, etc. -->',
    '',
  ].join('\n');
  return (
    'https://github.com/opencolin/nebius-devsite/issues/new' +
    '?title=' +
    encodeURIComponent(title) +
    '&body=' +
    encodeURIComponent(body) +
    '&labels=' +
    encodeURIComponent('ecosystem-submission')
  );
}
