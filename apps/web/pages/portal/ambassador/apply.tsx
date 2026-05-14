import type {GetServerSideProps} from 'next';
import Head from 'next/head';

import {Button, Card, Text, TextInput} from '@gravity-ui/uikit';

import {LabeledTextArea} from '@/components/forms/LabeledTextArea';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {StubCallout} from '@/components/chrome/StubCallout';
import {requireRole} from '@/lib/auth';

import page from '@/styles/page.module.scss';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('builder', ctx);

export default function AmbassadorApplyPage() {
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

      <Card view="filled" className={page.cardBody} style={{maxWidth: 720, marginTop: 24}}>
        <Text variant="caption-2" color="secondary">YOUR APPLICATION</Text>
        <TextInput label="City you'd cover" placeholder="e.g. Berlin" />
        <TextInput label="Existing community size" placeholder="e.g. 200-person Discord" />
        <LabeledTextArea
          label="What you'd run"
          placeholder="Frequency, format (workshop / demo night / hack), audience profile"
          rows={4}
        />
        <LabeledTextArea
          label="Why you"
          placeholder="What experience makes you the right person? Past meetups, content, GitHub work?"
          rows={4}
        />
        <Button view="action" size="l">Submit application</Button>
      </Card>

      <StubCallout description="Form handler will POST to /api/portal/ambassador/apply, creating a row in ambassador_applications with status=PENDING. Reviewed monthly via /admin/ambassador-applications." />
    </PortalLayout>
  );
}
