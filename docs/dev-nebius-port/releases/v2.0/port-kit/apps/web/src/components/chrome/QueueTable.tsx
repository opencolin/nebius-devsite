// Generic admin-queue table: header row + rows with action buttons.
// Used for ambassador apps, credit claims, library submissions, etc.

import {Button, Card, Label, Text} from '@gravity-ui/uikit';

import styles from './QueueTable.module.scss';

export interface QueueColumn<T> {
  label: string;
  width?: string;
  render: (row: T) => React.ReactNode;
}

interface Props<T> {
  rows: T[];
  columns: QueueColumn<T>[];
  emptyText?: string;
  onApprove?: (row: T) => void;
  onReject?: (row: T) => void;
}

export function QueueTable<T extends {id?: string | number}>({
  rows,
  columns,
  emptyText = 'No items in this queue.',
  onApprove,
  onReject,
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <Card view="filled" style={{padding: 24}}>
        <Text color="secondary">{emptyText}</Text>
      </Card>
    );
  }

  const widths = columns.map((c) => c.width ?? '1fr').join(' ');
  const grid = onApprove || onReject ? `${widths} 180px` : widths;

  return (
    <Card view="filled" className={styles.tableCard}>
      <div className={styles.head} style={{gridTemplateColumns: grid}}>
        {columns.map((c) => (
          <span key={c.label}>{c.label}</span>
        ))}
        {(onApprove || onReject) && <span className={styles.right}>Actions</span>}
      </div>
      {rows.map((r, i) => (
        <div key={(r.id as string) ?? i} className={styles.row} style={{gridTemplateColumns: grid}}>
          {columns.map((c) => (
            <span key={c.label}>{c.render(r)}</span>
          ))}
          {(onApprove || onReject) && (
            <span className={styles.actions}>
              {onApprove && (
                <Button view="action" size="s" onClick={() => onApprove(r)}>
                  Approve
                </Button>
              )}
              {onReject && (
                <Button view="flat" size="s" onClick={() => onReject(r)}>
                  Reject
                </Button>
              )}
            </span>
          )}
        </div>
      ))}
    </Card>
  );
}

export function StatusLabel({status}: {status: string}) {
  const theme: 'success' | 'warning' | 'info' | 'danger' | 'normal' =
    status === 'APPROVED' || status === 'PUBLISHED' || status === 'CLAIMED'
      ? 'success'
      : status === 'PENDING' || status === 'INITIATED' || status === 'SELF_REPORTED'
        ? 'warning'
        : status === 'REJECTED' || status === 'CANCELLED'
          ? 'danger'
          : 'normal';
  return (
    <Label theme={theme} size="s">
      {status}
    </Label>
  );
}
