import type {GetServerSideProps} from 'next';
import Head from 'next/head';

import {Text} from '@gravity-ui/uikit';

import {AdminLayout} from '@/components/chrome/AdminLayout';
import {PageHeader} from '@/components/chrome/PageHeader';
import {QueueTable, StatusLabel} from '@/components/chrome/QueueTable';
import {requireRole} from '@/lib/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('admin', ctx);

const ROWS = [
  {id: 'cr_1', event: 'Brooklyn workshop · Aug 12', host: '@aboros', amount: 2000, attendees: 40, status: 'PENDING'},
  {id: 'cr_2', event: 'Berlin Soperator · Aug 19', host: '@skoshy', amount: 4000, attendees: 80, status: 'PENDING'},
];

export default function CreditRequestsAdmin() {
  return (
    <AdminLayout>
      <Head>
        <title>Per-event credit requests · Admin</title>
      </Head>
      <PageHeader
        eyebrow="Queues"
        title="Per-event credit requests"
        description={`${ROWS.length} pending. Approve to allocate Token Factory credits at $50–500 per attendee.`}
      />

      <div style={{marginTop: 24}}>
        <QueueTable
          rows={ROWS}
          columns={[
            {label: 'Event', width: 'minmax(220px, 2fr)', render: (r) => <Text variant="subheader-2">{r.event}</Text>},
            {label: 'Host', width: '120px', render: (r) => r.host},
            {label: 'Attendees', width: '100px', render: (r) => String(r.attendees)},
            {label: 'Amount', width: '100px', render: (r) => `$${r.amount}`},
            {label: 'Status', width: '110px', render: (r) => <StatusLabel status={r.status} />},
          ]}
          onApprove={() => undefined}
          onReject={() => undefined}
        />
      </div>
    </AdminLayout>
  );
}
