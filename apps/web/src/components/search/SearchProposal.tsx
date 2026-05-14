// Header search box, debounced, talks to /api/search.
// Class names mirror Nebius's signature `SearchProposal_*` CSS Module pattern.

import {Popup, TextInput} from '@gravity-ui/uikit';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';

import styles from './SearchProposal.module.scss';

interface Hit {
  id: string;
  kind: string;
  title: string;
  blurb?: string;
  url: string;
}

export function SearchProposal() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
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
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const j = (await r.json()) as {hits: Hit[]};
        setHits(j.hits);
        setOpen(true);
      } catch {
        /* ignore */
      }
    }, 150);
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, [q]);

  return (
    <div ref={anchorRef} className={styles.root}>
      <TextInput
        size="l"
        placeholder="Search…"
        value={q}
        onUpdate={setQ}
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
        </div>
      </Popup>
    </div>
  );
}
