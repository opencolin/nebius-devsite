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

import {Button, Label, Text} from '@gravity-ui/uikit';

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
          // Primary CTA — the whole point of a non-video library entry is
          // to send the visitor to the source (a repo, a doc, a recording).
          // Label is derived from the URL host so it reads "View on GitHub"
          // for repos, "Watch on YouTube" for non-embedded videos, "Read on
          // Nebius Academy" for docs, etc. — gives the click target a
          // concrete destination instead of the vague "original site."
          <div className={styles.externalCta}>
            <ExternalSourceButton url={entry.external_url} />
          </div>
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
            footer link so the visitor can pop out to the source site
            (YouTube, or whatever the host turns out to be). Same label
            helper used by the primary CTA above, just rendered as a flat
            text link rather than an action button so it stays secondary. */}
        {youtubeId && entry.external_url ? (
          <p style={{marginTop: 24}}>
            <a
              href={entry.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.backLink}
            >
              {externalLinkLabel(entry.external_url)} ↗
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

function typePillTheme(type: string): 'info' | 'success' | 'warning' | 'normal' {
  if (type === 'WORKSHOP') return 'success';
  if (type === 'VIDEO' || type === 'PLAYLIST') return 'info';
  if (type === 'DOCS') return 'warning';
  // BLOG + REPO + anything new → neutral
  return 'normal';
}

// Renders the primary "View/Watch/Read on <SOURCE>" CTA for non-video
// library entries. Wraps Gravity UI's Button so the visual treatment
// matches "Get started" in the header chrome (view="action", size="l") —
// signals this is the main action on the page.
function ExternalSourceButton({url}: {url: string}) {
  return (
    <Button
      view="action"
      size="l"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {externalLinkLabel(url)} ↗
    </Button>
  );
}

// Turns an external_url into a "{verb} on {SOURCE}" label.
//
// Verbs are matched to the kind of content the host typically serves:
//   - View    → code/repo hosts (GitHub, GitLab)
//   - Watch   → video hosts (YouTube)
//   - Open    → real-time / app hosts (Zoom)
//   - Read    → everything else (docs, articles, blogs) — the default
//
// Source names use the public-facing brand spelling ("GitHub" not "Github",
// "Hugging Face" not "huggingface", "DEV" not "dev.to"). Anything not in
// the table falls back to a Title-Cased version of the bare hostname,
// minus any "www." or trailing TLD, so a fresh host like "newthing.dev"
// becomes "Newthing" rather than the lazy "original site".
export function externalLinkLabel(url: string): string {
  let host = '';
  let pathname = '';
  try {
    const parsed = new URL(url);
    host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    pathname = parsed.pathname.toLowerCase();
  } catch {
    return 'Read on the original site';
  }

  // nebius.com/events/* and /webinar/* are video recordings — "Watch",
  // not "Read". Check path before falling through to the host table.
  if (host === 'nebius.com' && /^\/(events|webinar)\//.test(pathname)) {
    return 'Watch on Nebius.com';
  }

  // Most-specific first so subdomains override the base-domain match
  // (academy.nebius.com beats the plain nebius.com fallback).
  const entries: Array<{match: RegExp; verb: string; name: string}> = [
    {match: /^github\.com$|\.github\.com$/, verb: 'View', name: 'GitHub'},
    {match: /^gitlab\.com$/, verb: 'View', name: 'GitLab'},
    {match: /^(youtube\.com|youtu\.be|m\.youtube\.com)$/, verb: 'Watch', name: 'YouTube'},
    {match: /\.zoom\.us$|^zoom\.us$/, verb: 'Open', name: 'Zoom'},
    {match: /^huggingface\.co$/, verb: 'View', name: 'Hugging Face'},
    {match: /^arxiv\.org$/, verb: 'Read', name: 'arXiv'},
    {match: /^academy\.nebius\.com$/, verb: 'Read', name: 'Nebius Academy'},
    {match: /^docs\.tokenfactory\.nebius\.com$/, verb: 'Read', name: 'Token Factory docs'},
    {match: /^docs\.nebius\.com$/, verb: 'Read', name: 'Nebius docs'},
    {match: /^nebius\.science$/, verb: 'Read', name: 'Nebius Science'},
    {match: /^nebius\.com$/, verb: 'Read', name: 'Nebius'},
    {match: /^medium\.com$/, verb: 'Read', name: 'Medium'},
    {match: /^dev\.to$/, verb: 'Read', name: 'DEV'},
    {match: /\.substack\.com$/, verb: 'Read', name: 'Substack'},
    {match: /^(twitter\.com|x\.com)$/, verb: 'View', name: 'X'},
    {match: /^linkedin\.com$/, verb: 'View', name: 'LinkedIn'},
    {match: /^futurecoding\.ai$/, verb: 'Read', name: 'FutureCoding'},
  ];
  const hit = entries.find((e) => e.match.test(host));
  if (hit) return `${hit.verb} on ${hit.name}`;

  // Unknown host — pretty-print the bare second-level domain. "newthing.dev"
  // → "Newthing"; "blog.someplace.io" → "Someplace".
  const parts = host.split('.');
  const base = parts.length >= 2 ? parts[parts.length - 2] : host;
  const titled = base.charAt(0).toUpperCase() + base.slice(1);
  return `Read on ${titled}`;
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
