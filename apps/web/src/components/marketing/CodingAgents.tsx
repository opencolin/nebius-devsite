// CodingAgents — section that points engineers at the skills + MCP
// integrations they can drop into their existing coding agent (Claude
// Code, Cursor, ChatGPT/OpenAI clients). Same card pattern as
// EcosystemPartners: name + category pill + blurb + "View docs →".
//
// Each card is an external link. The list is inline for now; moves into
// a Directus collection when one exists.

import {Label, Text} from '@gravity-ui/uikit';

import styles from './CodingAgents.module.scss';

type Category = 'skill' | 'mcp';

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
];

const CATEGORY_LABEL: Record<Category, string> = {
  skill: 'Skill',
  mcp: 'MCP',
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
