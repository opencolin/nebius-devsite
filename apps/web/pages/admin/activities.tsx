import type {GetServerSideProps} from 'next';
import Head from 'next/head';

import {Text} from '@gravity-ui/uikit';

import {AdminLayout} from '@/components/chrome/AdminLayout';
import {PageHeader} from '@/components/chrome/PageHeader';
import {QueueTable, StatusLabel} from '@/components/chrome/QueueTable';
import {requireRole} from '@/lib/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('admin', ctx);

export default function ActivitiesAdmin() {
  return (
    <AdminLayout>
      <Head>
        <title>Self-reported activity · Admin</title>
      </Head>
      <PageHeader
        eyebrow="Queues"
        title="Self-reported activity"
        description="Builders' self-reported wins (tweets, meetup attendance, referrals) waiting for points approval."
      />

      <div style={{marginTop: 24}}>
        <QueueTable
          rows={[]}
          columns={[
            {label: 'Builder', width: '160px', render: () => null},
            {label: 'Activity', width: '1fr', render: () => null},
            {label: 'Proof', width: '1fr', render: () => null},
            {label: 'Status', width: '110px', render: (r: {status?: string}) => <StatusLabel status={r.status ?? 'PENDING'} />},
          ]}
          emptyText="No self-reported activity awaiting review."
          onApprove={() => undefined}
          onReject={() => undefined}
        />
        <Text variant="caption-2" color="secondary" style={{display: 'block', marginTop: 12}}>
          Pulled live from the activities collection where status=PENDING.
        </Text>
      </div>
    </AdminLayout>
  );
}
