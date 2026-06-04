// CodingAgents — section that points engineers at the skills + MCP
// integrations they can drop into their existing coding agent. Card
// shape: name + blurb + one or more "View X →" links at the bottom.
//
// Combined cards: editors that have both a Nebius-model integration AND
// a Tavily-search integration get a single card with two CTAs (Claude
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
      'Drop in the open-source Nebius Skill so Claude Code knows Token Factory, AI Cloud, and Serverless. Add the Tavily MCP server to search the live web from your shell.',
    links: [
      {label: 'Nebius Skill', url: 'https://github.com/opencolin/nebius-skill'},
      {
        label: 'Tavily MCP',
        url: 'https://docs.tavily.com/documentation/mcp#connect-to-claude-code',
      },
    ],
  },
  // Cursor — also combined.
  {
    name: 'Cursor',
    blurb:
      'Wire Token Factory in as a custom model provider, and add the Tavily MCP server for in-editor web search and extraction.',
    links: [
      {
        label: 'Nebius models',
        url: 'https://docs.tokenfactory.nebius.com/integrations/coding/cursor',
      },
      {
        label: 'Tavily MCP',
        url: 'https://docs.tavily.com/documentation/mcp#connect-to-cursor',
      },
    ],
  },
  // Single-link entries.
  {
    name: 'Tavily Agent Skills',
    blurb:
      'Pre-built skills that give your agent web search, extraction, and crawling out of the box.',
    links: [
      {label: 'View docs', url: 'https://docs.tavily.com/documentation/agent-skills'},
    ],
  },
  // OpenAI Codex — third combined card alongside Claude Code + Cursor.
  // First link points at the open-source codex-nebius config repo
  // (label reads "Nebius models" since that's what the link configures
  // Codex to use; the repo name is incidental). Second is the Tavily
  // MCP setup for the OpenAI Responses + Agents SDK.
  {
    name: 'OpenAI Codex',
    blurb:
      'Configure OpenAI Codex to use Nebius coding models, and add the Tavily MCP server for live web search inside your terminal.',
    links: [
      {
        label: 'Nebius models',
        url: 'https://github.com/opencolin/codex-nebius',
      },
      {
        label: 'Tavily MCP',
        url: 'https://docs.tavily.com/documentation/mcp#openai',
      },
    ],
  },
  {
    name: 'VS Code (Github Copilot)',
    blurb:
      "Hugging Face's VS Code Chat extension — routes Github Copilot through Nebius Token Factory models.",
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
      'Open-source AI coding agent for VSCode + JetBrains. Direct access to Nebius coding models.',
    links: [
      {
        label: 'View docs',
        url: 'https://docs.tokenfactory.nebius.com/integrations/coding/cline',
      },
    ],
  },
  {
    name: 'Continue',
    blurb: 'Open-source autopilot for VS Code & JetBrains, pointed at Nebius.',
    links: [
      {
        label: 'View docs',
        url: 'https://docs.tokenfactory.nebius.com/integrations/coding/continue',
      },
    ],
  },
  {
    name: 'Kilo Code',
    blurb: 'Multi-mode coding agent for VS Code on Token Factory models.',
    links: [
      {
        label: 'View docs',
        url: 'https://docs.tokenfactory.nebius.com/integrations/coding/kilo',
      },
    ],
  },
  // Zed — last per latest sort.
  {
    name: 'Zed',
    blurb: "Configure Zed's inline assistant against Token Factory models.",
    links: [
      {
        label: 'View docs',
        url: 'https://docs.tokenfactory.nebius.com/integrations/coding/zed',
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
            Bring Nebius into the editor you already use.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            Drop-in skills and MCP servers for Claude Code, Cursor, and OpenAI
            clients. Same Nebius credentials; your agent just gets more useful.
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
