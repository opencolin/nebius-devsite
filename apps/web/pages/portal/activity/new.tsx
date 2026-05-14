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

export default function NewActivityPage() {
  return (
    <PortalLayout>
      <Head>
        <title>Log activity · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Program"
        title="Log a new activity"
        description="Self-report something points-eligible: a tweet, a workshop, a meetup attendance. Reviewed within 48h."
      />

      <Card view="filled" className={page.cardBody} style={{maxWidth: 720, marginTop: 24}}>
        <Text variant="caption-2" color="secondary">DETAILS</Text>
        <Select label="Activity type" placeholder="Pick one">
          <Select.Option value="tweet">Tweet / social post</Select.Option>
          <Select.Option value="meetup">Attended a meetup</Select.Option>
          <Select.Option value="referral">Referred another builder</Select.Option>
          <Select.Option value="other">Other</Select.Option>
        </Select>
        <TextInput label="Proof URL" placeholder="https://…" />
        <LabeledTextArea label="Details" placeholder="What did you do? Why does it count?" rows={4} />
        <Button view="action" size="l">Submit for review</Button>
      </Card>

      <StubCallout description="Submission handler will POST to /api/portal/activity, creating a row in the activities collection with status=PENDING for admin review." />
    </PortalLayout>
  );
}
