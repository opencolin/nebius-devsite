// EcosystemPartners — homepage marketing section (eyebrow reads
// "Integrations"; the component name keeps its legacy "Ecosystem"
// prefix since it's not user-facing). Shows the THREE most-recognized
// integrations as a teaser; the full directory lives at /integrations.
//
// Featured set is hand-picked here — easy to swap. We pick by docsUrl
// (not by name) because some partner names are non-unique across the
// Tavily + Nebius integration tables (Agno, LangChain, CrewAI exist
// twice with different docs pages).

import Link from 'next/link';

import {Button, Label, Text} from '@gravity-ui/uikit';

import {
  CATEGORY_LABEL,
  ECOSYSTEM_PARTNERS,
  PRODUCT_LABEL,
} from '@/lib/ecosystem-partners';

import styles from './EcosystemPartners.module.scss';

// docsUrls of the three integrations to feature on the homepage.
// Picks the most universally-recognized AI dev tools — the visitor sees
// names they trust before clicking through to the long list.
const FEATURED_URLS: ReadonlyArray<string> = [
  'https://docs.nebius.com/studio/inference/integrations/huggingface',          // Hugging Face
  'https://docs.tokenfactory.nebius.com/integrations/frameworks/langchain',     // LangChain
  'https://docs.nebius.com/applications/standalone/nvidia-nim',                 // NVIDIA NIM
];

export function EcosystemPartners() {
  // Preserve the FEATURED_URLS order so the lineup matches our editorial
  // intent, not the source array's order. Falls through silently if a
  // featured URL is missing from the data — easier to refactor than to
  // throw at build time.
  const featured = FEATURED_URLS.map((url) =>
    ECOSYSTEM_PARTNERS.find((p) => p.docsUrl === url),
  ).filter((p): p is (typeof ECOSYSTEM_PARTNERS)[number] => p != null);

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
            orchestrators we&apos;ve tested end-to-end. A few standouts below
            &mdash; the rest are one click away.
          </Text>
        </header>

        <div className={styles.grid}>
          {featured.map((p) => (
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

        <div className={styles.footerCta}>
          <Link href="/integrations" passHref legacyBehavior>
            <Button view="action" size="l">
              See all {ECOSYSTEM_PARTNERS.length} integrations &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default EcosystemPartners;
