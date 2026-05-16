// Single source of truth for the ecosystem partner list — consumed by
// both the homepage <EcosystemPartners /> section and the /ecosystem
// filter page. When a `partners` collection lands in Directus, this
// file is what moves there (each row gets a `products` + `category`
// multi-select).
//
// Every URL was curl-200 verified at the time of authoring; if a doc
// page later returns 404, fix or drop the entry rather than leaving
// the link broken.

export type PartnerProduct = 'ai-cloud' | 'token-factory' | 'tavily';

export type PartnerCategory =
  | 'inference'
  | 'router'
  | 'agents'
  | 'coding'
  | 'nocode'
  | 'training'
  | 'orchestration'
  | 'mlops'
  | 'observability'
  | 'iac'
  | 'search'
  | 'tooling';

export interface EcosystemPartner {
  name: string;
  blurb: string;
  docsUrl: string;
  category: PartnerCategory;
  // A partner can show up under multiple product filters when they
  // integrate with more than one Nebius product (rare today, but the
  // shape supports it).
  products: PartnerProduct[];
}

export const PRODUCT_LABEL: Record<PartnerProduct, string> = {
  'ai-cloud': 'AI Cloud',
  'token-factory': 'Token Factory',
  tavily: 'Tavily',
};

export const CATEGORY_LABEL: Record<PartnerCategory, string> = {
  inference: 'Inference',
  router: 'Gateway',
  agents: 'Agents',
  coding: 'Coding',
  nocode: 'No-code',
  training: 'Training',
  orchestration: 'Orchestration',
  mlops: 'MLOps',
  observability: 'Observability',
  iac: 'IaC',
  search: 'Search',
  tooling: 'Tooling',
};

export const ECOSYSTEM_PARTNERS: EcosystemPartner[] = [
  // ============================== AI Cloud ===============================
  // Inference
  {
    name: 'Hugging Face',
    blurb: 'Open-source models and datasets via inference API.',
    docsUrl: 'https://docs.nebius.com/studio/inference/integrations/huggingface',
    category: 'inference',
    products: ['ai-cloud'],
  },
  {
    name: 'NVIDIA NIM',
    blurb: 'Self-hosted GPU inference microservices, turnkey.',
    docsUrl: 'https://docs.nebius.com/applications/standalone/nvidia-nim',
    category: 'inference',
    products: ['ai-cloud'],
  },
  // Agents (AI Cloud)
  {
    name: 'LlamaIndex',
    blurb: 'RAG framework integration for Nebius inference.',
    docsUrl: 'https://docs.nebius.com/studio/inference/integrations/llamaindex',
    category: 'agents',
    products: ['ai-cloud'],
  },
  // Orchestration
  {
    name: 'Anyscale',
    blurb: 'Scale AI workloads with Anyscale deployed on Managed Kubernetes.',
    docsUrl: 'https://docs.anyscale.com/clouds/kubernetes/nebius',
    category: 'orchestration',
    products: ['ai-cloud'],
  },
  {
    name: 'dstack',
    blurb: 'Install dstack and orchestrate AI workloads end-to-end.',
    docsUrl: 'https://docs.nebius.com/3p-integrations/dstack',
    category: 'orchestration',
    products: ['ai-cloud'],
  },
  {
    name: 'Run:ai',
    blurb: 'Optimize GPU resources for ML/AI workloads on Managed Kubernetes.',
    docsUrl: 'https://docs.nebius.com/3p-integrations/run-ai',
    category: 'orchestration',
    products: ['ai-cloud'],
  },
  {
    name: 'SkyPilot',
    blurb: 'Run, manage and scale AI workloads with SkyPilot.',
    docsUrl: 'https://docs.nebius.com/3p-integrations/skypilot',
    category: 'orchestration',
    products: ['ai-cloud'],
  },
  {
    name: 'Outerbounds (Metaflow)',
    blurb: 'Production-grade ML pipelines via the Outerbounds partnership.',
    docsUrl:
      'https://nebius.com/blog/posts/nebius-outerbounds-strategic-technology-partnership-integration',
    category: 'orchestration',
    products: ['ai-cloud'],
  },
  // Training
  {
    name: 'MPIrun',
    blurb: 'Configure a Compute GPU cluster and run NCCL tests with MPIrun.',
    docsUrl: 'https://docs.nebius.com/3p-integrations/mpirun',
    category: 'training',
    products: ['ai-cloud'],
  },
  // MLOps
  {
    name: 'MLflow',
    blurb: 'Managed experiment tracking and model registry.',
    docsUrl: 'https://docs.nebius.com/mlflow',
    category: 'mlops',
    products: ['ai-cloud'],
  },
  // IaC
  {
    name: 'Terraform',
    blurb: 'Official Nebius provider for IaC resource management.',
    docsUrl: 'https://docs.nebius.com/terraform-provider',
    category: 'iac',
    products: ['ai-cloud'],
  },
  {
    name: 'Pulumi',
    blurb: 'Manage Nebius resources from Pulumi via the Terraform bridge.',
    docsUrl: 'https://docs.nebius.com/terraform-provider/pulumi',
    category: 'iac',
    products: ['ai-cloud'],
  },

  // ============================== Token Factory ===============================
  // Inference / API
  {
    name: 'AISuite',
    blurb: 'Multi-provider LLM router with a unified Python API.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/api/aisuite',
    category: 'inference',
    products: ['token-factory'],
  },
  // Routers / Gateways
  {
    name: 'LiteLLM',
    blurb: 'Unified LLM gateway routing to Nebius endpoints.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/api/litellm',
    category: 'router',
    products: ['token-factory'],
  },
  {
    name: 'OpenRouter',
    blurb: 'OpenRouter exposes Nebius models through its unified API.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/api-routers/openrouter',
    category: 'router',
    products: ['token-factory'],
  },
  {
    name: 'Portkey',
    blurb: 'LLM gateway with caching, retries, and budget guardrails.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/api-routers/portkey',
    category: 'router',
    products: ['token-factory'],
  },
  // Agents (Token Factory)
  {
    name: 'LangChain',
    blurb: 'Chat models, embeddings, retrievers via langchain-nebius.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/frameworks/langchain',
    category: 'agents',
    products: ['token-factory'],
  },
  {
    name: 'CrewAI',
    blurb: 'Open-source agentic framework on Token Factory models.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/agents/crewai',
    category: 'agents',
    products: ['token-factory'],
  },
  {
    name: 'Agno',
    blurb: 'Lightweight multi-modal agent framework.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/agents/agno',
    category: 'agents',
    products: ['token-factory'],
  },
  {
    name: 'Google ADK',
    blurb: "Google's Agent Development Kit, wired to Nebius models.",
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/agents/google-adk',
    category: 'agents',
    products: ['token-factory'],
  },
  {
    name: 'Pydantic AI',
    blurb: 'Type-safe agent framework with Pydantic validation.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/agents/pydantic',
    category: 'agents',
    products: ['token-factory'],
  },
  {
    name: 'AWS Strands',
    blurb: "Amazon's agent SDK, model-agnostic and Nebius-ready.",
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/agents/strands',
    category: 'agents',
    products: ['token-factory'],
  },
  // More agents — added from the TF integrations overview index
  {
    name: 'Camel AI',
    blurb: 'Multi-agent framework with role-playing and task pipelines.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/agents/camelai',
    category: 'agents',
    products: ['token-factory'],
  },
  // Coding assistants — Token Factory models inside your editor
  {
    name: 'Cursor (Token Factory)',
    blurb: 'Wire Token Factory in as a custom model provider in Cursor.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/coding/cursor',
    category: 'coding',
    products: ['token-factory'],
  },
  {
    name: 'VS Code (Copilot Chat)',
    blurb:
      'Hugging Face VS Code Chat extension routes Copilot through Nebius.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/coding/vscode',
    category: 'coding',
    products: ['token-factory'],
  },
  {
    name: 'Zed (Token Factory)',
    blurb: "Configure Zed's inline assistant against Token Factory models.",
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/coding/zed',
    category: 'coding',
    products: ['token-factory'],
  },
  {
    name: 'Cline',
    blurb:
      'Open-source AI coding agent for VSCode + JetBrains, powered by Nebius.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/coding/cline',
    category: 'coding',
    products: ['token-factory'],
  },
  {
    name: 'Continue',
    blurb: 'Open-source autopilot for VS Code & JetBrains, pointed at Nebius.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/coding/continue',
    category: 'coding',
    products: ['token-factory'],
  },
  {
    name: 'Kilo Code',
    blurb: 'Multi-mode coding agent for VS Code on Token Factory models.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/coding/kilo',
    category: 'coding',
    products: ['token-factory'],
  },
  // Search / tools
  {
    name: 'Linkup',
    blurb: 'Web search and content extraction API for agents.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/tools/linkup',
    category: 'search',
    products: ['token-factory'],
  },
  // Dev tools
  {
    name: 'Postman',
    blurb: 'Pre-built Postman collection for the Token Factory API.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/dev-tools/postman',
    category: 'tooling',
    products: ['token-factory'],
  },
  // Observability
  {
    name: 'Helicone',
    blurb: 'LLM observability: traces, costs, prompts, and evals.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/observability/helicone',
    category: 'observability',
    products: ['token-factory'],
  },
  {
    name: 'Keywords AI',
    blurb:
      'Production LLM monitoring — logs, evals, prompt tracking, alerts.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/observability/keywords-ai',
    category: 'observability',
    products: ['token-factory'],
  },

  // ============================== Tavily ===============================
  // Tavily is bundled in the marketing site as a product alongside AI Cloud
  // and Token Factory. Three Tavily entries here so the filter has something
  // to show; can expand as more first-party integrations land.
  {
    name: 'Tavily Web Search API',
    blurb:
      'Real-time web search, extraction, and crawling for LLMs and agents.',
    docsUrl: 'https://docs.tavily.com/documentation/quickstart',
    category: 'search',
    products: ['tavily'],
  },
  {
    name: 'Tavily MCP Server',
    blurb:
      'Hosted MCP endpoint so any MCP-aware client can search the live web.',
    docsUrl: 'https://docs.tavily.com/documentation/mcp',
    category: 'search',
    products: ['tavily'],
  },
  {
    name: 'Tavily Agent Skills',
    blurb:
      'Drop-in skills that give your agent web search, extraction, and crawling.',
    docsUrl: 'https://docs.tavily.com/documentation/agent-skills',
    category: 'agents',
    products: ['tavily'],
  },

  // ============================== Tavily — third-party integrations ===============================
  // Pulled from docs.tavily.com/llms.txt (27 entries). Each is a guide for
  // wiring Tavily web search/extraction into the named tool. Names match
  // the destination tool — Agno, LangChain, etc. exist twice in this
  // array (once as a Token Factory integration, once as a Tavily one);
  // cards in the grid are keyed by docsUrl so duplicates render fine.
  {
    name: 'OpenAI Agent Builder',
    blurb: "Wire Tavily's MCP server into OpenAI Agent Builder.",
    docsUrl: 'https://docs.tavily.com/documentation/integrations/agent-builder',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'Agno',
    blurb: 'Use Tavily as a tool inside Agno agents.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/agno',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Anthropic',
    blurb: "Add live web search to Anthropic Claude via Tavily's API.",
    docsUrl: 'https://docs.tavily.com/documentation/integrations/anthropic',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Arcade.dev',
    blurb:
      "Governed web search, extraction, and research via Arcade's MCP Gateway.",
    docsUrl: 'https://docs.tavily.com/documentation/integrations/arcade-dev',
    category: 'router',
    products: ['tavily'],
  },
  {
    name: 'Cartesia',
    blurb: "Real-time voice agents that search the web via Cartesia's Line SDK.",
    docsUrl: 'https://docs.tavily.com/documentation/integrations/cartesia',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Claude',
    blurb:
      'Use Tavily across the Claude ecosystem as a Connector or Plugin.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/claude',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Composio',
    blurb: 'Tavily available as a tool through Composio.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/composio',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'CrewAI',
    blurb: 'Equip CrewAI agents with web search and extraction.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/crewai',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Dify',
    blurb: 'No-code Tavily integration inside Dify workflows.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/dify',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'FlowiseAI',
    blurb: 'Tavily as a tool inside Flowise visual agent builds.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/flowise',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'Google ADK',
    blurb:
      "Connect Google's Agent Development Kit to Tavily's search API.",
    docsUrl: 'https://docs.tavily.com/documentation/integrations/google-adk',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Haystack',
    blurb: 'Use Tavily inside Haystack pipelines via `tavily-haystack`.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/haystack',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'LangChain',
    blurb: "LangChain's recommended search tool — official partnership.",
    docsUrl: 'https://docs.tavily.com/documentation/integrations/langchain',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Langflow',
    blurb: 'Visual multi-agent + RAG builds with Tavily search nodes.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/langflow',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'LibreChat',
    blurb: 'Search, extract, and use Tavily as a built-in agent tool.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/librechat',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'LlamaIndex',
    blurb: 'Search the web from LlamaIndex RAG/agent flows.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/llamaindex',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Make',
    blurb: 'No-code Tavily steps in Make scenarios.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/make',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'Mastra',
    blurb: 'First-class Mastra tools for search, extract, crawl, and map.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/mastra',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'n8n',
    blurb: 'No-code Tavily nodes for n8n automation workflows.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/n8n',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'OpenAI',
    blurb: 'Add real-time web search to OpenAI Responses + Agents.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/openai',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'OpenClaw',
    blurb:
      'Web search across WhatsApp, Telegram, Discord, iMessage agents.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/openclaw',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Pydantic AI',
    blurb: 'Type-safe Tavily tool calls inside Pydantic AI agents.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/pydantic-ai',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'StackAI',
    blurb: 'Plug Tavily into StackAI workflows for real-time web data.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/stackai',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'Tines',
    blurb: 'Automated, no-code intelligence workflows in Tines.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/tines',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'Vellum',
    blurb: 'Built-in web search inside the Vellum Assistant desktop app.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/vellum',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Vercel AI SDK',
    blurb: 'Search, extraction, crawl, and map for Vercel AI agents.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/vercel',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Zapier',
    blurb: 'No-code Tavily steps across thousands of Zapier integrations.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/zapier',
    category: 'nocode',
    products: ['tavily'],
  },
];
