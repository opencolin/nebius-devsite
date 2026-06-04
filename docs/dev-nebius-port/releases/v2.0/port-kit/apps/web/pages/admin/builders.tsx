import {readItems} from '@directus/sdk';
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';

import {Text} from '@gravity-ui/uikit';

import {AdminLayout} from '@/components/chrome/AdminLayout';
import {PageHeader} from '@/components/chrome/PageHeader';
import {QueueTable, StatusLabel} from '@/components/chrome/QueueTable';
import {enforceRole} from '@/lib/auth';
import {directusServer} from '@/lib/directus';
import {formatNumber, tierLabel} from '@/lib/format';

interface BuilderRow {
  id: string;
  handle: string;
  name: string;
  city: string;
  country: string;
  tier: string;
  points_total: number;
}

interface Props {
  rows: BuilderRow[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const guard = await enforceRole('admin', ctx);
  if (guard) return guard;
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('builders', {
      sort: ['-points_total'],
      fields: ['id', 'handle', 'name', 'city', 'country', 'tier', 'points_total'],
      limit: -1,
    }),
  )) as BuilderRow[];
  return {props: {rows}};
};

export default function AdminBuilders({
  rows,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AdminLayout>
      <Head>
        <title>Builders · Admin</title>
      </Head>
      <PageHeader
        eyebrow="Manage"
        title="Builders"
        description={`${rows.length} builders in the network. Click to view their public profile or edit tier.`}
      />

      <div style={{marginTop: 24}}>
        <QueueTable
          rows={rows}
          columns={[
            {label: 'Handle', width: '160px', render: (r) => <Text variant="subheader-2">@{r.handle}</Text>},
            {label: 'Name', width: '160px', render: (r) => r.name},
            {label: 'Location', width: '180px', render: (r) => `${r.city}, ${r.country}`},
            {label: 'Tier', width: '160px', render: (r) => <StatusLabel status={tierLabel(r.tier).split(' · ')[0].toUpperCase()} />},
            {label: 'Points', width: '100px', render: (r) => formatNumber(r.points_total)},
          ]}
        />
      </div>
    </AdminLayout>
  );
}
