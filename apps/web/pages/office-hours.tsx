// /office-hours — bespoke landing modeled on the upstream draft:
//   1. Hero — title + "drop-in + 1:1" intro
//   2. Open drop-in office hours — recurring community events (London, Berlin)
//   3. Weekly 1:1 slots — one card per region-anchored advocate (Calendly)
//   4. FAQ — quick answers before booking
//   5. Footer CTA — Discord fallback
//
// 1:1 cards pull from team_members (active + has calendly_url). Drop-in
// events are hand-authored here for now — moving them to a Directus
// collection (`recurring_events` or filtering events by format=OFFICE_HOURS)
// is a future polish task.
//
// Booking is auth-gated. Unauthenticated visitors see "Sign in to book";
// signed-in visitors get the live Calendly link. The auth check runs
// server-side in getServerSideProps so the rendered HTML matches what the
// session permits — no flash-of-unauthed-button after hydration.

import {readItems} from '@directus/sdk';
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Button, Card, Label, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {PhosphorMesh} from '@/components/hero/PhosphorMesh';
import {getServerSession} from '@/lib/auth';
import {directusServer} from '@/lib/directus';

import page from '@/styles/page.module.scss';
import styles from './office-hours.module.scss';

interface TeamMember {
  slug: string;
  name: string;
  title: string;
  bio: string;
  region: string;
  timezone: string;
  expertise: string[];
  calendly_url?: string | null;
  github_handle?: string | null;
}

interface Props {
  members: TeamMember[];
  isSignedIn: boolean;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const directus = directusServer();
  const members = (await directus.request(
    readItems('team_members', {
      filter: {active: {_eq: true}},
      sort: ['sort_order', 'name'],
      fields: ['slug', 'name', 'title', 'bio', 'region', 'timezone', 'expertise', 'calendly_url', 'github_handle'],
      limit: -1,
    }),
  )) as TeamMember[];
  const user = await getServerSession(ctx.req, ctx.res);
  return {props: {members, isSignedIn: Boolean(user)}};
};

// Hand-authored recurring drop-in events. Move to Directus when the team
// outgrows hand-coding (e.g. when partner-hosted slots multiply).
const DROP_INS: Array<{
  title: string;
  city: string;
  blurb: string;
  cadence: string;
  url: string;
  host: string;
}> = [
  {
    title: 'Builders & Brews London',
    city: 'London',
    blurb:
      'London co-working drop-in for AI builders at Encode Hub. Coffee on, laptops out, Token Factory credits available for the room.',
    cadence: 'Every other Tuesday · 18:00 BST',
    url: 'https://lu.ma/builders-brews-london',
    host: '@priya',
  },
  {
    title: 'build fridays london',
    city: 'London',
    blurb:
      'Friday co-working session in London for early-stage AI founders. Bring your laptop, bring your repo, leave with progress.',
    cadence: 'Fridays · 14:00 BST',
    url: 'https://lu.ma/build-fridays-london',
    host: '@priya',
  },
  {
    title: 'Builders & Brews Berlin',
    city: 'Berlin',
    blurb:
      'Berlin co-working session at St. Oberholz. Talk to other AI builders, get unstuck on your stack, claim Token Factory credits.',
    cadence: 'Wednesdays · 18:30 CET',
    url: 'https://lu.ma/builders-brews-berlin',
    host: '@jonas',
  },
];

const FAQ: Array<{q: string; a: string}> = [
  {
    q: 'What should I bring?',
    a: "A specific question or a repo we can look at together. Office hours work best as a working session — not a sales pitch and not a demo of our roadmap.",
  },
  {
    q: 'Can my whole team join?',
    a: "Yes. Up to four people on the call is fine. If you're more than that, talk to us about a private workshop via the Ambassador program instead.",
  },
  {
    q: 'Is it under NDA?',
    a: "Default no. If you need it under NDA, mention it on the booking and we'll send paperwork before the session.",
  },
  {
    q: "What's out of scope?",
    a: "Anything that requires reading code we haven't seen for hours. For deep dives, the better path is a paid Solutions Architect engagement — happy to make the intro.",
  },
  {
    q: 'Do you record the session?',
    a: "Only if you ask. We default to off and we don't share recordings anywhere if we do record.",
  },
  {
    q: 'I missed the booking window — what now?',
    a: "Drop a question in the Discord office-hours channel. The team checks it daily and we'll route it to whichever advocate can answer fastest.",
  },
];

export default function OfficeHoursPage({
  members,
  isSignedIn,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const oneOnOneAdvocates = members.filter((m) => m.calendly_url);

  return (
    <PublicLayout>
      <Head>
        <title>{`Office Hours · Nebius Builders`}</title>
        <meta
          name="description"
          content="Open public office-hours plus weekly 1:1 slots with the Nebius Builders team — one per region. Bring a real question; we'll bring a working session."
        />
      </Head>

      {/* ---- Hero ----
          PhosphorMesh (variant-B1a Soft Haze) sits behind the content as a
          full-bleed visual. The mesh component owns its own dark scene
          background (#04060a) so we don't need a fallback bg on the hero
          itself — but we still set one so SSR + the brief moment before the
          three.js chunk lands isn't a flash of light theme. */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <PhosphorMesh aspectRatio={21 / 9} />
        </div>
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Office Hours</span>
          <h1 className={styles.heroTitle}>Drop in. Get unstuck.</h1>
          <p className={styles.heroDescription}>
            Open public office-hours events plus weekly 1:1 slots with the
            Nebius Builders team — one per region. Bring a real question;
            we&apos;ll bring a working session.
          </p>
          <div className={styles.heroActions}>
            <Button view="action" size="xl" href="#drop-in">
              Open drop-ins
            </Button>
            <Button view="outlined" size="xl" href="#one-on-one">
              See 1:1 slots
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Open drop-in office hours ---- */}
      <section id="drop-in" className={styles.section}>
        <div className={styles.sectionHead}>
          <Text variant="caption-2" color="secondary" className={styles.sectionEyebrow}>
            Open drop-in
          </Text>
          <h2 className={styles.sectionTitle}>Open drop-in office hours.</h2>
          <p className={styles.sectionLede}>
            Recurring group office hours hosted by ambassadors and the team.
            Show up, ask anything, eat the pizza.
          </p>
        </div>

        <div className={page.grid2}>
          {DROP_INS.map((d) => (
            <a
              key={d.title}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.dropInLink}
            >
              <Card view="filled" className={styles.dropInCard}>
                <div className={styles.dropInMeta}>
                  <Label theme="info" size="xs">
                    {d.city}
                  </Label>
                  <Text variant="caption-2" color="secondary">
                    {d.cadence} · hosted by {d.host}
                  </Text>
                </div>
                <Text variant="subheader-2" as="h3">
                  {d.title}
                </Text>
                <Text variant="body-2" color="secondary" className={styles.dropInBlurb}>
                  {d.blurb}
                </Text>
                <Text variant="caption-2" color="info" className={styles.dropInCta}>
                  RSVP on Luma →
                </Text>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* ---- Weekly 1:1 slots ---- */}
      <section id="one-on-one" className={styles.section}>
        <div className={styles.sectionHead}>
          <Text variant="caption-2" color="secondary" className={styles.sectionEyebrow}>
            Weekly 1:1 slots
          </Text>
          <h2 className={styles.sectionTitle}>One slot per region, every week.</h2>
          <p className={styles.sectionLede}>
            15 minutes minimum, 60 minutes if you&apos;ve got a working session
            in mind. Calendly takes care of time zones.{' '}
            {!isSignedIn ? (
              <>
                <Link href={`/login?next=${encodeURIComponent('/office-hours#one-on-one')}`} className={styles.inlineSignIn}>
                  Sign in
                </Link>{' '}
                to book.
              </>
            ) : null}
          </p>
        </div>

        <div className={page.grid2}>
          {oneOnOneAdvocates.map((m) => (
            <Card key={m.slug} view="filled" className={styles.advocateCard}>
              <div className={styles.advocateHead}>
                <div className={styles.advocateMeta}>
                  <Text variant="subheader-2" as="h3">
                    {m.name}
                  </Text>
                  <Text variant="caption-2" color="secondary" className={styles.advocateTitle}>
                    {m.title.replace(', Nebius', '')}
                  </Text>
                  <Text variant="caption-2" color="secondary">
                    {m.region} · {m.timezone}
                  </Text>
                </div>
              </div>
              <Text variant="body-2" color="secondary" className={styles.advocateBio}>
                {m.bio}
              </Text>
              <div className={styles.advocateTags}>
                {m.expertise.slice(0, 4).map((e) => (
                  <Label key={e} theme="normal" size="xs">
                    {e}
                  </Label>
                ))}
              </div>
              <div className={styles.advocateActions}>
                {isSignedIn ? (
                  <Button
                    view="action"
                    size="m"
                    href={m.calendly_url ?? '#'}
                    target="_blank"
                  >
                    Book on Calendly →
                  </Button>
                ) : (
                  <Button
                    view="action"
                    size="m"
                    href={`/login?next=${encodeURIComponent('/office-hours#one-on-one')}`}
                  >
                    Sign in to book
                  </Button>
                )}
                <Link href={`/team/${m.slug}`} className={styles.profileLink}>
                  See profile
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <Text variant="caption-2" color="secondary" className={styles.sectionEyebrow}>
            FAQ
          </Text>
          <h2 className={styles.sectionTitle}>Quick answers before you book.</h2>
          <p className={styles.sectionLede}>
            The stuff people ask right after they click Schedule.
          </p>
        </div>

        <div className={styles.faqList}>
          {FAQ.map((item) => (
            <details key={item.q} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{item.q}</summary>
              <p className={styles.faqAnswer}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---- Footer CTA ---- */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Can&apos;t make any of the slots?</h2>
        <p className={styles.ctaDescription}>
          Drop the question in the Discord office-hours channel. The team
          checks it daily and routes it to whoever can answer fastest.
        </p>
        <div className={styles.ctaActions}>
          <Button
            view="action"
            size="xl"
            href="https://discord.gg/nebius"
            target="_blank"
          >
            Join Discord →
          </Button>
          <Button view="outlined" size="xl" href="mailto:builders@nebius.com">
            Email the team
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
