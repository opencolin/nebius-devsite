// Light/dark toggle. Mirrors opencolin/nebius-builders' ThemeToggle pattern:
//   - reads localStorage.theme on mount (falls back to OS prefers-color-scheme)
//   - sets the theme class on <html> immediately so Gravity tokens flip
//   - persists to localStorage on toggle
//
// Uses a React Context so the SAME theme state is shared between _app.tsx
// (which passes it to Gravity ThemeProvider + PageConstructorProvider) and
// the ThemeToggle button (rendered inside PublicNav). Without the shared
// context, the toggle would only update its own local state and the rest
// of the page would stay in the previous theme until full reload.
//
// The pre-paint script in pages/_document.tsx applies the same logic before
// React hydrates so there's no FOUC.

import {Button, Icon} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readThemeFromBrowser(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('g-root_theme_light', 'g-root_theme_dark');
  root.classList.add('g-root', `g-root_theme_${theme}`);
  root.setAttribute('data-theme', theme);
}

/**
 * Wraps the app and owns the theme state. Must be mounted ONCE near the root
 * (in pages/_app.tsx). All other components that need to read or change the
 * theme call useThemeToggle() and get the same state.
 */
export function ThemeProvider({children}: {children: ReactNode}) {
  // SSR returns 'light'; client effect below corrects to the real preference.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const t = readThemeFromBrowser();
    setThemeState(t);
    applyTheme(t);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      window.localStorage.setItem('theme', t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        window.localStorage.setItem('theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({theme, toggle, setTheme}), [theme, toggle, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeToggle(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Defensive fallback for stories / isolated tests where the provider
    // isn't mounted. Returns a no-op so render still works.
    return {theme: 'light', toggle: () => undefined, setTheme: () => undefined};
  }
  return ctx;
}

export function ThemeToggle() {
  const {theme, toggle} = useThemeToggle();
  return (
    <Button
      view="flat"
      size="m"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon data={theme === 'dark' ? Sun : Moon} size={16} />
    </Button>
  );
}
