// Minimal, GDPR-friendly consent banner.
//
// Until the visitor explicitly accepts, _app.tsx withholds the GTM bootstrap
// script. Once accepted, we set localStorage['nb_consent'] = 'granted' and
// fire a `nb:consent-granted` event that _app picks up to inject GTM.
// Mirrors the gating pattern Nebius uses for HubSpot/Demandbase/Hotjar/etc.

import {Button, Text} from '@gravity-ui/uikit';
import Link from 'next/link';
import {useEffect, useState} from 'react';

import styles from './ConsentBanner.module.scss';

const KEY = 'nb_consent';

export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = window.localStorage.getItem(KEY);
    setOpen(v !== 'granted' && v !== 'denied');
  }, []);

  if (!open) return null;

  function decide(state: 'granted' | 'denied') {
    try {
      window.localStorage.setItem(KEY, state);
      if (state === 'granted') {
        window.dispatchEvent(new Event('nb:consent-granted'));
      }
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <div className={styles.root} role="dialog" aria-label="Cookie consent">
      <Text variant="body-2" className={styles.copy}>
        We use cookies to measure marketing performance and improve the site.{' '}
        <Link href="/legal/privacy">Privacy</Link>.
      </Text>
      <div className={styles.actions}>
        <Button view="flat" onClick={() => decide('denied')}>
          Decline
        </Button>
        <Button view="action" onClick={() => decide('granted')}>
          Accept
        </Button>
      </div>
    </div>
  );
}
