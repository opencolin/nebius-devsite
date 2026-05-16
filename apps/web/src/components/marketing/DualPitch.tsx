// DualPitch — two-column "For builders / For businesses" pitch on white
// bg. Left card is the standard light card; right card flips to navy
// with white text and a lime CTA.
//
// Ported from nb3 dual-pitch.tsx.

import Link from 'next/link';

import {Text} from '@gravity-ui/uikit';

import styles from './DualPitch.module.scss';

const BUILDER_BULLETS = [
  'Workshops with Nebius engineers, recorded and indexed',
  'Snapshot before you demo — never blow up on stage',
  'Auto-generated post-event summary for your portfolio',
];

const BUSINESS_BULLETS = [
  'Per-project SDK call counts and latency',
  'AI-graded feedback you can export to CSV',
  'White-label event pages on Scale',
];

export function DualPitch() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.cardLight}`}>
            <span className={styles.pillLime}>For builders</span>
            <Text variant="header-1" as="h3" className={styles.cardTitle}>
              A league for shippers.
            </Text>
            <Text variant="body-2" color="secondary" className={styles.cardBody}>
              Live events every week. A Contree workspace with OpenClaw
              preinstalled. Token Factory keys waiting in the terminal. Ranked
              standings by what you ship, not who you know.
            </Text>
            <ul className={styles.bullets}>
              {BUILDER_BULLETS.map((s) => (
                <li key={s} className={styles.bullet}>
                  <span className={styles.bulletDotLight} aria-hidden>
                    &bull;
                  </span>
                  {s}
                </li>
              ))}
            </ul>
            <Link href="/builders/login" className={styles.ctaNavy}>
              Enter the league &rarr;
            </Link>
          </div>

          <div className={`${styles.card} ${styles.cardDark}`}>
            <span className={styles.pillLime}>For businesses</span>
            <Text variant="header-1" as="h3" className={styles.cardTitleDark}>
              Stop chasing developers.
            </Text>
            <p className={styles.cardBodyDark}>
              Real integration telemetry replaces badge scans. See which
              builders called your SDK, what model they used, and what they
              shipped. Turnkey events: venue, catering, judging, and capture
              handled.
            </p>
            <ul className={styles.bullets}>
              {BUSINESS_BULLETS.map((s) => (
                <li key={s} className={styles.bulletDark}>
                  <span className={styles.bulletDotLime} aria-hidden>
                    &bull;
                  </span>
                  {s}
                </li>
              ))}
            </ul>
            <a href="#contact" className={styles.ctaLime}>
              Talk to us &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DualPitch;
