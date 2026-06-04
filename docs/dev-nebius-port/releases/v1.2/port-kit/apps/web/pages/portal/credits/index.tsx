import type {GetServerSideProps} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Card, Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole} from '@/lib/auth';

import page from '@/styles/page.module.scss';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('builder', ctx);

const CREDITS = [
  {name: 'Token Factory $100', kind: 'TF', status: 'CLAIMED', balance: 67, total: 100},
  {name: 'AI Cloud $100', kind: 'AI', status: 'PENDING', balance: 0, total: 100},
  {name: 'Per-event credits — Brooklyn workshop', kind: 'TF', status: 'APPROVED', balance: 200, total: 200},
];

export default function CreditsPage() {
  return (
    <PortalLayout>
      <Head>
        <title>Credits · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Events"
        title="Credits"
        description="Your intro credits and per-event allocations. Token Factory and AI Cloud are tracked separately."
      />

      <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, maxWidth: 720}}>
        {CREDITS.map((c, i) => (
          <Card view="filled" key={i} style={{padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16}}>
            <div style={{flex: 1}}>
              <Text variant="subheader-2" as="div">{c.name}</Text>
              <Text variant="caption-2" color="secondary">
                {c.balance}/{c.total} remaining
              </Text>
            </div>
            <Label theme={c.status === 'APPROVED' ? 'success' : c.status === 'PENDING' ? 'warning' : 'info'} size="s">
              {c.status}
            </Label>
          </Card>
        ))}
      </div>

      <div className={page.grid2} style={{marginTop: 32}}>
        <Card view="filled" className={page.cardBody}>
          <Text variant="caption-2" color="secondary">CLAIM</Text>
          <Text variant="subheader-2">Need to claim a fresh allocation?</Text>
          <Text variant="body-2" color="secondary">
            Each builder gets one $100 Token Factory + one $100 AI Cloud allocation per year.
          </Text>
          <div style={{display: 'flex', gap: 8, marginTop: 12}}>
            <Link href="/portal/credits/claim-tf" style={{color: 'var(--g-color-text-link)'}}>Token Factory →</Link>
            <Link href="/portal/credits/claim-ai" style={{color: 'var(--g-color-text-link)', marginLeft: 16}}>AI Cloud →</Link>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}
