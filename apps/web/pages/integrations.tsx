// /integrations — full filterable directory of ecosystem partner integrations.
// Same card shape as the homepage <EcosystemPartners /> section. Single
// filter row: an "All" chip, then product chips, then category chips. The
// chosen filter is a tagged union (kind: 'product' | 'category'), so
// picking one chip auto-clears whatever was picked before — much simpler
// state model than the two-row AND-filter we shipped first.
//
// Route renamed from /ecosystem; the data file + section component name
// keep the legacy "ecosystem" naming since they're not user-facing.

import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import {useMemo, useState} from 'react';

import {Button, Label, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {HeroSection} from '@/components/integrations/HeroSection';
import {
  CATEGORY_LABEL,
  ECOSYSTEM_PARTNERS,
  PRODUCT_LABEL,
  type EcosystemPartner,
  type PartnerCategory,
  type PartnerProduct,
} from '@/lib/ecosystem-partners';

import page from '@/styles/page.module.scss';
import styles from './integrations.module.scss';

interface Props {
  partners: EcosystemPartner[];
}

// One filter, two kinds. `null` means "All".
type ActiveFilter =
  | {kind: 'product'; value: PartnerProduct}
  | {kind: 'category'; value: PartnerCategory}
  | null;

function filterEq(a: ActiveFilter, b: ActiveFilter): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.kind === b.kind && a.value === b.value;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // No external fetch — partners list is bundled at build time. Page is
  // SSG and ships zero server work per request.
  return {props: {partners: ECOSYSTEM_PARTNERS}};
};

export default function IntegrationsPage({
  partners,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [active, setActive] = useState<ActiveFilter>(null);

  // Counts always derive from the full partner list so each chip's
  // number is a stable "if I pick this, here's what I'll get" preview.
  const productCounts = useMemo(() => {
    const counts: Record<PartnerProduct, number> = {
      'ai-cloud': 0,
      'token-factory': 0,
      tavily: 0,
    };
    for (const p of partners) {
      for (const prod of p.products) counts[prod] += 1;
    }
    return counts;
  }, [partners]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<PartnerCategory, number>();
    for (const p of partners) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    // Sort by count desc, then alpha so visually heavy categories lead.
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [partners]);

  const visible = useMemo(() => {
    if (active === null) return partners;
    if (active.kind === 'product') {
      return partners.filter((p) => p.products.includes(active.value));
    }
    return partners.filter((p) => p.category === active.value);
  }, [partners, active]);

  const toggle = (f: ActiveFilter) =>
    setActive((cur) => (filterEq(cur, f) ? null : f));

  return (
    <PublicLayout>
      <Head>
        <title>Integrations · Nebius Builders</title>
        <meta
          name="description"
          content="Every Nebius integration in one filterable directory — products (AI Cloud, Token Factory, Tavily) and categories (agents, gateway, orchestration, and more)."
        />
      </Head>

      {/* Dark hero with the R3F membrane scene behind the copy. Dynamic-
          imported under the hood so neither three nor R3F ships on SSR
          or to any other page's bundle.

          `One page.` uses a non-breaking space so the last sentence
          stays atomic — when the line would otherwise wrap between "One"
          and "page." it wraps before "One" instead, keeping the second
          sentence intact. */}
      <HeroSection
        eyebrow="Integrations"
        title={'Every integration. One page.'}
        lede="Frameworks, gateways, orchestrators, and observability tools that integrate with Nebius products. Pick a filter to narrow it down."
      />

      <div className={styles.filters}>
        <div className={page.container}>
          <div className={styles.filterRow}>
            <Text variant="caption-2" color="secondary" className={styles.filterLabel}>
              Filter
            </Text>
            <div className={styles.chips}>
              <Button
                view={active == null ? 'action' : 'outlined'}
                size="m"
                onClick={() => setActive(null)}
              >
                All ({partners.length})
              </Button>
              {(Object.keys(productCounts) as PartnerProduct[]).map((prod) => {
                const f: ActiveFilter = {kind: 'product', value: prod};
                return (
                  <Button
                    key={`p:${prod}`}
                    view={filterEq(active, f) ? 'action' : 'outlined'}
                    size="m"
                    onClick={() => toggle(f)}
                  >
                    {PRODUCT_LABEL[prod]} ({productCounts[prod]})
                  </Button>
                );
              })}
              {categoryCounts.map(([cat, count]) => {
                const f: ActiveFilter = {kind: 'category', value: cat};
                return (
                  <Button
                    key={`c:${cat}`}
                    view={filterEq(active, f) ? 'action' : 'outlined'}
                    size="m"
                    onClick={() => toggle(f)}
                  >
                    {CATEGORY_LABEL[cat]} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <main className={page.container} style={{paddingTop: 24, paddingBottom: 80}}>
        <div className={styles.resultCount}>
          <Text variant="caption-2" color="secondary">
            Showing {visible.length} of {partners.length}
          </Text>
        </div>

        {visible.length === 0 ? (
          <Text color="secondary" className={styles.empty}>
            No partners match this filter. Pick a different one.
          </Text>
        ) : (
          <div className={styles.grid}>
            {visible.map((p) => (
              <a
                key={p.docsUrl}
                href={p.docsUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.card}
              >
                <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                  {p.name}
                </Text>
                <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                  {p.blurb}
                </Text>
                <div className={styles.tagRow}>
                  {p.products.map((prod) => (
                    <Label key={prod} theme="info" size="xs">
                      {PRODUCT_LABEL[prod]}
                    </Label>
                  ))}
                  <Label theme="utility" size="xs">
                    {CATEGORY_LABEL[p.category]}
                  </Label>
                </div>
                <span className={styles.cardCta}>View docs &rarr;</span>
              </a>
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
