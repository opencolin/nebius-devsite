import type {ReactNode} from 'react';

import {PortalSidebar} from './PortalSidebar';

import styles from './AppShell.module.scss';

export function PortalLayout({children}: {children: ReactNode}) {
  return (
    <div className={styles.shell}>
      <PortalSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
