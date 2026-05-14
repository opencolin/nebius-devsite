// Public top nav. Built from Gravity UI primitives so the markup matches
// nebius.com's `g-button g-button_view_normal`-style classnames out of the
// box. Logo is the official Nebius mark + "Builders" wordmark.

import {Button} from '@gravity-ui/uikit';
import Link from 'next/link';

import {Logo} from '@/components/chrome/Logo';
import {ThemeToggle} from '@/components/chrome/ThemeToggle';
import {SearchProposal} from '@/components/search/SearchProposal';

import styles from './PublicNav.module.scss';

// Notes on what's NOT in the nav:
//   - /builders (program pitch + top-10 leaderboard) is reachable via the
//     footer "About the program" link; the nav exposes /leaderboard directly
//   - /team is folded into /office-hours (DevRel team roster sits at the
//     bottom of that page next to the booking copy)
const NAV: Array<{href: string; label: string}> = [
  {href: '/events', label: 'Events'},
  {href: '/library', label: 'Library'},
  {href: '/apps', label: 'Apps'},
  {href: '/leaderboard', label: 'Leaderboard'},
  {href: '/office-hours', label: 'Office Hours'},
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
