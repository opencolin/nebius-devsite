// Header search box, debounced, talks to /api/search.
// Class names mirror Nebius's signature `SearchProposal_*` CSS Module pattern.
//
// Two paths to results:
//   1. Autocomplete dropdown (live, debounced 200ms) shows up to 6 hits.
//   2. Enter key (or "View all results" link) navigates to /search?q=…
//      which renders the full grid.
//
// Errors swallow silently (the bar never blocks the rest of the nav).
// Previously /api/search proxied to Typesense which isn't deployed —
// that 500'd and threw a client-side exception. The Directus-backed
// /api/search shipped alongside this file is the fix.

import {Popup, TextInput} from '@gravity-ui/uikit';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useEffect, useRef, useState} from 'react';

import type {SearchHit} from '@/lib/search-types';

import styles from './SearchProposal.module.scss';

const PREVIEW_LIMIT = 6;

export function SearchProposal() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    if (!q.trim()) {
      setHits([]);
      setOpen(false);
      return;
    }
    tRef.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&limit=${PREVIEW_LIMIT}`,
        );
        if (!r.ok) {
          setHits([]);
          setOpen(false);
          return;
        }
        const j = (await r.json()) as {hits?: SearchHit[]};
        setHits(Array.isArray(j.hits) ? j.hits : []);
        setOpen(true);
      } catch {
        // Network errors leave the dropdown closed — Enter still navigates
        // to /search which has its own retry surface.
        setHits([]);
        setOpen(false);
      }
    }, 200);
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, [q]);

  const goToResults = () => {
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div ref={anchorRef} className={styles.root}>
      <TextInput
        size="l"
        placeholder="Search…"
        value={q}
        onUpdate={setQ}
        onKeyDown={(e) => {
          if (e.key === 'Enter') goToResults();
        }}
        className={styles.input}
      />
      <Popup
        open={open && hits.length > 0}
        anchorRef={anchorRef}
        placement="bottom-end"
        onClose={() => setOpen(false)}
      >
        <div className={styles.results}>
          {hits.map((h) => (
            <Link
              key={`${h.kind}-${h.id}`}
              href={h.url}
              className={styles.result}
              onClick={() => setOpen(false)}
            >
              <span className={styles.kind}>{h.kind}</span>
              <span className={styles.title}>{h.title}</span>
              {h.blurb ? <span className={styles.blurb}>{h.blurb}</span> : null}
            </Link>
          ))}
          <button
            type="button"
            className={styles.viewAll}
            onClick={goToResults}
          >
            View all results for &ldquo;{q.trim()}&rdquo; &rarr;
          </button>
        </div>
      </Popup>
    </div>
  );
}
