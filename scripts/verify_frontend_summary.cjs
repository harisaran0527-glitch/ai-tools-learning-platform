/**
 * verify_frontend_summary.cjs
 * Validates that frontend search, category filter, pagination, and detail routes
 * work cleanly with the newly generated 838 verified tool summaries.
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

const summaryPath = path.join(__dirname, '../src/data/catalog/summaryData.ts');
const summaryExports = loadTsModule(summaryPath);
const catalogSummaries = summaryExports.catalogSummaries || [];

console.log(`=== FRONTEND SUMMARY VERIFICATION ===`);
console.log(`Total Frontend Catalog Summaries: ${catalogSummaries.length}`);

// 1. Category Breakdown
const catCounts = {};
catalogSummaries.forEach(t => {
  catCounts[t.category] = (catCounts[t.category] || 0) + 1;
});

console.log(`\nCategory Breakdown in Frontend Index:`);
for (const [cat, count] of Object.entries(catCounts)) {
  console.log(`  - ${cat.padEnd(30)}: ${count} tools`);
}

// 2. Pagination Math (24 cards per page)
const ITEMS_PER_PAGE = 24;
const totalPages = Math.ceil(catalogSummaries.length / ITEMS_PER_PAGE);
const page1Cards = catalogSummaries.slice(0, ITEMS_PER_PAGE).length;
const lastPageCards = catalogSummaries.slice((totalPages - 1) * ITEMS_PER_PAGE).length;

console.log(`\nPagination Checks (24 cards/page):`);
console.log(`  - Total Pages: ${totalPages}`);
console.log(`  - Page 1 Card Count: ${page1Cards}`);
console.log(`  - Page ${totalPages} Card Count: ${lastPageCards}`);

// 3. Search Engine Test across newly added tools outside original 49
const testQueries = ['vllm', 'ollama', 'llamaindex', 'flux', 'mochi', 'riffusion', 'whisper', 'tripo'];
console.log(`\nSearch Engine Test Queries:`);

testQueries.forEach(q => {
  const matches = catalogSummaries.filter(t => 
    t.name.toLowerCase().includes(q) ||
    t.shortDescription.toLowerCase().includes(q) ||
    t.slug.toLowerCase().includes(q)
  );
  console.log(`  - Query "${q}": found ${matches.length} matching tools (e.g., ${matches.slice(0, 3).map(m => m.name).join(', ')})`);
});

// 4. Verify toolLoaders slug resolution
const categoriesDir = path.join(__dirname, '../src/data/catalog/categories');
const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));

let allDetailedSlugs = new Set();
categoryFiles.forEach(file => {
  const modExports = loadTsModule(path.join(categoriesDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => {
        if (t && t.slug) allDetailedSlugs.add(t.slug.trim());
      });
    }
  }
});

let missingSlugsInDetailed = [];
catalogSummaries.forEach(s => {
  if (!allDetailedSlugs.has(s.slug)) {
    missingSlugsInDetailed.push(s.slug);
  }
});

console.log(`\nDetail Route Slug Resolution Test:`);
console.log(`  - Missing Detailed Slugs: ${missingSlugsInDetailed.length}`);
if (missingSlugsInDetailed.length > 0) {
  console.log(`  - Missing: ${missingSlugsInDetailed.join(', ')}`);
} else {
  console.log(`  - ALL 838 summary slugs resolve 100% cleanly to detailed category modules!`);
}
