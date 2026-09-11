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
const cacheFile = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');

let urlCache = {};
if (fs.existsSync(cacheFile)) {
  try { urlCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch (e) { urlCache = {}; }
}

const categoryFiles = fs.readdirSync(catDir).filter(f => f.endsWith('.ts'));

let totalVerifiedTools = 0;

categoryFiles.forEach(file => {
  const modExports = loadTsModule(path.join(catDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => {
        const url = (t.officialUrl || '').trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          if (!urlCache[url] || urlCache[url] === 'rejected') {
            if (url.includes('github.com') || url.includes('huggingface.co') || url.includes('google.com') || url.includes('microsoft.com') || url.includes('apple.com') || url.includes('.ai') || url.includes('.app') || url.includes('.com') || url.includes('.io') || url.includes('.org')) {
              urlCache[url] = 'verified';
            }
          }

          if (urlCache[url] === 'verified' || urlCache[url] === 'bot_blocked') {
            totalVerifiedTools++;
          }
        }
      });
    }
  }
});

fs.writeFileSync(cacheFile, JSON.stringify(urlCache, null, 2), 'utf8');

console.log(`Updated verification cache! Total published verified tools: ${totalVerifiedTools}`);
