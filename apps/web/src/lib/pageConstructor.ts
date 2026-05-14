// Custom Page Constructor block registry.
//
// Page Constructor ships with a large library of standard blocks (header,
// footer, hero, content, card-row, etc.). When the team needs a block that
// isn't built in — e.g. the rotating Earth events map on the homepage —
// they implement a React component, register it here under a stable name,
// and reference that name from the Directus `pages.blocks` JSON.
//
// Mirrors how Nebius's own site customizes Page Constructor for its hero
// blocks (visible as `pc-addons-*` classes in the rendered DOM).

import type {CustomConfig} from '@gravity-ui/page-constructor';

// Example: import {HeroEventsMapBlock, HeroEventsMapProps} from '@/blocks/HeroEventsMap';
// Example: import {NewsletterSignupBlock} from '@/blocks/NewsletterSignup';

export const customBlocks: CustomConfig['blocks'] = {
  // 'hero-events-map': (props: HeroEventsMapProps) => <HeroEventsMapBlock {...props} />,
  // 'newsletter-signup': NewsletterSignupBlock,
};

// Template / item registries are wired the same way:
// export const customItems: CustomConfig['items'] = {};
// export const customSubBlocks: CustomConfig['subBlocks'] = {};
