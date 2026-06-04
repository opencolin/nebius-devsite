import {readItems} from '@directus/sdk';
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';

import {Text} from '@gravity-ui/uikit';

import {AdminLayout} from '@/components/chrome/AdminLayout';
import {PageHeader} from '@/components/chrome/PageHeader';
import {QueueTable, StatusLabel} from '@/components/chrome/QueueTable';
import {enforceRole} from '@/lib/auth';
import {directusServer} from '@/lib/directus';

interface LibraryRow {
  id: string;
  status: string;
  slug: string;
  title: string;
  type: string;
  level: string;
}

interface Props {
  rows: LibraryRow[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const guard = await enforceRole('admin', ctx);
  if (guard) return guard;
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('library_articles', {
      sort: ['-id'],
      fields: ['id', 'status', 'slug', 'title', 'type', 'level'],
      limit: -1,
    }),
  )) as LibraryRow[];
  return {props: {rows}};
};

export default function AdminLibraryQueue({
  rows,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const pending = rows.filter((r) => r.status === 'draft');
  return (
    <AdminLayout>
      <Head>
        <title>Library submissions · Admin</title>
      </Head>
      <PageHeader
        eyebrow="Queues"
        title="Library submissions"
        description={`${pending.length} draft of ${rows.length} total. Approve to publish on /library.`}
      />

      <div style={{marginTop: 24}}>
        <QueueTable
          rows={rows}
          columns={[
            {label: 'Title', width: 'minmax(240px, 2fr)', render: (r) => <Text variant="subheader-2">{r.title}</Text>},
            {label: 'Type', width: '100px', render: (r) => r.type},
            {label: 'Level', width: '120px', render: (r) => r.level},
            {label: 'Slug', width: 'minmax(160px, 1fr)', render: (r) => `/library/${r.slug}`},
            {label: 'Status', width: '110px', render: (r) => <StatusLabel status={r.status.toUpperCase()} />},
          ]}
          onApprove={() => undefined}
          onReject={() => undefined}
        />
      </div>
    </AdminLayout>
  );
}
