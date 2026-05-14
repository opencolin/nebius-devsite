import type {GetServerSideProps} from 'next';
import Head from 'next/head';

import {Button, Card, Text, TextInput} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {StubCallout} from '@/components/chrome/StubCallout';
import {requireRole} from '@/lib/auth';

import page from '@/styles/page.module.scss';

export const getServerSideProps: GetServerSideProps = async (ctx) => requireRole('builder', ctx);

export default function ClaimTFPage() {
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

      <Card view="filled" className={page.cardBody} style={{maxWidth: 640, marginTop: 24}}>
        <Text variant="caption-2" color="secondary">YOUR TOKEN FACTORY ACCOUNT</Text>
        <TextInput label="Token Factory account email" placeholder="you@org.com" />
        <Button view="action" size="l">Claim $100 →</Button>
      </Card>

      <StubCallout description="Submit handler will POST to /api/portal/credits/claim with kind=TF, creating a row in credit_requests with status=PENDING. Admins approve in /admin/credit-claims." />
    </PortalLayout>
  );
}
