import type {AppProps} from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import {useEffect, useState} from 'react';

import {ThemeProvider as GravityThemeProvider} from '@gravity-ui/uikit';

import {FirstVisitRedirect} from '@/components/chrome/FirstVisitRedirect';
import {MockupBanner} from '@/components/chrome/MockupBanner';
import {ThemeProvider, useThemeToggle} from '@/components/chrome/ThemeToggle';
import {ConsentBanner} from '@/components/consent/ConsentBanner';

import '@/styles/globals.scss';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GTM_PROXY = process.env.NEXT_PUBLIC_GTM_PROXY;

export default function App({Component, pageProps}: AppProps) {
  return (
    <ThemeProvider>
      <ThemedShell Component={Component} pageProps={pageProps} />
    </ThemeProvider>
  );
}

// Inner shell needs to be inside our ThemeProvider so useThemeToggle() can
// read the shared context. The outer App can't use the hook because it
// renders the provider.
function ThemedShell({Component, pageProps}: {Component: AppProps['Component']; pageProps: AppProps['pageProps']}) {
  const {theme} = useThemeToggle();

  // GTM is only injected after consent. We re-check on mount and listen for
  // the `nb:consent-granted` event the ConsentBanner emits.
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = window.localStorage.getItem('nb_consent');
    if (v === 'granted') setConsentGranted(true);
    const onGrant = () => setConsentGranted(true);
    window.addEventListener('nb:consent-granted', onGrant);
    return () => window.removeEventListener('nb:consent-granted', onGrant);
  }, []);

  // Stape sGTM proxy domain (mirrors gw.stape.run on nebius.com) — when set,
  // we point the GTM script at the proxy origin instead of googletagmanager.com.
  // This is what makes attribution survive ad-blockers in prod.
  const gtmSrc =
    GTM_ID && GTM_PROXY
      ? `${GTM_PROXY.replace(/\/$/, '')}/gtm.js?id=${GTM_ID}`
      : GTM_ID
        ? `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
        : null;

  return (
    <GravityThemeProvider theme={theme}>
      <Head>
        <meta name="viewport" content="width=device-width" />
      </Head>

      <MockupBanner />
      {/* First-arrival redirect to /about-this-build. Null-rendering
          side-effect — only fires on '/' and only once per browser
          (localStorage flag). Mounted before <Component> so the
          redirect kicks before the homepage's heavy data hydrates. */}
      <FirstVisitRedirect />
      <Component {...pageProps} />

      {/* Second mockup banner pinned to the bottom of the viewport.
          Stays visible regardless of scroll — reviewers who skim past
          the top strip never lose the "this is a mockup" context. */}
      <MockupBanner placement="bottom" />
      <ConsentBanner />

      {consentGranted && gtmSrc ? (
        <>
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              `,
            }}
          />
          <Script id="gtm-loader" strategy="afterInteractive" src={gtmSrc} />
        </>
      ) : null}
    </GravityThemeProvider>
  );
}
