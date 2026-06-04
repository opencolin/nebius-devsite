import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import {useState} from 'react';

import {Button, Card, Label, Text, TextInput} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole, type SessionUser} from '@/lib/auth';

import page from '@/styles/page.module.scss';

interface Props {
  user: SessionUser;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) =>
  requireRole('builder', ctx);

export default function ProfilePage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const r = await fetch('/api/portal/profile', {
        method: 'PATCH',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({first_name: firstName, last_name: lastName}),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as {error?: string};
        throw new Error(j.error ?? `Save failed (${r.status})`);
      }
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PortalLayout>
      <Head>
        <title>Profile · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="You"
        title="Profile"
        description="What other builders see on your /team/[handle] page. Backed by Directus directus_users + the linked builders row."
      />

      <form onSubmit={onSubmit}>
        <Card view="filled" className={page.cardBody} style={{maxWidth: 640, marginTop: 24}}>
          <Text variant="caption-2" color="secondary">
            ACCOUNT
          </Text>
          <TextInput label="Email" value={user.email} disabled />
          <TextInput
            label="First name"
            value={firstName}
            onUpdate={setFirstName}
          />
          <TextInput
            label="Last name"
            value={lastName}
            onUpdate={setLastName}
          />
          <span style={{alignSelf: 'flex-start'}}>
            <Label theme="info" size="s">
              Role: {user.role}
            </Label>
          </span>
          {error ? (
            <Text variant="body-2" color="danger" role="alert">
              {error}
            </Text>
          ) : null}
          {saved ? (
            <Text variant="body-2" color="positive" role="status">
              Saved.
            </Text>
          ) : null}
          <Button
            type="submit"
            view="action"
            size="l"
            loading={submitting}
            disabled={!firstName && !lastName}
          >
            Save changes
          </Button>
        </Card>
      </form>
    </PortalLayout>
  );
}
