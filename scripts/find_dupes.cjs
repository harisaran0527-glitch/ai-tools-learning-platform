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
const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));

let detailedTools = [];
categoryFiles.forEach(file => {
  const modExports = loadTsModule(path.join(categoriesDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => detailedTools.push({ ...t, _file: file }));
    }
  }
});

const nameMap = new Map();
detailedTools.forEach(t => {
  const name = (t.name || '').trim().toLowerCase();
  if (!nameMap.has(name)) nameMap.set(name, []);
  nameMap.get(name).push(t);
});

console.log('Duplicates found:');
for (const [name, list] of nameMap.entries()) {
  if (list.length > 1) {
    console.log(`Duplicate Name: "${name}" (${list.length} occurrences)`);
    list.forEach(item => console.log(`  - slug: ${item.slug} | name: ${item.name} | url: ${item.officialUrl} | file: ${item._file}`));
  }
}
