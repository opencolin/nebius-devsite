import type {GetServerSideProps} from 'next';
import Head from 'next/head';

import {Text} from '@gravity-ui/uikit';

import {AdminLayout} from '@/components/chrome/AdminLayout';
import {PageHeader} from '@/components/chrome/PageHeader';
import {QueueTable, StatusLabel} from '@/components/chrome/QueueTable';
import {requireRole} from '@/lib/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('admin', ctx);

const ROWS = [
  {id: 'app_1', handle: '@aboros', city: 'Brooklyn', submitted_at: '2026-05-08', status: 'PENDING'},
  {id: 'app_2', handle: '@skoshy', city: 'Berlin', submitted_at: '2026-05-09', status: 'PENDING'},
  {id: 'app_3', handle: '@miyara', city: 'Tokyo', submitted_at: '2026-05-10', status: 'PENDING'},
];

export default function AmbassadorApplicationsAdmin() {
  return (
    <AdminLayout>
      <Head>
        <title>Ambassador applications · Admin</title>
      </Head>
      <PageHeader
        eyebrow="Queues"
        title="Ambassador applications"
        description={`${ROWS.filter((r) => r.status === 'PENDING').length} pending — review monthly.`}
      />

      <div style={{marginTop: 24}}>
        <QueueTable
          rows={ROWS}
          columns={[
            {label: 'Builder', width: '160px', render: (r) => <Text variant="subheader-2">{r.handle}</Text>},
            {label: 'City', width: '160px', render: (r) => r.city},
            {label: 'Submitted', width: '140px', render: (r) => r.submitted_at},
            {label: 'Status', width: '120px', render: (r) => <StatusLabel status={r.status} />},
          ]}
          onApprove={() => undefined}
          onReject={() => undefined}
        />
      </div>
    </AdminLayout>
  );
}
