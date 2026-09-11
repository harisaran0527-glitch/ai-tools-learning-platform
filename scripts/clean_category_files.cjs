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
  const modExports = loadTsModule(filePath);
  
  for (const exportKey in modExports) {
    if (Array.isArray(modExports[exportKey])) {
      let list = modExports[exportKey].filter(Boolean).filter(t => t.slug && t.name);
      
      // Re-write file cleanly if needed
      // Check if it's focused_tools or standard category array
      if (file === 'focused_tools.ts') {
        // preserve focused helper if wanted, or re-serialize array
      } else {
        const importLine = `import { AITool } from '../../../types/tool';\n\n`;
        const exportLine = `export const ${exportKey}: AITool[] = ${JSON.stringify(list, null, 2)};\n`;
        fs.writeFileSync(filePath, importLine + exportLine, 'utf8');
        console.log(`Cleaned and formatted ${file} (${list.length} valid tools)`);
      }
    }
  }
});
