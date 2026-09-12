/**
 * remove_duplicate_stub_names.cjs
 * Removes duplicate stub entries (where name matches a verified tool but slug/url differs)
 * so that duplicate names = 0.
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
const urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));

// 1. Collect all tools
let allTools = [];
categoryFiles.forEach(file => {
  const modExports = loadTsModule(path.join(categoriesDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => {
        if (t && t.name) {
          allTools.push({ ...t, _file: file, _key: key });
        }
      });
    }
  }
});

// Group by normalized name
const nameGroups = new Map();
allTools.forEach(t => {
  const normName = t.name.trim().toLowerCase();
  if (!nameGroups.has(normName)) nameGroups.set(normName, []);
  nameGroups.get(normName).push(t);
});

const removeSlugsByFile = {};

for (const [normName, group] of nameGroups.entries()) {
  if (group.length > 1) {
    // Determine which one to keep (keep verified in cache first, or tool with officialUrl)
    group.sort((a, b) => {
      const aCache = urlCache[a.officialUrl || ''];
      const bCache = urlCache[b.officialUrl || ''];
      const aScore = (aCache === 'verified' ? 3 : aCache === 'bot_blocked' ? 2 : a.officialUrl ? 1 : 0);
      const bScore = (bCache === 'verified' ? 3 : bCache === 'bot_blocked' ? 2 : b.officialUrl ? 1 : 0);
      return bScore - aScore; // highest score first
    });

    const keeper = group[0];
    const toRemove = group.slice(1);

    console.log(`Deduplicating "${normName}": keeping slug "${keeper.slug}" (${keeper.officialUrl}), removing ${toRemove.length} duplicates.`);

    toRemove.forEach(rem => {
      if (!removeSlugsByFile[rem._file]) removeSlugsByFile[rem._file] = new Set();
      removeSlugsByFile[rem._file].add(rem.slug);
    });
  }
}

// 2. Remove specified slugs from category files
for (const [file, slugsSet] of Object.entries(removeSlugsByFile)) {
  const filePath = path.join(categoriesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  slugsSet.forEach(slug => {
    // Remove object with matching slug
    const regexStr = `\\{\\s*"id"[^}]*"slug"\\s*:\\s*"${slug}"[\\s\\S]*?\\}(?:,\\s*)?`;
    content = content.replace(new RegExp(regexStr, 'g'), '');

    const helperRegex = new RegExp(`focused\\([^)]*?'${slug}'[\\s\\S]*?\\);?\\n?`, 'g');
    content = content.replace(helperRegex, '');
  });

  content = content.replace(/,\s*];/g, '\n];');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned ${slugsSet.size} duplicate names from ${file}`);
}

console.log('Duplicate name cleanup complete.');
