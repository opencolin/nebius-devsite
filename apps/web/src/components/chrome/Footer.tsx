import Link from 'next/link';

import {Logo} from '@/components/chrome/Logo';

import styles from './Footer.module.scss';

const COL_LEARN: Array<{href: string; label: string; external?: boolean}> = [
  {href: '/library', label: 'Library'},
  {href: '/office-hours', label: 'Office hours'},
  {href: 'https://docs.nebius.com', label: 'Docs ↗', external: true},
];

const COL_BUILD: Array<{href: string; label: string; external?: boolean}> = [
  {href: '/events', label: 'Events'},
  {href: '/apps', label: 'Apps'},
  {href: '/builders/all', label: 'Builders directory'},
  // Leaderboard moved under /portal — signed-in only.
];

const COL_PROGRAM: Array<{href: string; label: string; external?: boolean}> = [
  {href: '/builders', label: 'About the program'},
  {href: '/team', label: 'DevRel team'},
  {href: '/localhosts', label: 'Host an event'},
  {href: '/signup', label: 'Sign up'},
];

const COL_NEBIUS: Array<{href: string; label: string; external?: boolean}> = [
  {href: 'https://nebius.com', label: 'Nebius.com ↗', external: true},
  {href: 'https://docs.tokenfactory.nebius.com', label: 'Token Factory ↗', external: true},
  {href: 'https://careers.nebius.com', label: 'Careers ↗', external: true},
];

export function Footer() {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Logo />
          <p className={styles.tagline}>
            Workshops, demos, hackathons, office hours — built by the community,
            on Nebius.
          </p>
          <p className={styles.legal}>© 2026 Nebius B.V.</p>
        </div>

        <div className={styles.cols}>
          <FooterCol heading="Learn" items={COL_LEARN} />
          <FooterCol heading="Build" items={COL_BUILD} />
          <FooterCol heading="Program" items={COL_PROGRAM} />
          <FooterCol heading="Nebius" items={COL_NEBIUS} />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  items,
}: {
  heading: string;
  items: Array<{href: string; label: string; external?: boolean}>;
}) {
  return (
    <div className={styles.col}>
      <div className={styles.colHead}>{heading}</div>
      <ul className={styles.colList}>
        {items.map((it) =>
          it.external ? (
            <li key={it.href}>
              <a href={it.href} target="_blank" rel="noopener noreferrer">
                {it.label}
              </a>
            </li>
          ) : (
            <li key={it.href}>
              <Link href={it.href}>{it.label}</Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
