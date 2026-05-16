// Products — 4-up grid for AI Cloud, Token Factory (highlighted), Serverless,
// and Tavily. Each card has a primary "Start building" link and a secondary
// "How-tos" link to docs. Token Factory wears a navy border + lime ring to
// flag it as the recommended entry point.
//
// Ported from nb3 products.tsx, Tailwind → CSS Module + Gravity.

import Link from 'next/link';

import {Text} from '@gravity-ui/uikit';

import styles from './Products.module.scss';

interface Product {
  name: string;
  blurb: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  highlight?: boolean;
}

const PRODUCTS: Product[] = [
  {
    name: 'AI Cloud',
    blurb:
      'Spin up GPU VMs and multi-node clusters for training and custom stacks, with full control.',
    primaryHref: '/ai-cloud',
    primaryLabel: 'Start building',
    secondaryHref: 'https://docs.nebius.com/',
    secondaryLabel: 'How-tos',
  },
  {
    name: 'Token Factory',
    blurb:
      'Serve open-source models via an OpenAI-compatible API with real-time and batch inference, dedicated endpoints, and production SLAs.',
    primaryHref: '/token-factory',
    primaryLabel: 'Start building',
    secondaryHref: 'https://docs.tokenfactory.nebius.com/quickstart',
    secondaryLabel: 'How-tos',
    highlight: true,
  },
  {
    name: 'Serverless',
    blurb:
      'Build and deploy serverless AI jobs and endpoints from your container in minutes — no Kubernetes, no infrastructure.',
    primaryHref: '/serverless',
    primaryLabel: 'Start building',
    secondaryHref: 'https://docs.nebius.com/',
    secondaryLabel: 'How-tos',
  },
  {
    name: 'Tavily',
    blurb:
      'Real-time web search and content extraction for LLMs and agents via API and SDKs.',
    primaryHref: 'https://tavily.com',
    primaryLabel: 'Start building',
    secondaryHref: 'https://docs.tavily.com',
    secondaryLabel: 'How-tos',
  },
];

function ProductLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith('http');
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children} &uarr;
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children} &rarr;
    </Link>
  );
}

export function Products() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Products
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            Choose a starting point for your work
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            Four products. Pick the one that fits how you want to build.
          </Text>
        </header>

        <div className={styles.grid}>
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              className={`${styles.card} ${p.highlight ? styles.cardHighlight : ''}`}
            >
              <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                {p.name}
              </Text>
              <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                {p.blurb}
              </Text>
              <div className={styles.cardFooter}>
                <ProductLink href={p.primaryHref} className={styles.linkPrimary}>
                  {p.primaryLabel}
                </ProductLink>
                <ProductLink href={p.secondaryHref} className={styles.linkSecondary}>
                  {p.secondaryLabel}
                </ProductLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;
