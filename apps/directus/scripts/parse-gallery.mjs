#!/usr/bin/env node
// Parses the two hackathon gallery dumps (gallery-source/robotics.txt and
// gallery-source/jetbrains.txt) into a unified projects seed JSON.
//
// Each project gets:
//   - slug, title, tagline, description, builder_handle, members, repo_url
//   - hackathon: 'robotics' | 'jetbrains'
//   - award: 'winner' | 'runner-up' | '3rd' | 'finalist' | undefined
//   - product_focus: keyword-inferred from description
//   - tags: keyword-inferred from description
//   - category: 'Other' if the description mentions neither Nebius nor Tavily,
//     otherwise undefined (= the default — meaning "uses sponsor tech")
//
// Output: ../seed/projects.generated.json (consumed by seed.mjs).

import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.join(__dirname, 'gallery-source');
const OUT_PATH = path.join(__dirname, '..', 'seed', 'projects.generated.json');

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

function parseGallery(text, hackathon) {
  const projects = [];
  const cards = text.split(/^#(\d+)\s*$/m).slice(1); // [num, body, num, body, ...]
  for (let i = 0; i < cards.length; i += 2) {
    const num = parseInt(cards[i], 10);
    const body = cards[i + 1] ?? '';
    const lines = body.trim().split(/\n/);
    if (lines.length < 4) continue;

    const title = lines[0].trim();
    const membersMatch = lines[1].match(/(\d+)\s+member/);
    const members = membersMatch ? parseInt(membersMatch[1], 10) : 1;

    // Find repo URL (line after "GitHub Repository" or first http github link)
    let repoUrl = null;
    const repoIdx = lines.findIndex((l) => /^GitHub Repository/.test(l));
    if (repoIdx >= 0 && repoIdx + 1 < lines.length) {
      repoUrl = lines[repoIdx + 1].trim();
    }

    // Description (between "Project Description" and the next bracketed marker / "Submitted by:")
    let description = '';
    const descIdx = lines.findIndex((l) => /^Project Description/.test(l));
    if (descIdx >= 0) {
      const descLines = [];
      for (let j = descIdx + 1; j < lines.length; j++) {
        const line = lines[j];
        if (/^\[AWARD:/.test(line) || /^Submitted by:/.test(line)) break;
        descLines.push(line);
      }
      description = descLines.join(' ').trim().replace(/\s+/g, ' ');
    }

    // Award
    let award;
    const awardMatch = body.match(/\[AWARD:\s*(winner|runner-up|3rd|finalist)\]/);
    if (awardMatch) award = awardMatch[1];

    // Submitter name (used as builder_handle slug)
    let builderHandle = 'unknown';
    const subMatch = body.match(/Submitted by:\s*([^\n]+)/);
    if (subMatch) {
      builderHandle = slugify(subMatch[1]);
    }

    // Slug from title — keep stable, hackathon-prefixed to avoid clashes
    const slug = `${hackathon}-${slugify(title) || `entry-${num}`}`;

    // First sentence = tagline (paraphrased to ≤ 200 chars)
    const tagline = (description.split(/(?<=[.?!])\s+/)[0] ?? description).slice(0, 200);

    // Inferred product focus + tags
    const product_focus = inferProductFocus(description);
    const tags = inferTags(description);

    // Category = Other if neither Nebius nor Tavily appears in the text
    const haystack = `${title}\n${description}`.toLowerCase();
    const usesNebius =
      /\bnebius\b|token factory|ai cloud|openclaw|soperator|gravity ui/.test(haystack);
    const usesTavily = /\btavily\b/.test(haystack);
    const category = usesNebius || usesTavily ? undefined : 'Other';

    projects.push({
      slug,
      title,
      tagline,
      description,
      builder_handle: builderHandle,
      members,
      tags,
      product_focus,
      repo_url: repoUrl,
      stars: 0,
      featured: Boolean(award),
      hackathon,
      award,
      category,
    });
  }
  return projects;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const PRODUCT_KEYWORDS = {
  tokenfactory: /token factory|tokenfactory/i,
  aicloud: /\bai cloud\b/i,
  openclaw: /openclaw/i,
  soperator: /soperator/i,
};

function inferProductFocus(text) {
  const out = [];
  for (const [key, re] of Object.entries(PRODUCT_KEYWORDS)) {
    if (re.test(text)) out.push(key);
  }
  return out;
}

const TAG_KEYWORDS = {
  python: /\bpython\b/i,
  typescript: /\btypescript|tsx?\b/i,
  ros2: /\bros2\b/i,
  mujoco: /\bmujoco\b/i,
  llama: /\bllama\b/i,
  qwen: /\bqwen\b/i,
  deepseek: /\bdeepseek\b/i,
  gemma: /\bgemma\b/i,
  tavily: /\btavily\b/i,
  rl: /\bRL\b|reinforcement learning/i,
  fastapi: /fastapi/i,
  nextjs: /next\.js|nextjs/i,
  react: /\breact\b/i,
  vision: /vision-language|vlm|computer vision/i,
  agents: /\bagents?\b|multi-?agent/i,
  robotics: /\brobot|humanoid|drone/i,
  voice: /\bvoice\b|whisper|gemini live/i,
  jetbrains: /jetbrains|intellij|pycharm/i,
  codex: /\bcodex\b/i,
  supabase: /supabase/i,
  vercel: /\bvercel\b/i,
};

function inferTags(text) {
  const out = [];
  for (const [key, re] of Object.entries(TAG_KEYWORDS)) {
    if (re.test(text)) out.push(key);
  }
  return out.slice(0, 6);
}

// -----------------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------------

const sources = readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.txt'));
const all = [];
for (const file of sources) {
  const hackathon = path.basename(file, '.txt'); // 'robotics' or 'jetbrains'
  const text = readFileSync(path.join(SOURCE_DIR, file), 'utf8');
  const parsed = parseGallery(text, hackathon);
  console.log(`  ${file}: parsed ${parsed.length} projects`);
  all.push(...parsed);
}

// Deduplicate by slug (later wins; in practice slugs are hackathon-prefixed so
// no collisions, but be safe)
const bySlug = new Map();
for (const p of all) bySlug.set(p.slug, p);
const out = Array.from(bySlug.values());

// Stats
const totalsByHack = out.reduce((acc, p) => {
  acc[p.hackathon] = (acc[p.hackathon] ?? 0) + 1;
  return acc;
}, {});
const otherCount = out.filter((p) => p.category === 'Other').length;
const awardCount = out.filter((p) => p.award).length;

writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
console.log(`\n✓ Wrote ${out.length} projects to ${path.relative(process.cwd(), OUT_PATH)}`);
console.log(`  by hackathon: ${JSON.stringify(totalsByHack)}`);
console.log(`  with awards: ${awardCount}`);
console.log(`  tagged "Other" (no Nebius/Tavily): ${otherCount}`);
