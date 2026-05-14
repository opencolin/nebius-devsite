// /apps/[slug] — bespoke project detail page modeled on the upstream draft
// at nebius-builders-draft-a.vercel.app/projects/<slug>:
//   1. Dark navy hero — back link, pill chips (product focus + award), title, tagline
//   2. Two-column body — About + Technologies on the left; Builders, Shipped at,
//      and "Ship one of your own" CTA card on the right
//
// Builders sidebar resolves the project's `builder_handle` against the
// `builders` collection so we can show real avatar initials + display name.
// Falls back gracefully when the row is missing (e.g. hackathon entries
// where the builder hasn't signed up yet).

import {readItems} from '@directus/sdk';
import type {GetStaticPaths, GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Button, Card, Label, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';
import {formatNumber} from '@/lib/format';

import page from '@/styles/page.module.scss';
import styles from './apps.module.scss';

interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  builder_handle: string;
  tags: string[];
  product_focus: string[];
  repo_url?: string | null;
  demo_url?: string | null;
  stars: number;
  featured: boolean;
  hackathon: 'robotics' | 'jetbrains' | 'none';
  award?: 'winner' | 'runner-up' | '3rd' | 'finalist' | null;
  category?: 'Other' | null;
  members?: number | null;
}

interface Builder {
  handle: string;
  name: string;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  tier?: string | null;
  github_handle?: string | null;
  attribution_slug?: string | null;
}

// Display label for a product_focus key. Mirrors the index page.
const PRODUCT_LABEL: Record<string, string> = {
  token_factory: 'Token Factory',
  ai_cloud: 'AI Cloud',
  openclaw: 'OpenClaw',
  soperator: 'Soperator',
  tavily: 'Tavily',
};

// Friendly labels + dates for the hackathons projects shipped at. Hand-authored
// here so we don't need a separate `hackathons` Directus collection — we have
// exactly two right now.
const HACKATHON_META: Record<
  Project['hackathon'],
  {label: string; href: string} | null
> = {
  robotics: {
    label: 'Nebius.Build Hackathon — Robotics edition',
    href: '/events',
  },
  jetbrains: {
    label: 'Nebius × JetBrains × Codex IDE Hackathon',
    href: '/events',
  },
  none: null,
};

export const getStaticPaths: GetStaticPaths = async () => {
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('projects', {fields: ['slug'], limit: -1}),
  )) as Array<{slug: string}>;
  return {
    paths: rows.map((r) => ({params: {slug: r.slug}})),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<{
  project: Project;
  builder: Builder | null;
}> = async ({params}) => {
  const slug = params?.slug as string;
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('projects', {
      filter: {slug: {_eq: slug}},
      fields: [
        'slug', 'title', 'tagline', 'description', 'builder_handle',
        'tags', 'product_focus', 'repo_url', 'demo_url', 'stars',
        'featured', 'hackathon', 'award', 'category', 'members',
      ],
      limit: 1,
    }),
  )) as unknown as Project[];
  if (!rows[0]) return {notFound: true, revalidate: 60};
  const project = rows[0];

  // Look up the builder by handle. Stored under either `handle` or
  // `attribution_slug` depending on import source — try both, take the
  // first hit.
  let builder: Builder | null = null;
  if (project.builder_handle) {
    const builders = (await directus.request(
      readItems('builders', {
        filter: {
          _or: [
            {handle: {_eq: project.builder_handle}},
            {attribution_slug: {_eq: project.builder_handle}},
          ],
        },
        fields: ['handle', 'name', 'bio', 'city', 'country', 'tier', 'github_handle', 'attribution_slug'],
        limit: 1,
      }),
    )) as Builder[];
    builder = builders[0] ?? null;
  }

  return {props: {project, builder}, revalidate: 60};
};

export default function ProjectPage({
  project,
  builder,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const hackathon = HACKATHON_META[project.hackathon];

  return (
    <PublicLayout>
      <Head>
        <title>{`${project.title} · Nebius Builders`}</title>
        <meta name="description" content={project.tagline} />
      </Head>

      {/* ---- Dark hero ---- */}
      <section className={styles.detailHero}>
        <div className={styles.detailHeroInner}>
          <Link href="/apps" className={styles.heroBackLink}>
            ← All apps
          </Link>

          <div className={styles.heroPills}>
            {(project.product_focus ?? []).map((pf) => (
              <span key={pf} className={`${styles.pill} ${styles.pillNeutral}`}>
                {PRODUCT_LABEL[pf] ?? pf}
              </span>
            ))}
            <AwardPill award={project.award} featured={project.featured} category={project.category} />
            {project.hackathon !== 'none' ? (
              <span className={`${styles.pill} ${styles.pillNeutral}`}>
                {project.hackathon === 'robotics' ? 'Robotics hack' : 'JetBrains hack'}
              </span>
            ) : null}
          </div>

          <h1 className={styles.heroTitle}>{project.title}</h1>
          <p className={styles.heroTagline}>{project.tagline}</p>
        </div>
      </section>

      {/* ---- Body: about + sidebar ---- */}
      <section className={styles.detailBody}>
        <div className={styles.detailBodyInner}>
          {/* Left: about + tech */}
          <div className={styles.detailMain}>
            <h2 className={styles.detailH2}>About this project</h2>
            <p className={styles.detailDesc}>{project.description || project.tagline}</p>

            <div className={styles.detailLinkRow}>
              {project.repo_url ? (
                <Button view="outlined" size="l" href={project.repo_url} target="_blank">
                  View on GitHub ↗
                </Button>
              ) : null}
              {project.demo_url ? (
                <Button view="outlined" size="l" href={project.demo_url} target="_blank">
                  Live demo ↗
                </Button>
              ) : null}
            </div>

            {(project.tags?.length ?? 0) > 0 ? (
              <div className={styles.detailTechBlock}>
                <h3 className={styles.detailH3}>Technologies</h3>
                <div className={styles.detailTagRow}>
                  {project.tags.map((t) => (
                    <Label key={t} theme="normal" size="s">
                      {t}
                    </Label>
                  ))}
                </div>
              </div>
            ) : null}

            {project.stars > 0 ? (
              <Text variant="caption-2" color="secondary" className={styles.detailStars}>
                ★ {formatNumber(project.stars)} stars on GitHub
              </Text>
            ) : null}
          </div>

          {/* Right: sidebar */}
          <aside className={styles.detailSidebar}>
            <Card view="filled" className={styles.sidebarCard}>
              <h3 className={styles.sidebarH3}>
                Builder{(project.members ?? 1) > 1 ? 's' : ''}
              </h3>
              <ul className={styles.builderList}>
                <li className={styles.builderRow}>
                  <Avatar name={builder?.name ?? project.builder_handle} />
                  <div className={styles.builderMeta}>
                    {builder ? (
                      <Link
                        href={`/team/${builder.attribution_slug ?? builder.handle}`}
                        className={styles.builderName}
                      >
                        {builder.name}
                      </Link>
                    ) : (
                      <span className={styles.builderName}>
                        {prettyHandle(project.builder_handle)}
                      </span>
                    )}
                    <span className={styles.builderHandle}>
                      @{builder?.handle ?? project.builder_handle}
                      {builder?.tier ? (
                        <>
                          {' · '}
                          {tierLabel(builder.tier)}
                        </>
                      ) : null}
                    </span>
                  </div>
                </li>
                {(project.members ?? 0) > 1 ? (
                  <li className={styles.builderTeamHint}>
                    + {(project.members ?? 1) - 1} teammate
                    {(project.members ?? 1) - 1 > 1 ? 's' : ''}
                  </li>
                ) : null}
              </ul>
            </Card>

            {hackathon ? (
              <Card view="filled" className={styles.sidebarCard}>
                <h3 className={styles.sidebarH3}>Shipped at</h3>
                <p className={styles.sidebarBody}>{hackathon.label}</p>
                <Link href={hackathon.href} className={styles.sidebarLink}>
                  See more events →
                </Link>
              </Card>
            ) : null}

            <Card view="filled" className={`${styles.sidebarCard} ${styles.sidebarCta}`}>
              <p className={styles.ctaCardTitle}>Ship one of your own.</p>
              <p className={styles.ctaCardBody}>
                Sign up, claim $200 of intro credits, and submit your project
                to the showcase.
              </p>
              <Button view="action" size="l" width="max" href="/signup">
                Sign up →
              </Button>
            </Card>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}

// -----------------------------------------------------------------------------
// Bits
// -----------------------------------------------------------------------------

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
    return <span className={`${styles.pill} ${styles.pillAward}`}>★ Winner</span>;
  }
  if (award === 'runner-up') {
    return <span className={`${styles.pill} ${styles.pillAward}`}>★ Runner-up</span>;
  }
  if (award === '3rd') {
    return <span className={`${styles.pill} ${styles.pillAward}`}>★ 3rd Place</span>;
  }
  if (award === 'finalist') {
    return <span className={`${styles.pill} ${styles.pillNeutral}`}>Finalist</span>;
  }
  if (featured) {
    return <span className={`${styles.pill} ${styles.pillFeatured}`}>Featured</span>;
  }
  if (category === 'Other') {
    return <span className={`${styles.pill} ${styles.pillNeutral}`}>Other</span>;
  }
  return null;
}

function Avatar({name}: {name: string}) {
  const initials = name
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span className={styles.avatar} aria-hidden>
      {initials || '?'}
    </span>
  );
}

// "@chase-brignac" → "Chase Brignac" — only used as a fallback when the
// builder row is missing. We just title-case the handle parts.
function prettyHandle(handle: string) {
  return handle
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(' ');
}

function tierLabel(tier: string) {
  const t = tier.toUpperCase();
  if (t === 'AMBASSADOR') return 'Ambassador';
  if (t === 'CONTRIBUTOR') return 'Contributor';
  return 'Builder';
}
