// ResourceCard — horizontal text-only card for the product landing pages.
// Mirrors dev.nebius.com's resource card style: type chip + title + blurb
// + link arrow. No cover gradient — the type label does the categorization.
//
// Rendered on /ai-cloud, /token-factory, /serverless.

import Link from 'next/link';

import {Text} from '@gravity-ui/uikit';

import {externalLinkLabel} from '../../../pages/library/[slug]';
import styles from '@/styles/product-page.module.scss';

export interface ResourceEntry {
  slug: string;
  title: string;
  blurb: string;
  type: string;
  level: string;
  duration_min?: number | null;
  external_url: string | null;
  is_official: boolean;
  pinned: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  WORKSHOP: 'Workshop',
  VIDEO: 'Video',
  PLAYLIST: 'Playlist',
  BLOG: 'Guide',
  DOCS: 'Docs',
  REPO: 'GitHub',
};

export function ResourceCard({entry}: {entry: ResourceEntry}) {
  const chipLabel = TYPE_LABEL[entry.type] ?? entry.type;
  const linkLabel = entry.external_url ? externalLinkLabel(entry.external_url) : 'View →';

  // External entries link directly out; library entries go to /library/<slug>
  const href = entry.external_url ?? `/library/${entry.slug}`;
  const isExternal = Boolean(entry.external_url);

  const inner = (
    <div className={styles.resourceCard}>
      <div className={styles.resourceCardHead}>
        <span className={styles.resourceTypeChip}>{chipLabel}</span>
      </div>
      <Text variant="subheader-2" as="h3" className={styles.resourceTitle}>
        {entry.title}
      </Text>
      <Text variant="body-2" color="secondary" className={styles.resourceBlurb}>
        {entry.blurb}
      </Text>
      <Text variant="caption-2" color="info" className={styles.resourceArrow}>
        {linkLabel} ↗
      </Text>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.resourceLink}
        aria-label={entry.title}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={styles.resourceLink} aria-label={entry.title}>
      {inner}
    </Link>
  );
}
