// ProductsMenu — the product mega-menu. Two trigger variants:
//   - variant="nav" (default): a text trigger that sits inline with the
//     other PublicNav links (the original "Products" item).
//   - variant="cta": the right-hand "Get started" action button opens the
//     same menu. This is how PublicNav now surfaces it — there's no longer a
//     separate "Products" nav link; Get started IS the products menu.
//
// The dropdown is a full-width mega-menu pinned beneath the nav (see
// DocsMenu.module.scss .dropdown), so it renders identically regardless of
// where the trigger sits. Hover mechanics match DocsMenu (200ms grace timer
// so the cursor can cross the gap between trigger and dropdown).

import {Button} from '@gravity-ui/uikit';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';

// Reuse DocsMenu's existing styles — same dropdown shape — plus a few
// ProductsMenu-only additions (the Get-started chevron + the free-credits
// banner) defined at the bottom of the same module.
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

// Top-of-menu call to action. Lands on /signup — the destination the bare
// "Get started" button used to link to directly.
const FREE_CREDITS_HREF = '/signup';

const CLOSE_DELAY_MS = 200;

export function ProductsMenu({variant = 'nav'}: {variant?: 'nav' | 'cta'}) {
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

  const renderChevron = (extra = '') => (
    <svg
      aria-hidden
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''} ${extra}`}
    >
      <path
        d="M2 4l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onMouseEnter={handleOpen}
      onMouseLeave={scheduleClose}
    >
      {variant === 'cta' ? (
        <Button
          view="action"
          size="m"
          onClick={() => setOpen((v) => !v)}
          extraProps={{'aria-haspopup': 'menu', 'aria-expanded': open}}
        >
          Get started
          {renderChevron(styles.ctaChevron)}
        </Button>
      ) : (
        <button
          type="button"
          className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          Products
          {renderChevron()}
        </button>
      )}

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

            {/* Builder Network — styled like the product items above, set
                below them behind a divider. Lands on /signup. */}
            <div className={styles.builderNetworkWrap}>
              <Link
                href={FREE_CREDITS_HREF}
                className={styles.item}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className={styles.itemTitle}>Nebius Builder Network</span>
                <span className={styles.itemBlurb}>Sign up for free credits</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
