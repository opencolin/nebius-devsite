// ProductsMenu — hover/click dropdown in PublicNav linking to the three
// product landing pages (/ai-cloud, /token-factory, /serverless).
//
// Identical hover mechanics to DocsMenu (200ms grace timer so the cursor
// can cross the gap between trigger and dropdown without the menu closing).
// Reuses DocsMenu.module.scss for all visual tokens.

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';

// Reuse DocsMenu's existing styles — same dropdown shape, no extra CSS.
import styles from './DocsMenu.module.scss';

const PRODUCTS = [
  {
    label: 'AI Cloud',
    tagline: 'VMs, Kubernetes, and Slurm for GPU training and inference',
    href: '/ai-cloud',
  },
  {
    label: 'Token Factory',
    tagline: 'OpenAI-compatible inference API for open models',
    href: '/token-factory',
  },
  {
    label: 'Serverless AI',
    tagline: 'Containerized GPU workloads — Jobs + Endpoints',
    href: '/serverless',
  },
  {
    label: 'Tavily',
    tagline: 'Real-time web search & retrieval for AI agents',
    href: '/tavily',
  },
];

const CLOSE_DELAY_MS = 200;

export function ProductsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, CLOSE_DELAY_MS);
  };

  const handleOpen = () => {
    cancelClose();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    return cancelClose;
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onMouseEnter={handleOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Products
        <svg
          aria-hidden
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={styles.chevron}
        >
          <path
            d="M2 4l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          className={styles.dropdown}
          role="menu"
          onMouseEnter={handleOpen}
          onMouseLeave={scheduleClose}
        >
          <div className={styles.dropdownInner}>
            <div className={styles.heading}>Products</div>
            <div className={styles.grid}>
              {PRODUCTS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className={styles.item}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.itemTitle}>{p.label}</span>
                  <span className={styles.itemBlurb}>{p.tagline}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
