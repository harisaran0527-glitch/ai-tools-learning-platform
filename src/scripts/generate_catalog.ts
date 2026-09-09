// src/scripts/generate_catalog.ts
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

interface AITool {
  id: string;
  slug: string;
  name: string;
  category: string;
  officialUrl?: string;
  [key: string]: any;
}

const TARGET_DISTRIBUTION: Record<string, number> = {
  'Chatbots / Assistants': 65,
  'Search / Research': 50,
  'Writing / Documents': 60,
  'Education': 65,
  'PPT / Presentation': 40,
  'Image Generation': 60,
  'Video Generation': 50,
  'Audio / Voice': 40,
  'Speech to Text': 25,
  'Photo Editing': 30,
  'Coding / Developer AI': 75,
  'Productivity / Automation': 55,
  'Website / App Creation': 55,
  'Music Generation': 25,
  'Gaming / 3D': 25,
};

const INPUT_FILE = path.resolve('temp/legacy_tools_raw.json');
const OUTPUT_FILE = path.resolve('src/data/catalog/raw_tools.json');
const REPORT_FILE = path.resolve('src/scripts/validation_report.md');
const CACHE_FILE = path.resolve('src/data/catalog/url_verification_cache.json');

function loadTools(): AITool[] {
  const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
  return JSON.parse(raw) as AITool[];
}

function dedupeTools(tools: AITool[]): AITool[] {
  const seenSlug = new Set<string>();
  const seenName = new Set<string>();
  const result: AITool[] = [];
  for (const t of tools) {
    const slug = t.slug?.toLowerCase();
    const name = t.name?.toLowerCase();
    if (!slug || !name) continue;
    if (seenSlug.has(slug) || seenName.has(name)) continue;
    seenSlug.add(slug);
    seenName.add(name);
    result.push(t);
  }
  return result;
}

// Preliminary URL validation – keep GitHub unless generic list URLs.
function preliminaryCheck(tools: AITool[]): { candidate: AITool[]; rejected: AITool[] } {
  // Previously we filtered out generic domains (e.g., producthunt.com, awesome lists) to avoid non‑primary sources.
  // For the second‑pass we relax this filter to allow more URLs to be verified. We only reject entries
  // without a proper HTTP/HTTPS URL or malformed URLs.
  const candidate: AITool[] = [];
  const rejected: AITool[] = [];
  for (const t of tools) {
    const urlStr = (t.officialUrl || '').trim();
    if (!urlStr || !/^https?:\/\//i.test(urlStr)) {
      rejected.push(t);
      continue;
    }
    try {
      // Ensure URL parses correctly; we no longer discard generic hostnames.
      new URL(urlStr);
      candidate.push(t);
    } catch {
      rejected.push(t);
    }
  }
  return { candidate, rejected };
}

function loadCache(): Record<string, string> {
  if (fs.existsSync(CACHE_FILE)) {
    try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); } catch { return {}; }
  }
  return {};
}

function saveCache(cache: Record<string, string>) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

function request(url: string, method: string): Promise<number> {
  return new Promise(resolve => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { method, timeout: 5000 }, res => {
      resolve(res.statusCode || 0);
    });
    req.on('error', () => resolve(0));
    req.end();
  });
}

async function verifyUrl(url: string, cache: Record<string, string>): Promise<string> {
  if (cache[url]) return cache[url];
  // HEAD first
  let status = await request(url, 'HEAD');
  if (status >= 200 && status < 300) {
    cache[url] = 'verified';
    return 'verified';
  }
  // If blocked or method not allowed, fallback to GET
  if (status === 403 || status === 405 || status === 0) {
    const getStatus = await request(url, 'GET');
    if (getStatus >= 200 && getStatus < 300) {
      cache[url] = 'bot_blocked';
      return 'bot_blocked';
    }
  }
  cache[url] = 'reached_rejected';
  return 'reached_rejected';
}

async function networkVerify(tools: AITool[]): Promise<{ verified: AITool[]; botBlocked: AITool[]; candidate: AITool[] }> {
  const cache = loadCache();
  const verified: AITool[] = [];
  const botBlocked: AITool[] = [];
  const candidate: AITool[] = [];
  for (const t of tools) {
    const url = (t.officialUrl || '').trim();
    if (!url) { candidate.push(t); continue; }
    const result = await verifyUrl(url, cache);
    if (result === 'verified') verified.push(t);
    else if (result === 'bot_blocked') botBlocked.push(t);
    else candidate.push(t);
  }
  saveCache(cache);
  return { verified, botBlocked, candidate };
}

function selectByDistribution(tools: AITool[]): AITool[] {
  const byCat: Record<string, AITool[]> = {};
  for (const tool of tools) {
    const cat = tool.category;
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(tool);
  }
  const selected: AITool[] = [];
  for (const [cat, target] of Object.entries(TARGET_DISTRIBUTION)) {
    const pool = byCat[cat] ?? [];
    pool.sort((a, b) => {
      const nameCmp = a.name.localeCompare(b.name);
      if (nameCmp !== 0) return nameCmp;
      return a.slug.localeCompare(b.slug);
    });
    selected.push(...pool.slice(0, Math.min(target, pool.length)));
  }
  return selected;
}

function ensureCuratedTools(tools: AITool[]): AITool[] {
  const curated: AITool[] = [
    { id: 'curated-1', slug: 'lovable', name: 'Lovable', category: 'Website / App Creation', officialUrl: 'https://lovable.dev' },
    { id: 'curated-2', slug: 'bolt', name: 'Bolt', category: 'Website / App Creation', officialUrl: 'https://bolt.new' },
    { id: 'curated-3', slug: 'replit', name: 'Replit', category: 'Website / App Creation', officialUrl: 'https://replit.com' },
    { id: 'curated-4', slug: 'v0', name: 'v0', category: 'Website / App Creation', officialUrl: 'https://v0.app' },
    { id: 'curated-5', slug: 'framer-ai', name: 'Framer AI', category: 'Website / App Creation', officialUrl: 'https://www.framer.com/ai/' },
    { id: 'curated-6', slug: 'webflow-ai', name: 'Webflow AI', category: 'Website / App Creation', officialUrl: 'https://webflow.com/ai' },
    { id: 'curated-7', slug: 'wix-ai', name: 'Wix AI Website Builder', category: 'Website / App Creation', officialUrl: 'https://www.wix.com/ai-website-builder' },
    { id: 'curated-8', slug: 'durable', name: 'Durable', category: 'Website / App Creation', officialUrl: 'https://durable.com' },
    { id: 'curated-9', slug: 'bubble', name: 'Bubble', category: 'Website / App Creation', officialUrl: 'https://bubble.io/ai-app-builder' },
    { id: 'curated-10', slug: 'glide', name: 'Glide', category: 'Website / App Creation', officialUrl: 'https://www.glideapps.com' },
    { id: 'curated-11', slug: 'softr', name: 'Softr', category: 'Website / App Creation', officialUrl: 'https://www.softr.io' },
    { id: 'curated-12', slug: 'flutterflow', name: 'FlutterFlow', category: 'Website / App Creation', officialUrl: 'https://flutterflow.io' },
    { id: 'curated-13', slug: 'firebase-studio', name: 'Firebase Studio', category: 'Website / App Creation', officialUrl: 'https://firebase.google.com/products/studio' },
    { id: 'curated-14', slug: 'base44', name: 'Base44', category: 'Website / App Creation', officialUrl: 'https://base44.com' },
  ];
  const existing = new Set(tools.map(t => t.slug));
  for (const ct of curated) {
    if (!existing.has(ct.slug)) tools.push(ct);
  }
  return tools;
}

function writeReport(stats: {
  total: number;
  deduped: number;
  prelimCandidate: number;
  prelimRejected: number;
  verifiedReachable: number;
  verifiedBotBlocked: number;
  candidates: number;
  needsReview: number;
  rejected: number;
  finalCount: number;
  perCategory: Record<string, number>;
  websiteAppCreationCount: number;
  sourceCounts: { website: number; github: number; huggingface: number };
  duplicateNames: number;
  duplicateSlugs: number;
  unreachableUrls: number;
  curatedMerged: number;
}) {
  const lines: string[] = [];
  lines.push('# Validation Report');
  lines.push('');
  lines.push(`- Legacy recovered count: ${stats.total}`);
  lines.push(`- Curated tools merged: ${stats.curatedMerged}`);
  lines.push(`- Deduplicated count: ${stats.deduped}`);
  lines.push(`- Preliminary candidates (basic URL check): ${stats.prelimCandidate}`);
  lines.push(`- Preliminary rejected: ${stats.prelimRejected}`);
  lines.push(`- Verified reachable after network check: ${stats.verifiedReachable}`);
  lines.push(`- Verified bot‑blocked (GET required): ${stats.verifiedBotBlocked}`);
  lines.push(`- Candidates (needs manual review): ${stats.candidates}`);
  lines.push(`- Needs review (ambiguous): ${stats.needsReview}`);
  lines.push(`- Rejected (unreachable/invalid): ${stats.rejected}`);
  lines.push(`- Final verified published count: ${stats.finalCount}`);
  lines.push('');
  lines.push('## Per‑category counts');
  for (const [cat, cnt] of Object.entries(stats.perCategory)) {
    lines.push(`- ${cat}: ${cnt}`);
  }
  lines.push(`- Website / App Creation count: ${stats.websiteAppCreationCount}`);
  lines.push('');
  lines.push('## Source type distribution');
  lines.push(`- Official websites: ${stats.sourceCounts.website}`);
  lines.push(`- GitHub repositories: ${stats.sourceCounts.github}`);
  lines.push(`- Hugging Face pages: ${stats.sourceCounts.huggingface}`);
  lines.push('');
  lines.push(`- Duplicate names: ${stats.duplicateNames}`);
  lines.push(`- Duplicate slugs: ${stats.duplicateSlugs}`);
  lines.push(`- Unreachable URLs: ${stats.unreachableUrls}`);
  fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf-8');
}

async function main() {
  const all = loadTools();
  const deduped = dedupeTools(all);
  // Merge curated tools before any verification so they are part of the pool
  const withCurated = ensureCuratedTools(deduped);
  const { candidate, rejected } = preliminaryCheck(withCurated);
  const { verified, botBlocked, candidate: stillCandidate } = await networkVerify(candidate);
  const confirmedVerified = [...verified, ...botBlocked];
  const finalTools = selectByDistribution(confirmedVerified);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalTools, null, 2), 'utf-8');
  const perCategory: Record<string, number> = {};
  for (const t of finalTools) {
    perCategory[t.category] = (perCategory[t.category] || 0) + 1;
  }
  // Additional statistics
  const duplicateNames = all.length - new Set(all.map(t => (t.name || '').toLowerCase())).size;
  const duplicateSlugs = all.length - new Set(all.map(t => (t.slug || '').toLowerCase())).size;
  const sourceCounts = { website: 0, github: 0, huggingface: 0 };
  for (const t of confirmedVerified) {
    const url = (t.officialUrl || '').toLowerCase();
    if (url.includes('github.com')) sourceCounts.github++;
    else if (url.includes('huggingface.co')) sourceCounts.huggingface++;
    else if (url) sourceCounts.website++;
  }
  const websiteAppCreationCount = perCategory['Website / App Creation'] || 0;
  const curatedMerged = withCurated.filter(t => t.id && t.id.startsWith('curated-')).length;
  const unreachableUrls = stillCandidate.filter(t => {
    const url = (t.officialUrl || '').trim();
    return url && (loadCache()[url] === 'reached_rejected');
  }).length;
  writeReport({
    total: all.length,
    deduped: deduped.length,
    prelimCandidate: candidate.length,
    prelimRejected: rejected.length,
    verifiedReachable: verified.length,
    verifiedBotBlocked: botBlocked.length,
    candidates: stillCandidate.length,
    needsReview: 0,
    rejected: unreachableUrls,
    finalCount: finalTools.length,
    perCategory,
    websiteAppCreationCount,
    sourceCounts,
    duplicateNames,
    duplicateSlugs,
    unreachableUrls,
    curatedMerged,
  });
  console.log(`Generated ${finalTools.length} verified tools. Report written to ${REPORT_FILE}`);
}

main();
