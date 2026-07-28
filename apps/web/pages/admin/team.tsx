import {readItems} from '@directus/sdk';
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';

import {Text} from '@gravity-ui/uikit';

import {AdminLayout} from '@/components/chrome/AdminLayout';
import {PageHeader} from '@/components/chrome/PageHeader';
import {QueueTable, StatusLabel} from '@/components/chrome/QueueTable';
import {enforceRole} from '@/lib/auth';
import {directusServer} from '@/lib/directus';

interface MemberRow {
  id: string;
  slug: string;
  name: string;
  title: string;
  region: string;
  active: boolean;
}

interface Props {
  rows: MemberRow[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const guard = await enforceRole('admin', ctx);
  if (guard) return guard;
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('team_members', {
      sort: ['sort_order', 'name'],
      fields: ['id', 'slug', 'name', 'title', 'region', 'active'],
      limit: -1,
    }),
  )) as MemberRow[];
  return {props: {rows}};
};

export default function AdminTeam({
  rows,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AdminLayout>
      <Head>
        <title>Team · Admin</title>
      </Head>
      <PageHeader
        eyebrow="Manage"
        title="DevRel team"
        description="Add, deactivate, or update Nebius DevRel team members. Active members appear on /team."
      />

      <div style={{marginTop: 24}}>
        <QueueTable
          rows={rows}
          columns={[
            {label: 'Member', width: '180px', render: (r) => <Text variant="subheader-2">{r.name}</Text>},
            {label: 'Title', width: 'minmax(220px, 2fr)', render: (r) => r.title},
            {label: 'Region', width: 'minmax(160px, 1fr)', render: (r) => r.region},
            {label: 'Slug', width: '140px', render: (r) => r.slug},
            {label: 'Status', width: '110px', render: (r) => <StatusLabel status={r.active ? 'PUBLISHED' : 'CANCELLED'} />},
          ]}
        />
      </div>
    </AdminLayout>
  );
}
