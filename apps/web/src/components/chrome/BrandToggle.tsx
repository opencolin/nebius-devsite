// Brand switch — flips the whole site between the current "Builders" look and a
// pixel-faithful "dev.nebius.com" brand. Mirrors ThemeToggle's pattern exactly:
//   - reads localStorage.brand on mount (default 'builders')
//   - sets `data-brand` on <html> so the CSS token layer in globals.scss applies
//   - persists to localStorage on change
// The pre-paint script in pages/_document.tsx applies the same attribute before
// React hydrates, so there's no flash of the wrong brand.
//
// Rendered once, site-wide, as a fixed control near the bottom (see _app.tsx).

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

import styles from './BrandToggle.module.scss';

export type Brand = 'builders' | 'nebius';

interface BrandContextValue {
  brand: Brand;
  setBrand: (b: Brand) => void;
  toggle: () => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

function readBrand(): Brand {
  if (typeof window === 'undefined') return 'builders';
  return window.localStorage.getItem('brand') === 'nebius' ? 'nebius' : 'builders';
}

function applyBrand(b: Brand) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-brand', b);
}

/** Owns the brand state. Mount once near the root (pages/_app.tsx). */
export function BrandProvider({children}: {children: ReactNode}) {
  const [brand, setBrandState] = useState<Brand>('builders');

  useEffect(() => {
    const b = readBrand();
    setBrandState(b);
    applyBrand(b);
  }, []);

  const setBrand = useCallback((b: Brand) => {
    setBrandState(b);
    applyBrand(b);
    try {
      window.localStorage.setItem('brand', b);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setBrandState((prev) => {
      const next: Brand = prev === 'nebius' ? 'builders' : 'nebius';
      applyBrand(next);
      try {
        window.localStorage.setItem('brand', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<BrandContextValue>(() => ({brand, setBrand, toggle}), [brand, setBrand, toggle]);
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) return {brand: 'builders', setBrand: () => undefined, toggle: () => undefined};
  return ctx;
}

// Internal keys stay 'builders' / 'nebius' (used by data-brand, localStorage,
// and the globals.scss selectors) — only the user-facing labels change. The
// default brand mirrors nebius.com; 'nebius' is the dev.nebius.com brand.
const OPTIONS: Array<{key: Brand; label: string}> = [
  {key: 'builders', label: 'nebius.com'},
  {key: 'nebius', label: 'dev.nebius.com'},
];

/** Fixed bottom control. Segmented two-option switch. */
export function BrandToggle() {
  const {brand, setBrand} = useBrand();
  return (
    <div className={styles.root} role="group" aria-label="Site brand / theme">
      <span className={styles.label}>Theme</span>
      <div className={styles.seg}>
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            className={`${styles.opt} ${brand === o.key ? styles.optOn : ''}`}
            aria-pressed={brand === o.key}
            onClick={() => setBrand(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
