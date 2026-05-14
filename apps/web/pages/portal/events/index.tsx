import type {GetServerSideProps} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Button, Card, Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole} from '@/lib/auth';
import {formatDateTime} from '@/lib/format';

import page from '@/styles/page.module.scss';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('builder', ctx);

const EVENTS = [
  {id: 'ev_1', title: 'Token Factory Workshop · NYC', starts_at: '2026-05-22T18:30:00Z', city: 'Brooklyn', status: 'PUBLISHED'},
  {id: 'ev_2', title: 'Soperator on Kubernetes · Berlin', starts_at: '2026-06-04T17:00:00Z', city: 'Berlin', status: 'PUBLISHED'},
];

export default function PortalEventsPage() {
  return (
    <PortalLayout>
      <Head>
        <title>My events · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Events"
        title="My events"
        description="Events you've hosted or are hosting. Per-event credits are auto-allocated when an event publishes."
        actions={
          <Button view="action" size="m" href="/portal/events/new">
            Host new event
          </Button>
        }
      />

      <div className={page.grid2} style={{marginTop: 24}}>
        {EVENTS.map((e) => (
          <Card key={e.id} view="filled" className={page.cardBody}>
            <Text variant="caption-2" color="secondary">{formatDateTime(e.starts_at)} · {e.city}</Text>
            <Text variant="subheader-2" as="h3">{e.title}</Text>
            <span style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto'}}>
              <Label theme="success" size="s">{e.status}</Label>
              <Link href={`/portal/events/${e.id}`} style={{color: 'var(--g-color-text-link)'}}>
                Manage →
              </Link>
            </span>
          </Card>
        ))}
      </div>
    </PortalLayout>
  );
}
