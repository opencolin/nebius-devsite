// Hero — top-of-homepage statement. Big display headline, a lime "joy"
// underline on "AI Builders", a triple-CTA row, and a four-up metrics
// strip across the bottom. Live-event pill in the eyebrow position turns
// the chip into a real counter when an event is currently running.
//
// Ported from opencolin/nebius-builders-3/components/hero.tsx, with
// Tailwind utilities translated to a CSS Module + Gravity UI <Button>.
// Background grid + lime blur are pure CSS (no <Image>).

import {Button, Text} from '@gravity-ui/uikit';

import {formatNumber} from '@/lib/format';

import styles from './Hero.module.scss';

interface HeroProps {
  /** Number of events currently inside their [starts_at, ends_at) window. */
  liveEventCount: number;
  /** Marketing metric — hard-coded in pages/index.tsx for now. */
  activeBuilders: number;
  /** Marketing metric — hard-coded in pages/index.tsx for now. */
  eventsRun: number;
  /** Total entries in the library collection. */
  libraryCount: number;
  /** Marketing metric — hard-coded in pages/index.tsx for now. */
  signupsAttributed: number;
}

export function Hero({
  liveEventCount,
  activeBuilders,
  eventsRun,
  libraryCount,
  signupsAttributed,
}: HeroProps) {
  const eventsCopy =
    liveEventCount > 0
      ? `${liveEventCount} event${liveEventCount === 1 ? '' : 's'} live`
      : 'Next event in the next 7 days';

  const stats: Array<[string, string]> = [
    ['Active builders', formatNumber(activeBuilders)],
    ['Events run', formatNumber(eventsRun)],
    ['Library entries', `${libraryCount}`],
    ['Sign-ups attributed', formatNumber(signupsAttributed)],
  ];

  return (
    <section className={styles.root}>
      <div className={styles.gridBg} aria-hidden />
      <div className={styles.limeBlur} aria-hidden />
      <div className={styles.inner}>
        <span className={styles.pill}>
          <span className={styles.liveDot} />
          {eventsCopy}
          {' · '}
          {formatNumber(activeBuilders)} active builders
        </span>
        <Text variant="display-3" as="h1" className={styles.title}>
          Nebius for{' '}
          <span className={styles.headlineHighlight}>
            <span className={styles.headlineUnderline} aria-hidden />
            <span className={styles.headlineText}>AI Builders</span>
          </span>
          .
        </Text>
        <Text variant="body-3" color="secondary" as="p" className={styles.lede}>
          From training and fine-tuning to production inference at scale. Plus a
          community of builders shipping real work — workshops, demos,
          hackathons, office hours. Get started with $100 of Token Factory or AI
          Cloud credits.
        </Text>
        <div className={styles.ctas}>
          <Button view="action" size="xl" href="/signup">
            Start building &rarr;
          </Button>
          <Button view="outlined" size="xl" href="/events">
            Find an event near you
          </Button>
          <Button view="flat" size="xl" href="/library/running-openclaw-on-nebius">
            Watch: Running OpenClaw on Nebius &rarr;
          </Button>
        </div>
        <dl className={styles.stats}>
          {stats.map(([label, value]) => (
            <div key={label} className={styles.stat}>
              <dt className={styles.statLabel}>{label}</dt>
              <dd className={styles.statValue}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// Preserved for callers that want to import as default.
export default Hero;
