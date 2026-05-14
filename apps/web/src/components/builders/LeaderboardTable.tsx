// Shared leaderboard table — used both by /portal/leaderboard (full list,
// signed-in only) and the top of /builders (public top N). Keeps a single
// source of truth for the column shape, tier-color mapping, and row markup.
//
// Builder rows used to link to /team/<handle>, but only the four DevRel
// team members live in `team_members` — the 100+ builders imported from
// GitHub repos aren't reachable there. We don't have a public per-builder
// page yet, so the row links to the builder's GitHub profile when we have
// a github_handle (true for ~all of the imported set), and falls back to
// plain text otherwise.

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
  /** Optional — when present, the row name links out to github.com/<handle>. */
  github_handle?: string | null;
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
          <BuilderName builder={b} />
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
            {b.city}
            {b.country ? `, ${b.country}` : ''}
          </Text>
          <Text variant="subheader-2" className={styles.right}>
            {formatNumber(b.points_total)}
          </Text>
        </div>
      ))}
    </Card>
  );
}

function BuilderName({builder}: {builder: LeaderboardBuilder}) {
  const handle = builder.github_handle ?? builder.handle;
  const ghUrl = handle ? `https://github.com/${handle}` : null;
  const inner = (
    <>
      <Text variant="subheader-2">{builder.name}</Text>
      <Text variant="caption-2" color="secondary">
        @{handle}
        {ghUrl ? ' ↗' : ''}
      </Text>
    </>
  );
  if (!ghUrl) {
    return <span className={styles.builderLink}>{inner}</span>;
  }
  return (
    <a
      href={ghUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.builderLink}
    >
      {inner}
    </a>
  );
}
