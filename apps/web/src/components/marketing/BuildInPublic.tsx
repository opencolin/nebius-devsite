// BuildInPublic — newsletter signup banner with a soft submit (fake API
// delay, no backend wiring yet). Sits between Contact and the footer
// with hairline top/bottom borders.
//
// Ported from nb3 build-in-public.tsx. Uses local component state for the
// optimistic submit UX.

import {useState} from 'react';

import {Button, Text, TextInput} from '@gravity-ui/uikit';

import styles from './BuildInPublic.module.scss';

type SubmitState = 'idle' | 'submitting' | 'done' | 'error';

const SOCIALS: Array<{href: string; label: string}> = [
  {href: 'https://x.com/nebiusai', label: 'X / Twitter'},
  {href: 'https://www.linkedin.com/company/nebius', label: 'LinkedIn'},
  {href: 'https://www.youtube.com/@nebiusofficial/videos', label: 'YouTube'},
  {href: 'https://nebius.com/blog?tags=builder-updates', label: 'Blog'},
];

export function BuildInPublic() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid email.');
      setStatus('error');
      return;
    }
    setError(null);
    setStatus('submitting');
    // Demo: no backend wired. Pretend-submit so the UI flow is real.
    await new Promise((r) => setTimeout(r, 600));
    setStatus('done');
  }

  return (
    <section className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Text variant="caption-2" className={styles.eyebrow}>
            Build in public
          </Text>
          <Text variant="subheader-3" as="h3" className={styles.title}>
            Builder updates in your inbox.
          </Text>
          <Text variant="body-2" color="secondary" className={styles.body}>
            Monthly digest: new workshops, library entries, builder spotlights,
            upcoming events, and what the team shipped. No marketing fluff,
            unsubscribe in one click.
          </Text>
          <div className={styles.socialRow}>
            <Text variant="caption-2" className={styles.socialLabel}>
              Also on
            </Text>
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                {s.label} &uarr;
              </a>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className={styles.form} noValidate>
          {status === 'done' ? (
            <div className={styles.success} role="status" aria-live="polite">
              <p className={styles.successTitle}>You&rsquo;re on the list.</p>
              <p className={styles.successBody}>
                Watch for a confirmation email at{' '}
                <strong>{email}</strong>. Demo only — no real send is wired up.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.fieldRow}>
                <TextInput
                  size="l"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onUpdate={(v) => {
                    setEmail(v);
                    if (status === 'error') {
                      setError(null);
                      setStatus('idle');
                    }
                  }}
                  validationState={status === 'error' ? 'invalid' : undefined}
                  className={styles.field}
                />
                <Button
                  view="action"
                  size="l"
                  type="submit"
                  disabled={status === 'submitting'}
                  loading={status === 'submitting'}
                >
                  Subscribe &rarr;
                </Button>
              </div>
              {status === 'error' && error ? (
                <p className={styles.errorLine} role="alert">
                  {error}
                </p>
              ) : (
                <p className={styles.helpLine}>
                  Monthly cadence. Unsubscribe link in every email.
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </section>
  );
}

export default BuildInPublic;
