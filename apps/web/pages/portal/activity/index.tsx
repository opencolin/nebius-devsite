import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';

import {Button, Card, Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole} from '@/lib/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) =>
  requireRole('builder', ctx);

const ROWS = [
  {kind: 'Library submission', detail: 'Running OpenClaw on Nebius', pts: 50, status: 'APPROVED', date: '2026-05-08'},
  {kind: 'Event hosted', detail: 'Token Factory Workshop · NYC (40 RSVPs)', pts: 120, status: 'APPROVED', date: '2026-05-04'},
  {kind: 'Self-reported', detail: 'Tweeted about Nebius', pts: 5, status: 'PENDING', date: '2026-05-12'},
];

export default function ActivityPage(_props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <PortalLayout>
      <Head>
        <title>Activity · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Program"
        title="Activity log"
        description="Every points-bearing action you've taken — official events, library submissions, self-reported wins."
        actions={
          <Button view="action" size="m" href="/portal/activity/new">
            Log new activity
          </Button>
        }
      />

      <Card view="filled" style={{padding: 0, marginTop: 24}}>
        {ROWS.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '180px 1fr 100px 120px 80px',
              gap: 16,
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--g-color-line-generic)',
            }}
          >
            <Text variant="caption-2" color="secondary">{r.date}</Text>
            <div>
              <Text variant="subheader-2" as="div">{r.kind}</Text>
              <Text variant="body-2" color="secondary">{r.detail}</Text>
            </div>
            <Label theme={r.status === 'APPROVED' ? 'success' : 'warning'} size="s">
              {r.status}
            </Label>
            <span />
            <Text variant="subheader-2" style={{textAlign: 'right'}}>+{r.pts}</Text>
          </div>
        ))}
      </Card>
    </PortalLayout>
  );
}
