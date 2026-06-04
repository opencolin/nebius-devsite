// Visible "this page is a placeholder" callout. Used on portal/admin pages
// that exist for routing parity with opencolin/nebius-builders but whose
// full UI/state machine is out of scope for the current rebuild.

import {Card, Text} from '@gravity-ui/uikit';
import Link from 'next/link';

import styles from './StubCallout.module.scss';

export function StubCallout({
  title = 'Placeholder',
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <Card view="filled" className={styles.root}>
      <span className={styles.badge}>STUB</span>
      <div>
        <Text variant="subheader-2" as="div" style={{marginBottom: 4}}>
          {title}
        </Text>
        <Text variant="body-2" color="secondary">
          {description}
        </Text>
        <Text variant="caption-2" color="secondary" style={{display: 'block', marginTop: 8}}>
          See <Link href="/about-this-build">About this build</Link> for what's wired vs stubbed.
        </Text>
      </div>
    </Card>
  );
}
