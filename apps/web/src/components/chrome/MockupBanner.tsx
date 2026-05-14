// Site-wide banner above the nav. Clearly marks this build as a non-production
// stack demonstration so reviewers, screenshots, and inbound links can't
// confuse it with the real Nebius Builders Network.
//
// Renders before <PublicNav> in _app.tsx so it sits at the very top of
// every page (public, portal, admin, login). Non-sticky — scrolls away with
// the rest of the page; the nav remains sticky.

import Link from 'next/link';

import styles from './MockupBanner.module.scss';

export function MockupBanner() {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <div className={styles.inner}>
        <span className={styles.badge}>Mockup for review</span>
        <span className={styles.copy}>
          Tech-stack demonstration. Not affiliated with Nebius and not the live
          Builders Network.
        </span>
        <Link href="/about-this-build" className={styles.link}>
          About this build →
        </Link>
      </div>
    </div>
  );
}
