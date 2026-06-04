import type {GetServerSideProps} from 'next';
import Head from 'next/head';

import {Text} from '@gravity-ui/uikit';

import {AdminLayout} from '@/components/chrome/AdminLayout';
import {PageHeader} from '@/components/chrome/PageHeader';
import {QueueTable, StatusLabel} from '@/components/chrome/QueueTable';
import {requireRole} from '@/lib/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('admin', ctx);

const ROWS = [
  {id: 'cl_1', handle: '@kshitij', kind: 'TF', amount: 100, status: 'INITIATED', submitted_at: '2026-05-09'},
  {id: 'cl_2', handle: '@olivia', kind: 'AI', amount: 100, status: 'SELF_REPORTED', submitted_at: '2026-05-10'},
  {id: 'cl_3', handle: '@mkearney', kind: 'TF', amount: 100, status: 'CLAIMED', submitted_at: '2026-05-04'},
];

export default function CreditClaimsAdmin() {
  return (
    <AdminLayout>
      <Head>
        <title>Intro credit claims · Admin</title>
      </Head>
      <PageHeader
        eyebrow="Queues"
        title="Intro credit claims"
        description={`${ROWS.filter((r) => r.status !== 'CLAIMED').length} pending. AI Cloud claims need use-case review; TF claims are auto-approvable for known builders.`}
      />

      <div style={{marginTop: 24}}>
        <QueueTable
          rows={ROWS}
          columns={[
            {label: 'Builder', width: '140px', render: (r) => <Text variant="subheader-2">{r.handle}</Text>},
            {label: 'Kind', width: '80px', render: (r) => r.kind},
            {label: 'Amount', width: '100px', render: (r) => `$${r.amount}`},
            {label: 'Submitted', width: '120px', render: (r) => r.submitted_at},
            {label: 'Status', width: '140px', render: (r) => <StatusLabel status={r.status} />},
          ]}
          onApprove={() => undefined}
          onReject={() => undefined}
        />
      </div>
    </AdminLayout>
  );
}
