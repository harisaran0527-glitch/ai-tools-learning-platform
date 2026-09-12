/**
 * fix_duplicate_tool_names.cjs
 * Ensures every catalog tool record has a unique product name.
 * If multiple tools share the exact name, disambiguates them cleanly (e.g., "Voicemaker AI", "Wordtune Writer", etc.)
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

// 1. Gather all tools across category files
let allTools = [];
categoryFiles.forEach(file => {
  const filePath = path.join(categoriesDir, file);
  const modExports = loadTsModule(filePath);
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => {
        if (t && t.slug && t.name) {
          allTools.push({ tool: t, file, key });
        }
      });
    }
  }
});

// Group tools by lowercase name
const nameMap = new Map();
allTools.forEach(item => {
  const normName = item.tool.name.trim().toLowerCase();
  if (!nameMap.has(normName)) nameMap.set(normName, []);
  nameMap.get(normName).push(item);
});

let renamedCount = 0;

for (const [normName, group] of nameMap.entries()) {
  if (group.length > 1) {
    console.log(`Disambiguating ${group.length} items named "${group[0].tool.name}"...`);
    
    group.forEach((item, idx) => {
      // If it's not the first item, or if both need clear distinction
      if (idx > 0) {
        const oldName = item.tool.name;
        // Differentiate based on category or slug
        const categoryLabel = item.tool.category ? item.tool.category.split('/')[0].trim() : 'AI';
        const newName = `${oldName} (${categoryLabel})`;
        
        // Update in file content
        const filePath = path.join(categoriesDir, item.file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace exact string name for this tool's slug block
        // Search for "slug": "item.tool.slug" ... "name": "oldName"
        const slug = item.tool.slug;
        const re = new RegExp(`("slug"\\s*:\\s*"${slug}"[\\s\\S]*?"name"\\s*:\\s*)"${oldName.replace(/[-[\]{}()*+?.:=\\^$|#\s]/g, '\\$&')}"`, 'g');
        
        if (re.test(content)) {
          content = content.replace(re, `$1"${newName}"`);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  File ${item.file}: Renamed "${oldName}" (slug: ${slug}) -> "${newName}"`);
          renamedCount++;
        } else {
          // Try focused syntax if present: focused('id', 'slug', 'oldName', ...)
          const helperRe = new RegExp(`(focused\\([^)]*?'${slug}'\\s*,\\s*')"${oldName.replace(/[-[\]{}()*+?.:=\\^$|#\s]/g, '\\$&')}"`, 'g');
          if (helperRe.test(content)) {
            content = content.replace(helperRe, `$1"${newName}"`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  File ${item.file}: Renamed focused "${oldName}" (slug: ${slug}) -> "${newName}"`);
            renamedCount++;
          }
        }
      }
    });
  }
}

console.log(`\nRenamed ${renamedCount} duplicate names to establish unique product names.`);
