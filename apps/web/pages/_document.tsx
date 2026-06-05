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
        // Brand bootstrap — apply the dev.nebius.com brand before paint so the
        // CSS token layer (globals.scss html[data-brand='nebius']) is live with
        // no flash. Default 'builders'.
        var brand = localStorage.getItem('brand') === 'nebius' ? 'nebius' : 'builders';
        document.documentElement.setAttribute('data-brand', brand);
      } catch (e) {}
    })();
  `;

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        <script dangerouslySetInnerHTML={{__html: themeBootstrap}} />
        {/* Inter (body) + Space Mono (display headings) — the dev.nebius.com
            brand's fonts. Loaded for all brands; only applied under
            data-brand="nebius" via globals.scss. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
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
