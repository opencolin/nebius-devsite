import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import {useState} from 'react';

import {Button, Card, Text, TextInput} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole, type SessionUser} from '@/lib/auth';

import page from '@/styles/page.module.scss';

interface Props {
  user: SessionUser;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) =>
  requireRole('builder', ctx);

export default function ClaimTFPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [accountEmail, setAccountEmail] = useState(user.email ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/portal/credits/claim', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          kind: 'TF',
          account_email: accountEmail,
        }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as {error?: string};
        throw new Error(j.error ?? `Submission failed (${r.status})`);
      }
      setSubmittedEmail(accountEmail);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedEmail) {
    return (
      <PortalLayout>
        <Head>
          <title>Claim Token Factory $100 · Builder portal</title>
        </Head>
        <PageHeader
          eyebrow="Intro credits"
          title="Claim Token Factory $100"
          description="A $100 prepaid Token Factory balance lands on your account within 1 business day."
        />
        <Card
          view="filled"
          className={page.cardBody}
          style={{
            maxWidth: 640,
            marginTop: 24,
            borderLeft: '4px solid var(--g-color-base-positive-medium, #2da26a)',
          }}
        >
          <Text variant="subheader-2" as="div">
            Claim submitted.
          </Text>
          <Text variant="body-2" color="secondary">
            We&apos;ll credit $100 to your Token Factory account at{' '}
            <strong>{submittedEmail}</strong> within one business day.
          </Text>
        </Card>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <Head>
        <title>Claim Token Factory $100 · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Intro credits"
        title="Claim Token Factory $100"
        description="A $100 prepaid Token Factory balance lands on your account within 1 business day."
      />

      <form onSubmit={onSubmit}>
        <Card view="filled" className={page.cardBody} style={{maxWidth: 640, marginTop: 24}}>
          <Text variant="caption-2" color="secondary">YOUR TOKEN FACTORY ACCOUNT</Text>
          <TextInput
            label="Token Factory account email"
            type="email"
            placeholder="you@org.com"
            value={accountEmail}
            onUpdate={setAccountEmail}
          />
          {error ? (
            <Text variant="body-2" color="danger" role="alert">
              {error}
            </Text>
          ) : null}
          <Button
            type="submit"
            view="action"
            size="l"
            loading={submitting}
            disabled={!accountEmail}
          >
            Claim $100 →
          </Button>
        </Card>
      </form>
    </PortalLayout>
  );
}
