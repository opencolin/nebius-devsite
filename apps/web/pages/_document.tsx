import {Html, Head, Main, NextScript} from 'next/document';

export default function Document() {
  // Pre-paint bootstrap (mirrors the pattern in the existing nebius-builders
  // repo) so the wrong theme/brand never flashes on hydration. Gravity UI
  // looks for the `g-root_theme_*` class on <html>.
  //
  // Site ships LIGHT-FIRST on the tenki.cloud brand: a first-time visitor
  // (no stored choice) gets light + 'tenki' regardless of OS preference.
  // Returning visitors keep whatever they toggled (localStorage wins).
  const themeBootstrap = `
    (function () {
      try {
        var stored = localStorage.getItem('theme');
        var theme = (stored === 'dark' || stored === 'light') ? stored : 'light';
        document.documentElement.classList.add('g-root', 'g-root_theme_' + theme);
        // Brand bootstrap — apply the brand before paint so the CSS token layer
        // (globals.scss html[data-brand='tenki']) is live with no flash.
        // Default 'tenki' (the tenki.cloud brand).
        var brand = localStorage.getItem('brand') === 'builders' ? 'builders' : 'tenki';
        document.documentElement.setAttribute('data-brand', brand);
      } catch (e) {}
    })();
  `;

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        <script dangerouslySetInnerHTML={{__html: themeBootstrap}} />
        {/* Brand fonts: Inter (body, both brands), Space Mono (tenki.cloud
            headings), Space Grotesk (tenki.cloud display headings — the closest
            free match for tenki.cloud's licensed Gramatika). Loaded for all
            brands; applied per-brand via globals.scss. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
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
