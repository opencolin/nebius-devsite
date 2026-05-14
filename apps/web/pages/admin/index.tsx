import type {GetServerSideProps} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Card, Label, Text} from '@gravity-ui/uikit';

import {AdminLayout} from '@/components/chrome/AdminLayout';
import {PageHeader} from '@/components/chrome/PageHeader';
import {requireRole} from '@/lib/auth';
import {formatNumber} from '@/lib/format';

import page from '@/styles/page.module.scss';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('admin', ctx);

const QUEUES = [
  {label: 'Ambassador apps', count: 3, href: '/admin/ambassador-applications'},
  {label: 'Credit claims', count: 8, href: '/admin/credit-claims'},
  {label: 'Per-event credit requests', count: 2, href: '/admin/credit-requests'},
  {label: 'Library submissions', count: 4, href: '/admin/library'},
  {label: 'Self-reported activity', count: 0, href: '/admin/activities'},
];

const METRICS = {
  events: 142,
  signups: 1847,
  creditsUsd: 284_000,
  builders: 312,
};

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Head>
        <title>Exec dashboard · Admin</title>
      </Head>
      <PageHeader
        eyebrow="Overview"
        title="Exec dashboard"
        description="Program metrics + open queues across the network. Reset weekly."
      />

      <div className={page.grid3} style={{marginTop: 24}}>
        <Stat label="Events run" value={formatNumber(METRICS.events)} delta="+12 this month" />
        <Stat label="Sign-ups attributed" value={formatNumber(METRICS.signups)} delta="+183 this month" />
        <Stat label="Credits claimed" value={`$${formatNumber(METRICS.creditsUsd)}`} delta="+$24K this month" />
      </div>

      <Text variant="header-1" as="h2" style={{display: 'block', marginTop: 40, marginBottom: 16}}>
        Open queues
      </Text>
      <Card view="filled" style={{padding: 0}}>
        {QUEUES.map((q, i) => (
          <Link
            key={q.href}
            href={q.href}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--g-color-line-generic)',
              color: 'var(--g-color-text-primary)',
              textDecoration: 'none',
            }}
          >
            <Text variant="subheader-2">{q.label}</Text>
            <Label theme={q.count > 0 ? 'warning' : 'success'} size="s">
              {q.count}
            </Label>
          </Link>
        ))}
      </Card>
    </AdminLayout>
  );
}

function Stat({label, value, delta}: {label: string; value: string; delta: string}) {
  return (
    <Card view="filled" style={{padding: 20}}>
      <Text variant="caption-2" color="secondary" style={{display: 'block', marginBottom: 8}}>
        {label}
      </Text>
      <Text variant="display-2" as="div" style={{marginBottom: 4}}>
        {value}
      </Text>
      <Text variant="caption-2" color="secondary">{delta}</Text>
    </Card>
  );
}
