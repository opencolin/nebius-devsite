// /ecosystem — full filterable directory of ecosystem partner integrations.
// Same card shape as the homepage <EcosystemPartners /> section but with
// two filter rows (product + category) and live counts beside each chip.
//
// Filters AND together — picking "Token Factory" + "Agents" shows
// partners whose product list includes token-factory AND whose category
// is agents. Toggle the active chip off to clear that filter row.

import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import {useMemo, useState} from 'react';

import {Button, Label, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {
  CATEGORY_LABEL,
  ECOSYSTEM_PARTNERS,
  PRODUCT_LABEL,
  type EcosystemPartner,
  type PartnerCategory,
  type PartnerProduct,
} from '@/lib/ecosystem-partners';

import page from '@/styles/page.module.scss';
import styles from './ecosystem.module.scss';

interface Props {
  partners: EcosystemPartner[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // No external fetch — partners list is bundled at build time. revalidate
  // dropped since the data is static. Kept getStaticProps so the page is
  // SSG and ships zero server work per request.
  return {props: {partners: ECOSYSTEM_PARTNERS}};
};

export default function EcosystemPage({
  partners,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [activeProduct, setActiveProduct] = useState<PartnerProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState<PartnerCategory | null>(
    null,
  );

  // Counts shown alongside each chip — always derived from the full list,
  // not the currently-filtered subset, so the user can see how each
  // toggle will affect the result before clicking.
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
    return partners.filter((p) => {
      if (activeProduct && !p.products.includes(activeProduct)) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      return true;
    });
  }, [partners, activeProduct, activeCategory]);

  return (
    <PublicLayout>
      <Head>
        <title>Ecosystem · Nebius Builders</title>
        <meta
          name="description"
          content="Every Nebius ecosystem partner integration, filterable by product (AI Cloud, Token Factory, Tavily) and category (agents, gateway, orchestration, and more)."
        />
      </Head>

      <section className={styles.hero}>
        <div className={page.container}>
          <Text variant="caption-2" className={styles.heroEyebrow}>
            Ecosystem
          </Text>
          <Text variant="display-2" as="h1" className={styles.heroTitle}>
            Every integration. One page.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.heroLede}>
            Frameworks, gateways, orchestrators, and observability tools that
            integrate with Nebius products. Filter by product or by category to
            find the doc page you need.
          </Text>
        </div>
      </section>

      <div className={styles.filters}>
        <div className={page.container}>
          <FilterRow
            label="Product"
            allCount={partners.length}
            onClearAll={() => setActiveProduct(null)}
            isAllActive={activeProduct == null}
          >
            {(Object.keys(productCounts) as PartnerProduct[]).map((prod) => (
              <Button
                key={prod}
                view={activeProduct === prod ? 'action' : 'outlined'}
                size="m"
                onClick={() =>
                  setActiveProduct((cur) => (cur === prod ? null : prod))
                }
              >
                {PRODUCT_LABEL[prod]} ({productCounts[prod]})
              </Button>
            ))}
          </FilterRow>

          <FilterRow
            label="Category"
            allCount={partners.length}
            onClearAll={() => setActiveCategory(null)}
            isAllActive={activeCategory == null}
          >
            {categoryCounts.map(([cat, count]) => (
              <Button
                key={cat}
                view={activeCategory === cat ? 'action' : 'outlined'}
                size="m"
                onClick={() =>
                  setActiveCategory((cur) => (cur === cat ? null : cat))
                }
              >
                {CATEGORY_LABEL[cat]} ({count})
              </Button>
            ))}
          </FilterRow>
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
            No partners match this combination. Clear a filter to widen the
            results.
          </Text>
        ) : (
          <div className={styles.grid}>
            {visible.map((p) => (
              <a
                key={p.name}
                href={p.docsUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.card}
              >
                <Label theme="utility" size="s">
                  {CATEGORY_LABEL[p.category]}
                </Label>
                <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                  {p.name}
                </Text>
                <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                  {p.blurb}
                </Text>
                <div className={styles.productRow}>
                  {p.products.map((prod) => (
                    <Label key={prod} theme="info" size="xs">
                      {PRODUCT_LABEL[prod]}
                    </Label>
                  ))}
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

// FilterRow — small wrapper that renders "Label: [All (N)] [chip] [chip] …"
// and forwards click of the All chip to the row-specific reset callback.
function FilterRow({
  label,
  allCount,
  isAllActive,
  onClearAll,
  children,
}: {
  label: string;
  allCount: number;
  isAllActive: boolean;
  onClearAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.filterRow}>
      <Text variant="caption-2" color="secondary" className={styles.filterLabel}>
        {label}
      </Text>
      <div className={styles.chips}>
        <Button
          view={isAllActive ? 'action' : 'outlined'}
          size="m"
          onClick={onClearAll}
        >
          All ({allCount})
        </Button>
        {children}
      </div>
    </div>
  );
}
