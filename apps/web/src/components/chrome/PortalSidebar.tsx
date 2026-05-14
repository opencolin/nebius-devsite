// Portal sidebar — left rail for /portal/* pages. Mirrors the upstream
// PortalSidebar grouping (YOU / EVENTS / PROGRAM / INTRO CREDITS) but built
// from Gravity primitives instead of Tailwind classes.

import {Button} from '@gravity-ui/uikit';
import Link from 'next/link';
import {useRouter} from 'next/router';

import {Logo} from '@/components/chrome/Logo';
import {ThemeToggle} from '@/components/chrome/ThemeToggle';

import styles from './Sidebar.module.scss';

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: 'YOU',
    items: [
      {href: '/portal', label: 'Dashboard'},
      {href: '/portal/profile', label: 'Profile'},
      {href: '/portal/checklist', label: 'Checklist'},
    ],
  },
  {
    label: 'EVENTS',
    items: [
      {href: '/portal/events/new', label: 'Host an event'},
      {href: '/portal/events', label: 'My events'},
      {href: '/portal/credits', label: 'Per-event credits'},
    ],
  },
  {
    label: 'PROGRAM',
    items: [
      {href: '/portal/library', label: 'Library submissions'},
      {href: '/portal/activity', label: 'Activity'},
      {href: '/portal/leaderboard', label: 'Leaderboard'},
      {href: '/portal/ambassador/apply', label: 'Apply for Ambassador'},
    ],
  },
  {
    label: 'INTRO CREDITS',
    items: [
      {href: '/portal/credits/claim-tf', label: 'Token Factory $100', badge: '✓'},
      {href: '/portal/credits/claim-ai', label: 'AI Cloud $100', badge: '…'},
    ],
  },
];

export function PortalSidebar() {
  const {pathname} = useRouter();

  async function signOut() {
    await fetch('/api/auth/logout', {method: 'POST'});
    window.location.href = '/';
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHead}>
        <Logo />
      </div>

      <nav className={styles.nav}>
        {GROUPS.map((g) => (
          <div key={g.label} className={styles.group}>
            <div className={styles.groupLabel}>{g.label}</div>
            {g.items.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`${styles.link} ${active ? styles.linkActive : ''}`}
                >
                  <span>{it.label}</span>
                  {it.badge ? <span className={styles.badge}>{it.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFoot}>
        <ThemeToggle />
        <Button view="flat" size="m" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
