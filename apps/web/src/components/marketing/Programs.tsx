// Programs — three cards for Builders Network (highlighted), Startup
// Program, and AI for Tech Academy. Mirrors Products.tsx layout with
// fewer items.
//
// Ported from nb3 programs.tsx.

import Link from 'next/link';

import {Text} from '@gravity-ui/uikit';

import styles from './Programs.module.scss';

interface Program {
  name: string;
  blurb: string;
  cta: string;
  href: string;
  highlight?: boolean;
}

const PROGRAMS: Program[] = [
  {
    name: 'Builders Network',
    blurb:
      'Run events, post tutorials, build with Nebius. Earn up to $2,600 of credits as you climb tiers. Get promoted to Contributor and Ambassador on points.',
    cta: 'Learn more',
    href: '/builders',
    highlight: true,
  },
  {
    name: 'Startup Program',
    blurb:
      'Credits, guidance, and infrastructure support for teams building on Nebius.',
    cta: 'More',
    href: 'https://nebius.com/startups/',
  },
  {
    name: 'AI for Tech Academy',
    blurb: 'Short courses for individuals and teams adopting AI.',
    cta: 'More',
    href: 'https://academy.nebius.com/',
  },
];

function ProgramCard({program}: {program: Program}) {
  const className = `${styles.card} ${program.highlight ? styles.cardHighlight : ''}`;
  const isExternal = program.href.startsWith('http');
  const ctaArrow = isExternal ? '↑' : '→';
  const inner = (
    <>
      <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
        {program.name}
      </Text>
      <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
        {program.blurb}
      </Text>
      <span className={styles.cardCta}>
        {program.cta} {ctaArrow}
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={program.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={program.href} className={className}>
      {inner}
    </Link>
  );
}

export function Programs() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Programs for builders
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            Three ways to get more from Nebius
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            Credits, infrastructure support, and standing in the community.
          </Text>
        </header>

        <div className={styles.grid}>
          {PROGRAMS.map((p) => (
            <ProgramCard key={p.name} program={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Programs;
