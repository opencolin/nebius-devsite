// Products — 3-up grid for Tenki's core products: Sandbox, Code Reviewer,
// and Runners. Each card shows a price, a headline, a short blurb, and
// Start for Free / Learn More / Docs links. Sandbox wears the highlight ring
// as the flagship agent-infrastructure entry point.

import {Text} from '@gravity-ui/uikit';

import styles from './Products.module.scss';

interface ProductLink {
  label: string;
  href: string;
}

interface Product {
  name: string;
  price: string;
  tagline: string;
  blurb: string;
  links: ProductLink[];
  highlight?: boolean;
}

const PRODUCTS: Product[] = [
  {
    name: 'Sandbox',
    price: '~$0.00276/minute',
    tagline: 'Give your agent root without giving it yours',
    blurb:
      'Select from SDK and/or ADE for agentic-driven multi-tasking workflows.',
    links: [
      {label: 'Start for Free', href: 'https://tenki.cloud/sandbox'},
      {label: 'Learn More', href: 'https://tenki.cloud/sandbox'},
      {label: 'Docs', href: 'https://tenki.cloud/docs/sandbox/quick-start-sandbox'},
    ],
    highlight: true,
  },
  {
    name: 'Code Reviewer',
    price: '$1.00/review',
    tagline: 'The reviewer built for the agentic era',
    blurb:
      'Understands your codebase to catch critical issues, so you can deploy with confidence.',
    links: [
      {label: 'Start for Free', href: 'https://tenki.cloud/code-reviewer'},
      {label: 'Learn More', href: 'https://tenki.cloud/code-reviewer'},
      {label: 'Docs', href: 'https://tenki.cloud/docs/start-code-review'},
    ],
  },
  {
    name: 'Runners',
    price: '$0.002/core/minute',
    tagline: 'Run 30% Faster and Up to 60% Cheaper',
    blurb:
      'Supports private and public repositories, with x64 and macOS environments.',
    links: [
      {label: 'Start for Free', href: 'https://tenki.cloud/runners'},
      {label: 'Learn More', href: 'https://tenki.cloud/runners'},
      {label: 'Docs', href: 'https://tenki.cloud/docs/runners/quick-start-runners'},
    ],
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
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children} &uarr;
    </a>
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
            Three products. Pick the one that fits how you want to build.
          </Text>
        </header>

        <div className={styles.grid}>
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              className={`${styles.card} ${p.highlight ? styles.cardHighlight : ''}`}
            >
              <div className={styles.cardHead}>
                <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                  {p.name}
                </Text>
                <Text variant="caption-2" color="secondary" className={styles.cardPrice}>
                  {p.price}
                </Text>
              </div>
              <Text variant="subheader-1" as="p" className={styles.cardTagline}>
                {p.tagline}
              </Text>
              <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                {p.blurb}
              </Text>
              <div className={styles.cardFooter}>
                {p.links.map((l, i) => (
                  <ProductLink
                    key={l.label}
                    href={l.href}
                    className={i === 0 ? styles.linkPrimary : styles.linkSecondary}
                  >
                    {l.label}
                  </ProductLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;
