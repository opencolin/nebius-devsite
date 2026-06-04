import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Card, Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole, type SessionUser} from '@/lib/auth';
import {formatNumber} from '@/lib/format';

import page from '@/styles/page.module.scss';

interface Props {
  user: SessionUser;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) =>
  requireRole('builder', ctx);

export default function PortalDashboard({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // Display data is sample-only for now — replace with the user's real
  // points/credits/activity once those collections are wired in Directus.
  const stats = {
    points: 1240,
    creditsClaimedUsd: 200,
    eventsHosted: 2,
    libraryAccepted: 3,
  };

  return (
    <PortalLayout>
      <Head>
        <title>Dashboard · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow={`Welcome back, ${user.firstName ?? user.email}`}
        title="Builder dashboard"
        description="Your tier, your credits, your shipped work — at a glance."
      />

      <div className={page.grid3} style={{marginTop: 24}}>
        <StatCard label="Points" value={formatNumber(stats.points)} caption="Tier: Builder · L1" />
        <StatCard label="Credits claimed" value={`$${stats.creditsClaimedUsd}`} caption="of $200 intro" />
        <StatCard label="Events hosted" value={String(stats.eventsHosted)} caption="0 upcoming" />
      </div>

      <div className={page.grid2} style={{marginTop: 24}}>
        <Card view="filled" className={page.cardBody}>
          <Text variant="caption-2" color="secondary">
            QUICK ACTIONS
          </Text>
          <ActionLink href="/portal/events/new" label="Host an event" />
          <ActionLink href="/portal/library/submit" label="Submit a library entry" />
          <ActionLink href="/portal/credits/claim-tf" label="Claim Token Factory $100" />
          <ActionLink href="/portal/credits/claim-ai" label="Claim AI Cloud $100" />
          <ActionLink href="/portal/ambassador/apply" label="Apply for Ambassador →" />
        </Card>

        <Card view="filled" className={page.cardBody}>
          <Text variant="caption-2" color="secondary">
            RECENT ACTIVITY
          </Text>
          <Activity label="Submitted: Running OpenClaw on Nebius" pts={50} time="2d ago" />
          <Activity label="Hosted: Token Factory Workshop NYC" pts={120} time="5d ago" />
          <Activity label="Connected GitHub" pts={10} time="2w ago" />
        </Card>
      </div>
    </PortalLayout>
  );
}

function StatCard({label, value, caption}: {label: string; value: string; caption: string}) {
  return (
    <Card view="filled" style={{padding: 20}}>
      <Text variant="caption-2" color="secondary" style={{display: 'block', marginBottom: 8}}>
        {label}
      </Text>
      <Text variant="display-2" as="div" style={{marginBottom: 4}}>
        {value}
      </Text>
      <Text variant="caption-2" color="secondary">
        {caption}
      </Text>
    </Card>
  );
}

function ActionLink({href, label}: {href: string; label: string}) {
  return (
    <Link href={href} style={{display: 'block', padding: '8px 0', color: 'var(--g-color-text-link)', textDecoration: 'none'}}>
      {label}
    </Link>
  );
}

function Activity({label, pts, time}: {label: string; pts: number; time: string}) {
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--g-color-line-generic)'}}>
      <Text variant="body-2">{label}</Text>
      <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <Label theme="success" size="xs">+{pts}</Label>
        <Text variant="caption-2" color="secondary">{time}</Text>
      </span>
    </div>
  );
}
