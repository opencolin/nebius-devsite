// Marketing homepage — composes the 14 marketing sections ported from
// opencolin/nebius-builders-3 into a single Pages Router page.
//
// Data strategy:
//   - Events, library entries, and the monthly builder project come from
//     Directus via getStaticProps (revalidated every 60s).
//   - Pure marketing metrics (active builders, events run, sign-ups
//     attributed) are hard-coded here until a programs collection lands.
//
// The map-hero + CMS body that used to live at `/` is now at /signup.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import {Button} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {ActiveEvents, type MarketingEvent} from '@/components/marketing/ActiveEvents';
import {BuildInPublic} from '@/components/marketing/BuildInPublic';
import {BuilderSpotlight, type SpotlightProject} from '@/components/marketing/BuilderSpotlight';
import {CodingAgents} from '@/components/marketing/CodingAgents';
import {Community} from '@/components/marketing/Community';
import {Contact} from '@/components/marketing/Contact';
import {EcosystemPartners} from '@/components/marketing/EcosystemPartners';
import {Products} from '@/components/marketing/Products';
import {Programs} from '@/components/marketing/Programs';
import {UseCases} from '@/components/marketing/UseCases';
import {WorkshopSpotlight, type LibrarySpotlightEntry} from '@/components/marketing/WorkshopSpotlight';
import {directusServer} from '@/lib/directus';
import type {BuildersEventRow, LibraryArticleRow, ProjectRow} from '@/lib/types';

import styles from './index.module.scss';

// Hero map is client-only (Leaflet touches `window`).
const HeroEventsMap = dynamic(() => import('@/components/hero/HeroEventsMap'), {
  ssr: false,
});

interface HeroEvent {
  id: string;
  title: string;
  location?: {type: 'Point'; coordinates: [number, number]} | null;
}

// TODO: replace these hard-codes with a programs/metrics collection in
// Directus once one exists. Numbers mirror nb3 /lib/network for parity.
const PROGRAM_METRICS = {
  activeBuilders: 2_847,
  eventsRun: 142,
  signupsAttributed: 5_320,
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface Props {
  events: MarketingEvent[];
  heroEvents: HeroEvent[];
  liveEventCount: number;
  libraryCount: number;
  featuredWorkshop: LibrarySpotlightEntry | null;
  relatedWorkshops: LibrarySpotlightEntry[];
  monthlyProject: SpotlightProject | null;
  monthLabel: string;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const directus = directusServer();

  // Fetch Directus collections in parallel. Each is wrapped in a try/catch
  // so a dev environment without all collections seeded still renders the
  // page (showing the empty-state branches).
  const safeRequest = async <T,>(p: Promise<T[]>): Promise<T[]> => {
    try {
      return await p;
    } catch (err) {
      console.warn('[homepage] directus fetch failed:', err);
      return [];
    }
  };

  const [eventsRaw, libraryRaw, projectsRaw] = await Promise.all([
    safeRequest(
      directus.request(
        readItems('events', {
          filter: {status: {_eq: 'PUBLISHED'}},
          sort: ['starts_at'],
          fields: [
            'id',
            'title',
            'format',
            'starts_at',
            'ends_at',
            'city',
            'country',
            'is_online',
            'product_focus',
            'is_official',
            'luma_url',
            'location',
          ],
          limit: -1,
        }),
      ) as Promise<BuildersEventRow[]>,
    ),
    safeRequest(
      directus.request(
        readItems('library_articles', {
          filter: {status: {_eq: 'published'}},
          sort: ['-is_official', 'title'],
          fields: [
            'slug',
            'type',
            'title',
            'blurb',
            'level',
            'duration_min',
            'product_focus',
            'is_official',
          ],
          limit: -1,
        }),
      ) as Promise<LibraryArticleRow[]>,
    ),
    safeRequest(
      directus.request(
        readItems('projects', {
          sort: ['-featured', 'title'],
          fields: [
            'slug',
            'title',
            'tagline',
            'description',
            'builder_handle',
            'tags',
            'product_focus',
            'repo_url',
          ],
          limit: -1,
        }),
      ) as Promise<ProjectRow[]>,
    ),
  ]);

  // Live events: now() inside [starts_at, ends_at]. Sorted-by-start_at
  // already; just count the live ones for the hero pill.
  const now = Date.now();
  const liveEventCount = eventsRaw.filter((e) => {
    const start = +new Date(e.starts_at);
    const end = +new Date(e.ends_at);
    return now >= start && now <= end;
  }).length;

  // Future-ish events: starts in the future, or already started and not yet
  // ended. ActiveEvents takes the first 3.
  const upcoming = eventsRaw.filter((e) => {
    const end = +new Date(e.ends_at);
    return end >= now;
  });
  const events: MarketingEvent[] = upcoming.slice(0, 3).map((e) => ({
    id: e.id,
    title: e.title,
    format: e.format,
    starts_at: e.starts_at,
    city: e.city,
    country: e.country,
    is_online: e.is_online,
    product_focus: e.product_focus ?? [],
    is_official: e.is_official,
    luma_url: e.luma_url ?? null,
  }));

  // For the map hero: every event with coordinates, regardless of past/upcoming
  // — same shape and source the old homepage used. The hero is a "where the
  // community is" thing, not a "what's next" thing; past events still belong.
  const heroEvents: HeroEvent[] = eventsRaw.map((e) => ({
    id: e.id,
    title: e.title,
    location: e.location ?? null,
  }));

  // Workshop spotlight: prefer the canonical OpenClaw entry by slug, fall
  // back to the first workshop. The "related" rail picks the next two
  // WORKSHOP-type entries.
  const toLibrary = (l: LibraryArticleRow): LibrarySpotlightEntry => ({
    slug: l.slug,
    type: l.type,
    title: l.title,
    blurb: l.blurb,
    level: l.level,
    duration_min: l.duration_min ?? null,
    product_focus: l.product_focus ?? [],
    is_official: l.is_official,
  });

  const featuredRaw =
    libraryRaw.find((l) => l.slug === 'running-openclaw-on-nebius') ?? libraryRaw[0];
  const featuredWorkshop = featuredRaw ? toLibrary(featuredRaw) : null;
  const relatedWorkshops = libraryRaw
    .filter((l) => l.slug !== featuredRaw?.slug && l.type === 'WORKSHOP')
    .slice(0, 2)
    .map(toLibrary);

  // Monthly project: same picker as upstream, cycles on the 1st of each
  // month UTC. If projects collection is empty, the BuilderSpotlight
  // section renders nothing.
  const monthDate = new Date();
  const monthIndex = monthDate.getUTCFullYear() * 12 + monthDate.getUTCMonth();
  const project =
    projectsRaw.length > 0 ? projectsRaw[monthIndex % projectsRaw.length] : null;
  const monthlyProject: SpotlightProject | null = project
    ? {
        slug: project.slug,
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        builderHandle: project.builder_handle,
        builderName: project.builder_handle, // No name field on ProjectRow yet
        tags: project.tags ?? [],
        productFocus: project.product_focus ?? [],
        repoUrl: project.repo_url ?? null,
      }
    : null;
  const monthLabel = `${MONTHS[monthDate.getUTCMonth()]} ${monthDate.getUTCFullYear()}`;

  return {
    props: {
      events,
      heroEvents,
      liveEventCount,
      libraryCount: libraryRaw.length,
      featuredWorkshop,
      relatedWorkshops,
      monthlyProject,
      monthLabel,
    },
    revalidate: 60,
  };
};

export default function HomePage({
  events,
  heroEvents,
  featuredWorkshop,
  relatedWorkshops,
  monthlyProject,
  monthLabel,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const heroEventCount = heroEvents.filter(
    (e) => e.location?.coordinates?.length === 2,
  ).length;

  return (
    <PublicLayout>
      <Head>
        <title>Nebius for AI Builders</title>
        <meta
          name="description"
          content="From training and fine-tuning to production inference at scale. Plus a community of builders shipping real work."
        />
      </Head>

      {/* Map-hero — preserved from the pre-rebuild homepage at the user's
          request. The new Hero from nebius-builders-3 is unused; the rest of
          the marketing composition (ActiveEvents, Products, ...) renders
          below it. */}
      <section className={styles.hero}>
        <HeroEventsMap events={heroEvents} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Nebius for AI Builders</h1>
          <p className={styles.heroDescription}>
            From training and fine-tuning to production inference at scale.
            Plus a community of builders shipping real work — workshops, demos,
            hackathons, office hours.
          </p>
          <div className={styles.heroActions}>
            <Button view="action" size="xl" href="/signup">
              Start building
            </Button>
            <Button view="outlined" size="xl" href="https://docs.nebius.com" target="_blank">
              Read the docs
            </Button>
          </div>
          <div className={styles.heroFootnote}>
            Live map · {heroEventCount} event locations across the network
          </div>
        </div>
      </section>

      <ActiveEvents events={events} />
      <Products />
      <CodingAgents />
      <UseCases />
      <WorkshopSpotlight featured={featuredWorkshop} related={relatedWorkshops} />
      <BuilderSpotlight project={monthlyProject} monthLabel={monthLabel} />
      <Community />
      <Programs />
      <EcosystemPartners />
      <Contact />
      <BuildInPublic />
    </PublicLayout>
  );
}
