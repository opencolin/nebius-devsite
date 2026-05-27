// Public top nav. Built from Gravity UI primitives so the markup matches
// nebius.com's `g-button g-button_view_normal`-style classnames out of the
// box. Logo is the official Nebius mark + "Builders" wordmark.

import {Button} from '@gravity-ui/uikit';
import Link from 'next/link';

import {DocsMenu} from '@/components/chrome/DocsMenu';
import {Logo} from '@/components/chrome/Logo';
import {ThemeToggle} from '@/components/chrome/ThemeToggle';
import {SearchProposal} from '@/components/search/SearchProposal';

import styles from './PublicNav.module.scss';

// Notes on what's NOT in the nav:
//   - /builders (program pitch + top-10 leaderboard) is reachable via the
//     footer "About the program" link
//   - /team is folded into /office-hours (DevRel team roster sits at the
//     bottom of that page next to the booking copy)
//   - /portal/leaderboard (full leaderboard) is signed-in only — surfaced
//     in the PortalSidebar instead of the public nav, since the row links
//     and tier breakdown are most useful to active builders comparing
//     themselves to the field
// Three sibling pages share the ecosystem story:
//   /ecosystem  = unified mixed grid (Apps + Integrations + Kind filter)
//   /apps       = community-built projects only
//   /integrations = partner integrations only
// All three are linked from the nav so each surface is bookmarkable.
// "Office Hours" uses a non-breaking space between the two words so
// the label doesn't wrap awkwardly when the nav gets tight at small
// viewports — same NBSP trick as the /integrations hero title.
const NAV: Array<{href: string; label: string}> = [
  {href: '/events', label: 'Events'},
  {href: '/library', label: 'Library'},
  {href: '/ecosystem', label: 'Ecosystem'},
  {href: '/apps', label: 'Apps'},
  {href: '/integrations', label: 'Integrations'},
  // /fellows hidden — the page itself still resolves at /fellows for
  // direct-URL access (and emits noindex,nofollow), but is intentionally
  // not linked from anywhere on the site, sitemap, or llms.txt while
  // the Featured roll-call is being curated. Restore by uncommenting.
  // {href: '/fellows', label: 'Fellows'},
  {href: '/office-hours', label: 'Office Hours'},
];

export function PublicNav() {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <Logo />

        <nav className={styles.links} aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
          <DocsMenu />
        </nav>

        <div className={styles.right}>
          <SearchProposal />
          <ThemeToggle />
          <Button view="flat" size="m" href="/login">
            Log in
          </Button>
          <Button view="action" size="m" href="/signup">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
