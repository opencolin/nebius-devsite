// EcosystemPartners — homepage marketing section (eyebrow reads
// "Integrations"; the component name keeps its legacy "Ecosystem" prefix
// since it's not user-facing). Shows the full partner roster as a 3-up
// grid of cards. Data lives in `@/lib/ecosystem-partners` so the
// /integrations filter page can share it.
//
// Each card is a docs link, opening in a new tab. Category pill above the
// title; product pills below the blurb so visitors can see which Nebius
// product(s) the integration targets at a glance.

import Link from 'next/link';

import {Label, Text} from '@gravity-ui/uikit';

import {
  CATEGORY_LABEL,
  ECOSYSTEM_PARTNERS,
  PRODUCT_LABEL,
} from '@/lib/ecosystem-partners';

import styles from './EcosystemPartners.module.scss';

export function EcosystemPartners() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Integrations
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            Pick the tools you already love. They work on Nebius.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            First-party integration docs for the frameworks, gateways, and
            orchestrators we&apos;ve tested end-to-end. Each card links to the
            Nebius doc page for that partner.{' '}
            <Link href="/integrations" className={styles.headLink}>
              See all and filter &rarr;
            </Link>
          </Text>
        </header>

        <div className={styles.grid}>
          {ECOSYSTEM_PARTNERS.map((p) => (
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
      </div>
    </section>
  );
}

export default EcosystemPartners;
