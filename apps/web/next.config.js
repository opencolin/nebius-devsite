// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    ];
  },
};

module.exports = nextConfig;
