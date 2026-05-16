import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import {useState} from 'react';

import {Button, Card, Text, TextInput} from '@gravity-ui/uikit';

import {LabeledTextArea} from '@/components/forms/LabeledTextArea';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole, type SessionUser} from '@/lib/auth';

import page from '@/styles/page.module.scss';

interface Props {
  user: SessionUser;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) =>
  requireRole('builder', ctx);

export default function AmbassadorApplyPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState(user.email ?? '');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [oneThingBuilt, setOneThingBuilt] = useState('');
  const [meetupsToHost, setMeetupsToHost] = useState('');
  const [communities, setCommunities] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/portal/ambassador/apply', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          handle,
          email,
          city,
          country,
          one_thing_built: oneThingBuilt,
          meetups_to_host: meetupsToHost,
          communities,
        }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as {error?: string};
        throw new Error(j.error ?? `Submission failed (${r.status})`);
      }
      setSubmittedEmail(email);
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
          <title>Apply for Ambassador · Builder portal</title>
        </Head>
        <PageHeader
          eyebrow="Program"
          title="Apply for Ambassador"
          description="Ambassadors host recurring events, get a quarterly stipend, and a direct line to Nebius DevRel + product. Applications reviewed monthly."
        />
        <Card
          view="filled"
          className={page.cardBody}
          style={{
            maxWidth: 720,
            marginTop: 24,
            borderLeft: '4px solid var(--g-color-base-positive-medium, #2da26a)',
          }}
        >
          <Text variant="subheader-2" as="div">
            Thanks — your ambassador application is in.
          </Text>
          <Text variant="body-2" color="secondary">
            We review monthly; you&apos;ll hear back at <strong>{submittedEmail}</strong>.
          </Text>
        </Card>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <Head>
        <title>Apply for Ambassador · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Program"
        title="Apply for Ambassador"
        description="Ambassadors host recurring events, get a quarterly stipend, and a direct line to Nebius DevRel + product. Applications reviewed monthly."
      />

      <form onSubmit={onSubmit}>
        <Card view="filled" className={page.cardBody} style={{maxWidth: 720, marginTop: 24}}>
          <Text variant="caption-2" color="secondary">YOUR APPLICATION</Text>
          <TextInput
            label="Handle"
            placeholder="GitHub or Twitter handle, e.g. @opencolin"
            value={handle}
            onUpdate={setHandle}
          />
          <TextInput
            label="Contact email"
            type="email"
            placeholder="you@org.com"
            value={email}
            onUpdate={setEmail}
          />
          <TextInput
            label="City you'd cover"
            placeholder="e.g. Berlin"
            value={city}
            onUpdate={setCity}
          />
          <TextInput
            label="Country"
            placeholder="e.g. Germany"
            value={country}
            onUpdate={setCountry}
          />
          <LabeledTextArea
            label="One thing you've built"
            placeholder="A project, repo, or experiment you're proud of — link if possible."
            rows={3}
            value={oneThingBuilt}
            onUpdate={setOneThingBuilt}
          />
          <LabeledTextArea
            label="Meetups you'd host"
            placeholder="Frequency, format (workshop / demo night / hack), audience profile"
            rows={4}
            value={meetupsToHost}
            onUpdate={setMeetupsToHost}
          />
          <LabeledTextArea
            label="Communities you're part of"
            placeholder="Discords, meetups, or networks you'd draw on (with sizes if you know them)"
            rows={3}
            value={communities}
            onUpdate={setCommunities}
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
            disabled={!handle || !email || !city || !oneThingBuilt}
          >
            Submit application
          </Button>
        </Card>
      </form>
    </PortalLayout>
  );
}
