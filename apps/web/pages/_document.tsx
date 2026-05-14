import {Html, Head, Main, NextScript} from 'next/document';

export default function Document() {
  // Pre-paint theme bootstrap (mirrors the pattern in the existing
  // nebius-builders repo) so dark mode doesn't flash on hydration.
  // Gravity UI looks for the `g-root_theme_*` class on <html>.
  const themeBootstrap = `
    (function () {
      try {
        var stored = localStorage.getItem('theme');
        var preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = stored || (preferDark ? 'dark' : 'light');
        document.documentElement.classList.add('g-root', 'g-root_theme_' + theme);
      } catch (e) {}
    })();
  `;

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        <script dangerouslySetInnerHTML={{__html: themeBootstrap}} />
      </Head>
      <body>
        {/* GTM noscript — only emitted in markup if a container ID is configured.
            The actual GTM script tag is loaded from _app.tsx after consent. */}
        {gtmId ? (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        ) : null}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
