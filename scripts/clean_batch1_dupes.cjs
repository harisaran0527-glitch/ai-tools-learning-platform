const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const cleaned = code.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?/gm, '');
  const result = ts.transpileModule(cleaned, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', result.outputText);
  fn(mod, mod.exports);
  return mod.exports;
}

const catDir = path.join(__dirname, '../src/data/catalog/categories');
const searchFile = path.join(catDir, 'search_research.ts');
const focusedFile = path.join(catDir, 'focused_tools.ts');

// 1. Find all duplicates across categories
const seenSlugs = new Map();
const seenNames = new Map();

const categoryFiles = fs.readdirSync(catDir).filter(f => f.endsWith('.ts'));

let allTools = [];
categoryFiles.forEach(file => {
  const modExports = loadTsModule(path.join(catDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => allTools.push({ ...t, _file: file }));
    }
  }
});

console.log('Total tools before deduplication:', allTools.length);

// Remove duplicate batch1- items that collide with existing tools
const batch1Dupes = new Set();
allTools.forEach(t => {
  const s = (t.slug || '').toLowerCase();
  const n = (t.name || '').toLowerCase();

  if (s && seenSlugs.has(s)) {
    // If it's a batch1 item, mark it for removal
    if (t.id && t.id.startsWith('batch1-')) {
      batch1Dupes.add(t.id);
    } else if (seenSlugs.get(s).id && seenSlugs.get(s).id.startsWith('batch1-')) {
      batch1Dupes.add(seenSlugs.get(s).id);
    }
  } else if (s) {
    seenSlugs.set(s, t);
  }

  if (n && seenNames.has(n)) {
    if (t.id && t.id.startsWith('batch1-')) {
      batch1Dupes.add(t.id);
    } else if (seenNames.get(n).id && seenNames.get(n).id.startsWith('batch1-')) {
      batch1Dupes.add(seenNames.get(n).id);
    }
  } else if (n) {
    seenNames.set(n, t);
  }
});

console.log('Batch 1 duplicates to filter out:', batch1Dupes.size);

// Re-read search_research.ts and filter out batch1Dupes
let searchContent = fs.readFileSync(searchFile, 'utf8');
batch1Dupes.forEach(id => {
  // Regex to remove object with this id
  const reg = new RegExp(`\\s*{\\s*"id"\\s*:\\s*"${id}"[\\s\\S]*?}(,)?`, 'g');
  searchContent = searchContent.replace(reg, '');
});
fs.writeFileSync(searchFile, searchContent, 'utf8');

// Re-read focused_tools.ts and filter out batch1Dupes
let focusedContent = fs.readFileSync(focusedFile, 'utf8');
batch1Dupes.forEach(id => {
  const reg = new RegExp(`\\s*focused\\('${id}'[\\s\\S]*?\\)(,)?`, 'g');
  focusedContent = focusedContent.replace(reg, '');
});
fs.writeFileSync(focusedFile, focusedContent, 'utf8');

console.log('Deduplication cleanup complete!');
