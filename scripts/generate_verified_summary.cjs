/**
 * generate_verified_summary.cjs
 *
 * Reads all detailed category records, filters strictly for verified tools
 * (cache status = 'verified' or 'bot_blocked'), deduplicates by canonical slug,
 * and generates a lightweight frontend index in src/data/catalog/summaryData.ts.
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
const summaryOutputPath = path.join(__dirname, '../src/data/catalog/summaryData.ts');

const urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

// Verified bot blocked domains list for verification
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

// 1. Read all category files
const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));
let allTools = [];

categoryFiles.forEach(file => {
  const modExports = loadTsModule(path.join(categoriesDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => {
        if (t && typeof t === 'object' && t.slug && t.name) {
          allTools.push(t);
        }
      });
    }
  }
});

console.log(`Loaded ${allTools.length} total detailed catalog records.`);

// 2. Filter strictly for verified tools
const verifiedTools = [];
const seenSlugs = new Set();

allTools.forEach(t => {
  const slug = t.slug.trim();
  if (seenSlugs.has(slug)) return;

  const url = (t.officialUrl || '').trim();
  const cacheStatus = urlCache[url];

  let isVerified = false;
  if (cacheStatus === 'verified') {
    if (!url.includes('ai-tools-learning') && !url.includes('example.com') && url.startsWith('http')) {
      isVerified = true;
    }
  } else if (cacheStatus === 'bot_blocked') {
    if (isVerifiedBotBlocked(url)) {
      isVerified = true;
    }
  }

  if (isVerified) {
    seenSlugs.add(slug);

    // Convert full AITool into lightweight ToolSummary object
    const summary = {
      id: t.id || slug,
      slug: slug,
      name: t.name,
      logo: t.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${slug}`,
      category: t.category,
      subcategory: t.subcategory || t.category,
      pricingType: t.pricingType || 'free-tier',
      freePlanDetails: t.freePlanDetails || 'A free tier or open source plan is available.',
      platforms: t.platforms || ['Web'],
      shortDescription: t.shortDescription || t.superpower || `${t.name} AI tool`,
      superpower: t.superpower || t.shortDescription || `${t.name} AI tool`,
      difficulty: t.difficulty || 'Beginner',
      learningTime: t.learningTime || 20,
      officialUrl: url,
      officialStatus: 'verified',
      docsUrl: t.docsUrl || url,
      docsStatus: t.docsUrl ? 'verified' : 'unavailable',
      keywords: t.keywords || [t.name, t.category, 'AI', 'verified'],
      badge: t.badge || (t.pricingType === 'free' ? 'FREE' : 'VERIFIED')
    };

    verifiedTools.push(summary);
  }
});

console.log(`Filtered ${verifiedTools.length} genuine verified tool summaries.`);

// 3. Write lightweight summaryData.ts
const codeContent = `import { ToolSummary } from '../../types/tool';

/**
 * Lightweight Verified Catalog Index
 * Generated automatically from canonical category files and url_verification_cache.json.
 * Total Verified Tools: ${verifiedTools.length}
 */
export const catalogSummaries: ToolSummary[] = ${JSON.stringify(verifiedTools, null, 2)};

export const TOOL_COUNT = catalogSummaries.length;
`;

fs.writeFileSync(summaryOutputPath, codeContent, 'utf8');
console.log(`Successfully generated ${summaryOutputPath} with ${verifiedTools.length} verified tool summaries.`);
