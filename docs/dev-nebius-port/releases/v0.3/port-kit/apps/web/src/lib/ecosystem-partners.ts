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
    name: 'NVIDIA NIM',
    blurb: 'Self-hosted GPU inference microservices, turnkey.',
    docsUrl: 'https://docs.nebius.com/applications/standalone/nvidia-nim',
    category: 'inference',
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
    name: 'Hugging Face',
    blurb: 'Open-source models and datasets via inference API.',
    // Was under the old /studio namespace until the AI Studio → Token
    // Factory rename. Tagged token-factory (not ai-cloud) because the
    // integration is the Token Factory inference API surface.
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/api/hugging-face',
    category: 'inference',
    products: ['token-factory'],
  },
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
    blurb: 'Unified LLM gateway with a Nebius AI provider — use model=nebius/<model-name> to route 30+ Token Factory models across any agent framework.',
    docsUrl: 'https://docs.litellm.ai/docs/providers/nebius',
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
    name: 'LlamaIndex',
    blurb: 'RAG framework integration for Nebius inference.',
    // Same provenance as Hugging Face above — moved from the /studio
    // namespace to docs.tokenfactory.nebius.com, retagged token-factory.
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/frameworks/llama-index/overview',
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
  {
    // Docs live on Mastra's own site (mastra.ai), not on
    // docs.tokenfactory.nebius.com — Mastra is the framework and they own
    // the provider integration page. Verified 200 on the canonical URL
    // the Mastra team uses for the Nebius provider.
    name: 'Mastra',
    blurb: 'TypeScript agent framework with Nebius as a first-class provider.',
    docsUrl: 'https://mastra.ai/models/providers/nebius',
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
    blurb: 'Open-source autonomous coding agent for VS Code + JetBrains with Nebius Token Factory as a native provider — pick Nebius, paste your key, drive Qwen3-Coder or GLM-4.5.',
    docsUrl: 'https://docs.cline.bot/provider-config/other-30-plus-providers',
    category: 'coding',
    products: ['token-factory'],
  },
  {
    name: 'Continue',
    blurb: 'Open-source AI coding assistant for VS Code & JetBrains with a native Nebius provider — configure chat (DeepSeek R1) and embeddings (BAAI) in config.yaml.',
    docsUrl: 'https://docs.continue.dev/customize/model-providers/more/nebius',
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

  // ===================== Content-expansion additions =====================
  // Discovered + verified (curl-200) in the content-expansion sweep
  // (docs/content-expansion). Token Factory: terminal/agent/gateway tools
  // that expose Nebius open models. Tavily: agents that use Tavily search.
  {
    name: 'OpenCode',
    blurb: 'Terminal coding agent with a built-in Token Factory provider — drive open models like Kimi K2 and Qwen3-Coder from the CLI.',
    docsUrl: 'https://opencode.ai/docs/providers/',
    category: 'coding',
    products: ['token-factory'],
  },
  {
    name: 'Hugging Face smolagents',
    blurb: 'Minimalist code-agent framework; set provider="nebius" to run CodeAgents on Token Factory open models.',
    docsUrl: 'https://huggingface.co/docs/smolagents/en/reference/models',
    category: 'agents',
    products: ['token-factory'],
  },
  {
    name: 'LLM Gateway',
    blurb: 'Open-source unified LLM gateway; its Nebius provider exposes Token Factory models behind one OpenAI-compatible API.',
    docsUrl: 'https://llmgateway.io/providers/nebius',
    category: 'router',
    products: ['token-factory'],
  },
  {
    name: 'Pipecat',
    blurb: 'Real-time voice + multimodal agent framework with a NebiusLLMService for low-latency Token Factory inference.',
    docsUrl: 'https://docs.pipecat.ai/api-reference/server/services/llm/nebius',
    category: 'agents',
    products: ['token-factory'],
  },
  {
    name: 'Devin',
    blurb: "Cognition's autonomous coding agent uses Tavily for research-before-coding via the MCP marketplace connector.",
    docsUrl: 'https://docs.tavily.com/documentation/integrations/devin',
    category: 'coding',
    products: ['tavily'],
  },
  {
    name: 'ElevenLabs',
    blurb: 'ElevenLabs voice agents add live web retrieval by wiring in a Tavily Search API key as a tool.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/elevenlabs',
    category: 'agents',
    products: ['tavily'],
  },
  {
    name: 'Gradium',
    blurb: 'Voice-AI platform for live speech agents; uses Tavily as its real-time web-context layer.',
    docsUrl: 'https://docs.tavily.com/documentation/integrations/gradium',
    category: 'agents',
    products: ['tavily'],
  },

  // ================ Content-expansion additions (wave 2) =================
  // Discovered + curl-200 verified in the wave-2 sweep (docs/content-expansion).
  {
    name: 'Requesty',
    blurb: 'LLM routing gateway; its Nebius provider exposes Token Factory open models behind a unified API.',
    docsUrl: 'https://www.requesty.ai/models/nebius',
    category: 'router',
    products: ['token-factory'],
  },
  {
    name: 'Dask Cloud Provider',
    blurb: 'Spin up Dask clusters on Nebius AI Cloud VMs for distributed Python + data workloads.',
    docsUrl: 'https://cloudprovider.dask.org/en/latest/nebius.html',
    category: 'orchestration',
    products: ['ai-cloud'],
  },
  {
    name: 'Retool',
    blurb: 'Build internal tools with a Tavily action for live web search inside Retool apps + workflows.',
    docsUrl: 'https://docs.retool.com/changelog/tavily',
    category: 'tooling',
    products: ['tavily'],
  },
  {
    name: 'Pipedream',
    blurb: 'Connect Tavily search + extract into thousands of Pipedream automation workflows.',
    docsUrl: 'https://pipedream.com/apps/tavily',
    category: 'tooling',
    products: ['tavily'],
  },
  {
    name: 'BuildShip',
    blurb: 'Low-code visual backend builder with a Tavily node for web search + extraction.',
    docsUrl: 'https://buildship.com/integrations/tavily',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'Sim',
    blurb: 'Visual agent builder; drop in the Tavily tool to give agents live web retrieval.',
    docsUrl: 'https://docs.sim.ai/tools/tavily',
    category: 'nocode',
    products: ['tavily'],
  },
  {
    name: 'Activepieces',
    blurb: 'Open-source automation platform with a Tavily MCP piece for web search in flows.',
    docsUrl: 'https://www.activepieces.com/mcp/tavily',
    category: 'nocode',
    products: ['tavily'],
  },

  // ================ Content-expansion additions (wave 3) =================
  // AI Cloud standalone apps (one-click deploys on Nebius GPU infra),
  // curl-200 verified. ("Flowise (Nebius AI Cloud)" = deploy Flowise ON
  // Nebius; distinct from the existing "FlowiseAI" = Tavily tool inside
  // Flowise.)
  {
    name: 'Qdrant',
    blurb: 'Deploy the Qdrant vector database on Nebius AI Cloud for RAG + similarity search.',
    docsUrl: 'https://docs.nebius.com/applications/standalone/qdrant',
    category: 'tooling',
    products: ['ai-cloud'],
  },
  {
    name: 'Open WebUI',
    blurb: 'Self-host the Open WebUI chat front-end on Nebius AI Cloud over your own models.',
    docsUrl: 'https://docs.nebius.com/applications/standalone/open-webui',
    category: 'tooling',
    products: ['ai-cloud'],
  },
  {
    name: 'Flowise (Nebius AI Cloud)',
    blurb: 'Deploy the Flowise low-code agent builder on Nebius AI Cloud GPU infrastructure.',
    docsUrl: 'https://docs.nebius.com/applications/standalone/flowise',
    category: 'nocode',
    products: ['ai-cloud'],
  },
  {
    name: 'ComfyUI',
    blurb: 'Run the ComfyUI node-based diffusion workflow tool on Nebius AI Cloud GPUs.',
    docsUrl: 'https://docs.nebius.com/applications/standalone/comfyui',
    category: 'tooling',
    products: ['ai-cloud'],
  },
  {
    name: 'JupyterLab (Nebius AI Cloud)',
    blurb: 'Launch a GPU-backed JupyterLab environment on Nebius AI Cloud for notebooks + experiments.',
    docsUrl: 'https://docs.nebius.com/applications/standalone/jupyterlab',
    category: 'tooling',
    products: ['ai-cloud'],
  },
  {
    name: 'dlt (dltHub)',
    blurb: 'Open-source Python ELT library with a Nebius source/destination for data pipelines.',
    docsUrl: 'https://dlthub.com/context/source/nebius-ai-studio',
    category: 'tooling',
    products: ['ai-cloud'],
  },

  // ================ Content-expansion additions (wave 4) =================
  // Discovered manually (subagent quota hit); curl-200 verified.
  {
    name: 'Zed IDE',
    blurb: 'GPU-accelerated, collaborative code editor with a Token Factory integration guide for connecting open models to its built-in AI assistant.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/coding/zed',
    category: 'coding',
    products: ['token-factory'],
  },
];
