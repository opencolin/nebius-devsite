import {Text} from '@gravity-ui/uikit';
import type {ReactNode} from 'react';

import styles from './PageHeader.module.scss';

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({eyebrow, title, description, actions}: Props) {
  return (
    <header className={styles.root}>
      {eyebrow ? (
        <Text variant="caption-2" className={styles.eyebrow}>
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="display-2" as="h1" className={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="body-2" color="secondary" className={styles.description}>
          {description}
        </Text>
      ) : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
