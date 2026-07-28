// WorkshopSpotlight — featured library entry on top, two related WORKSHOP
// entries below in a 2-up grid. The featured entry uses a 16:9 cover with
// a play-button overlay; the secondary entries use compact horizontal
// cards.
//
// Receives the picked entries from getStaticProps so this component stays
// pure. The upstream nb3 component picks "running-openclaw-on-nebius" by
// slug when present.

import Link from 'next/link';

import {Button, Label, Text} from '@gravity-ui/uikit';

import styles from './WorkshopSpotlight.module.scss';

export interface LibrarySpotlightEntry {
  slug: string;
  type: string;
  title: string;
  blurb: string;
  level: string;
  duration_min?: number | null;
  product_focus: string[];
  is_official: boolean;
}

interface Props {
  featured: LibrarySpotlightEntry | null;
  related: LibrarySpotlightEntry[];
}

export function WorkshopSpotlight({featured, related}: Props) {
  if (!featured) return null;

  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <Text variant="caption-2" className={styles.eyebrow}>
              Library
            </Text>
            <Text variant="header-2" as="h2" className={styles.title}>
              Watch what shipped, run it yourself.
            </Text>
            <Text variant="body-2" color="secondary" className={styles.body}>
              Workshops, videos, and example repos curated by Nebius DevRel and
              the community.
            </Text>
          </div>
          <Button view="outlined" size="l" href="/library">
            Browse the full library &rarr;
          </Button>
        </div>

        <Link href={`/library/${featured.slug}`} className={styles.featuredLink}>
          <article className={styles.featured}>
            <div className={`${styles.cover} ${styles.coverFeatured}`}>
              <div className={styles.coverChips}>
                <Label theme="utility" size="s">
                  {featured.type}
                </Label>
                {featured.is_official ? (
                  <Label theme="warning" size="s">
                    Official
                  </Label>
                ) : null}
              </div>
              <span className={styles.playMark} aria-hidden>
                &#9658;
              </span>
            </div>
            <div className={styles.featuredBody}>
              <Text variant="subheader-3" as="h3" className={styles.featuredTitle}>
                {featured.title}
              </Text>
              <Text variant="body-2" color="secondary" className={styles.featuredBlurb}>
                {featured.blurb}
              </Text>
              <div className={styles.featuredMeta}>
                <Text variant="caption-2" color="hint">
                  {featured.level}
                  {featured.duration_min ? ` · ${featured.duration_min} min` : ''}
                </Text>
              </div>
            </div>
          </article>
        </Link>

        {related.length > 0 ? (
          <div className={styles.relatedGrid}>
            {related.map((r) => (
              <Link key={r.slug} href={`/library/${r.slug}`} className={styles.relatedLink}>
                <article className={styles.relatedCard}>
                  <div className={`${styles.cover} ${styles.coverRelated}`}>
                    <Label theme="utility" size="s">
                      {r.type}
                    </Label>
                  </div>
                  <div className={styles.relatedBody}>
                    <Text variant="subheader-2" as="h3" className={styles.relatedTitle}>
                      {r.title}
                    </Text>
                    <Text variant="body-2" color="secondary" className={styles.relatedBlurb}>
                      {r.blurb}
                    </Text>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default WorkshopSpotlight;
