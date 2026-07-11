// Community — 6-up grid of community surfaces: Discord, Events, Builder
// Hours, GitHub, YouTube, and Library. Each card is a full link (internal
// or external). White-bg variant, hover lifts the border and underlines
// the CTA.
//
// Ported from nb3 community.tsx.

import Link from 'next/link';

import {Text} from '@gravity-ui/uikit';

import styles from './Community.module.scss';

interface CommunityCard {
  title: string;
  blurb: string;
  cta: string;
  href: string;
}

const CARDS: CommunityCard[] = [
  {
    title: 'Discord',
    blurb:
      "Ask questions, share what you're building, and get help from other Tenki builders and the team.",
    cta: 'Join Discord',
    href: 'https://discord.gg/qNFaWrR6um',
  },
  {
    title: 'Hackathons & Events',
    blurb:
      'Hands-on sessions for inference, training, and real workloads. Bring a laptop, ship something real.',
    cta: 'See upcoming events',
    href: '/events',
  },
  {
    title: 'GitHub',
    blurb:
      'Examples, templates, and reference architectures to copy-paste into your stack.',
    cta: 'Go to repos',
    href: 'https://github.com/tenki-cloud',
  },
  {
    title: 'YouTube',
    blurb:
      'Walkthroughs, demos, and technical deep dives from the Tenki team.',
    cta: 'See videos',
    href: 'https://github.com/tenki-cloud',
  },
  {
    title: 'X / Twitter',
    blurb:
      'Daily updates, release threads, and the occasional GPU benchmark from @TenkiCloud.',
    cta: 'Follow @TenkiCloud',
    href: 'https://x.com/TenkiCloud',
  },
  {
    title: 'LinkedIn',
    blurb:
      'Company announcements, partnerships, and team posts. Good follow if your stakeholders live here.',
    cta: 'Follow on LinkedIn',
    href: 'https://www.linkedin.com/company/tenki-cloud',
  },
];

function CardWrapper({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith('http');
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={styles.card}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={styles.card}>
      {children}
    </Link>
  );
}

export function Community() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Community
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            Join the community
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            Get help, share what you&rsquo;re building, and connect with other
            Tenki builders.
          </Text>
        </header>

        <div className={styles.grid}>
          {CARDS.map((c) => {
            const isExternal = c.href.startsWith('http');
            return (
              <CardWrapper key={c.title} href={c.href}>
                <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                  {c.title}
                </Text>
                <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                  {c.blurb}
                </Text>
                <span className={styles.cardCta}>
                  {c.cta} {isExternal ? '↑' : '→'}
                </span>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Community;
