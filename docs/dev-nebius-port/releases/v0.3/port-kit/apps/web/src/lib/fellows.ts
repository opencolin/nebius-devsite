// Fellow candidate directory. Sourced from the internal Confluence page
// "Fellow candidate pool" (Nebius DevRel ops). Only the public-facing
// fields surface here — name, region, city, role, company, LinkedIn,
// and a local photo when one was on file.
//
// Deliberately omitted from this lib (and therefore from the rendered
// /fellows page): email, candidate status, areas-for-contribution tags,
// referrer, internal notes, and any pricing references. Those live in
// the source Confluence and aren't appropriate for a public surface.
//
// Photos: 7 downloaded from the source Confluence CDN (signed tokens that
// would otherwise expire, so re-hosted locally), 9 fetched via unavatar.io
// against the fellow's LinkedIn handle — except Rayyan whose LinkedIn
// returned the unavatar default, sourced from GitHub instead. All photos
// live in /public/fellows/<slug>.{png,jpg}; re-run scripts/refresh-fellow-
// photos.sh if the roster changes.

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
   * Short promotional one-liner. Synthesized from the source directory's
   * Notes + Previous Work columns with internal-only fragments removed
   * (referrers, motivation level, pricing, attribution chains). Undefined
   * when the source had no public-facing material to draw from.
   */
  tagline?: string;
}

export const FELLOWS: Fellow[] = [
  {
    slug: 'maroon-ayoub',
    name: 'Maroon Ayoub',
    region: 'EMEA',
    city: 'Tel Aviv',
    role: 'Research Scientist & Architect, AI Infrastructure',
    company: 'IBM',
    linkedinUrl: 'https://linkedin.com/in/v-maroon/',
    photo: '/fellows/maroon-ayoub.png',
    tagline: 'Key vLLM contributor.',
  },
  {
    slug: 'kosseila-hd',
    name: 'Kosseila hd',
    region: 'North America',
    city: 'Toronto',
    role: 'Founder',
    company: 'Cloudthrill',
    linkedinUrl: 'https://www.linkedin.com/in/kousshd/',
    photo: '/fellows/kosseila-hd.png',
    tagline: 'Writes hands-on Nebius deployment guides (vLLM, Terraform).',
  },
  {
    slug: 'mesut-oezdil',
    name: 'Mesut Oezdil',
    region: 'EMEA',
    city: 'Stuttgart',
    role: 'GPU + Kubernetes · HAMi Member · kagent Contributor',
    company: '',
    linkedinUrl: 'https://www.linkedin.com/in/mesut-oezdil/',
    photo: '/fellows/mesut-oezdil.png',
  },
  {
    slug: 'daniel-colaianni',
    name: 'Daniel Colaianni',
    region: 'EMEA',
    city: 'London',
    role: 'Cofounder',
    company: 'Holito',
    linkedinUrl: 'https://www.linkedin.com/in/danielcolaianni/',
    photo: '/fellows/daniel-colaianni.png',
    tagline: 'Active community builder in London.',
  },
  {
    slug: 'tim-santos',
    name: 'Tim Santos',
    region: 'EMEA',
    city: 'London',
    role: 'Director of Product',
    company: 'Graphcore',
    linkedinUrl: 'https://www.linkedin.com/in/internetoftim/',
    photo: '/fellows/tim-santos.png',
    tagline: 'Experienced DevRel and community builder.',
  },
  {
    slug: 'john-varghese',
    name: 'John Varghese',
    region: 'North America',
    city: 'Mountain View',
    role: 'Principal DevOps Engineer',
    company: 'DNAnexus',
    linkedinUrl: 'https://www.linkedin.com/in/jvaws/',
    photo: '/fellows/john-varghese.png',
  },
  {
    slug: 'rapha-gutsche',
    name: 'Rapha Gutsche',
    region: 'EMEA',
    city: 'Berlin',
    role: 'Founder / Engineer',
    company: 'AI Agents Berlin',
    linkedinUrl: 'https://www.linkedin.com/in/raphael-gutsche/',
    photo: '/fellows/rapha-gutsche.jpg',
    tagline: 'Organizing the AI Agents Summit Berlin; agent-builder community since 2024.',
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
    tagline: '250k+ community. Ray OSS contributor. Formerly AWS.',
  },
  {
    slug: 'mel-cordoba',
    name: 'Angel “Mel” Cordoba',
    region: 'LATAM',
    city: 'Mexico City',
    role: 'Founder / Engineer',
    company: 'Frutero Club',
    linkedinUrl: 'https://www.linkedin.com/in/mel-mc/',
    photo: '/fellows/mel-cordoba.jpg',
    tagline: 'Shipped a NemoClaw workshop and reported real bugs in Nebius models.',
  },
  {
    slug: 'alejandra-marin',
    name: 'Alejandra Marin',
    region: 'LATAM',
    city: 'Buenos Aires',
    role: 'Conference Organizer',
    company: 'NERDConf',
    linkedinUrl: 'https://www.linkedin.com/in/alejandra-marin-83b369113/?locale=en',
    photo: '/fellows/alejandra-marin.jpg',
    tagline: 'Cohosts 100+ person AI events across South America.',
  },
  {
    slug: 'matheus-pagani',
    name: 'Matheus Pagani',
    region: 'LATAM',
    city: 'São Paulo',
    role: 'DevRel',
    company: 'Vibe Space',
    linkedinUrl: 'https://www.linkedin.com/in/mdpagani/',
    photo: '/fellows/matheus-pagani.jpg',
    tagline: 'Cohosted AI events for Groq, Windsurf, and others.',
  },
  {
    slug: 'boldrin-antony',
    name: 'Boldrin Antony',
    region: 'APJ',
    city: 'Bangalore',
    role: 'Business Development',
    company: 'Zo House',
    linkedinUrl: 'https://www.linkedin.com/in/boldrin-antony/',
    photo: '/fellows/boldrin-antony.jpg',
    tagline: 'Runs Zo House, India’s flagship hacker community space.',
  },
  {
    slug: 'rayyan-zahid',
    name: 'Rayyan Zahid',
    region: 'North America',
    city: 'San Francisco',
    role: 'Founder / Engineer',
    company: 'Immersive Commons',
    linkedinUrl: 'https://www.linkedin.com/in/rayyanzahid/',
    // From GitHub avatar — unavatar.io/linkedin returned the default
    // placeholder for this profile, so we sourced from his GitHub.
    photo: '/fellows/rayyan-zahid.png',
    tagline: 'Ran a Nebius workshop on fine-tuning Gemma 4.',
  },
  {
    slug: 'dhruv-diddi',
    name: 'Dhruv Diddi',
    region: 'North America',
    city: 'San Francisco',
    role: 'Founder / Engineer',
    company: 'Solo Tech',
    linkedinUrl: 'https://www.linkedin.com/in/dhruvdiddi/',
    photo: '/fellows/dhruv-diddi.jpg',
    tagline: 'Solo Tech runs more robotic arms than any other company in the Bay Area.',
  },
  {
    slug: 'sushmita-rashid',
    name: 'Sushmita Rashid',
    region: 'APJ',
    city: 'Dhaka',
    role: 'DevRel Engineer',
    company: '',
    linkedinUrl: 'https://www.linkedin.com/in/sushmitaaar/',
    photo: '/fellows/sushmita-rashid.jpg',
    tagline: 'Top DevRel content creator from Consensys.',
  },
  {
    slug: 'michael-ejeh',
    name: 'Michael Ejeh',
    region: 'EMEA',
    city: 'Birmingham',
    role: 'Ambassador',
    company: '',
    linkedinUrl: 'https://www.linkedin.com/in/micheal-marvelous-ejeh-6735711b6/',
    photo: '/fellows/michael-ejeh.jpg',
    tagline: 'Ambassador with deep ties to the UK builder scene.',
  },
  {
    slug: 'mike-lin',
    name: 'Mike Lin',
    region: 'APJ',
    city: 'Taipei',
    role: 'Community Founder',
    company: 'Tempo House',
    linkedinUrl: 'https://www.linkedin.com/in/mikelin9/',
    photo: '/fellows/mike-lin.jpg',
    tagline: 'Leads a popular builder community venue in Taipei.',
  },
  {
    slug: 'michael-s',
    name: 'Michael S',
    region: 'APJ',
    // Source had "Tapei" — normalized to Taipei to match Mike Lin above
    // and avoid two chips for the same city if we ever add a city filter.
    city: 'Taipei',
    role: 'Founder',
    company: 'ED3N',
    linkedinUrl: 'https://www.linkedin.com/in/miketpe/',
    photo: '/fellows/michael-s.jpg',
    tagline: 'Cohosts hackathons and builder events in Taipei.',
  },
  {
    slug: 'masaya-o',
    name: 'Masaya O',
    region: 'APJ',
    city: 'Tokyo',
    role: 'Community Leader',
    company: 'Akindo.io',
    linkedinUrl: 'https://www.linkedin.com/in/mozok/',
    photo: '/fellows/masaya-o.jpg',
    tagline: 'Built Akindo, a hackathon platform reaching millions of builders.',
  },
  {
    slug: 'yong-quan-tan',
    name: 'Yong Quan Tan',
    region: 'APJ',
    city: 'Singapore',
    role: '',
    company: 'AI Tinkerers',
    linkedinUrl: 'https://www.linkedin.com/in/yong-quan-tan/',
    photo: '/fellows/yong-quan-tan.jpg',
    tagline: 'Designs UGC content factories for performance marketing; hosts a podcast on Singapore tech leaders.',
  },
];

// Featured fellows — curated list rendered at the top of /fellows in a
// 4-column grid above the region-grouped roster. Source of truth for
// which slugs are featured lives here so the curation decision is in
// one place, not scattered across 20 entries as a boolean field.
export const FEATURED_SLUGS: ReadonlyArray<string> = [
  'linda-haviv',
  'maroon-ayoub',
  'dhruv-diddi',
  'rayyan-zahid',
  'rapha-gutsche',
  'boldrin-antony',
  'mel-cordoba',
  'kosseila-hd',
  'yong-quan-tan',
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
// first letter of the first and last name parts; Angel "Mel" Cordoba
// renders as "AC" rather than 'A"' because the quote characters are
// stripped before letter extraction.
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
