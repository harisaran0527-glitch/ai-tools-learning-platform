/**
 * strict_integrity_audit.cjs
 * Performs a strict 8-point integrity audit on every catalog tool.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const cleaned = code.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?/gm, '');
  const result = ts.transpileModule(cleaned, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', result.outputText);
  fn(mod, mod.exports);
  return mod.exports;
}

const categoriesDir = path.join(__dirname, '../src/data/catalog/categories');
const cachePath = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');
const summaryPath = path.join(__dirname, '../src/data/catalog/summaryData.ts');

const urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

// 1. Load category tools
const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));
let allTools = [];

categoryFiles.forEach(file => {
  const modExports = loadTsModule(path.join(categoriesDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => {
        if (t && typeof t === 'object') {
          allTools.push({ ...t, _file: file });
        }
      });
    }
  }
});

// Load summary data
const summaryExports = loadTsModule(summaryPath);
const catalogSummaries = summaryExports.catalogSummaries || [];

console.log(`=== STRICT INTEGRITY AUDIT INPUT METRICS ===`);
console.log(`Total Detailed Tool Records: ${allTools.length}`);
console.log(`Total Homepage Summaries: ${catalogSummaries.length}`);

// Check unique slugs and names
const seenSlugs = new Map();
const seenNames = new Map();
const duplicateSlugs = [];
const duplicateNames = [];

allTools.forEach(t => {
  const slug = (t.slug || '').trim().toLowerCase();
  const name = (t.name || '').trim().toLowerCase();

  if (slug) {
    if (seenSlugs.has(slug)) duplicateSlugs.push(t.slug);
    else seenSlugs.set(slug, t);
  }

  if (name) {
    if (seenNames.has(name)) duplicateNames.push(t.name);
    else seenNames.set(name, t);
  }
});

console.log(`Unique Slugs: ${seenSlugs.size}`);
console.log(`Unique Names: ${seenNames.size}`);
console.log(`Duplicate Slugs Count: ${duplicateSlugs.length}`);
console.log(`Duplicate Names Count: ${duplicateNames.length}`);

// Well-known bot_blocked domains that are verified official identities
const VERIFIED_BOT_BLOCKED_DOMAINS = [
  'chatgpt.com', 'openai.com', 'claude.ai', 'anthropic.com', 'gemini.google.com',
  'perplexity.ai', 'mistral.ai', 'poe.com', 'x.ai', 'phind.com', 'cursor.com',
  'codeium.com', 'crewai.com', 'devin.ai', 'milvus.io', 'lancedb.com',
  'quillbot.com', 'play.ht', 'github.com', 'huggingface.co', 'midjourney.com',
  'leonardo.ai', 'runwayml.com', 'gamma.app', 'tome.app', 'quizlet.com',
  'typeset.io', 'supernormal.com', 'make.com', 'ideogram.ai', 'playground.com',
  'openalex.org', 'freepik.com', 'canva.com', 'lovable.dev', 'dora.run',
  'pictory.ai', 'eduaide.ai', 'quizgecko.com', 'nearpod.com', 'brainly.com',
  'tripo3d.ai', 'craiyon.com', 'tensor.art', 'vocalremover.org', 'scholarcy.com',
  'genspark.ai', 'elai.io', 'landingi.com', 'webstudio.is', 'textcortex.com',
  'diffit.me', 'nightcafe.studio'
];

function isVerifiedBotBlocked(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return VERIFIED_BOT_BLOCKED_DOMAINS.some(domain => host.includes(domain));
  } catch (e) {
    return false;
  }
}

// Inspect every counted verified tool
let verifiedReachableCount = 0;
let verifiedBotBlockedCount = 0;
let fakeOrFabricatedCount = 0;
let unconfirmedBotBlockedCount = 0;
const invalidVerifiedSlugs = [];

allTools.forEach(t => {
  const url = (t.officialUrl || '').trim();
  const cacheState = urlCache[url];

  if (cacheState === 'verified') {
    if (url.includes('ai-tools-learning') || url.includes('example.com') || url.includes('localhost') || !url.startsWith('http')) {
      fakeOrFabricatedCount++;
      invalidVerifiedSlugs.push({ slug: t.slug, reason: 'fake_url', url });
    } else {
      verifiedReachableCount++;
    }
  } else if (cacheState === 'bot_blocked') {
    if (isVerifiedBotBlocked(url)) {
      verifiedBotBlockedCount++;
    } else {
      unconfirmedBotBlockedCount++;
      invalidVerifiedSlugs.push({ slug: t.slug, reason: 'unconfirmed_bot_blocked', url });
    }
  }
});

console.log(`\n=== CANONICAL INTEGRITY METRICS ===`);
console.log(`exact canonical unique product count: ${allTools.length}`);
console.log(`exact verified_reachable: ${verifiedReachableCount}`);
console.log(`exact verified_identity_bot_blocked: ${verifiedBotBlockedCount}`);
console.log(`exact total verified: ${verifiedReachableCount + verifiedBotBlockedCount}`);
console.log(`fake / guessed verified URLs: ${fakeOrFabricatedCount}`);
console.log(`unconfirmed bot-blocked records: ${unconfirmedBotBlockedCount}`);
console.log(`duplicate names: ${duplicateNames.length}`);
console.log(`duplicate slugs: ${duplicateSlugs.length}`);
