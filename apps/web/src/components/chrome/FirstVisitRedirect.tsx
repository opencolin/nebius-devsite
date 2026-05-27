// FirstVisitRedirect — bounce the very first arrival on the homepage to
// /about-this-build. After redirecting once, set a localStorage flag so
// every subsequent visit lands on the real homepage as normal.
//
// Scope is deliberately narrow:
//   - Only fires when pathname === '/'. Deep links (a shared /events/foo
//     URL, a sitemap-driven crawler hit on /apps/openclaw, etc.) resolve
//     directly and don't get bounced through the welcome page.
//   - router.replace, not router.push — so the homepage doesn't pollute
//     the back button.
//   - Silently no-ops if localStorage is unavailable (strict-mode
//     incognito, quota errors). Better to show the page than throw.
//   - SSR-safe: returns null on the server (useEffect guards window).
//
// Reset for testing: in devtools console,
//   localStorage.removeItem('nb_first_visit_done'); location.assign('/');

import {useEffect} from 'react';
import {useRouter} from 'next/router';

const FIRST_VISIT_KEY = 'nb_first_visit_done';
const REDIRECT_TARGET = '/about-this-build';

export function FirstVisitRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (router.pathname !== '/') return;
    try {
      if (window.localStorage.getItem(FIRST_VISIT_KEY) === '1') return;
      window.localStorage.setItem(FIRST_VISIT_KEY, '1');
      router.replace(REDIRECT_TARGET);
    } catch {
      // localStorage unavailable — skip the redirect rather than throw.
    }
  }, [router]);

  return null;
}
