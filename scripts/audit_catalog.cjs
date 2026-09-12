const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Helper to transpile TS file to CJS and evaluate it
function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  // Strip import statements
  const cleaned = code.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?/gm, '');
  const result = ts.transpileModule(cleaned, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', result.outputText);
  fn(mod, mod.exports);
  return mod.exports;
}

// 1. Load Homepage Summaries
const summaryPath = path.join(__dirname, '../src/data/catalog/summaryData.ts');
const summaryExports = loadTsModule(summaryPath);
const catalogSummaries = summaryExports.catalogSummaries || [];

// 2. Load Detailed Catalog Records from Category Files
const categoriesDir = path.join(__dirname, '../src/data/catalog/categories');
const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));

let detailedTools = [];
categoryFiles.forEach(file => {
  const modExports = loadTsModule(path.join(categoriesDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      detailedTools.push(...modExports[key]);
    }
  }
});

// Load URL Verification Cache if available
const cachePath = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');
let urlCache = {};
if (fs.existsSync(cachePath)) {
  try {
    urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    console.error('Error reading url_verification_cache.json:', e.message);
  }
}

// 3. Compute Audit Metrics
const detailedCount = detailedTools.length;
const summaryCount = catalogSummaries.length;

// Unique Tool Slugs & Names
const seenSlugs = new Map();
const seenNames = new Map();
const duplicateSlugs = [];
const duplicateNames = [];

detailedTools.forEach(tool => {
  if (!tool) return;
  const slug = (tool.slug || '').toLowerCase();
  const name = (tool.name || '').toLowerCase();

  if (slug) {
    if (seenSlugs.has(slug)) {
      duplicateSlugs.push(tool.slug);
    } else {
      seenSlugs.set(slug, tool);
    }
  }

  if (name) {
    if (seenNames.has(name)) {
      duplicateNames.push(tool.name);
    } else {
      seenNames.set(name, tool);
    }
  }
});

const uniqueToolSlugs = seenSlugs.size;
const uniqueProductCount = seenSlugs.size;

// Verification & Status Breakdown
let verifiedReachable = 0;
let verifiedIdentityBotBlocked = 0;
let legacyOfficialVerified = 0;
let candidateCount = 0;
let needsReviewCount = 0;
let rejectedCount = 0;
let websiteAppCreationCount = 0;

detailedTools.forEach(tool => {
  if (!tool) return;
  const url = (tool.officialUrl || '').trim();
  const cacheStatus = urlCache[url];

  if (tool.officialStatus === 'verified') {
    legacyOfficialVerified++;
  }

  if (cacheStatus === 'verified') {
    verifiedReachable++;
  } else if (cacheStatus === 'bot_blocked') {
    verifiedIdentityBotBlocked++;
  } else if (cacheStatus === 'rejected' || cacheStatus === 'reached_rejected') {
    rejectedCount++;
  } else if (tool.verificationStatus === 'candidate') {
    candidateCount++;
  } else if (tool.verificationStatus === 'needs_review') {
    needsReviewCount++;
  } else if (tool.verificationStatus === 'rejected') {
    rejectedCount++;
  } else if (url && !cacheStatus) {
    needsReviewCount++;
  } else if (!url) {
    needsReviewCount++;
  }

  if (tool.category === 'Website / App Creation') {
    websiteAppCreationCount++;
  }
});

console.log('=== CANONICAL AI TOOLS CATALOG AUDIT ===');
console.log(`detailed catalog record count: ${detailedCount}`);
console.log(`homepage summary count: ${summaryCount}`);
console.log(`unique tool slugs: ${uniqueToolSlugs}`);
console.log(`unique product count: ${uniqueProductCount}`);
console.log(`duplicate names: ${duplicateNames.length > 0 ? duplicateNames.join(', ') : 0}`);
console.log(`duplicate slugs: ${duplicateSlugs.length > 0 ? duplicateSlugs.join(', ') : 0}`);
console.log(`verified_reachable: ${verifiedReachable}`);
console.log(`verified_identity_bot_blocked: ${verifiedIdentityBotBlocked}`);
console.log(`legacy officialStatus=verified: ${legacyOfficialVerified}`);
console.log(`candidate: ${candidateCount}`);
console.log(`needs_review: ${needsReviewCount}`);
console.log(`rejected: ${rejectedCount}`);
console.log(`Website/App Creation count: ${websiteAppCreationCount}`);

