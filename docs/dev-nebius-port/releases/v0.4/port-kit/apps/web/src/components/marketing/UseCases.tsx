// UseCases — three example workflows with deep links to docs. Tinted bg
// matches ActiveEvents to stripe sections.
//
// Ported from nb3 use-cases.tsx. All three cards link out to external
// docs.nebius.com / github.com URLs (no internal routing).

import {Text} from '@gravity-ui/uikit';

import styles from './UseCases.module.scss';

interface UseCase {
  title: string;
  blurb: string;
  href: string;
}

const CASES: UseCase[] = [
  {
    title: 'Inference',
    blurb:
      'Serve open models in production with a simple API, real-time or batch inference, dedicated endpoints, and autoscaling for traffic spikes.',
    href: 'https://docs.tokenfactory.nebius.com/ai-models-inference/overview',
  },
  {
    title: 'Training & Fine-tuning',
    blurb:
      'Train new models or fine-tune existing ones with scalable GPU jobs, track experiments, and push the best checkpoint into production.',
    href: 'https://github.com/nebius/nebius-solutions-library/blob/main/k8s-training',
  },
  {
    title: 'Industries AI Applications',
    blurb:
      'Build domain-specific workflows in healthcare, robotics, and more with secure data access, guardrails, and reusable patterns for RAG, copilots, and automation.',
    href: 'https://docs.nebius.com/applications/standalone/nvidia-nim',
  },
];

export function UseCases() {
  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Use cases
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            What can you build
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            A few examples to get you going. More in the docs and cookbooks.
          </Text>
        </header>

        <div className={styles.grid}>
          {CASES.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className={styles.card}
            >
              <Text variant="subheader-2" as="h3" className={styles.cardTitle}>
                {c.title}
              </Text>
              <Text variant="body-2" color="secondary" className={styles.cardBlurb}>
                {c.blurb}
              </Text>
              <span className={styles.cardLink}>View guides &uarr;</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UseCases;
