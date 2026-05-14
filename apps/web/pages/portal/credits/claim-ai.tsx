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

export default function ClaimAICloudPage() {
  return (
    <PortalLayout>
      <Head>
        <title>Claim AI Cloud $100 · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Intro credits"
        title="Claim AI Cloud $100"
        description="AI Cloud credits require a brief use-case description for fraud prevention. Reviewed within 1 business day."
      />

      <Card view="filled" className={page.cardBody} style={{maxWidth: 640, marginTop: 24}}>
        <Text variant="caption-2" color="secondary">CLAIM</Text>
        <TextInput label="AI Cloud account email" placeholder="you@org.com" />
        <LabeledTextArea
          label="What you'll use it for"
          placeholder="e.g. Fine-tune Llama 3.3 70B on a medical-summary dataset"
          rows={3}
        />
        <Button view="action" size="l">Submit claim →</Button>
      </Card>

      <StubCallout description="Submit handler will POST to /api/portal/credits/claim with kind=AI, creating a row in credit_requests with status=PENDING. Admins approve in /admin/credit-claims." />
    </PortalLayout>
  );
}
