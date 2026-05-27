// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Next's built-in gzip. Azure Front Door's HTTP/2 + gzip pass-through
  // hangs browser streams when ~25 parallel asset requests are issued at once
  // (single curl works fine; browser fan-out doesn't). With compress:false here
  // and AFD compression also off, assets are served uncompressed end-to-end —
  // larger over the wire, but the browser can actually load them. CDN
  // compression can be re-enabled at a real CDN tier later.
  compress: false,
  // Standalone output is enabled only when we're building for the prod Docker
  // image (infra/Dockerfile.web sets BUILD_STANDALONE=1). For local dev and
  // `next start` it's disabled, because `next start` is incompatible with
  // standalone output and silently serves stale dev chunks otherwise.
  ...(process.env.BUILD_STANDALONE === '1' ? {output: 'standalone'} : {}),
  // Server-side ISR + on-demand revalidate of CMS pages. Bumped from default 60s
  // to fit larger Directus payloads on first build.
  staticPageGenerationTimeout: 180,
  // Transpile Gravity UI ESM packages so they work under Next's webpack pipeline.
  // Includes transitive deps (@gravity-ui/components, @gravity-ui/navigation, etc.)
  // because they import .css from inside their ESM, which Node's loader can't
  // handle during Next's `Collecting page data` step.
  transpilePackages: [
    '@gravity-ui/uikit',
    '@gravity-ui/page-constructor',
    '@gravity-ui/icons',
    '@gravity-ui/components',
    '@gravity-ui/navigation',
    '@gravity-ui/dynamic-forms',
    '@gravity-ui/i18n',
    '@gravity-ui/date-utils',
    '@gravity-ui/date-components',
    '@gravity-ui/chartkit',
    '@bem-react/classname',
    '@bem-react/core',
  ],
  images: {
    remotePatterns: [
      // Directus assets, both local dev and prod-CDN-fronted
      { protocol: 'http', hostname: 'localhost', port: '8055' },
      { protocol: 'https', hostname: 'nebius.directus.app' },
      { protocol: 'https', hostname: 'assets.nebius.com' },
      // Anywhere we plan to alias the Directus assets domain in prod
      { protocol: 'https', hostname: '**.nebius-homepage.local' },
    ],
  },
  async headers() {
    return [
      // Long-cache immutable static chunks (matches nebius.com)
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // HTML revalidation policy. Without this, every deploy churns the
      // BUILD_ID embedded in HTML; users with cached HTML from a previous
      // deploy then prefetch /_next/data/<old-BUILD_ID>/<route>.json on
      // <Link> hover and the JSON 404s, because the new deploy only knows
      // the new BUILD_ID. Pages still work (Next falls back to a hard nav)
      // but the console fills with red 404s after every redeploy.
      //
      // Policy:
      //   public                      proxies + browsers may cache
      //   max-age=0                   browser revalidates on every navigation
      //   must-revalidate             stale browser copy is unusable till checked
      //   s-maxage=60                 Front Door holds the response for 60s
      //   stale-while-revalidate=300  Front Door may serve up to 5min stale
      //                               while it fetches a fresh copy in the bg
      //
      // Net effect: edge cache benefits preserved; browsers stop reusing
      // HTML with a dead BUILD_ID across redeploys. Long-open tabs still
      // hit 404s on hover until the user navigates (no header alone can
      // fix that without a service worker or skew-protection routing).
      //
      // Negative match `((?!_next/static/|favicon\\.ico).*)` so static chunks
      // keep their immutable header (set above) and aren't accidentally
      // downgraded by this catch-all.
      {
        source: '/:path((?!_next/static/|favicon\\.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
