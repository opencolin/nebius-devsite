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

// GitHub used to be in here as a "coming soon" branch; now it's a real
// OAuth redirect handled by onGithubLogin so it's out of the email-mode
// fallback list. Google + SSO still stub to email.
type EmailModeReason = 'google' | 'sso' | 'email' | null;

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
  // When non-null, the email/password form is visible. The reason controls
  // the small banner above the form so users understand why they landed in
  // the email flow.
  const [emailMode, setEmailMode] = useState<EmailModeReason>(null);

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
            <button
              type="button"
              className={styles.oauthBtn}
              data-qa="login-google"
              onClick={() => setEmailMode('google')}
            >
              <span className={styles.oauthIcon} aria-hidden>
                <GoogleIcon />
              </span>
              <span>Get started with Google</span>
            </button>

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

            <button
              type="button"
              className={styles.oauthBtn}
              data-qa="login-sso"
              onClick={() => setEmailMode('sso')}
            >
              <span className={styles.oauthIcon} aria-hidden>
                <KeyIcon />
              </span>
              <span>Get started with SSO</span>
            </button>
          </div>

          {emailMode == null ? (
            <button
              type="button"
              className={styles.emailLink}
              onClick={() => setEmailMode('email')}
            >
              Sign in with email
            </button>
          ) : (
            <form onSubmit={onSubmit} className={styles.form}>
              {emailMode !== 'email' ? (
                <p className={styles.formHint} role="status">
                  {emailMode === 'sso'
                    ? 'SSO is coming soon. Use your email and password for now.'
                    : 'Google sign-in is coming soon. Use your email and password for now.'}
                </p>
              ) : null}

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
                  setEmailMode(null);
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
// Icons — inlined SVGs match the Token Factory login exactly (Google color
// mark, GitHub silhouette, key for SSO). Kept inline so we don't need to ship
// extra image assets or pull from static.nebius.com at runtime.
// -----------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 25 24">
      <g clipPath="url(#g-google-a)">
        <path
          fill="#4285F4"
          d="M24.1 12.276a14.3 14.3 0 0 0-.204-2.439H12.733v4.621h6.392a5.56 5.56 0 0 1-2.366 3.647v2.998h3.825c2.243-2.071 3.516-5.13 3.516-8.827"
        />
        <path
          fill="#34A853"
          d="M12.733 24c3.198 0 5.886-1.04 7.851-2.83l-3.825-2.998c-1.064.722-2.434 1.144-4.026 1.144-3.094 0-5.715-2.087-6.654-4.892h-3.95v3.087A11.99 11.99 0 0 0 12.732 24"
        />
        <path
          fill="#FBBC04"
          d="M6.08 14.42a7.2 7.2 0 0 1 0-4.587V6.749h-3.95a12 12 0 0 0 0 10.756z"
        />
        <path
          fill="#E94235"
          d="M12.733 4.755a6.5 6.5 0 0 1 4.59 1.795l3.391-3.392A11.5 11.5 0 0 0 12.733 0a11.99 11.99 0 0 0-10.71 6.62l3.95 3.087c.939-2.808 3.563-4.952 6.76-4.952"
        />
      </g>
      <defs>
        <clipPath id="g-google-a">
          <path fill="#fff" d="M.733 0h24v24h-24z" />
        </clipPath>
      </defs>
    </svg>
  );
}

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

function KeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 16 16">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10.313 7.488 9 7.653v5.37a.5.5 0 0 1-.353.478l-1.62.498-.006.001h-.008l-.007-.006-.005-.007v-.003L7 13.979V7.653l-1.313-.165a1.5 1.5 0 0 1-1.271-1.144l-.588-2.5A1.5 1.5 0 0 1 5.288 2h5.424a1.5 1.5 0 0 1 1.46 1.844l-.588 2.5a1.5 1.5 0 0 1-1.271 1.144m2.731-.8A3 3 0 0 1 10.5 8.976v4.046a2 2 0 0 1-1.412 1.911l-1.62.499A1.52 1.52 0 0 1 5.5 13.979V8.977a3 3 0 0 1-2.544-2.29l-.588-2.5A3 3 0 0 1 5.288.5h5.424a3 3 0 0 1 2.92 3.687zM6.75 3.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
