// Tenki Fellows — the official cohort as unveiled on stage: 12 Fellows,
// 12 cities, 9 countries, 1 global network. Each Fellow is an independent
// community leader (event organizer, OSS contributor, educator, founder)
// helping shape the Tenki ecosystem.
//
// Only public-facing fields surface here — name, region, city, role,
// company, LinkedIn (when known), a short tagline, and a local photo when
// one is on file. Internal ops data (email, status, notes) is deliberately
// omitted and lives in the source Confluence.
//
// Photos live in /public/fellows/<slug>.{png,jpg}. Most were sourced from
// the cohort directory; Vivek's is his public @vivekhaldar avatar. Ayub
// has no photo on file yet and renders the initials fallback.

export type Region = 'EMEA' | 'North America' | 'LATAM' | 'APJ';

export interface Fellow {
  slug: string;
  name: string;
  region: Region;
  city: string;
  /** Job title — empty string if not on file. */
  role: string;
  /** Company / organization — empty string if independent. */
  company: string;
  linkedinUrl: string;
  /** /public path to a local photo, or null to fall back to initials avatar. */
  photo: string | null;
  /**
   * Short promotional one-liner, drawn from the cohort's on-stage
   * descriptions. Undefined when no public-facing material is on file.
   */
  tagline?: string;
}

export const FELLOWS: Fellow[] = [
  {
    slug: 'maroon-ayoub',
    name: 'Maroon Ayoub',
    region: 'EMEA',
    city: 'Tel Aviv',
    role: 'ML Engineer',
    company: 'Red Hat',
    linkedinUrl: 'https://linkedin.com/in/v-maroon/',
    photo: '/fellows/maroon-ayoub.png',
    tagline: 'vLLM + llm-d contributor.',
  },
  {
    slug: 'linda-haviv',
    name: 'Linda Haviv',
    region: 'North America',
    city: 'New York',
    role: 'Founder',
    company: 'LindaV Media Labs',
    linkedinUrl: 'https://www.linkedin.com/in/lindahaviv/',
    photo: '/fellows/linda-haviv.png',
    tagline: 'Educating 250k+ AI developers; leads a model training & inference community.',
  },
  {
    slug: 'rapha-gutsche',
    name: 'Raphael Gutsche',
    region: 'EMEA',
    city: 'Berlin',
    role: 'Founder',
    company: 'AI Agents Berlin',
    linkedinUrl: 'https://www.linkedin.com/in/raphael-gutsche/',
    photo: '/fellows/rapha-gutsche.jpg',
    tagline: 'Founder of AI Agents Berlin, an agent-orchestration community.',
  },
  {
    slug: 'kosseila-hd',
    name: 'Kosseila Haddalene',
    region: 'North America',
    city: 'Toronto',
    role: 'Founder',
    company: 'Cloudthrill',
    linkedinUrl: 'https://www.linkedin.com/in/kousshd/',
    photo: '/fellows/kosseila-hd.png',
    tagline: 'vLLM contributor; creator of @Cloud_Dude on YouTube.',
  },
  {
    slug: 'ayub-yanturin',
    name: 'Ayub Yanturin',
    region: 'EMEA',
    city: 'London',
    role: 'Chair',
    company: 'Innovators Guild',
    linkedinUrl: '',
    photo: null,
    tagline: "Chairs Innovators Guild, London's AI builder community.",
  },
  {
    slug: 'dhruv-diddi',
    name: 'Dhruv Diddi',
    region: 'North America',
    city: 'San Francisco',
    role: 'Founder',
    company: 'Solo Tech',
    linkedinUrl: 'https://www.linkedin.com/in/dhruvdiddi/',
    photo: '/fellows/dhruv-diddi.jpg',
    tagline: 'Founder of Solo Tech — model training & RL for Physical AI.',
  },
  {
    slug: 'mesut-oezdil',
    name: 'Mesut Oezdil',
    region: 'EMEA',
    city: 'Stuttgart',
    role: 'HAMi Contributor · GPU virtualization on Kubernetes',
    company: '',
    linkedinUrl: 'https://www.linkedin.com/in/mesut-oezdil/',
    photo: '/fellows/mesut-oezdil.png',
    tagline: 'HAMi contributor working on GPU virtualization on Kubernetes.',
  },
  {
    slug: 'yong-quan-tan',
    name: 'Yong Quan Tan',
    region: 'APJ',
    city: 'Singapore',
    role: 'Organizer',
    company: 'AI Tinkerers Singapore',
    linkedinUrl: 'https://www.linkedin.com/in/yong-quan-tan/',
    photo: '/fellows/yong-quan-tan.jpg',
    tagline: 'Organizes AI Tinkerers Singapore, an applied-AI builder community.',
  },
  {
    slug: 'vivek-haldar',
    name: 'Vivek Haldar',
    region: 'North America',
    city: 'Los Angeles',
    role: 'Engineer · Writer & Teacher',
    company: '',
    linkedinUrl: '',
    photo: '/fellows/vivek-haldar.jpg',
    tagline: 'Production agent infrastructure; widely-read writer and teacher.',
  },
  {
    slug: 'rayyan-zahid',
    name: 'Rayyan Zahid',
    region: 'North America',
    city: 'San Francisco',
    role: 'Founder / Engineer',
    company: 'Immersive Commons',
    linkedinUrl: 'https://www.linkedin.com/in/rayyanzahid/',
    photo: '/fellows/rayyan-zahid.png',
    tagline: 'Builds open-source AI security tooling; hosts fine-tuning workshops.',
  },
  {
    slug: 'alejandra-marin',
    name: 'Alejandra Marin',
    region: 'LATAM',
    city: 'Buenos Aires',
    role: 'Co-founder',
    company: 'NERDCONF',
    linkedinUrl: 'https://www.linkedin.com/in/alejandra-marin-83b369113/?locale=en',
    photo: '/fellows/alejandra-marin.jpg',
    tagline: "Co-founder of NERDCONF, building LATAM's AI builder community.",
  },
  {
    slug: 'mel-cordoba',
    name: 'Ángel Meléndez Córdoba',
    region: 'LATAM',
    city: 'Mexico City',
    role: 'Founder',
    company: 'Frutero Club',
    linkedinUrl: 'https://www.linkedin.com/in/mel-mc/',
    photo: '/fellows/mel-cordoba.jpg',
    tagline: 'Founder of Frutero Club (CDMX); has mentored 1,500+ AI projects.',
  },
];

// The cohort grid rendered on /fellows. Order mirrors the on-stage slide
// exactly — top row then bottom row, left to right — so the page reads the
// same as the reveal. All 12 Fellows are listed here (the region-grouped
// roster below is kept in code but currently hidden, so this is the single
// source of what renders).
export const FEATURED_SLUGS: ReadonlyArray<string> = [
  'maroon-ayoub',
  'linda-haviv',
  'rapha-gutsche',
  'kosseila-hd',
  'ayub-yanturin',
  'dhruv-diddi',
  'mesut-oezdil',
  'yong-quan-tan',
  'vivek-haldar',
  'rayyan-zahid',
  'alejandra-marin',
  'mel-cordoba',
];

// Resolve FEATURED_SLUGS → Fellow records, preserving order. Throws at
// import time if a slug is missing so a typo here surfaces immediately
// instead of producing a quietly-shorter Featured row.
export const FEATURED_FELLOWS: Fellow[] = FEATURED_SLUGS.map((slug) => {
  const fellow = FELLOWS.find((f) => f.slug === slug);
  if (!fellow) {
    throw new Error(`FEATURED_SLUGS references unknown slug: ${slug}`);
  }
  return fellow;
});

// Region display order — North America first since most fellows live
// there, then EMEA, LATAM, APJ. Used by /fellows to group cards.
export const REGION_ORDER: Region[] = ['North America', 'EMEA', 'LATAM', 'APJ'];

// Stable initials for the fallback avatar when photo is null. Picks the
// first letter of the first and last name parts; accented letters (e.g.
// Ángel) are preserved and uppercased.
export function fellowInitials(name: string): string {
  const cleaned = name.replace(/[“”"]/g, '').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}
