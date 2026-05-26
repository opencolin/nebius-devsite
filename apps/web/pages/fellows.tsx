// /fellows — the Nebius Builders Network fellows directory.
//
// Fellows are independent community leaders (event organizers, OSS
// contributors, DevRel folks) recognized by Nebius. This page is the
// public-facing roll call; the underlying candidate-pool spreadsheet
// (with email, status, internal notes) lives in Confluence.
//
// Data lives in src/lib/fellows.ts as a static array — small set, no
// CMS needed yet. If/when this grows past a couple dozen, migrate to a
// Directus `fellows` collection mirroring the team_members pattern.

import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';

import {Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {
  FEATURED_FELLOWS,
  FELLOWS,
  REGION_ORDER,
  fellowInitials,
  type Fellow,
  type Region,
} from '@/lib/fellows';

import page from '@/styles/page.module.scss';
import styles from './fellows.module.scss';

interface Props {
  featured: Fellow[];
  byRegion: Array<{region: Region; fellows: Fellow[]}>;
  total: number;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Featured curation — order in FEATURED_SLUGS is preserved (it's an
  // editorial sequence, not alphabetical), so the grid reads left-to-
  // right top-to-bottom exactly as the team listed them.
  const featured = FEATURED_FELLOWS;

  // Group by region in REGION_ORDER. Within each region, sort by city
  // then name so the layout reads geographically. Empty regions are
  // dropped so we don't render a header with zero cards under it.
  const byRegion = REGION_ORDER.map((region) => ({
    region,
    fellows: FELLOWS
      .filter((f) => f.region === region)
      .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
  })).filter((g) => g.fellows.length > 0);
  return {props: {featured, byRegion, total: FELLOWS.length}};
};

export default function FellowsPage({
  featured,
  byRegion,
  total,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>Fellows · Nebius Builders</title>
        <meta
          name="description"
          content="Independent community leaders in the Nebius Builders Network — event organizers, open-source contributors, and developer advocates across EMEA, North America, LATAM, and APJ."
        />
      </Head>
      <div className={page.container}>
        <PageHeader
          eyebrow="Fellows"
          title="The Nebius Builders Network"
          description={`${total} independent community leaders shipping events, content, and open-source on Nebius — organized by region.`}
        />

        {/* Featured rail — curated 4-wide grid above the region groups.
            Wraps to additional rows past 8 cards; current curation is 9
            so the third row holds 1 card. */}
        {featured.length > 0 ? (
          <section className={styles.featuredSection}>
            <header className={styles.regionHeader}>
              <Text variant="caption-2" color="secondary" className={styles.regionEyebrow}>
                Featured
              </Text>
              <Text variant="caption-2" color="secondary">
                {featured.length} {featured.length === 1 ? 'fellow' : 'fellows'}
              </Text>
            </header>
            <div className={styles.featuredGrid}>
              {featured.map((f) => (
                <FellowCard key={f.slug} fellow={f} />
              ))}
            </div>
          </section>
        ) : null}

        {byRegion.map(({region, fellows}) => (
          <section key={region} className={styles.regionSection}>
            <header className={styles.regionHeader}>
              <Text variant="caption-2" color="secondary" className={styles.regionEyebrow}>
                {region}
              </Text>
              <Text variant="caption-2" color="secondary">
                {fellows.length} {fellows.length === 1 ? 'fellow' : 'fellows'}
              </Text>
            </header>

            <div className={page.grid3}>
              {fellows.map((f) => (
                <FellowCard key={f.slug} fellow={f} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PublicLayout>
  );
}

// Single fellow card. Photo + initials fallback handled inline because
// it's the only place that needs the pattern. Whole card is wrapped in
// the LinkedIn link so the entire card is the click target — same
// affordance the existing /team and /apps cards use.
function FellowCard({fellow}: {fellow: Fellow}) {
  return (
    <a
      href={fellow.linkedinUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cardLink}
      aria-label={`${fellow.name} on LinkedIn`}
    >
      <article className={styles.card}>
        <FellowAvatar fellow={fellow} />
        <div className={styles.body}>
          <Text variant="subheader-2" as="h3" className={styles.name}>
            {fellow.name}
          </Text>
          {fellow.role ? (
            <Text variant="caption-2" color="secondary" className={styles.role}>
              {fellow.role}
            </Text>
          ) : null}
          {/* Organization gets its own line in primary text color so it
              reads as a distinct field, not a tail of the role string. */}
          {fellow.company ? (
            <Text variant="body-2" className={styles.company}>
              {fellow.company}
            </Text>
          ) : null}
          {/* Tagline — short promotional one-liner synthesized from the
              source directory's Notes + Previous Work. Three fellows had
              no public-facing source material; their cards render
              without this line. */}
          {fellow.tagline ? (
            <Text variant="body-2" color="secondary" className={styles.tagline}>
              {fellow.tagline}
            </Text>
          ) : null}
          {/* City + region as a single chip pair so a card always shows
              both geography axes — region is also the section header but
              repeating it on each card removes the need to scroll up to
              answer "where is this fellow based?". */}
          <div className={styles.geoRow}>
            <Label theme="utility" size="xs">
              {fellow.city}
            </Label>
            <Label theme="normal" size="xs">
              {fellow.region}
            </Label>
          </div>
          <div className={styles.metaRow}>
            <LinkedInIcon />
          </div>
        </div>
      </article>
    </a>
  );
}

// LinkedIn brand mark — inline SVG so we avoid a dep + a network round-trip
// for an icon font. The card itself is the click target (entire <a>);
// aria-hidden hides the icon from screen readers since the parent <a>
// already carries an aria-label like "<Name> on LinkedIn".
function LinkedInIcon() {
  return (
    <svg
      className={styles.linkedinIcon}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.86 3.37-1.86 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function FellowAvatar({fellow}: {fellow: Fellow}) {
  if (fellow.photo) {
    return (
      <img
        src={fellow.photo}
        alt={`${fellow.name} portrait`}
        className={styles.photo}
        loading="lazy"
        width={120}
        height={120}
      />
    );
  }
  // No photo on file — show a high-contrast initials avatar. Same
  // visual treatment as /apps/[slug]'s builder sidebar fallback.
  return (
    <div className={styles.initials} aria-hidden>
      {fellowInitials(fellow.name)}
    </div>
  );
}
