// Shared leaderboard table — used both by /leaderboard (full list) and the
// top of /builders (top N). Keeps a single source of truth for the column
// shape, tier-color mapping, and row markup.

import Link from 'next/link';

import {Card, Label, Text} from '@gravity-ui/uikit';

import {formatNumber, tierLabel} from '@/lib/format';

import styles from './LeaderboardTable.module.scss';

export interface LeaderboardBuilder {
  handle: string;
  name: string;
  city: string;
  country: string;
  tier: string;
  points_total: number;
}

interface Props {
  builders: LeaderboardBuilder[];
  /** Optional cap for "top N" use cases (e.g. /builders shows top 10). */
  limit?: number;
}

export function LeaderboardTable({builders, limit}: Props) {
  const rows = limit ? builders.slice(0, limit) : builders;
  return (
    <Card view="filled" className={styles.tableCard}>
      <div className={styles.head}>
        <span>#</span>
        <span>Builder</span>
        <span>Tier</span>
        <span>Location</span>
        <span className={styles.right}>Points</span>
      </div>
      {rows.map((b, i) => (
        <div key={b.handle} className={styles.row}>
          <span className={styles.rank}>{i + 1}</span>
          <Link href={`/team/${b.handle}`} className={styles.builderLink}>
            <Text variant="subheader-2">{b.name}</Text>
            <Text variant="caption-2" color="secondary">
              @{b.handle}
            </Text>
          </Link>
          <Label
            theme={
              b.tier === 'AMBASSADOR'
                ? 'success'
                : b.tier === 'CONTRIBUTOR'
                  ? 'info'
                  : 'normal'
            }
            size="s"
          >
            {tierLabel(b.tier)}
          </Label>
          <Text variant="body-2" color="secondary">
            {b.city}, {b.country}
          </Text>
          <Text variant="subheader-2" className={styles.right}>
            {formatNumber(b.points_total)}
          </Text>
        </div>
      ))}
    </Card>
  );
}
