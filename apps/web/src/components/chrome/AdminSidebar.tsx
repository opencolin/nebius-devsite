// Admin sidebar — left rail for /admin/* pages. Mirrors the upstream
// AdminSidebar grouping (OVERVIEW / QUEUES / MANAGE) plus the distinctive
// "ADMIN MODE" badge below the logo.

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
    label: 'OVERVIEW',
    items: [{href: '/admin', label: 'Exec dashboard'}],
  },
  {
    label: 'QUEUES',
    items: [
      {href: '/admin/ambassador-applications', label: 'Ambassador apps'},
      {href: '/admin/credit-claims', label: 'Credit claims'},
      {href: '/admin/credit-requests', label: 'Per-event credits'},
      {href: '/admin/library', label: 'Library submissions'},
      {href: '/admin/activities', label: 'Self-reported activity'},
    ],
  },
  {
    label: 'MANAGE',
    items: [
      {href: '/admin/builders', label: 'Leaderboard'},
      {href: '/admin/team', label: 'Team'},
    ],
  },
];

export function AdminSidebar() {
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

      <div className={styles.adminBadge}>
        <div className={styles.adminBadgeTitle}>ADMIN MODE</div>
        <div className={styles.adminBadgeSub}>DevRel team only</div>
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
