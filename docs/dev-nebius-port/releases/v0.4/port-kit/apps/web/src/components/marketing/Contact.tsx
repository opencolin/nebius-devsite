// Contact — final section, id="contact" so the DualPitch "Talk to us"
// anchor lands here. Left column has the eyebrow + a quick contact info
// list. Right column has a placeholder form (no backend wired).
//
// Ported from nb3 contact.tsx. The "Send" button intentionally has
// type="button" so it doesn't submit anywhere — the form is wireframe
// state until a real intake endpoint exists.

import {Button, Text, TextArea, TextInput} from '@gravity-ui/uikit';

import styles from './Contact.module.scss';

export function Contact() {
  return (
    <section id="contact" className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <Text variant="caption-2" className={styles.eyebrow}>
              Get in touch
            </Text>
            <Text variant="header-2" as="h2" className={styles.title}>
              Run your next event with us.
            </Text>
            <Text variant="body-2" color="secondary" className={styles.body}>
              Tell us what you&rsquo;re planning. We&rsquo;ll come back inside 24
              hours with a venue, a partner shortlist, and a budget.
            </Text>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <span className={styles.icon} aria-hidden>
                  &#9678;
                </span>
                San Francisco &middot; NYC &middot; London &middot; Remote
              </li>
              <li className={styles.infoItem}>
                <span className={styles.icon} aria-hidden>
                  &#9993;
                </span>
                <a href="mailto:builders@nebius.com" className={styles.infoLink}>
                  builders@nebius.com
                </a>
              </li>
              <li className={styles.infoItem}>
                <span className={`${styles.icon} ${styles.iconStatus}`} aria-hidden>
                  &bull;
                </span>
                Accepting Q3 bookings
              </li>
            </ul>
          </div>

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.field}>
              <label htmlFor="contact-name" className={styles.label}>
                Name
              </label>
              <TextInput id="contact-name" placeholder="Colin Lowenberg" size="l" />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-email" className={styles.label}>
                Work email
              </label>
              <TextInput
                id="contact-email"
                type="email"
                placeholder="colin@nebius.com"
                size="l"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-company" className={styles.label}>
                Company
              </label>
              <TextInput id="contact-company" placeholder="Nebius" size="l" />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-msg" className={styles.label}>
                What are you planning?
              </label>
              <TextArea
                id="contact-msg"
                rows={4}
                placeholder="A 200-builder hackathon on agents in Q3..."
              />
            </div>
            <Button view="action" size="l" type="button" width="max">
              Send &rarr;
            </Button>
            <Text variant="caption-2" color="hint" className={styles.foot}>
              By submitting, you agree to our (placeholder) privacy policy. We
              won&rsquo;t add you to a marketing list.
            </Text>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
