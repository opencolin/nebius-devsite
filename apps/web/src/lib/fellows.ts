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
    role: 'Fellow',
    company: 'AI Agents Berlin',
    linkedinUrl: 'https://www.linkedin.com/in/raphael-gutsche/',
    photo: '/fellows/rapha-gutsche.jpg',
  },
  {
    slug: 'linda-haviv',
    name: 'Linda Haviv',
    region: 'North America',
    city: 'New York',
    role: '',
    company: '',
    linkedinUrl: 'https://www.linkedin.com/in/lindahaviv/',
    photo: '/fellows/linda-haviv.png',
  },
  {
    slug: 'mel-cordoba',
    name: 'Angel “Mel” Cordoba',
    region: 'LATAM',
    city: 'Mexico City',
    role: 'Ambassador / DevRel',
    company: 'Frutero Club',
    linkedinUrl: 'https://www.linkedin.com/in/mel-mc/',
    photo: '/fellows/mel-cordoba.jpg',
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
  },
  {
    slug: 'boldrin-antony',
    name: 'Boldrin Antony',
    region: 'APJ',
    city: 'Bangalore',
    role: 'Hackathon Organizer',
    company: 'Zo House',
    linkedinUrl: 'https://www.linkedin.com/in/boldrin-antony/',
    photo: '/fellows/boldrin-antony.jpg',
  },
  {
    slug: 'rayyan-zahid',
    name: 'Rayyan Zahid',
    region: 'North America',
    city: 'San Francisco',
    role: 'Developer / Leader',
    company: 'Immersive Commons',
    linkedinUrl: 'https://www.linkedin.com/in/rayyanzahid/',
    // From GitHub avatar — unavatar.io/linkedin returned the default
    // placeholder for this profile, so we sourced from his GitHub.
    photo: '/fellows/rayyan-zahid.png',
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
  },
];

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
