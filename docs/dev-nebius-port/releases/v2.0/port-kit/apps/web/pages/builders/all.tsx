// Bespoke builders directory at /builders/all with client-side search + tier
// filter. Sits next to the CMS-managed /builders page (which is the program-
// pitch content driven by Page Constructor blocks).
//
// Pages Router precedence: explicit > catch-all, so /builders/all matches
// this file and /builders falls through to pages/[[...slug]].tsx.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import {useMemo, useState} from 'react';

import {Card, Label, SegmentedRadioGroup, Text, TextInput} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';
import {formatNumber, tierLabel} from '@/lib/format';

import page from '@/styles/page.module.scss';
import styles from './builders.module.scss';

interface BuilderRow {
  handle: string;
  name: string;
  bio: string;
  city: string;
  country: string;
  tier: string;
  points_total: number;
  expertise: string[];
  github_handle: string;
}

const TIERS = ['ALL', 'AMBASSADOR', 'CONTRIBUTOR', 'BUILDER'] as const;

export const getStaticProps: GetStaticProps<{builders: BuilderRow[]}> = async () => {
  const directus = directusServer();
  const builders = (await directus.request(
    readItems('builders', {
      sort: ['-points_total'],
      fields: ['handle', 'name', 'bio', 'city', 'country', 'tier', 'points_total', 'expertise', 'github_handle'],
      limit: -1,
    }),
  )) as BuilderRow[];
  return {props: {builders}, revalidate: 60};
};

export default function BuildersDirectoryPage({
  builders,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [tier, setTier] = useState<(typeof TIERS)[number]>('ALL');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return builders.filter((b) => {
      if (tier !== 'ALL' && b.tier !== tier) return false;
      if (!needle) return true;
      return (
        b.handle.toLowerCase().includes(needle) ||
        b.name.toLowerCase().includes(needle) ||
        b.city.toLowerCase().includes(needle) ||
        b.expertise.some((e) => e.toLowerCase().includes(needle))
      );
    });
  }, [builders, tier, q]);

  return (
    <PublicLayout>
      <Head>
        <title>Builders directory · Nebius Builders</title>
        <meta
          name="description"
          content="Filterable directory of every builder in the Nebius Builders Network."
        />
      </Head>
      <div className={page.container}>
        <PageHeader
          eyebrow="Builders directory"
          title="The full network"
          description={`${builders.length} builders. Search by handle, name, city, or expertise. Filter by tier.`}
        />

        <div className={styles.filters}>
          <TextInput
            size="l"
            placeholder="handle, name, city, expertise…"
            value={q}
            onUpdate={setQ}
            className={styles.search}
          />
          <SegmentedRadioGroup
            value={tier}
            onUpdate={(v) => setTier(v as (typeof TIERS)[number])}
            size="l"
          >
            {TIERS.map((t) => (
              <SegmentedRadioGroup.Option key={t} value={t}>
                {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
              </SegmentedRadioGroup.Option>
            ))}
          </SegmentedRadioGroup>
        </div>

        <Text variant="caption-2" color="secondary" className={styles.count}>
          Showing {filtered.length} of {builders.length}
        </Text>

        <div className={page.grid3}>
          {filtered.map((b) => (
            <Card key={b.handle} view="filled" className={styles.card}>
              <div className={styles.headRow}>
                <div className={styles.headText}>
                  <Text variant="subheader-2" as="h3">
                    @{b.handle}
                  </Text>
                  <Text variant="caption-2" color="secondary">
                    {b.name} · {b.city}, {b.country}
                  </Text>
                </div>
                <Label theme={b.tier === 'AMBASSADOR' ? 'success' : b.tier === 'CONTRIBUTOR' ? 'info' : 'normal'} size="s">
                  {tierLabel(b.tier).split(' ·')[0]}
                </Label>
              </div>
              <Text variant="body-2" color="secondary" className={styles.bio}>
                {b.bio.length > 180 ? b.bio.slice(0, 180) + '…' : b.bio}
              </Text>
              <div className={page.tagRow}>
                {b.expertise.slice(0, 4).map((e) => (
                  <Label key={e} theme="normal" size="xs">
                    {e}
                  </Label>
                ))}
              </div>
              <div className={styles.foot}>
                <Text variant="caption-2" color="secondary">
                  {formatNumber(b.points_total)} pts
                </Text>
                {b.github_handle ? (
                  <a
                    href={`https://github.com/${b.github_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github ↗
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
