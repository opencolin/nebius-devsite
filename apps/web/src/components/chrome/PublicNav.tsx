// Public top nav. Built from Gravity UI primitives so the markup matches
// tenki.cloud's `g-button g-button_view_normal`-style classnames out of the
// box. Logo is the official Tenki mark + "Builders" wordmark.

import {Button} from '@gravity-ui/uikit';
import Link from 'next/link';

import {DocsMenu} from '@/components/chrome/DocsMenu';
import {ProductsMenu} from '@/components/chrome/ProductsMenu';
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
//   /apps       = community-built projects only (hidden from nav)
//   /integrations = partner integrations only (hidden from nav)
// Only the umbrella /ecosystem page is linked from the nav now; the
// other two stay reachable via direct URL, the /ecosystem footer copy
// ("For community apps only, see /apps. For integrations only, see
// /integrations."), and the sitemap. Tighter nav, same surface area.
// "Office Hours" uses a non-breaking space between the two words so
// the label doesn't wrap awkwardly when the nav gets tight at small
// viewports — same NBSP trick as the /integrations hero title.
const NAV: Array<{href: string; label: string}> = [
  {href: '/events', label: 'Events'},
  {href: '/library', label: 'Library'},
  {href: '/ecosystem', label: 'Ecosystem'},
  // /apps and /integrations hidden — both still resolve at their URLs
  // for direct access + bookmarkability, but the umbrella /ecosystem
  // page is the canonical entry point. Restore by uncommenting.
  // {href: '/apps', label: 'Apps'},
  // {href: '/integrations', label: 'Integrations'},
  // /fellows hidden — the page itself still resolves at /fellows for
  // direct-URL access (and emits noindex,nofollow), but is intentionally
  // not linked from anywhere on the site, sitemap, or llms.txt while
  // the Featured roll-call is being curated. Restore by uncommenting.
  // {href: '/fellows', label: 'Fellows'},
  // /office-hours hidden from nav — page still resolves at the URL.
  // Restore by uncommenting.
  // {href: '/office-hours', label: 'Office Hours'},
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
          {/* "Get started" is now the products mega-menu trigger (the old
              standalone "Products" nav link was removed). Its top item is the
              free-credits CTA that lands on /signup. */}
          <ProductsMenu variant="cta" />
        </div>
      </div>
    </header>
  );
}
