// CodingAgents — section that points engineers at the skills + MCP
// integrations they can drop into their existing coding agent (Claude
// Code, Cursor, ChatGPT/OpenAI clients). Same card pattern as
// EcosystemPartners: name + category pill + blurb + "View docs →".
//
// Each card is an external link. The list is inline for now; moves into
// a Directus collection when one exists.

import {Label, Text} from '@gravity-ui/uikit';

import styles from './CodingAgents.module.scss';

type Category = 'skill' | 'mcp' | 'editor';

interface Entry {
  name: string;
  blurb: string;
  url: string;
  category: Category;
}

const ENTRIES: Entry[] = [
  {
    name: 'Nebius Skill for Claude Code',
    blurb:
      'Drop-in skill that teaches Claude Code about Nebius — Token Factory, AI Cloud, Serverless. Open source.',
    url: 'https://github.com/opencolin/nebius-skill',
    category: 'skill',
  },
  {
    name: 'Tavily Agent Skills',
    blurb:
      'Pre-built skills that give your agent web search, extraction, and crawling out of the box.',
    url: 'https://docs.tavily.com/documentation/agent-skills',
    category: 'skill',
  },
  {
    name: 'Tavily MCP — Remote Server',
    blurb:
      'Hosted MCP endpoint. One URL, any MCP-aware client. Auth via Tavily API key.',
    url: 'https://docs.tavily.com/documentation/mcp#remote-mcp-server',
    category: 'mcp',
  },
  {
    name: 'Tavily MCP in Cursor',
    blurb:
      'Wire Tavily search + extraction into Cursor in two steps. Search, scrape, and crawl from the chat sidebar.',
    url: 'https://docs.tavily.com/documentation/mcp#connect-to-cursor',
    category: 'mcp',
  },
  {
    name: 'Tavily MCP in Claude Code',
    blurb:
      'Add the Tavily MCP server to Claude Code with `claude mcp add`. Search the live web from your shell.',
    url: 'https://docs.tavily.com/documentation/mcp#connect-to-claude-code',
    category: 'mcp',
  },
  {
    name: 'Tavily MCP for OpenAI',
    blurb:
      'OpenAI Responses + Agents SDK setup. Hosted Tavily tools, ready to call.',
    url: 'https://docs.tavily.com/documentation/mcp#openai',
    category: 'mcp',
  },
  // Editor / IDE integrations — use Token Factory as the model backend
  // inside your existing coding tool. Each URL is the Token Factory
  // integration guide for that editor.
  {
    name: 'Cursor',
    blurb: 'Wire Token Factory into Cursor as a custom model provider.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/cursor',
    category: 'editor',
  },
  {
    name: 'VS Code (Copilot Chat)',
    blurb: 'Use Token Factory as the LLM backend for Copilot Chat in VS Code.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/vscode',
    category: 'editor',
  },
  {
    name: 'Zed',
    blurb: "Configure Zed's inline assistant against Token Factory models.",
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/zed',
    category: 'editor',
  },
  {
    name: 'Cline',
    blurb: 'Open-source coding agent for VS Code, routed through Token Factory.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/cline',
    category: 'editor',
  },
  {
    name: 'Continue',
    blurb: 'Open-source autopilot for VS Code & JetBrains, pointed at Nebius.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/continue',
    category: 'editor',
  },
  {
    name: 'Kilo Code',
    blurb: 'Multi-mode coding agent for VS Code on Token Factory models.',
    url: 'https://docs.tokenfactory.nebius.com/integrations/coding/kilo',
    category: 'editor',
  },
];

const CATEGORY_LABEL: Record<Category, string> = {
  skill: 'Skill',
  mcp: 'MCP',
  editor: 'Editor',
};

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
              <Label theme="utility" size="s">
                {CATEGORY_LABEL[e.category]}
              </Label>
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
