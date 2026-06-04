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

export default function SubmitLibraryPage() {
  return (
    <PortalLayout>
      <Head>
        <title>Submit a library entry · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Program"
        title="Submit a library entry"
        description="Workshops, videos, repos, deep tutorials. Accepted submissions earn +50 pts and feature on /library."
      />

      <Card view="filled" className={page.cardBody} style={{maxWidth: 760, marginTop: 24}}>
        <Text variant="caption-2" color="secondary">SUBMISSION</Text>
        <TextInput label="Title" />
        <Select label="Type" placeholder="Pick one">
          <Select.Option value="WORKSHOP">Workshop</Select.Option>
          <Select.Option value="VIDEO">Video</Select.Option>
          <Select.Option value="REPO">Repo</Select.Option>
        </Select>
        <Select label="Level" placeholder="Beginner / Intermediate / Advanced">
          <Select.Option value="BEGINNER">Beginner</Select.Option>
          <Select.Option value="INTERMEDIATE">Intermediate</Select.Option>
          <Select.Option value="ADVANCED">Advanced</Select.Option>
        </Select>
        <TextInput label="External URL" placeholder="https://github.com/you/repo or https://youtube.com/…" />
        <LabeledTextArea label="Blurb" rows={3} placeholder="One-sentence description of what this is." />
        <LabeledTextArea label="Body (optional)" rows={6} placeholder="Markdown body if you want it inlined under /library/[slug]." />
        <Button view="action" size="l">Submit for review</Button>
      </Card>

      <StubCallout description="Submit handler will POST to /api/portal/library, creating a library_articles row with status=draft. Admins approve in /admin/library." />
    </PortalLayout>
  );
}
