import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';

import {Card, Label, Text, TextInput} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {StubCallout} from '@/components/chrome/StubCallout';
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

      <Card view="filled" className={page.cardBody} style={{maxWidth: 640, marginTop: 24}}>
        <Text variant="caption-2" color="secondary">
          ACCOUNT
        </Text>
        <TextInput label="Email" value={user.email} disabled />
        <TextInput label="First name" value={user.firstName ?? ''} />
        <TextInput label="Last name" value={user.lastName ?? ''} />
        <span style={{alignSelf: 'flex-start'}}><Label theme="info" size="s">
          Role: {user.role}
        </Label></span>
      </Card>

      <StubCallout description="Save handler for profile edits is not yet wired. Once the builders collection is linked to directus_users, PATCHing /items/builders/:id from a /api/portal/profile route will persist changes." />
    </PortalLayout>
  );
}
