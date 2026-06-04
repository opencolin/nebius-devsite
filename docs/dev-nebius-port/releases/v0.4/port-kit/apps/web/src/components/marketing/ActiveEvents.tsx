// ActiveEvents — "Next up" rail of three upcoming events with a CTA to the
// full /events map. Receives a pre-filtered list of events from
// getStaticProps (status=PUBLISHED, sorted by start_at, top 3). Renders
// each card with venue, format, and a Luma or /events deep link.
//
// Ported from nb3 active-events.tsx. The upstream uses an external
// BuilderEventCard; we inline a leaner card here because the wider events
// page (/events) already has the full feature set.

import Link from 'next/link';

import {Button, Label, Text} from '@gravity-ui/uikit';

import {eventHref} from '@/lib/event-url';
import {formatDateTime} from '@/lib/format';

import styles from './ActiveEvents.module.scss';

export interface MarketingEvent {
  id: string;
  title: string;
  format: string;
  starts_at: string;
  city: string;
  country: string;
  is_online: boolean;
  product_focus: string[];
  is_official: boolean;
  luma_url?: string | null;
  // Nebius.com-hosted webinars (e.g. SemiAnalysis collab) come in on
  // official_url, not luma_url; both feed the CTA via eventHref().
  official_url?: string | null;
}

interface Props {
  events: MarketingEvent[];
}

function formatLabel(format: string): string {
  // 'OFFICE_HOURS' → 'Office Hours'
  return format
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function ActiveEvents({events}: Props) {
  const next = events.slice(0, 3);

  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <Text variant="caption-2" className={styles.eyebrow}>
              Next up
            </Text>
            <Text variant="header-2" as="h2" className={styles.title}>
              Upcoming Nebius builder events
            </Text>
            <Text variant="body-2" color="secondary" className={styles.body}>
              Builder-hosted meetups and the Nebius official tour. Token Factory
              keys load on the day.
            </Text>
          </div>
          <Button view="outlined" size="l" href="/events">
            See all on the map &rarr;
          </Button>
        </div>

        <div className={styles.grid}>
          {next.map((e) => {
            // Luma → Nebius webinar → internal /events anchor (always
            // truthy). external check stays the same: only http(s) URLs
            // get target="_blank".
            const href = eventHref(e) ?? `/events#${e.id}`;
            const external = href.startsWith('http');
            return (
              <article key={e.id} className={styles.card}>
                <div className={styles.cardMeta}>
                  <Label theme="utility" size="s">
                    {formatLabel(e.format)}
                  </Label>
                  {e.is_official ? (
                    <Label theme="warning" size="s">
                      Official
                    </Label>
                  ) : null}
                </div>
                <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                  {e.title}
                </Text>
                <Text variant="body-2" color="secondary" className={styles.cardWhere}>
                  {e.is_online ? 'Online' : `${e.city}, ${e.country}`}
                </Text>
                <Text variant="caption-2" color="hint" className={styles.cardWhen}>
                  {formatDateTime(e.starts_at)}
                </Text>
                {external ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.cardLink}
                  >
                    RSVP &uarr;
                  </a>
                ) : (
                  <Link href={href} className={styles.cardLink}>
                    Details &rarr;
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ActiveEvents;
