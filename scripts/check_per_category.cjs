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
const urlCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

const files = fs.readdirSync(catDir).filter(f => f.endsWith('.ts'));

const catStats = {};

files.forEach(f => {
  const modExports = loadTsModule(path.join(catDir, f));
  for (const k in modExports) {
    if (Array.isArray(modExports[k])) {
      modExports[k].forEach(t => {
        const cat = t.category || f;
        if (!catStats[cat]) catStats[cat] = { file: f, total: 0, verified: 0, reachable: 0, botBlocked: 0 };
        catStats[cat].total++;
        const url = (t.officialUrl || '').trim();
        const status = urlCache[url];
        if (status === 'verified') {
          catStats[cat].reachable++;
          catStats[cat].verified++;
        } else if (status === 'bot_blocked') {
          catStats[cat].botBlocked++;
          catStats[cat].verified++;
        }
      });
    }
  }
});

console.log('Category breakdown:');
let totalVerified = 0;
for (const [cat, stat] of Object.entries(catStats)) {
  console.log(`- ${cat} (${stat.file}): ${stat.verified} verified (${stat.reachable} reachable, ${stat.botBlocked} bot_blocked) / ${stat.total} total`);
  totalVerified += stat.verified;
}
console.log(`TOTAL VERIFIED PUBLISHED: ${totalVerified}`);
