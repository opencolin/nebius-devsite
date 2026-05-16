// CodingAgents — section that points engineers at the skills + MCP
// integrations they can drop into their existing coding agent (Claude
// Code, Cursor, OpenAI clients). Card pattern: name + blurb + "View
// docs →" CTA. No category pill on the card — visitors can read the
// destination URL or click through if they want to know what kind of
// integration it is.
//
// Card order is hand-tuned, not alphabetical, so the most-likely flows
// (Cursor first, then the two Claude Code paths) lead.
//
// Each card is an external link. The list is inline for now; moves into
// a Directus collection when one exists.

import {Text} from '@gravity-ui/uikit';

import styles from './CodingAgents.module.scss';

interface Entry {
  name: string;
  blurb: string;
  url: string;
}

const ENTRIES: Entry[] = [
  // Lead with the most-used coding agent. Cursor + Token Factory is the
  // fastest path for somebody coming to this section cold.
  {
    name: 'Cursor',
    blurb: 'Wire Token Factory into Cursor as a custom model provider.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/cursor',
  },
  // Claude Code paths next — both the Nebius skill (deep integration)
  // and the Tavily MCP server (web search inside the shell).
  {
    name: 'Nebius Skill for Claude Code',
    blurb:
      'Drop-in skill that teaches Claude Code about Nebius — Token Factory, AI Cloud, Serverless. Open source.',
    url: 'https://github.com/opencolin/nebius-skill',
  },
  {
    name: 'Tavily MCP in Claude Code',
    blurb:
      'Add the Tavily MCP server to Claude Code with `claude mcp add`. Search the live web from your shell.',
    url: 'https://docs.tavily.com/documentation/mcp#connect-to-claude-code',
  },
  // The rest, grouped by family.
  {
    name: 'Tavily Agent Skills',
    blurb:
      'Pre-built skills that give your agent web search, extraction, and crawling out of the box.',
    url: 'https://docs.tavily.com/documentation/agent-skills',
  },
  {
    name: 'Tavily MCP — Remote Server',
    blurb:
      'Hosted MCP endpoint. One URL, any MCP-aware client. Auth via Tavily API key.',
    url: 'https://docs.tavily.com/documentation/mcp#remote-mcp-server',
  },
  {
    name: 'Tavily MCP in Cursor',
    blurb:
      'Wire Tavily search + extraction into Cursor in two steps. Search, scrape, and crawl from the chat sidebar.',
    url: 'https://docs.tavily.com/documentation/mcp#connect-to-cursor',
  },
  {
    name: 'Tavily MCP for OpenAI',
    blurb:
      'OpenAI Responses + Agents SDK setup. Hosted Tavily tools, ready to call.',
    url: 'https://docs.tavily.com/documentation/mcp#openai',
  },
  {
    name: 'VS Code (Copilot Chat)',
    blurb: 'Use Token Factory as the LLM backend for Copilot Chat in VS Code.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/vscode',
  },
  {
    name: 'Zed',
    blurb: "Configure Zed's inline assistant against Token Factory models.",
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/zed',
  },
  {
    name: 'Cline',
    blurb: 'Open-source coding agent for VS Code, routed through Token Factory.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/cline',
  },
  {
    name: 'Continue',
    blurb: 'Open-source autopilot for VS Code & JetBrains, pointed at Nebius.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/continue',
  },
  {
    name: 'Kilo Code',
    blurb: 'Multi-mode coding agent for VS Code on Token Factory models.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/kilo',
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
            <a
              key={e.name}
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className={styles.card}
            >
              <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                {e.name}
              </Text>
              <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                {e.blurb}
              </Text>
              <span className={styles.cardCta}>View docs &rarr;</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CodingAgents;
