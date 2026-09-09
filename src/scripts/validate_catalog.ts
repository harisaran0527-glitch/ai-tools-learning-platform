// src/scripts/validate_catalog.ts
import * as fs from 'fs';
import * as path from 'path';

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
  Education: 65,
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
const REPORT_FILE = path.resolve('validation_report.md');

function loadTools(): AITool[] {
  const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
  return JSON.parse(raw) as AITool[];
}

function dedupeTools(tools: AITool[]): AITool[] {
  const seenSlug = new Set<string>();
  const seenName = new Set<string>();
  const result: AITool[] = [];
  for (const tool of tools) {
    const slug = tool.slug?.toLowerCase();
    const name = tool.name?.toLowerCase();
    if (!slug || !name) continue;
    if (seenSlug.has(slug) || seenName.has(name)) continue;
    seenSlug.add(slug);
    seenName.add(name);
    result.push(tool);
  }
  return result;
}

function filterValid(tools: AITool[]): AITool[] {
  return tools.filter(t => t.officialUrl && /^https?:\/\//.test(t.officialUrl.trim()));
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
    // simple shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const count = Math.min(target, pool.length);
    selected.push(...pool.slice(0, count));
  }
  const totalDesired = Object.values(TARGET_DISTRIBUTION).reduce((a, b) => a + b, 0);
  if (selected.length < totalDesired) {
    const remaining = tools.filter(t => !selected.includes(t));
    for (let i = 0; i < totalDesired - selected.length && i < remaining.length; i++) {
      selected.push(remaining[i]);
    }
  }
  return selected;
}

function writeReport(total: number, afterDedup: number, afterFilter: number, finalCount: number, finalTools: AITool[]) {
  const lines = [];
  lines.push('# Validation Report');
  lines.push('');
  lines.push(`- Initial raw count: ${total}`);
  lines.push(`- After deduplication: ${afterDedup}`);
  lines.push(`- After primary‑source filter: ${afterFilter}`);
  lines.push(`- Final selected tools: ${finalCount}`);
  lines.push('');
  lines.push('## Per‑category counts');
  const catCounts: Record<string, number> = {};
  for (const t of finalTools) {
    catCounts[t.category] = (catCounts[t.category] || 0) + 1;
  }
  for (const [cat, cnt] of Object.entries(catCounts)) {
    lines.push(`- ${cat}: ${cnt}`);
  }
  fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf-8');
}

// Execute
const all = loadTools();
const deduped = dedupeTools(all);
const filtered = filterValid(deduped);
const finalTools = selectByDistribution(filtered);

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalTools, null, 2), 'utf-8');
writeReport(all.length, deduped.length, filtered.length, finalTools.length, finalTools);
console.log(`Validation complete. Selected ${finalTools.length} tools. Report at ${REPORT_FILE}`);
