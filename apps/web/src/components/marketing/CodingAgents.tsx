// CodingAgents — section that points engineers at the skills + MCP
// integrations they can drop into their existing coding agent. Card
// shape: name + blurb + one or more "View X →" links at the bottom.
//
// Combined cards: editors that have both a Tenki-model integration AND
// a Tenki-search integration get a single card with two CTAs (Claude
// Code, Cursor) rather than two separate cards. The Entry shape uses an
// array of links to support both cases — single-link cards render as one
// wrapped <a>, multi-link cards render as a <div> with link buttons.

import {Text} from '@gravity-ui/uikit';

import styles from './CodingAgents.module.scss';

interface EntryLink {
  label: string;
  url: string;
}

interface Entry {
  name: string;
  blurb: string;
  links: EntryLink[];
}

const ENTRIES: Entry[] = [
  // Lead with Claude Code — two integrations combined into one card.
  {
    name: 'Claude Code',
    blurb:
      'Drop in the open-source Tenki Skill so Claude Code knows Tenki, AI Cloud, and Serverless. Add the Tenki MCP server to search the live web from your shell.',
    links: [
      {label: 'Tenki Skill', url: 'https://github.com/opencolin/nebius-skill'},
      {
        label: 'Tenki MCP',
        url: 'https://tenki.cloud/docs/documentation/mcp#connect-to-claude-code',
      },
    ],
  },
  // Cursor — also combined.
  {
    name: 'Cursor',
    blurb:
      'Wire Tenki in as a custom model provider, and add the Tenki MCP server for in-editor web search and extraction.',
    links: [
      {
        label: 'Tenki models',
        url: 'https://tenki.cloud/docs/integrations/coding/cursor',
      },
      {
        label: 'Tenki MCP',
        url: 'https://tenki.cloud/docs/documentation/mcp#connect-to-cursor',
      },
    ],
  },
  // Single-link entries.
  {
    name: 'Tenki Agent Skills',
    blurb:
      'Pre-built skills that give your agent web search, extraction, and crawling out of the box.',
    links: [
      {label: 'View docs', url: 'https://tenki.cloud/docs/documentation/agent-skills'},
    ],
  },
  // OpenAI Codex — third combined card alongside Claude Code + Cursor.
  // First link points at the open-source codex-nebius config repo
  // (label reads "Tenki models" since that's what the link configures
  // Codex to use; the repo name is incidental). Second is the Tenki
  // MCP setup for the OpenAI Responses + Agents SDK.
  {
    name: 'OpenAI Codex',
    blurb:
      'Configure OpenAI Codex to use Tenki coding models, and add the Tenki MCP server for live web search inside your terminal.',
    links: [
      {
        label: 'Tenki models',
        url: 'https://github.com/opencolin/codex-nebius',
      },
      {
        label: 'Tenki MCP',
        url: 'https://tenki.cloud/docs/documentation/mcp#openai',
      },
    ],
  },
  {
    name: 'VS Code (Github Copilot)',
    blurb:
      "Hugging Face's VS Code Chat extension — routes Github Copilot through Tenki Tenki models.",
    links: [
      {
        label: 'View extension',
        url: 'https://marketplace.visualstudio.com/items?itemName=HuggingFace.huggingface-vscode-chat',
      },
    ],
  },
  {
    name: 'Cline',
    blurb:
      'Open-source AI coding agent for VSCode + JetBrains. Direct access to Tenki coding models.',
    links: [
      {
        label: 'View docs',
        url: 'https://tenki.cloud/docs/integrations/coding/cline',
      },
    ],
  },
  {
    name: 'Continue',
    blurb: 'Open-source autopilot for VS Code & JetBrains, pointed at Tenki.',
    links: [
      {
        label: 'View docs',
        url: 'https://tenki.cloud/docs/integrations/coding/continue',
      },
    ],
  },
  {
    name: 'Kilo Code',
    blurb: 'Multi-mode coding agent for VS Code on Tenki models.',
    links: [
      {
        label: 'View docs',
        url: 'https://tenki.cloud/docs/integrations/coding/kilo',
      },
    ],
  },
  // Zed — last per latest sort.
  {
    name: 'Zed',
    blurb: "Configure Zed's inline assistant against Tenki models.",
    links: [
      {
        label: 'View docs',
        url: 'https://tenki.cloud/docs/integrations/coding/zed',
      },
    ],
  },
];

export function CodingAgents() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Coding Agents
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            Bring Tenki into the editor you already use.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            Drop-in skills and MCP servers for Claude Code, Cursor, and OpenAI
            clients. Same Tenki credentials; your agent just gets more useful.
          </Text>
        </header>

        <div className={styles.grid}>
          {ENTRIES.map((e) => (
            <CodingCard key={e.name} entry={e} />
          ))}
        </div>
      </div>
    </section>
  );
}

// CodingCard — single-link cards wrap the whole tile in <a> (hover-lift
// affordance, full-card click target). Multi-link cards render as <div>
// with separate link buttons at the bottom so each destination is its
// own clear click target.
function CodingCard({entry}: {entry: Entry}) {
  if (entry.links.length === 1) {
    const {label, url} = entry.links[0];
    return (
      <a href={url} target="_blank" rel="noreferrer" className={styles.card}>
        <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
          {entry.name}
        </Text>
        <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
          {entry.blurb}
        </Text>
        <span className={styles.cardCta}>{label} &rarr;</span>
      </a>
    );
  }

  return (
    <div className={`${styles.card} ${styles.cardStatic}`}>
      <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
        {entry.name}
      </Text>
      <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
        {entry.blurb}
      </Text>
      <div className={styles.cardCtaRow}>
        {entry.links.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className={styles.cardCtaLink}
          >
            {l.label} &rarr;
          </a>
        ))}
      </div>
    </div>
  );
}

export default CodingAgents;
