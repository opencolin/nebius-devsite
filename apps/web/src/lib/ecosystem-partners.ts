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
  | 'nocode'
  | 'training'
  | 'orchestration'
  | 'mlops'
  | 'observability'
  | 'iac'
  | 'search';

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
  nocode: 'No-code',
  training: 'Training',
  orchestration: 'Orchestration',
  mlops: 'MLOps',
  observability: 'Observability',
  iac: 'IaC',
  search: 'Search',
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
  // Observability
  {
    name: 'Helicone',
    blurb: 'LLM observability: traces, costs, prompts, and evals.',
    docsUrl:
      'https://docs.tokenfactory.nebius.com/integrations/observability/helicone',
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
];
