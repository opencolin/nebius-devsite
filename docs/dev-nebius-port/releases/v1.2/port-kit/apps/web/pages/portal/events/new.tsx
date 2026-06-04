import type {GetServerSideProps} from 'next';
import Head from 'next/head';
import {useState} from 'react';

import {Button, Card, Select, Text, TextInput} from '@gravity-ui/uikit';

import {LabeledTextArea} from '@/components/forms/LabeledTextArea';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {requireRole} from '@/lib/auth';

import page from '@/styles/page.module.scss';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('builder', ctx);

export default function HostNewEventPage() {
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [agenda, setAgenda] = useState('');
  const [needsFromNebius, setNeedsFromNebius] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/portal/events', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          title,
          format: format[0] ?? '',
          starts_at: startsAt,
          venue,
          city,
          country,
          expected_attendees: expectedAttendees,
          agenda,
          needs_from_nebius: needsFromNebius,
          amount_usd: amountUsd,
        }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as {error?: string};
        throw new Error(j.error ?? `Submission failed (${r.status})`);
      }
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <PortalLayout>
        <Head>
          <title>Host an event · Builder portal</title>
        </Head>
        <PageHeader
          eyebrow="Events"
          title="Host an event"
          description="Apply to host a Nebius-supported event. We'll respond within 48h with credit allocation, swag shipping, and advocate support."
        />
        <Card
          view="filled"
          className={page.cardBody}
          style={{
            maxWidth: 760,
            marginTop: 24,
            borderLeft: '4px solid var(--g-color-base-positive-medium, #2da26a)',
          }}
        >
          <Text variant="subheader-2" as="div">
            Event application submitted.
          </Text>
          <Text variant="body-2" color="secondary">
            We&apos;ll respond within 48 hours with a credit allocation, swag
            shipping confirmation, and advocate availability.
          </Text>
        </Card>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <Head>
        <title>Host an event · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Events"
        title="Host an event"
        description="Apply to host a Nebius-supported event. We'll respond within 48h with credit allocation, swag shipping, and advocate support."
      />

      <form onSubmit={onSubmit}>
        <Card view="filled" className={page.cardBody} style={{maxWidth: 760, marginTop: 24}}>
          <Text variant="caption-2" color="secondary">EVENT BASICS</Text>
          <TextInput
            label="Title"
            placeholder="e.g. Fine-tuning Llama on Nebius"
            value={title}
            onUpdate={setTitle}
          />
          <Select
            label="Format"
            placeholder="Pick a format"
            value={format}
            onUpdate={setFormat}
          >
            <Select.Option value="WORKSHOP">Workshop</Select.Option>
            <Select.Option value="TALK">Talk</Select.Option>
            <Select.Option value="HACKATHON">Hackathon</Select.Option>
            <Select.Option value="DEMO_NIGHT">Demo night</Select.Option>
            <Select.Option value="OFFICE_HOURS">Office hours</Select.Option>
          </Select>
          <TextInput
            label="Date / time (YYYY-MM-DDTHH:MM)"
            placeholder="2026-08-12T18:30"
            value={startsAt}
            onUpdate={setStartsAt}
          />
          <TextInput
            label="Venue"
            placeholder="Venue name + address"
            value={venue}
            onUpdate={setVenue}
          />
          <TextInput
            label="City"
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
          <TextInput
            label="Expected attendees"
            type="number"
            placeholder="50"
            value={expectedAttendees}
            onUpdate={setExpectedAttendees}
          />
          <TextInput
            label="Credit amount requested (USD)"
            type="number"
            placeholder="100"
            value={amountUsd}
            onUpdate={setAmountUsd}
          />
          <LabeledTextArea
            label="What you'll cover"
            rows={4}
            placeholder="Agenda, hands-on portions, target audience"
            value={agenda}
            onUpdate={setAgenda}
          />
          <LabeledTextArea
            label="What you need from Nebius"
            rows={3}
            placeholder="Credits, swag, advocate as a speaker, sample code, etc."
            value={needsFromNebius}
            onUpdate={setNeedsFromNebius}
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
            disabled={!title || format.length === 0 || !startsAt}
          >
            Submit application
          </Button>
        </Card>
      </form>
    </PortalLayout>
  );
}
