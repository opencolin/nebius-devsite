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
  FELLOWS,
  REGION_ORDER,
  fellowInitials,
  type Fellow,
  type Region,
} from '@/lib/fellows';

import page from '@/styles/page.module.scss';
import styles from './fellows.module.scss';

interface Props {
  byRegion: Array<{region: Region; fellows: Fellow[]}>;
  total: number;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Group by region in REGION_ORDER. Within each region, sort by city
  // then name so the layout reads geographically. Empty regions are
  // dropped so we don't render a header with zero cards under it.
  const byRegion = REGION_ORDER.map((region) => ({
    region,
    fellows: FELLOWS
      .filter((f) => f.region === region)
      .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
  })).filter((g) => g.fellows.length > 0);
  return {props: {byRegion, total: FELLOWS.length}};
};

export default function FellowsPage({
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
          {fellow.role || fellow.company ? (
            <Text variant="caption-2" color="secondary" className={styles.role}>
              {[fellow.role, fellow.company].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          <div className={styles.metaRow}>
            <Label theme="utility" size="xs">
              {fellow.city}
            </Label>
            <span className={styles.linkedin}>LinkedIn ↗</span>
          </div>
        </div>
      </article>
    </a>
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
