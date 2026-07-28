import type {GetServerSideProps} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Button, Card, Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole} from '@/lib/auth';

import page from '@/styles/page.module.scss';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('builder', ctx);

const SUBMISSIONS = [
  {slug: 'running-openclaw-on-nebius', title: 'Running OpenClaw on Nebius', status: 'PUBLISHED', pts: 50},
  {slug: 'fine-tune-llama-101', title: 'Fine-tune Llama 101 on H100s', status: 'PENDING', pts: 0},
];

export default function PortalLibraryPage() {
  return (
    <PortalLayout>
      <Head>
        <title>My library submissions · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Program"
        title="Library submissions"
        description="Tutorials, workshops, repos, and videos you've submitted. Accepted entries get +50 pts and feature on /library."
        actions={
          <Button view="action" size="m" href="/portal/library/submit">
            Submit new entry
          </Button>
        }
      />

      <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24}}>
        {SUBMISSIONS.map((s) => (
          <Card key={s.slug} view="filled" style={{padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16}}>
            <div style={{flex: 1}}>
              <Text variant="subheader-2" as="div">{s.title}</Text>
              <Text variant="caption-2" color="secondary">/library/{s.slug}</Text>
            </div>
            <Label theme={s.status === 'PUBLISHED' ? 'success' : 'warning'} size="s">{s.status}</Label>
            <Text variant="subheader-2">+{s.pts}</Text>
            {s.status === 'PUBLISHED' ? (
              <Link href={`/library/${s.slug}`} style={{color: 'var(--g-color-text-link)'}}>View →</Link>
            ) : (
              <span style={{width: 50}} />
            )}
          </Card>
        ))}
      </div>
    </PortalLayout>
  );
}
