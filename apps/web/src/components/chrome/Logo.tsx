// Nebius lockup: the official Nebius logo SVG (lime pill + dark-navy mark) +
// "Builders" wordmark on the right. Mirrors the Logo component in the
// upstream opencolin/nebius-builders repo, restyled for the Gravity-token
// chassis.

import Link from 'next/link';

import styles from './Logo.module.scss';

interface Props {
  /** Hide the "Builders" wordmark — used in compact contexts. */
  brandOnly?: boolean;
}

export function Logo({brandOnly = false}: Props) {
  return (
    <Link
      href="/"
      className={styles.root}
      aria-label="Nebius Builders Network — home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/nebius-logo.svg"
        alt="Nebius"
        width={102}
        height={28}
        className={styles.mark}
      />
      {!brandOnly ? <span className={styles.wordmark}>Builders</span> : null}
    </Link>
  );
}
