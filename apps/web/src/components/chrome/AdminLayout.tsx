import type {ReactNode} from 'react';

import {AdminSidebar} from './AdminSidebar';

import styles from './AppShell.module.scss';

export function AdminLayout({children}: {children: ReactNode}) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
