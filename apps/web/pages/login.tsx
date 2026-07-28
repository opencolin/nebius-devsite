// /login — bespoke split-screen layout that mirrors
// https://auth.tokenfactory.nebius.com/ui/login. We deliberately skip
// PublicNav here so the dark banner on the left can run flush to the top of
// the viewport (matches upstream). The MockupBanner stays — it's mounted in
// _app.tsx above every page.

import type {GetServerSideProps} from 'next';
import Head from 'next/head';

import {LoginForm} from '@/components/auth/LoginForm';
import {getServerSession} from '@/lib/auth';

interface Props {
  next: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const next = typeof ctx.query.next === 'string' ? ctx.query.next : '/portal';
  const user = await getServerSession(ctx.req, ctx.res);
  if (user) return {redirect: {destination: next, permanent: false}};
  return {props: {next}};
};

export default function LoginPage({next}: Props) {
  return (
    <>
      <Head>
        <title>{`Sign in · Nebius Builders`}</title>
        <meta
          name="description"
          content="Sign in to the Nebius Builders portal — credits, ambassador status, office hours, and the leaderboard."
        />
      </Head>
      <LoginForm nextHref={next} />
    </>
  );
}
