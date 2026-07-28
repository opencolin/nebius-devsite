// Site-wide banner that flags this build as a non-production stack
// demonstration so reviewers, screenshots, and inbound links can't
// confuse it with the real Nebius Builders Network.
//
// Two placements, both mounted from _app.tsx so they appear on every
// page (public, portal, admin, login):
//
//   placement="top"    → above <PublicNav>. Scrolls away with the page;
//                        the nav itself remains sticky below it. Full
//                        explanatory copy + "About this build →" link.
//   placement="bottom" → position: fixed at the bottom of the viewport,
//                        always visible. Compact one-line copy so it
//                        doesn't crowd the page; same "About this build"
//                        link so the visitor can dig in from either spot.
//
// Both variants render the same lime "Mockup for review" badge so the
// signal stays consistent — reviewers see the badge whether they're at
// the top or scrolled mid-page.

import Link from 'next/link';

import styles from './MockupBanner.module.scss';

export function MockupBanner({placement = 'top'}: {placement?: 'top' | 'bottom'}) {
  const isBottom = placement === 'bottom';
  return (
    <div
      className={isBottom ? styles.rootBottom : styles.root}
      role="status"
      aria-live="polite"
    >
      <div className={styles.inner}>
        <span className={styles.badge}>Mockup for review</span>
        <span className={styles.copy}>
          {isBottom
            ? 'Stack demo — not the live Builders Network.'
            : 'Tech-stack demonstration. Not affiliated with Nebius and not the live Builders Network.'}
        </span>
        <Link href="/about-this-build" className={styles.link}>
          About this build →
        </Link>
      </div>
    </div>
  );
}
