// /tavily — developer-onboarding page for Tavily, the Nebius web-search API.
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

// A single "how will you use Tavily?" selector drives the whole guide. Two
// workflows: SDK (Python / JavaScript — install the SDK and call the API) and
// MCP (Claude Code / Codex / Cursor — add Tavily's MCP server, then use it).
const PATHS = [
  {key: 'py', label: 'Python', kind: 'sdk'},
  {key: 'js', label: 'JavaScript', kind: 'sdk'},
  {key: 'claude-code', label: 'Claude Code', kind: 'mcp'},
  {key: 'codex', label: 'Codex', kind: 'mcp'},
  {key: 'cursor', label: 'Cursor', kind: 'mcp'},
] as const;
type PathKey = (typeof PATHS)[number]['key'];
type SdkKey = 'py' | 'js';
type McpKey = 'claude-code' | 'codex' | 'cursor';

const isMcp = (p: PathKey): p is McpKey =>
  p === 'claude-code' || p === 'codex' || p === 'cursor';

const pathLabel = (p: PathKey): string => PATHS.find((x) => x.key === p)!.label;

// SDK paths: install command + first-search snippet.
const SDK_GUIDE: Record<SdkKey, {install: string; search: string; searchCaption: string}> = {
  py: {
    install: 'pip install tavily-python',
    searchCaption: 'Python',
    search: `from tavily import TavilyClient

client = TavilyClient(api_key="tvly-YOUR_API_KEY")
response = client.search("What did Nebius announce this week?")
print(response)`,
  },
  js: {
    install: 'npm install @tavily/core',
    searchCaption: 'JavaScript',
    search: `import { tavily } from "@tavily/core";

const client = tavily({ apiKey: "tvly-YOUR_API_KEY" });
const response = await client.search("What did Nebius announce this week?");
console.log(response);`,
  },
};

// MCP paths: config to add Tavily's MCP server, where it goes, and how to use
// it. All three run the same tavily-mcp server (search / extract / crawl / map).
const MCP_GUIDE: Record<
  McpKey,
  {configCaption: string; config: string; where: string; use: string}
> = {
  'claude-code': {
    configCaption: 'Terminal',
    config: `claude mcp add tavily \\
  --env TAVILY_API_KEY=tvly-YOUR_API_KEY \\
  -- npx -y tavily-mcp@latest`,
    where: 'Run this in your project, then restart Claude Code.',
    use: 'Ask Claude Code something current — "search the web for the latest open-weight model releases" — and it will call Tavily and cite its sources.',
  },
  codex: {
    configCaption: '~/.codex/config.toml',
    config: `[mcp_servers.tavily]
command = "npx"
args = ["-y", "tavily-mcp@latest"]
env = { TAVILY_API_KEY = "tvly-YOUR_API_KEY" }`,
    where: 'Add to ~/.codex/config.toml, then restart Codex.',
    use: 'Ask Codex to research something live; it will call the Tavily search and extract tools mid-task.',
  },
  cursor: {
    configCaption: '~/.cursor/mcp.json',
    config: `{
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@latest"],
      "env": { "TAVILY_API_KEY": "tvly-YOUR_API_KEY" }
    }
  }
}`,
    where: 'Add to ~/.cursor/mcp.json (global) or .cursor/mcp.json (project), then reload Cursor.',
    use: "In Cursor's Agent chat, ask it to search the web and approve the Tavily tool when prompted.",
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

// ---- Code block (static caption; the path selector does the switching) ---

function CodeBlock({caption, code}: {caption?: string; code: string}) {
  return (
    <div className={t.code}>
      {caption ? <div className={t.codeCaption}>{caption}</div> : null}
      <pre className={t.codePre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---- Path selector — one control for the whole Get started guide ---------

function PathSelector({
  path,
  onChange,
  highlight,
}: {
  path: PathKey;
  onChange: (p: PathKey) => void;
  highlight: boolean;
}) {
  return (
    <div className={t.pathSelector} role="tablist" aria-label="How you'll use Tavily">
      {PATHS.map((p, i) => {
        // Thin divider where the SDK group ends and the agent group begins.
        const groupBreak = i > 0 && PATHS[i - 1].kind !== p.kind;
        // Only show the active highlight once the guide is open — while
        // collapsed the buttons read as a "pick one to begin" CTA.
        const active = highlight && path === p.key;
        return (
          <span key={p.key} className={t.pathItem}>
            {groupBreak ? <span className={t.pathDivider} aria-hidden /> : null}
            <button
              type="button"
              role="tab"
              aria-selected={active}
              className={`${t.pathTab} ${active ? t.pathTabActive : ''}`}
              onClick={() => onChange(p.key)}
            >
              {p.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

// ---- Page ---------------------------------------------------------------

export default function TavilyPage({
  libraryResources,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // One selector (Python / JavaScript / Claude Code / Codex / Cursor) drives
  // the whole guide; SDK paths show install+search, MCP paths show config+use.
  const [path, setPath] = useState<PathKey>('py');
  // Get started steps are collapsed by default — the page leads with the hero
  // and capabilities; builders expand the guide when they're ready to wire in.
  const [stepsOpen, setStepsOpen] = useState(false);

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
          <span className={styles.heroEyebrow}>Web search API</span>
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

      {/* ---- Get started (collapsible, closed by default) ---- */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <Text variant="caption-2" className={styles.sectionEyebrow}>
              Get started
            </Text>
            <Text variant="header-2" as="h2" className={styles.sectionTitle}>
              <button
                type="button"
                className={t.disclosure}
                aria-expanded={stepsOpen}
                aria-controls="tavily-get-started"
                onClick={() => setStepsOpen((v) => !v)}
              >
                Your first search in under five minutes.
                <svg
                  className={`${t.disclosureChevron} ${stepsOpen ? t.disclosureChevronOpen : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M5 8l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Text>
            <Text variant="body-2" color="secondary" className={t.disclosureHint}>
              {stepsOpen
                ? 'Four steps to a grounded answer. Switch language or tool anytime.'
                : 'Pick your language or tool to open the step-by-step guide.'}
            </Text>
          </div>

          {/* Master selector — always visible; selecting a path opens the guide */}
          <div className={t.pathPicker}>
            <span className={t.pathPickerLabel}>I&apos;ll use Tavily with</span>
            <PathSelector
              path={path}
              highlight={stepsOpen}
              onChange={(p) => {
                setPath(p);
                setStepsOpen(true);
              }}
            />
          </div>

          {stepsOpen ? (
            <div className={t.steps} id="tavily-get-started">
              {/* Step 1 — universal */}
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

              {/* Step 2 — install SDK (sdk paths) or add MCP server (agent paths) */}
              <div className={t.step}>
                <div className={t.stepNum}>2</div>
                <div className={t.stepBody}>
                  {isMcp(path) ? (
                    <>
                      <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                        Add the Tavily MCP server to {pathLabel(path)}
                      </Text>
                      <Text variant="body-2" color="secondary" className={t.stepText}>
                        One config and {pathLabel(path)} gains Tavily&apos;s search, extract, crawl,
                        and map tools, callable mid-task.
                      </Text>
                      <CodeBlock
                        caption={MCP_GUIDE[path].configCaption}
                        code={MCP_GUIDE[path].config}
                      />
                      <Text variant="caption-2" className={t.toolNote}>
                        {MCP_GUIDE[path].where}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                        Install the SDK
                      </Text>
                      <Text variant="body-2" color="secondary" className={t.stepText}>
                        The official {pathLabel(path)} SDK.
                      </Text>
                      <CodeBlock caption="Terminal" code={SDK_GUIDE[path].install} />
                    </>
                  )}
                </div>
              </div>

              {/* Step 3 — first search (sdk paths) or use it (agent paths) */}
              <div className={t.step}>
                <div className={t.stepNum}>3</div>
                <div className={t.stepBody}>
                  {isMcp(path) ? (
                    <>
                      <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                        Use Tavily in {pathLabel(path)}
                      </Text>
                      <Text variant="body-2" color="secondary" className={t.stepText}>
                        {MCP_GUIDE[path].use}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                        Run your first search
                      </Text>
                      <Text variant="body-2" color="secondary" className={t.stepText}>
                        Four lines to a ranked, LLM-ready result set. Swap in your key and run.
                      </Text>
                      <CodeBlock
                        caption={SDK_GUIDE[path].searchCaption}
                        code={SDK_GUIDE[path].search}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Step 4 — universal (Nebius) */}
              <div className={t.step}>
                <div className={t.stepNum}>4</div>
                <div className={t.stepBody}>
                  <Text variant="subheader-2" as="h3" className={t.stepTitle}>
                    Pair Tavily with Nebius
                  </Text>
                  <Text variant="body-2" color="secondary" className={t.stepText}>
                    Tavily retrieves; your Nebius model reasons. Pass Tavily&apos;s search results as
                    context to any OpenAI-compatible chat completion on Nebius Token Factory to build
                    agents that search the web, then synthesize grounded answers.
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
          ) : null}
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
