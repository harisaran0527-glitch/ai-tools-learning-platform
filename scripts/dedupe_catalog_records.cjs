/**
 * dedupe_catalog_records.cjs
 * Removes empty-URL duplicate stubs in category files where a tool with a verified officialUrl exists.
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
const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));

categoryFiles.forEach(file => {
  const filePath = path.join(categoriesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const modExports = loadTsModule(filePath);
  let modified = false;

  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      const arr = modExports[key];
      const seenNames = new Map();
      const removeSlugs = new Set();

      arr.forEach(t => {
        const name = (t.name || '').trim().toLowerCase();
        const url = (t.officialUrl || '').trim();
        
        if (seenNames.has(name)) {
          const prev = seenNames.get(name);
          const prevUrl = (prev.officialUrl || '').trim();
          
          if (!url && prevUrl) {
            // current tool has no URL, previous tool has URL -> remove current tool
            removeSlugs.add(t.slug);
          } else if (url && !prevUrl) {
            // current tool has URL, previous tool has no URL -> remove previous tool
            removeSlugs.add(prev.slug);
            seenNames.set(name, t);
          } else if (!url && !prevUrl) {
            // both have no URL -> remove current
            removeSlugs.add(t.slug);
          }
        } else {
          seenNames.set(name, t);
        }
      });

      if (removeSlugs.size > 0) {
        console.log(`File ${file}: removing ${removeSlugs.size} empty/duplicate stubs:`, Array.from(removeSlugs).join(', '));
        // Remove objects with these slugs from array in file content
        removeSlugs.forEach(slug => {
          // Regex to remove the object matching slug
          // Match `{ [^}]* "slug": "slug" [^}]* }` or similar in object literal / TS format
          const regexStr = `\\{\\s*"id"[^}]*"slug"\\s*:\\s*"${slug}"[\\s\\S]*?\\}(?:,\\s*)?`;
          const re = new RegExp(regexStr, 'g');
          content = content.replace(re, '');

          // Also match helper format if focused: focused('id', 'slug', ...),
          const helperRegex = new RegExp(`focused\\([^)]*?'${slug}'[\\s\\S]*?\\);?\\n?`, 'g');
          content = content.replace(helperRegex, '');
        });
        modified = true;
      }
    }
  }

  if (modified) {
    // Clean trailing commas in array if any
    content = content.replace(/,\s*];/g, '\n];');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('Deduplication complete.');
