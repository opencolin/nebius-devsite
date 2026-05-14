import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';

import {Card, Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole, type SessionUser} from '@/lib/auth';

interface Props {
  user: SessionUser;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) =>
  requireRole('builder', ctx);

const ITEMS: Array<{label: string; pts: number; done: boolean}> = [
  {label: 'Sign up', pts: 5, done: true},
  {label: 'Connect GitHub', pts: 10, done: true},
  {label: 'Claim Token Factory $100', pts: 25, done: true},
  {label: 'Claim AI Cloud $100', pts: 25, done: false},
  {label: 'Submit your first library entry', pts: 50, done: false},
  {label: 'Host your first event', pts: 200, done: false},
];

export default function ChecklistPage(_props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const completed = ITEMS.filter((i) => i.done).length;
  const earned = ITEMS.filter((i) => i.done).reduce((s, i) => s + i.pts, 0);
  const total = ITEMS.reduce((s, i) => s + i.pts, 0);

  return (
    <PortalLayout>
      <Head>
        <title>Checklist · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="You"
        title="Onboarding checklist"
        description={`${completed} of ${ITEMS.length} done · ${earned} of ${total} pts earned`}
      />

      <Card view="filled" style={{padding: 0, marginTop: 24}}>
        {ITEMS.map((it, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--g-color-line-generic)',
              opacity: it.done ? 0.65 : 1,
            }}
          >
            <span style={{display: 'flex', gap: 12, alignItems: 'center'}}>
              <span aria-hidden style={{fontSize: 16}}>{it.done ? '☑' : '☐'}</span>
              <Text variant={it.done ? 'body-2' : 'subheader-2'}>{it.label}</Text>
            </span>
            <Label theme={it.done ? 'success' : 'normal'} size="s">
              +{it.pts}
            </Label>
          </div>
        ))}
      </Card>
    </PortalLayout>
  );
}
