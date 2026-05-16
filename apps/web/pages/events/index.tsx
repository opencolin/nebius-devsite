import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import {Button, Label, Text} from '@gravity-ui/uikit';
import {useRouter} from 'next/router';
import {useState} from 'react';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';
import {formatDateTime} from '@/lib/format';

import page from '@/styles/page.module.scss';
import styles from './events.module.scss';

// Leaflet touches `window`, so the map can't SSR.
// In the events hero the map is full-bleed dark; the loading shim is just a
// matching dark block so the layout doesn't shift when tiles arrive.
const EventsMap = dynamic(() => import('@/components/events/EventsMap'), {
  ssr: false,
  loading: () => <div className={styles.heroMapPlaceholder} />,
});

interface EventRow {
  id: string;
  title: string;
  description: string;
  format: string;
  starts_at: string;
  ends_at: string;
  city: string;
  country: string;
  is_online: boolean;
  product_focus: string[];
  is_official: boolean;
  luma_url?: string | null;
  builder_handle?: string | null;
  location?: {type: 'Point'; coordinates: [number, number]} | null;
}

export const getStaticProps: GetStaticProps<{events: EventRow[]}> = async () => {
  const directus = directusServer();
  const events = (await directus.request(
    readItems('events', {
      filter: {status: {_eq: 'PUBLISHED'}},
      sort: ['starts_at'],
      fields: ['id', 'title', 'description', 'format', 'starts_at', 'ends_at', 'city', 'country', 'is_online', 'product_focus', 'is_official', 'luma_url', 'location'],
      limit: -1,
    }),
  )) as EventRow[];
  return {props: {events}, revalidate: 60};
};

export default function EventsPage({
  events,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // City filter: clicking a dot on the map sets activeCity; the lists below
  // narrow to events in that city. Click the same dot again or hit the clear
  // button on the active-filter pill to reset.
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const handleCityClick = (city: string) => {
    setActiveCity((prev) => (prev === city ? null : city));
  };

  // Split upcoming vs past based on the event's START date, anchored to the
  // beginning of today (UTC). An event qualifies as "upcoming" if it
  // hasn't started yet OR starts today. Anything that already started
  // before today — even if it's still running — is treated as past, since
  // the typical visitor question is "what can I attend from here on?",
  // not "what's currently in progress?".
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();
  const isUpcoming = (e: EventRow) => +new Date(e.starts_at) >= startOfTodayMs;

  // For the map: every upcoming event regardless of activeCity, so all city
  // dots stay visible while a single city is selected.
  const allUpcoming = events.filter(isUpcoming);

  // For the lists below: respect activeCity if one is selected.
  const visibleEvents = activeCity
    ? events.filter((e) => e.city === activeCity)
    : events;
  const upcoming = visibleEvents.filter(isUpcoming);
  // Past events: reverse-chronological so the most recently-finished events
  // sit at the top — that's what someone scanning "what just happened" wants.
  const past = visibleEvents
    .filter((e) => !isUpcoming(e))
    .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at));

  return (
    <PublicLayout>
      <Head>
        <title>Events · Nebius Builders</title>
        <meta
          name="description"
          content="Upcoming workshops, demo nights, hackathons, and office hours from the Nebius community."
        />
      </Head>
      <section className={styles.hero}>
        {/* Pin only upcoming events on the map. Past events still appear in
            the lists below — but the globe should reflect what someone can
            actually go to. */}
        <EventsMap
          events={allUpcoming}
          onCityClick={handleCityClick}
          activeCity={activeCity}
          variant="dark"
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div>
            <span className={styles.heroEyebrow}>Events</span>
            <h1 className={styles.heroTitle}>Workshops, demos, hackathons</h1>
            <p className={styles.heroDescription}>
              {upcoming.length} upcoming · {past.length} past. Hosted by the
              Nebius DevRel team and the global community of builders. Click a
              city pin to filter.
            </p>
          </div>
        </div>
      </section>

      {/* City chips reflect upcoming events only — same scope as the map
          dots above, so the filter answers "where can I go?", not
          "where has Nebius been?". A city with only past events won't
          show as a chip; if its past entries are wanted, expand the
          collapsed Recent section below to see them. */}
      <CityFilter
        events={allUpcoming}
        activeCity={activeCity}
        onChange={setActiveCity}
      />

      <div className={page.container} style={{paddingTop: 24}}>
        <Section
          title="Upcoming"
          events={upcoming}
          emptyText={activeCity ? `No upcoming events in ${activeCity}.` : 'No upcoming events.'}
          actions={<RefreshButton />}
        />
        <Section
          title="Recent"
          events={past.slice(0, 12)}
          emptyText={activeCity ? undefined : 'No recent events.'}
          collapsible
        />
      </div>
    </PublicLayout>
  );
}

function Section({
  title,
  events,
  emptyText,
  actions,
  collapsible,
}: {
  title: string;
  events: EventRow[];
  emptyText?: string;
  actions?: React.ReactNode;
  // When true, the section is wrapped in a native <details>/<summary> and
  // closed by default. Used for /events Recent — visitors come for upcoming
  // events first; past ones live one click away.
  collapsible?: boolean;
}) {
  if (!events.length && !emptyText) return null;

  const body =
    events.length === 0 ? (
      <Text color="secondary">{emptyText}</Text>
    ) : (
      <div className={page.grid3}>
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    );

  if (collapsible) {
    return (
      <section style={{marginTop: 32}}>
        <details className={styles.collapsible}>
          <summary className={styles.sectionHeader}>
            <Text variant="header-1" as="h2">
              {title}{' '}
              <Text variant="header-1" color="secondary">
                ({events.length})
              </Text>
            </Text>
          </summary>
          <div style={{marginTop: 16}}>{body}</div>
        </details>
      </section>
    );
  }

  return (
    <section style={{marginTop: 32}}>
      <div className={styles.sectionHeader}>
        <Text variant="header-1" as="h2">
          {title}
        </Text>
        {actions ? <div className={styles.sectionActions}>{actions}</div> : null}
      </div>
      {body}
    </section>
  );
}

function CityFilter({
  events,
  activeCity,
  onChange,
}: {
  events: EventRow[];
  activeCity: string | null;
  onChange: (city: string | null) => void;
}) {
  // Unique cities sorted by event count (most events first), then alpha.
  // Skip blanks / placeholders so the chip row stays clean.
  const counts = new Map<string, number>();
  for (const e of events) {
    const c = e.city?.trim();
    if (!c || c === '—') continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const cities = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([city, count]) => ({city, count}));

  if (cities.length === 0) return null;

  return (
    <div className={styles.cityFilter}>
      <div className={styles.cityFilterInner}>
        <Text variant="caption-2" color="secondary" className={styles.cityFilterLabel}>
          Filter by city
        </Text>
        <div className={styles.cityChips}>
          <Button
            view={activeCity == null ? 'action' : 'outlined'}
            size="m"
            onClick={() => onChange(null)}
          >
            All ({events.length})
          </Button>
          {cities.map(({city, count}) => (
            <Button
              key={city}
              view={activeCity === city ? 'action' : 'outlined'}
              size="m"
              onClick={() => onChange(activeCity === city ? null : city)}
            >
              {city} ({count})
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RefreshButton() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  async function refresh() {
    setState('loading');
    setMsg('Scraping luma.com/nebiusAI and nebius.com/events…');
    try {
      const r = await fetch('/api/events/refresh', {method: 'POST'});
      if (r.status === 401) {
        setState('error');
        setMsg('Sign in as admin to refresh events.');
        return;
      }
      if (r.status === 403) {
        setState('error');
        setMsg('Admin role required.');
        return;
      }
      const j = (await r.json()) as {
        scraped: number; created: number; updated: number; skipped: number;
        sources: Array<{source: string; ok: boolean; count: number; error?: string}>;
      };
      if (!r.ok) {
        setState('error');
        setMsg('error' in j ? String((j as {error?: string}).error) : `HTTP ${r.status}`);
        return;
      }
      setState('ok');
      setMsg(
        `Scraped ${j.scraped} (luma + nebius.com), created ${j.created}, updated ${j.updated}, skipped ${j.skipped}.`,
      );
      // Trigger ISR re-fetch by full-reloading the page
      setTimeout(() => router.replace(router.asPath), 1000);
    } catch (err) {
      setState('error');
      setMsg((err as Error).message);
    }
  }

  return (
    <span style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <Button view="outlined" size="m" loading={state === 'loading'} onClick={refresh}>
        ↻ Refresh
      </Button>
      {msg ? (
        <Text variant="caption-2" color={state === 'error' ? 'danger' : 'secondary'}>
          {msg}
        </Text>
      ) : null}
    </span>
  );
}

// Event card — mirrors upstream BuilderEventCard. Cover gradient varies by
// format (workshop / hack / demo / official). State pill (LIVE / UPCOMING /
// PAST) sits top-left; city pill sits top-right. The card itself is the
// link target — clicking anywhere on it pops the Luma RSVP, which keeps
// the card single-tap-friendly.
function EventCard({event}: {event: EventRow}) {
  const state = eventState(event);
  const cardBody = (
    <article className={styles.card}>
      <EventCover event={event} state={state} />
      <div className={styles.cardBody}>
        <Text variant="caption-2" color="secondary" className={styles.cardEyebrow}>
          {event.format}
          {' · '}
          {formatDateTime(event.starts_at)}
        </Text>
        <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
          {event.title}
        </Text>
        <Text variant="body-2" color="secondary" className={styles.cardDesc}>
          {event.description}
        </Text>
        {event.product_focus.length > 0 ? (
          <div className={styles.cardTagRow}>
            {event.product_focus.slice(0, 3).map((t) => (
              <Label key={t} theme="normal" size="xs">
                {t}
              </Label>
            ))}
          </div>
        ) : null}
      </div>
      <footer className={styles.cardFooter}>
        <Text variant="caption-2" color="secondary">
          {event.is_online ? 'Online' : `${event.city || '—'}${event.country ? `, ${event.country}` : ''}`}
        </Text>
        {event.luma_url ? (
          <Text variant="caption-2" color="info">
            RSVP ↗
          </Text>
        ) : null}
      </footer>
    </article>
  );
  return event.luma_url ? (
    <a
      href={event.luma_url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cardLink}
    >
      {cardBody}
    </a>
  ) : (
    <div className={styles.cardLink}>{cardBody}</div>
  );
}

// Map an event row to a {label, theme} for the state pill on the cover.
function eventState(event: EventRow): {label: string; tone: 'live' | 'upcoming' | 'past'} {
  const now = Date.now();
  const start = +new Date(event.starts_at);
  const end = +new Date(event.ends_at);
  if (now >= start && now <= end) return {label: 'Live', tone: 'live'};
  if (now < start) {
    // Show relative-day label up to a week out, otherwise just "Upcoming".
    const days = Math.round((start - now) / (1000 * 60 * 60 * 24));
    if (days <= 0) return {label: 'Today', tone: 'upcoming'};
    if (days === 1) return {label: 'Tomorrow', tone: 'upcoming'};
    if (days <= 7) return {label: `In ${days} days`, tone: 'upcoming'};
    return {label: 'Upcoming', tone: 'upcoming'};
  }
  return {label: 'Past', tone: 'past'};
}

function EventCover({
  event,
  state,
}: {
  event: EventRow;
  state: {label: string; tone: 'live' | 'upcoming' | 'past'};
}) {
  const variantClass = coverVariantForEvent(event);
  return (
    <div className={`${styles.cover} ${variantClass}`} aria-hidden>
      <div className={styles.coverTopLeft}>
        <span
          className={`${styles.coverPill} ${
            state.tone === 'live'
              ? styles.coverPillLive
              : state.tone === 'past'
                ? styles.coverPillPast
                : styles.coverPillUpcoming
          }`}
        >
          {state.label}
        </span>
        {event.is_official ? (
          <span className={`${styles.coverPill} ${styles.coverPillOfficial}`}>
            Official
          </span>
        ) : null}
      </div>
      {event.city && event.city !== '—' ? (
        <div className={styles.coverTopRight}>
          <span className={styles.coverPill}>{event.city}</span>
        </div>
      ) : null}
      <span className={styles.coverGlyph}>
        {event.format ? formatGlyph(event.format) : '·'}
      </span>
    </div>
  );
}

// Glyph shown big & translucent in the center of the cover. Cheaper than
// per-format SVGs and reads well at the small cover size.
function formatGlyph(format: string) {
  const f = format.toLowerCase();
  if (f.includes('workshop')) return '🛠';
  if (f.includes('hack')) return '⚡';
  if (f.includes('demo')) return '▶';
  if (f.includes('office')) return '☕';
  return '·';
}

function coverVariantForEvent(event: EventRow): string {
  const f = (event.format ?? '').toLowerCase();
  if (event.is_official) return styles.coverOfficial;
  if (f.includes('hack')) return styles.coverHack;
  if (f.includes('workshop')) return styles.coverWorkshop;
  if (f.includes('demo')) return styles.coverDemo;
  return styles.coverDefault;
}
