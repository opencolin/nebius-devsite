// Login screen — mirrors the layout of https://auth.tokenfactory.nebius.com/ui/login
// exactly: dark navy banner on the left with the Nebius lockup + headline,
// gradient panel on the right with a centered white card. The card surfaces
// three OAuth-style entry points (Google, GitHub, SSO) the same way Token
// Factory does. We don't have OAuth wired in this build, so those buttons
// expand the email/password form below — which is what the Directus auth
// backend actually accepts. The fallback is one click away, not buried.
//
// Layout breakpoints match upstream: side-by-side at ≥900px, stacked banner
// + card at <900px.

import Link from 'next/link';
import {useRouter} from 'next/router';
import {useState} from 'react';

import {Button, TextInput, ThemeProvider} from '@gravity-ui/uikit';

import styles from './LoginForm.module.scss';

interface Props {
  nextHref?: string;
}

// Only the email/password form has a hidden state now (GitHub triggers
// a real redirect, the other OAuth buttons are hidden). showEmailForm
// flips when the visitor clicks the "Sign in with email" link.

// Public Directus URL — used for OAuth init. NEXT_PUBLIC_ so the
// browser bundle has it.
const DIRECTUS_PUBLIC_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_PUBLIC_URL ?? 'https://cms.buildspace.sh';

export function LoginForm({nextHref = '/portal'}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When true, the email/password form is visible (collapsed under a
  // "Sign in with email" link by default to keep the OAuth path front-and-center).
  const [showEmailForm, setShowEmailForm] = useState(false);

  // GitHub OAuth — redirect to Directus's built-in /auth/login/github
  // endpoint. Directus handles the GitHub round-trip and sets its
  // session cookie on .buildspace.sh (Domain set via
  // SESSION_COOKIE_DOMAIN in the Directus container env), then redirects
  // back to our `redirect` URL. The destination URL must be in
  // Directus's AUTH_GITHUB_REDIRECT_ALLOW_LIST.
  const onGithubLogin = () => {
    if (typeof window === 'undefined') return;
    const dest = new URL(nextHref, window.location.origin).toString();
    const u = new URL('/auth/login/github', DIRECTUS_PUBLIC_URL);
    u.searchParams.set('redirect', dest);
    window.location.href = u.toString();
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({email, password}),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as {error?: string};
        throw new Error(j.error ?? `Login failed (${r.status})`);
      }
      router.push(nextHref);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.layout}>
      {/* ---- Left dark banner ---- */}
      <aside className={styles.banner}>
        <Link
          href="/"
          className={styles.lockup}
          aria-label="Nebius Builders — home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nebius-logo.svg"
            alt="Nebius"
            width={102}
            height={28}
            className={styles.lockupMark}
          />
          <span className={styles.lockupDivider} aria-hidden>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path
                d="M1 1l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.lockupBadge}>Builders</span>
        </Link>

        <div className={styles.bannerCopy}>
          <h1 className={styles.bannerTitle}>
            The community<br />shipping with Nebius
          </h1>
          <p className={styles.bannerLede}>
            Earn credits, claim ambassador status, and book time with the
            DevRel team. One sign-in across the portal and the leaderboard.
          </p>
        </div>
      </aside>

      {/* ---- Right gradient panel + card ----
          The card is always rendered against the light gradient — no matter
          what the global theme is — so we force a light Gravity scope here.
          Without this, TextInput text color comes from dark-mode tokens
          (light gray) and disappears against the white card. */}
      <section
        className={styles.main}
        style={{backgroundImage: 'url(/login-bg-light.svg)'}}
      >
        <ThemeProvider theme="light" rootClassName={styles.cardScope}>
        <div className={styles.card}>
          <header className={styles.cardHead}>
            <h2 className={styles.cardTitle}>
              Welcome to<br />Nebius Builders
            </h2>
            <p className={styles.cardTagline}>
              Build faster · Earn credits · Belong
            </p>
          </header>

          <div className={styles.actions}>
            {/* Only GitHub is wired right now. Google + SSO buttons are
                hidden until the corresponding Directus auth providers
                exist — keeping the JSX (commented stubs) so re-enabling
                is a delete-the-comment-wrappers operation. */}
            <button
              type="button"
              className={styles.oauthBtn}
              data-qa="login-github"
              onClick={onGithubLogin}
            >
              <span className={styles.oauthIcon} aria-hidden>
                <GitHubIcon />
              </span>
              <span>Get started with GitHub</span>
            </button>
          </div>

          {!showEmailForm ? (
            <button
              type="button"
              className={styles.emailLink}
              onClick={() => setShowEmailForm(true)}
            >
              Sign in with email
            </button>
          ) : (
            <form onSubmit={onSubmit} className={styles.form}>
              <TextInput
                placeholder="Email"
                type="email"
                value={email}
                onUpdate={setEmail}
                autoComplete="email"
                size="xl"
                hasClear
              />
              <TextInput
                placeholder="Password"
                type="password"
                value={password}
                onUpdate={setPassword}
                autoComplete="current-password"
                size="xl"
                hasClear
              />
              {error ? (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              ) : null}
              <Button
                type="submit"
                view="action"
                size="xl"
                width="max"
                loading={submitting}
                disabled={!email || !password}
              >
                Sign in
              </Button>
              <button
                type="button"
                className={styles.cancel}
                onClick={() => {
                  setShowEmailForm(false);
                  setError(null);
                }}
              >
                ← Back to sign-in options
              </button>
            </form>
          )}

          <p className={styles.privacy}>
            By logging in I confirm I have read the{' '}
            <Link href="/about-this-build" className={styles.privacyLink}>
              Privacy Policy
            </Link>
          </p>
        </div>
        </ThemeProvider>
      </section>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Icons — inlined SVG so the OAuth button doesn't need an extra image
// asset or runtime fetch from static.nebius.com. Google + SSO (key) icons
// removed alongside their buttons; restore from git history if you re-enable
// those providers later.
// -----------------------------------------------------------------------------

function GitHubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 25 24">
      <ellipse cx="12.5" cy="11.8" fill="#fff" rx="12" ry="11.8" />
      <path
        fill="#000"
        fillRule="evenodd"
        d="M12.504 0C5.842 0 .451 5.292.451 11.832c0 5.227 3.452 9.65 8.243 11.215.6.116.82-.255.82-.566 0-.286-.011-1.224-.016-2.226-3.354.717-4.062-1.41-4.062-1.41-.547-1.366-1.337-1.736-1.337-1.736-1.094-.731.082-.713.082-.713 1.21.083 1.846 1.218 1.846 1.218 1.075 1.81 2.823 1.288 3.51.989.108-.766.42-1.288.764-1.585-2.677-.293-5.491-1.314-5.491-5.85 0-1.293.473-2.347 1.247-3.176-.124-.3-.541-1.504.117-3.135 0 0 1.018-.32 3.336 1.213a11.7 11.7 0 0 1 3.038-.4 11.6 11.6 0 0 1 3.039.4c2.317-1.534 3.331-1.214 3.331-1.214.66 1.633.245 2.836.12 3.137.778.829 1.247 1.882 1.247 3.176 0 4.546-2.819 5.554-5.504 5.842.432.367.819 1.087.819 2.193 0 1.585-.014 2.86-.014 3.252 0 .315.216.685.823.569 4.79-1.566 8.236-5.987 8.236-11.214C24.555 5.292 19.166 0 12.503 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
