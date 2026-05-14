import type {GetServerSideProps} from 'next';
import Head from 'next/head';

import {Button, Card, Select, Text, TextInput} from '@gravity-ui/uikit';

import {LabeledTextArea} from '@/components/forms/LabeledTextArea';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {StubCallout} from '@/components/chrome/StubCallout';
import {requireRole} from '@/lib/auth';

import page from '@/styles/page.module.scss';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('builder', ctx);

export default function HostNewEventPage() {
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

      <Card view="filled" className={page.cardBody} style={{maxWidth: 760, marginTop: 24}}>
        <Text variant="caption-2" color="secondary">EVENT BASICS</Text>
        <TextInput label="Title" placeholder="e.g. Fine-tuning Llama on Nebius" />
        <Select label="Format" placeholder="Pick a format">
          <Select.Option value="WORKSHOP">Workshop</Select.Option>
          <Select.Option value="TALK">Talk</Select.Option>
          <Select.Option value="HACKATHON">Hackathon</Select.Option>
          <Select.Option value="DEMO_NIGHT">Demo night</Select.Option>
          <Select.Option value="OFFICE_HOURS">Office hours</Select.Option>
        </Select>
        <TextInput label="Date / time (YYYY-MM-DDTHH:MM)" placeholder="2026-08-12T18:30" />
        <TextInput label="Venue" placeholder="Venue name + address" />
        <TextInput label="Expected attendees" type="number" placeholder="50" />
        <LabeledTextArea label="What you'll cover" rows={4} placeholder="Agenda, hands-on portions, target audience" />
        <LabeledTextArea label="What you need from Nebius" rows={3} placeholder="Credits, swag, advocate as a speaker, sample code, etc." />
        <Button view="action" size="l">Submit application</Button>
      </Card>

      <StubCallout description="POST handler will create an events row with status=DRAFT and a credit_requests row for review by /admin/credit-requests. On approval, the event publishes and per-attendee credits are allocated." />
    </PortalLayout>
  );
}
