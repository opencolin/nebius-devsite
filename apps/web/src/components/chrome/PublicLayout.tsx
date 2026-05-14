import type {ReactNode} from 'react';

import {Footer} from './Footer';
import {PublicNav} from './PublicNav';

import styles from './PublicLayout.module.scss';

export function PublicLayout({children}: {children: ReactNode}) {
  return (
    <>
      <PublicNav />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
}
