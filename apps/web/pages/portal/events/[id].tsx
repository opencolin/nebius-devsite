import type {GetServerSideProps} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Button, Card, Label, Text} from '@gravity-ui/uikit';

import {PageHeader} from '@/components/chrome/PageHeader';
import {PortalLayout} from '@/components/chrome/PortalLayout';
import {StubCallout} from '@/components/chrome/StubCallout';
import {enforceRole} from '@/lib/auth';

import page from '@/styles/page.module.scss';

interface Props {
  id: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const guard = await enforceRole('builder', ctx);
  if (guard) return guard;
  return {props: {id: ctx.params!.id as string}};
};

export default function PortalEventDetail({id}: Props) {
  return (
    <PortalLayout>
      <Head>
        <title>Event {id} · Builder portal</title>
      </Head>
      <PageHeader
        eyebrow="Events"
        title={`Event #${id}`}
        description="Manage attendance, credits, and post-event reporting for one of your hosted events."
        actions={
          <Link href="/portal/events" style={{color: 'var(--g-color-text-secondary)'}}>
            ← All events
          </Link>
        }
      />

      <div className={page.grid2} style={{marginTop: 24}}>
        <Card view="filled" className={page.cardBody}>
          <Text variant="caption-2" color="secondary">STATUS</Text>
          <span style={{alignSelf: 'flex-start'}}><Label theme="success" size="s">PUBLISHED</Label></span>
          <Text variant="body-2" color="secondary">Visible on the public /events list. Luma RSVP synced.</Text>
        </Card>
        <Card view="filled" className={page.cardBody}>
          <Text variant="caption-2" color="secondary">CREDITS</Text>
          <Text variant="display-2" as="div">$2,000</Text>
          <Text variant="body-2" color="secondary">Allocated for 40 expected attendees ($50 each).</Text>
        </Card>
      </div>

      <Card view="filled" className={page.cardBody} style={{marginTop: 24}}>
        <Text variant="caption-2" color="secondary">POST-EVENT</Text>
        <Text variant="body-2">Once the event ends, submit attendance + photos within 7 days to claim points and unlock the next event allocation.</Text>
        <Button view="action" size="m" style={{alignSelf: 'flex-start', marginTop: 12}}>
          Submit post-event report
        </Button>
      </Card>

      <StubCallout description="Detail/edit handler will GET/PATCH /items/events/:id via the user-scoped Directus client. Builders can only edit events where builder = $CURRENT_USER (enforced in Directus role permissions)." />
    </PortalLayout>
  );
}
