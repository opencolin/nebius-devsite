// Placeholder home page — stays valid (avoids `/` 404'ing) while the new
// homepage composition lands in follow-up commits. Once the marketing
// sections (Hero, ActiveEvents, Products, UseCases, ...) are ported, this
// file becomes their composition shell.
//
// In the interim it just renders the navigation chrome + a short note +
// links to the routes that ARE finished. The CMS-driven landing page that
// used to live here is now at /signup.

import Head from 'next/head';
import Link from 'next/link';

import {Button, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';

import page from '@/styles/page.module.scss';

export default function HomePage() {
  return (
    <PublicLayout>
      <Head>
        <title>Nebius for AI Builders</title>
        <meta
          name="description"
          content="From training and fine-tuning to production inference at scale. Plus a community of builders shipping real work."
        />
      </Head>
      <main className={page.container} style={{paddingTop: 80, paddingBottom: 80}}>
        <Text variant="display-2" as="h1">
          Nebius for AI Builders
        </Text>
        <Text variant="body-2" color="secondary" as="p" style={{maxWidth: 640, marginTop: 16}}>
          New homepage composition lands in follow-up commits — Hero, events,
          products, use-cases, builder spotlight, programs, partner wall, and
          contact. Until then, head to one of the existing routes:
        </Text>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24}}>
          <Button view="action" size="l" href="/events">
            Events
          </Button>
          <Button view="outlined" size="l" href="/library">
            Library
          </Button>
          <Button view="outlined" size="l" href="/office-hours">
            Office hours
          </Button>
          <Button view="outlined" size="l" href="/team">
            Team
          </Button>
          <Button view="flat" size="l" href="/signup">
            Sign up
          </Button>
        </div>
      </main>
    </PublicLayout>
  );
}
