// /signup — Builder Program signup page. Custom hero up top persuades
// the visitor to join, with a single "Sign up" CTA. Below the hero we
// reuse the supporting Page Constructor blocks from the Directus `home`
// page (What you get / Three ways to get started) but strip out the
// CMS header-blocks since our custom hero replaces them.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import {Button, Text} from '@gravity-ui/uikit';
import type {PageContent} from '@gravity-ui/page-constructor';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {assetUrl, directusServer} from '@/lib/directus';
import type {PageRow} from '@/lib/types';

import page from '@/styles/page.module.scss';
import styles from './signup.module.scss';

// Page Constructor body loaded through the dynamic CmsRenderer to keep
// the swiper-resolution workaround in place.
const CmsRenderer = dynamic(() => import('@/components/CmsRenderer'), {ssr: true});

// Real Nebius signup URL — for the mockup this is what "join the
// program" actually means: create an account, claim the trial credits,
// follow the Builder onboarding checklist.
const SIGNUP_URL = 'https://console.nebius.com/signup';

interface Props {
  cms: PageRow | null;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const directus = directusServer();
  const pages = await directus.request(
    readItems('pages', {
      filter: {slug: {_eq: 'home'}, status: {_eq: 'published'}},
      limit: 1,
    }),
  );
  return {
    props: {
      cms: ((pages as PageRow[])[0] ?? null) as PageRow | null,
    },
    revalidate: 60,
  };
};

export default function SignupPage({
  cms,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // Strip header-blocks from the CMS body — our custom hero above
  // replaces the authored ones, and we don't want a second hero
  // sitting between the supporting feature blocks.
  const allBlocks = (cms?.blocks?.blocks as Array<{type?: string}> | undefined) ?? [];
  const cmsContent: PageContent = {
    blocks: allBlocks.filter((b) => b.type !== 'header-block') as PageContent['blocks'],
  };
  const ogImage = assetUrl(cms?.seo_image ?? null, {width: 1280, height: 640, format: 'auto'});

  return (
    <PublicLayout>
      <Head>
        <title>Join the Nebius Builders Network</title>
        <meta
          name="description"
          content="Sign up for the Nebius Builder Program — $100 in Token Factory + AI Cloud credits, a community of builders shipping real work, and a path to Ambassador."
        />
        <meta property="og:title" content="Join the Nebius Builders Network" />
        <meta
          property="og:description"
          content="$100 in credits. Workshops + office hours. Tier up as you ship."
        />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      </Head>

      <section className={styles.hero}>
        <div className={page.container}>
          <Text variant="caption-2" className={styles.heroEyebrow}>
            Builder Program
          </Text>
          <Text variant="display-2" as="h1" className={styles.heroTitle}>
            Build with Nebius. Get rewarded for shipping.
          </Text>
          <Text variant="body-2" color="secondary" as="p" className={styles.heroLede}>
            $100 in Token Factory and AI Cloud credits when you sign up.
            Workshops, hackathons, and office hours run by the community.
            Tier up from <strong>Builder</strong> &rarr;{' '}
            <strong>Contributor</strong> &rarr; <strong>Ambassador</strong> as
            you ship real work.
          </Text>
          <ul className={styles.proof}>
            <li>
              <strong>$100</strong>
              <span>in Token Factory + AI Cloud credits</span>
            </li>
            <li>
              <strong>2,800+</strong>
              <span>active builders worldwide</span>
            </li>
            <li>
              <strong>140+</strong>
              <span>community-led events run</span>
            </li>
          </ul>
          <div className={styles.heroActions}>
            <Button
              view="action"
              size="xl"
              href={SIGNUP_URL}
              target="_blank"
              rel="noreferrer"
            >
              Sign up for free &rarr;
            </Button>
          </div>
        </div>
      </section>

      <CmsRenderer content={cmsContent} />
    </PublicLayout>
  );
}
