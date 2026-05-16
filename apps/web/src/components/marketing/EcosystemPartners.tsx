// EcosystemPartners — replaces the old PartnerWall. Cards link straight to
// the Nebius docs page that shows how to use Nebius WITH each partner
// (huggingface integrations, langchain Token Factory integration, etc).
// Each URL was fetched + 200-confirmed during the research pass —
// rather than fabricating logo assets we don't have rights to, this
// section is name + one-liner + category + "View docs →".
//
// Partner list lives inline; once a `partners` collection lands in Directus
// the array below moves there and the component takes a `partners` prop.

import {Label, Text} from '@gravity-ui/uikit';

import styles from './EcosystemPartners.module.scss';

type Category =
  | 'inference'
  | 'agents'
  | 'training'
  | 'orchestration'
  | 'mlops'
  | 'iac';

interface Partner {
  name: string;
  blurb: string;
  docsUrl: string;
  category: Category;
}

const PARTNERS: Partner[] = [
  {
    name: 'Hugging Face',
    blurb: 'Open-source models and datasets via inference API.',
    docsUrl: 'https://docs.nebius.com/studio/inference/integrations/huggingface',
    category: 'inference',
  },
  {
    name: 'LangChain',
    blurb: 'Chat models, embeddings, retrievers via langchain-nebius.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/frameworks/langchain',
    category: 'agents',
  },
  {
    name: 'LlamaIndex',
    blurb: 'RAG framework integration for Nebius inference.',
    docsUrl: 'https://docs.nebius.com/studio/inference/integrations/llamaindex',
    category: 'agents',
  },
  {
    name: 'CrewAI',
    blurb: 'Open-source agentic framework on Token Factory models.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/agents/crewai',
    category: 'agents',
  },
  {
    name: 'LiteLLM',
    blurb: 'Unified LLM gateway routing to Nebius endpoints.',
    docsUrl: 'https://docs.tokenfactory.nebius.com/integrations/api/litellm',
    category: 'inference',
  },
  {
    name: 'NVIDIA NIM',
    blurb: 'Self-hosted GPU inference microservices, turnkey.',
    docsUrl: 'https://docs.nebius.com/applications/standalone/nvidia-nim',
    category: 'inference',
  },
  {
    name: 'SkyPilot',
    blurb: 'Managed SkyPilot API server for multi-cloud jobs.',
    docsUrl: 'https://docs.nebius.com/3p-integrations/skypilot',
    category: 'orchestration',
  },
  {
    name: 'Slurm (Soperator)',
    blurb: 'Slurm on Kubernetes for ML and AI training clusters.',
    docsUrl: 'https://docs.nebius.com/slurm-soperator/overview/architecture',
    category: 'training',
  },
  {
    name: 'MLflow',
    blurb: 'Managed experiment tracking and model registry.',
    docsUrl: 'https://docs.nebius.com/mlflow',
    category: 'mlops',
  },
  {
    name: 'Terraform',
    blurb: 'Official Nebius provider for IaC resource management.',
    docsUrl: 'https://docs.nebius.com/terraform-provider',
    category: 'iac',
  },
];

const CATEGORY_LABEL: Record<Category, string> = {
  inference: 'Inference',
  agents: 'Agents',
  training: 'Training',
  orchestration: 'Orchestration',
  mlops: 'MLOps',
  iac: 'IaC',
};

export function EcosystemPartners() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Ecosystem Partners
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            Pick the tools you already love. They work on Nebius.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            First-party integration docs for the frameworks, gateways, and
            orchestrators we&apos;ve tested end-to-end. Each card links to the
            Nebius doc page for that partner.
          </Text>
        </header>

        <div className={styles.grid}>
          {PARTNERS.map((p) => (
            <a
              key={p.name}
              href={p.docsUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.card}
            >
              <Label theme="utility" size="s">
                {CATEGORY_LABEL[p.category]}
              </Label>
              <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                {p.name}
              </Text>
              <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                {p.blurb}
              </Text>
              <span className={styles.cardCta}>View docs &rarr;</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EcosystemPartners;
