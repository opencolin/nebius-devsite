// Docs dropdown for PublicNav. Hover-or-click reveals a popover with the
// product-doc set + a Changelog footer item. Mirrors the Docs menu shape on
// nebius-builders-3 but with our full product list (10 entries) instead of
// the 4 it ships with.
//
// Each item has a title + one-line tagline + ↗ marker for external links.
// Changelog is accent-styled (lime) since it's the "what's new this week"
// touchpoint, not a reference-doc.

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';

import styles from './DocsMenu.module.scss';

interface DocItem {
  label: string;
  tagline: string;
  href: string;
  external?: boolean;
  accent?: boolean;
}

const PRODUCTS: DocItem[] = [
  {label: 'AI Cloud',       tagline: 'GPU clusters, VMs, networking',                href: 'https://docs.nebius.com/',                          external: true},
  {label: 'Token Factory',  tagline: 'Open-source models via OpenAI-compatible API', href: 'https://docs.tokenfactory.nebius.com/quickstart',   external: true},
  {label: 'Serverless AI',  tagline: 'Endpoints + jobs without infra',               href: 'https://docs.nebius.com/serverless',                external: true},
  {label: 'Soperator',      tagline: 'Slurm workload manager on Kubernetes',         href: 'https://github.com/nebius/soperator',               external: true},
  {label: 'Kubernetes',     tagline: 'Managed K8s clusters',                         href: 'https://docs.nebius.com/kubernetes',                external: true},
  {label: 'Compute & GPUs', tagline: 'VMs, containers, GPU drivers',                 href: 'https://docs.nebius.com/compute',                   external: true},
  {label: 'Object Storage', tagline: 'S3-compatible buckets',                        href: 'https://docs.nebius.com/object-storage',            external: true},
  {label: 'Applications',   tagline: 'Turnkey apps for ML/AI workloads',             href: 'https://docs.nebius.com/applications',              external: true},
  {label: 'CLI & SDKs',     tagline: 'nebius CLI, Terraform, Python/JS SDKs',        href: 'https://docs.nebius.com/cli',                       external: true},
];

const CHANGELOG: DocItem = {
  label: 'Changelog',
  tagline: 'What shipped recently',
  href: 'https://docs.nebius.com/changelog',
  external: true,
  accent: true,
};

export function DocsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click + Escape key. Hover open is handled inline.
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

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Docs
        <svg
          aria-hidden
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={styles.chevron}
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className={styles.dropdown} role="menu">
          <div className={styles.heading}>Product docs</div>
          {PRODUCTS.map((d) => (
            <ItemLink key={d.href} item={d} />
          ))}
          <div className={styles.divider} />
          <ItemLink item={CHANGELOG} />
        </div>
      ) : null}
    </div>
  );
}

function ItemLink({item}: {item: DocItem}) {
  const inner = (
    <>
      <span className={`${styles.itemTitle} ${item.accent ? styles.itemTitleAccent : ''}`}>
        {item.label}
      </span>
      <span className={styles.itemBlurb}>{item.tagline}</span>
      {item.external ? <span className={styles.itemArrow} aria-hidden>↗</span> : null}
    </>
  );
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.item}
        role="menuitem"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className={styles.item} role="menuitem">
      {inner}
    </Link>
  );
}
