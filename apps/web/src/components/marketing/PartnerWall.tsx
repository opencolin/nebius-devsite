// PartnerWall — centered-eyebrow section, then a grid of partner logos.
// We don't have logo assets in this repo, so the grid shows just the
// partner name as plain text against the white tile (matching the
// upstream's fallback behavior when an asset is missing).
//
// Hard-coded list mirrors the most common Nebius partner set; swap to
// `partners` collection in Directus when one is added.

import {Text} from '@gravity-ui/uikit';

import styles from './PartnerWall.module.scss';

interface Partner {
  name: string;
  tag?: 'host' | 'sponsor';
}

const PARTNERS: Partner[] = [
  {name: 'Tavily', tag: 'host'},
  {name: 'LangChain'},
  {name: 'CrewAI'},
  {name: 'NVIDIA'},
  {name: 'Anthropic'},
  {name: 'Hugging Face'},
  {name: 'Weights & Biases'},
  {name: 'LlamaIndex'},
  {name: 'OpenClaw'},
  {name: 'Contree'},
  {name: 'Scale'},
  {name: 'OpenAI'},
];

export function PartnerWall() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Partners
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            Where the SDKs meet the builders.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            Sponsors load their integrations into the workspace. Builders pick
            what fits. Telemetry tells the rest.
          </Text>
        </header>

        <div className={styles.grid}>
          {PARTNERS.map((p) => (
            <div key={p.name} className={styles.tile}>
              <span className={styles.name}>{p.name}</span>
              {p.tag === 'host' ? <span className={styles.hostPill}>Host</span> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartnerWall;
