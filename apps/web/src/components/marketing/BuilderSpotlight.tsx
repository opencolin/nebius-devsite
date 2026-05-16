// BuilderSpotlight — one featured project per month, picked deterministically
// by `(year*12 + month) % projects.length`. Half cover gradient, half copy
// with tech-tag pills and an author byline. Click-through goes to
// /projects/<slug> (route may not yet exist — kept as the original
// intent).
//
// Receives the pre-picked project from getStaticProps. If no projects
// collection has any rows yet, the parent passes null and the section
// silently renders nothing.

import Link from 'next/link';

import {Label, Text} from '@gravity-ui/uikit';

import styles from './BuilderSpotlight.module.scss';

export interface SpotlightProject {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  builderHandle: string;
  builderName: string;
  tags: string[];
  productFocus: string[];
}

interface Props {
  project: SpotlightProject | null;
  monthLabel: string;
}

export function BuilderSpotlight({project, monthLabel}: Props) {
  if (!project) return null;

  const initials = project.builderName
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Builder spotlight · {monthLabel}
          </Text>
          <Text variant="header-2" as="h2" className={styles.title}>
            One project, every month, picked by the team.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            A featured build from a Nebius Builder, Ambassador, or someone on
            the team. Rotates on the 1st.
          </Text>
        </header>

        <Link href={`/projects/${project.slug}`} className={styles.cardLink}>
          <article className={styles.card}>
            <div className={styles.cover}>
              <div className={styles.coverMonth}>
                <Label theme="warning" size="m">
                  {monthLabel}
                </Label>
              </div>
              {project.productFocus.length > 0 ? (
                <div className={styles.coverFocus}>
                  <Label theme="utility" size="m">
                    {project.productFocus[0]}
                  </Label>
                </div>
              ) : null}
            </div>
            <div className={styles.body2}>
              <Text variant="caption-2" className={styles.bodyEyebrow}>
                Builder project
              </Text>
              <Text variant="header-1" as="h3" className={styles.bodyTitle}>
                {project.title}
              </Text>
              <Text
                variant="body-2"
                color="secondary"
                className={styles.bodyDescription}
              >
                {project.description}
              </Text>
              <div className={styles.tags}>
                {project.tags.slice(0, 4).map((t) => (
                  <Label key={t} theme="normal" size="s">
                    {t}
                  </Label>
                ))}
              </div>
              <div className={styles.author}>
                <span className={styles.avatar} aria-hidden>
                  {initials || '?'}
                </span>
                <div className={styles.authorMeta}>
                  <Text variant="body-2" className={styles.authorName}>
                    {project.builderName}
                  </Text>
                  <Text variant="caption-2" color="hint">
                    @{project.builderHandle}
                  </Text>
                </div>
                <span className={styles.readMore}>Read more &rarr;</span>
              </div>
            </div>
          </article>
        </Link>
      </div>
    </section>
  );
}

export default BuilderSpotlight;
