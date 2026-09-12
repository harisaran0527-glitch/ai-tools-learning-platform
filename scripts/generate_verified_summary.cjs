const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const categoriesDir = path.join(__dirname, '../src/data/catalog/categories');
const cachePath = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');
const summaryOutputPath = path.join(__dirname, '../src/data/catalog/summaryData.ts');
const VERIFIED_CACHE_STATUSES = new Set(['verified', 'bot_blocked']);

function loadTsModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const withoutImports = source.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?/gm, '');
  const result = ts.transpileModule(withoutImports, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const module = { exports: {} };
  new Function('module', 'exports', result.outputText)(module, module.exports);
  return module.exports;
}

const urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const categoryFiles = fs.readdirSync(categoriesDir)
  .filter(file => file.endsWith('.ts'))
  .sort();
const records = [];

for (const file of categoryFiles) {
  const moduleKey = path.basename(file, '.ts');
  const moduleExports = loadTsModule(path.join(categoriesDir, file));
  for (const exportedValue of Object.values(moduleExports)) {
    if (!Array.isArray(exportedValue)) continue;
    for (const tool of exportedValue) {
      if (tool && typeof tool === 'object' && tool.slug && tool.name) {
        records.push({ tool, moduleKey });
      }
    }
  }
}

const verified = [];
const seenSlugs = new Set();
const seenNames = new Set();

for (const { tool, moduleKey } of records) {
  const slug = String(tool.slug).trim();
  const name = String(tool.name).trim();
  const status = urlCache[String(tool.officialUrl || '').trim()];
  if (!VERIFIED_CACHE_STATUSES.has(status)) continue;

  const slugKey = slug.toLowerCase();
  const nameKey = name.toLowerCase();
  if (seenSlugs.has(slugKey) || seenNames.has(nameKey)) continue;
  seenSlugs.add(slugKey);
  seenNames.add(nameKey);

  verified.push({
    id: tool.id || slug,
    slug,
    name,
    logo: tool.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${slug}`,
    category: tool.category,
    subcategory: tool.subcategory || tool.category,
    pricingType: tool.pricingType || 'free-tier',
    freePlanDetails: tool.freePlanDetails || 'A free tier or open-source plan is available.',
    platforms: tool.platforms || ['Web'],
    shortDescription: tool.shortDescription || tool.superpower || `${name} AI tool`,
    superpower: tool.superpower || tool.shortDescription || `${name} AI tool`,
    difficulty: tool.difficulty || 'Beginner',
    learningTime: tool.learningTime || 20,
    officialUrl: String(tool.officialUrl || '').trim(),
    officialStatus: 'verified',
    docsUrl: tool.docsUrl || tool.officialUrl,
    docsStatus: tool.docsUrl ? 'verified' : 'unavailable',
    keywords: tool.keywords || [name, tool.category, tool.subcategory || tool.category, 'AI'],
    badge: tool.badge || 'VERIFIED'
  });
  verified[verified.length - 1].moduleKey = moduleKey;
}

const moduleBySlug = Object.fromEntries(verified.map(tool => [tool.slug, tool.moduleKey]));
const summaries = verified.map(({ moduleKey, ...summary }) => summary);

const output = `import { ToolSummary } from '../../types/tool';

/** Generated from detailed category records and the canonical verification cache. */
export const catalogSummaries: ToolSummary[] = ${JSON.stringify(summaries, null, 2)};

export const toolModuleBySlug: Record<string, string> = ${JSON.stringify(moduleBySlug, null, 2)};

export const TOOL_COUNT = catalogSummaries.length;
`;

fs.writeFileSync(summaryOutputPath, output, 'utf8');
console.log(`CANONICAL_VERIFIED_COUNT=${verified.length}`);
console.log(`FRONTEND_SUMMARY_COUNT=${summaries.length}`);
console.log(`Generated ${summaryOutputPath}`);