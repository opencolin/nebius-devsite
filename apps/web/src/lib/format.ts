// Formatting helpers — ported verbatim from opencolin/nebius-builders so the
// two codebases keep identical display semantics.

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatCurrency(usd: number): string {
  if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}K`;
  return `$${usd}`;
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  });
}

// formatDateTime — date + time, optionally rendered in a specific IANA
// timezone with a short TZ abbreviation appended. Without a timeZone arg
// it behaves as before (browser local time, no TZ label). With one, the
// caller controls which zone to render in — for events we pick the venue
// timezone so a Berlin meetup shows in CEST, not the user's local TZ
// (which made evening events appear at midnight US time).
export function formatDateTime(iso: string, timeZone?: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: timeZone ? 'short' : undefined,
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - +new Date(iso);
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

export function tierLabel(tier: string): string {
  const map: Record<string, string> = {
    BUILDER: 'Builder · L1',
    CONTRIBUTOR: 'Contributor · L2',
    AMBASSADOR: 'Ambassador · L3',
    FOUNDING: 'Founding · L3',
  };
  return map[tier] ?? tier;
}
