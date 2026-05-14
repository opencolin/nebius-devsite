// /library/[slug] — workshop / video / repo detail page.
//
// VIDEO + WORKSHOP entries with a YouTube external_url get an embedded
// iframe player up top (instead of just a link out). Anything else (REPOs,
// non-YouTube videos) keeps the "Read on the original site ↗" link as
// before.

import {readItems} from '@directus/sdk';
import {marked} from 'marked';
import type {GetStaticPaths, GetStaticProps, InferGetStaticPropsType} from 'next';
import Head from 'next/head';
import Link from 'next/link';

import {Label, Text} from '@gravity-ui/uikit';

import {PublicLayout} from '@/components/chrome/PublicLayout';
import {directusServer} from '@/lib/directus';

import page from '@/styles/page.module.scss';
import styles from './library.module.scss';

interface LibraryEntry {
  slug: string;
  type: string;
  title: string;
  blurb: string;
  level: string;
  duration_min?: number | null;
  product_focus: string[];
  body_md?: string | null;
  external_url?: string | null;
  is_official: boolean;
}

interface Props {
  entry: LibraryEntry;
  bodyHtml: string | null;
  youtubeId: string | null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('library_articles', {
      filter: {status: {_eq: 'published'}},
      fields: ['slug'],
      limit: -1,
    }),
  )) as Array<{slug: string}>;
  return {
    paths: rows.map((r) => ({params: {slug: r.slug}})),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const slug = params?.slug as string;
  const directus = directusServer();
  const rows = (await directus.request(
    readItems('library_articles', {
      filter: {slug: {_eq: slug}, status: {_eq: 'published'}},
      limit: 1,
    }),
  )) as LibraryEntry[];
  const entry = rows[0];
  if (!entry) return {notFound: true, revalidate: 60};
  const bodyHtml = entry.body_md ? await marked.parse(entry.body_md) : null;
  // Only embed for video-shaped entries — repos go to the link.
  const youtubeId =
    (entry.type === 'WORKSHOP' || entry.type === 'VIDEO') && entry.external_url
      ? extractYouTubeId(entry.external_url)
      : null;
  return {props: {entry, bodyHtml, youtubeId}, revalidate: 60};
};

export default function LibraryArticle({
  entry,
  bodyHtml,
  youtubeId,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Head>
        <title>{`${entry.title} · Library · Nebius Builders`}</title>
        <meta name="description" content={entry.blurb} />
      </Head>
      <div className={page.containerNarrow}>
        <Link href="/library" className={styles.backLink}>
          ← Library
        </Link>

        <header className={styles.detailHeader}>
          <div className={styles.metaRow}>
            <Label theme={typePillTheme(entry.type)} size="s">
              {entry.type}
            </Label>
            {entry.is_official ? (
              <Label theme="utility" size="s">
                Official
              </Label>
            ) : null}
            <Text variant="caption-2" color="secondary">
              {entry.level}
              {entry.duration_min ? ` · ${entry.duration_min} min` : ''}
            </Text>
          </div>
          <Text variant="display-2" as="h1">
            {entry.title}
          </Text>
          <Text variant="body-2" color="secondary">
            {entry.blurb}
          </Text>
          <div className={page.tagRow} style={{marginTop: 8}}>
            {entry.product_focus.map((t) => (
              <Label key={t} theme="normal" size="s">
                {t}
              </Label>
            ))}
          </div>
        </header>

        {/* YouTube embed (workshops + videos with a YouTube URL). The
            iframe loads no-cookie + sandboxed origin so it doesn't pollute
            our cookie jar before consent. */}
        {youtubeId ? (
          <div className={styles.videoEmbed}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={entry.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : entry.external_url ? (
          <Text variant="body-2" style={{marginTop: 12}}>
            <a href={entry.external_url} target="_blank" rel="noopener noreferrer">
              Read on the original site ↗
            </a>
          </Text>
        ) : null}

        {bodyHtml ? (
          <div className={styles.markdown} dangerouslySetInnerHTML={{__html: bodyHtml}} />
        ) : (
          <div className={styles.markdown}>
            <p>
              <em>
                Body not available in CMS yet. {entry.external_url ? 'Use the link above to read the full content.' : ''}
              </em>
            </p>
          </div>
        )}

        {/* For embedded videos, also surface the original URL as a small
            footer link so the visitor can pop out to the YouTube site. */}
        {youtubeId && entry.external_url ? (
          <p style={{marginTop: 24}}>
            <a
              href={entry.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.backLink}
            >
              Watch on YouTube ↗
            </a>
          </p>
        ) : null}
      </div>
    </PublicLayout>
  );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function typePillTheme(type: string): 'info' | 'success' | 'normal' {
  if (type === 'WORKSHOP') return 'success';
  if (type === 'VIDEO') return 'info';
  return 'normal';
}

// Returns the 11-char YouTube video ID from any YouTube URL flavor we've
// seen in the library: watch?v=, youtu.be/, /embed/, /shorts/. Returns
// null if the URL isn't a recognized YouTube URL — caller falls back to
// the regular link-out.
export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'm.youtube.com') {
      // /watch?v=XXXX
      const v = u.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      // /embed/XXXX or /shorts/XXXX
      const m = u.pathname.match(/^\/(embed|shorts|v)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[2];
    }
    return null;
  } catch {
    return null;
  }
}
