// /tavily — partner developer-onboarding page for the Tavily web-search API.
//
// Tavily is the search/retrieval API for LLMs and agents. On the Nebius
// Builders site it sits under the Products menu next to AI Cloud / Token
// Factory / Serverless: builders pair Tavily web search with Nebius models
// to build agents that can browse the web.
//
// Unlike the first-party product pages (which are pure resource aggregators),
// this page is an onboarding flow: dark hero -> numbered get-started steps
// with runnable Python/JS code -> capabilities -> curated resources. The
// resources rail also auto-enriches from any library_articles tagged
// surface: ["tavily"] (fetched at build, ISR revalidate 60s), so curated
// content shows up here automatically as it lands.

import {readItems} from '@directus/sdk';
import type {GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import {useState} from 'react';

import {Button, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {ResourceCard, type ResourceEntry} from '@/components/product/ResourceCard';
import {directusServer} from '@/lib/directus';
import type {LibraryArticleRow} from '@/lib/types';

import styles from '@/styles/product-page.module.scss';
import t from '@/styles/tavily.module.scss';

// ---- Static content -----------------------------------------------------

// Curated official Tavily resources — always shown, independent of the CMS.
const RESOURCES: ResourceEntry[] = [
  {
    slug: 'tavily-docs',
    title: 'Documentation',
    blurb: 'Quickstart, concepts, and guides for Search, Extract, Crawl, and Map.',
    type: 'DOCS',
    level: 'BEGINNER',
    duration_min: null,
    external_url: 'https://docs.tavily.com',
    is_official: true,
    pinned: false,
  },
  {
    slug: 'tavily-api-reference',
    title: 'API Reference',
    blurb: 'Every endpoint and parameter, with request/response examples.',
    type: 'DOCS',
    level: 'INTERMEDIATE',
    duration_min: null,
    external_url: 'https://docs.tavily.com/documentation/api-reference/introduction',
    is_official: true,
    pinned: false,
  },
  {
    slug: 'tavily-sdks',
    title: 'Python & JS/TS SDKs',
    blurb: 'Official open-source SDKs: tavily-python and @tavily/core.',
    type: 'REPO',
    level: 'BEGINNER',
    duration_min: null,
    external_url: 'https://github.com/tavily-ai',
    is_official: true,
    pinned: false,
  },
  {
    slug: 'tavily-mcp',
    title: 'MCP Server',
    blurb: 'Drop Tavily web search into Claude, Cursor, and any MCP client.',
    type: 'DOCS',
    level: 'INTERMEDIATE',
    duration_min: null,
    external_url: 'https://docs.tavily.com/documentation/mcp',
    is_official: true,
    pinned: false,
  },
  {
    slug: 'tavily-examples',
    title: 'Examples & Notebooks',
    blurb: 'Reference apps and notebooks: RAG, research agents, and more.',
    type: 'REPO',
    level: 'INTERMEDIATE',
    duration_min: null,
    external_url: 'https://docs.tavily.com/examples/hub',
    is_official: true,
    pinned: false,
  },
  {
    slug: 'tavily-pricing',
    title: 'Credits & Pricing',
    blurb: '1,000 free API credits every month; usage-based after that.',
    type: 'DOCS',
    level: 'BEGINNER',
    duration_min: null,
    external_url: 'https://docs.tavily.com/documentation/api-credits',
    is_official: true,
    pinned: false,
  },
];

const CAPABILITIES: Array<{name: string; desc: string}> = [
  {name: 'Search', desc: 'One call returns ranked, LLM-ready results with sources and an optional AI answer.'},
  {name: 'Extract', desc: 'Pull clean, parsed content from any URL — no scraping boilerplate.'},
  {name: 'Crawl', desc: 'Traverse a site from a starting URL and collect pages in structured form.'},
  {name: 'Map', desc: "Discover a site's link graph to plan retrieval and coverage."},
];

const LANGS = [
  {key: 'py', label: 'Python'},
  {key: 'js', label: 'JavaScript'},
] as const;
type LangKey = (typeof LANGS)[number]['key'];

const SAMPLES: Record<'install' | 'search', Record<LangKey, string>> = {
  install: {
    py: 'pip install tavily-python',
    js: 'npm install @tavily/core',
  },
  search: {
    py: `from tavily import TavilyClient

client = TavilyClient(api_key="tvly-YOUR_API_KEY")
response = client.search("What did Nebius announce this week?")
print(response)`,
    js: `import { tavily } from "@tavily/core";

const client = tavily({ apiKey: "tvly-YOUR_API_KEY" });
const response = await client.search("What did Nebius announce this week?");
console.log(response);`,
  },
};

// ---- Data ---------------------------------------------------------------

interface Props {
  libraryResources: ResourceEntry[];
}

function toEntry(r: LibraryArticleRow): ResourceEntry {
  return {
    slug: r.slug,
    title: r.title,
    blurb: r.blurb,
    type: r.type,
    level: r.level,
    duration_min: r.duration_min ?? null,
    external_url: r.external_url ?? null,
    is_official: r.is_official,
    pinned: r.pinned ?? false,
  };
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const directus = directusServer();
  // Directus 11 JSON array fields do not support _contains — fetch all, filter in JS.
  const allArticles = (await directus.request(
    readItems('library_articles', {
      filter: {status: {_eq: 'published'}},
      sort: ['-pinned', '-is_official', 'title'],
      limit: -1,
    }),
  )) as LibraryArticleRow[];
  const libraryResources = allArticles
    .filter((r) => (r.surface ?? []).includes('tavily'))
    .map(toEntry);

  return {props: {libraryResources}, revalidate: 60};
};

// ---- Code block (shared language toggle) --------------------------------

function CodeBlock({
  lang,
  onLang,
  sample,
}: {
  lang: LangKey;
  onLang: (l: LangKey) => void;
  sample: Record<LangKey, string>;
}) {
  return (
    <div className={t.code}>
      <div className={t.codeTabs} role="tablist" aria-label="Language">
        {LANGS.map((l) => (
          <button
            key={l.key}
            type="button"
            role="tab"
            aria-selected={lang === l.key}
            className={`${t.codeTab} ${lang === l.key ? t.codeTabActive : ''}`}
            onClick={() => onLang(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <pre className={t.codePre}>
        <code>{sample[lang]}</code>
      </pre>
    </div>
  );
}

// ---- Page ---------------------------------------------------------------

export default function TavilyPage({
  libraryResources,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [lang, setLang] = useState<LangKey>('py');

  return (
    <PublicLayout>
      <Head>
        <title>Tavily · Nebius Builders</title>
        <meta
          name="description"
          content="Give your AI agents real-time web access with Tavily — the search and retrieval API for LLMs. Get started free in minutes and pair Tavily with Nebius models to build agents that search the web."
        />
      </Head>

      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.heroEyebrow}>Partner · Web search API</span>
          <h1 className={styles.heroTitle}>Give your agents real-time web access with Tavily.</h1>
          <p className={styles.heroLede}>
            Tavily is the search and retrieval API built for LLMs and agents. Search, extract,
            crawl, and map the web with one call, then ground your Nebius-powered models on fresh,
            reliable sources. Free to start — no credit card required.
          </p>
          <div className={styles.heroCtas}>
            <Button
              view="action"
              size="l"
              href="https://app.tavily.com"
              target="_blank"
              rel="noreferrer"
            >
              Get your API key
            </Button>
            <Button
              view="outlined"
              size="l"
              href="https://docs.tavily.com"
              target="_blank"
              rel="noreferrer"
            >
              Read the docs ↗
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Get started (numbered steps) ---- */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <Text variant="caption-2" className={styles.sectionEyebrow}>
              Get started
            </Text>
            <Text variant="header-2" as="h2" className={styles.sectionTitle}>
              Your first search in under five minutes.
            </Text>
          </div>

          <div className={t.steps}>
            {/* Step 1 */}
            <div className={t.step}>
              <div className={t.stepNum}>1</div>
              <div className={t.stepBody}>
                <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                  Get your free API key
                </Text>
                <Text variant="body-2" color="secondary" className={t.stepText}>
                  Create an account on the Tavily platform — you get 1,000 free API credits every
                  month, no credit card required. Copy a key from your dashboard; it looks like{' '}
                  <code>tvly-…</code>.
                </Text>
                <div className={t.stepActions}>
                  <Button
                    view="normal"
                    size="m"
                    href="https://app.tavily.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open the Tavily platform ↗
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={t.step}>
              <div className={t.stepNum}>2</div>
              <div className={t.stepBody}>
                <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                  Install the SDK
                </Text>
                <Text variant="body-2" color="secondary" className={t.stepText}>
                  Official SDKs for Python and JavaScript/TypeScript. Pick your language.
                </Text>
                <CodeBlock lang={lang} onLang={setLang} sample={SAMPLES.install} />
              </div>
            </div>

            {/* Step 3 */}
            <div className={t.step}>
              <div className={t.stepNum}>3</div>
              <div className={t.stepBody}>
                <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                  Run your first search
                </Text>
                <Text variant="body-2" color="secondary" className={t.stepText}>
                  Four lines to a ranked, LLM-ready result set. Swap in your key and run.
                </Text>
                <CodeBlock lang={lang} onLang={setLang} sample={SAMPLES.search} />
              </div>
            </div>

            {/* Step 4 */}
            <div className={t.step}>
              <div className={t.stepNum}>4</div>
              <div className={t.stepBody}>
                <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                  Pair Tavily with Nebius
                </Text>
                <Text variant="body-2" color="secondary" className={t.stepText}>
                  Tavily retrieves; your Nebius model reasons. Pass Tavily's search results as
                  context to any OpenAI-compatible chat completion on Nebius Token Factory to build
                  agents that search the web, then synthesize grounded answers. Or drop the Tavily
                  MCP server into Cursor, Claude, or any MCP client.
                </Text>
                <div className={t.stepActions}>
                  <Button view="normal" size="m" href="/token-factory">
                    Token Factory quickstart →
                  </Button>
                  <Button
                    view="flat"
                    size="m"
                    href="https://docs.tavily.com/documentation/mcp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Tavily MCP server ↗
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Capabilities ---- */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <Text variant="caption-2" className={styles.sectionEyebrow}>
              One API, four primitives
            </Text>
            <Text variant="header-2" as="h2" className={styles.sectionTitle}>
              Everything an agent needs to read the web.
            </Text>
          </div>
          <div className={t.capGrid}>
            {CAPABILITIES.map((c) => (
              <div key={c.name} className={t.capCard}>
                <Text variant="subheader-1" as="h3" className={t.capName}>
                  {c.name}
                </Text>
                <Text variant="body-2" color="secondary" className={t.capDesc}>
                  {c.desc}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Build with Tavily (curated resources) ---- */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <Text variant="caption-2" className={styles.sectionEyebrow}>
              Resources
            </Text>
            <Text variant="header-2" as="h2" className={styles.sectionTitle}>
              Build with Tavily.
            </Text>
          </div>
          <div className={styles.resourceGrid}>
            {RESOURCES.map((e) => (
              <ResourceCard key={e.slug} entry={e} />
            ))}
          </div>
          <Text variant="caption-2" className={t.partnerNote}>
            Tavily is an independent partner product. Pricing and availability are set by Tavily.
          </Text>
        </div>
      </section>

      {/* ---- From the Nebius library (auto-enriches via surface: tavily) ---- */}
      {libraryResources.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Text variant="caption-2" className={styles.sectionEyebrow}>
                From the library
              </Text>
              <Text variant="header-2" as="h2" className={styles.sectionTitle}>
                Tavily + Nebius, from the community.
              </Text>
            </div>
            <div className={styles.resourceGrid}>
              {libraryResources.map((e) => (
                <ResourceCard key={e.slug} entry={e} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Console CTA ---- */}
      <div className={styles.consoleCta}>
        <div className={styles.consoleCtaInner}>
          <Text variant="header-1" as="h2">
            Start building with Tavily + Nebius.
          </Text>
          <Button
            view="action"
            size="l"
            href="https://app.tavily.com"
            target="_blank"
            rel="noreferrer"
          >
            Get your API key ↗
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
