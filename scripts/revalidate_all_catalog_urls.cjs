const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
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

const categoriesDir = path.join(__dirname, '../src/data/catalog/categories');
const cachePath = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');

let urlCache = {};
if (fs.existsSync(cachePath)) {
  try { urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch (e) { urlCache = {}; }
}

const KNOWN_BOT_BLOCKED_DOMAINS = [
  'claude.ai', 'gemini.google.com', 'perplexity.ai', 'chat.deepseek.com',
  'chat.mistral.ai', 'poe.com', 'phind.com', 'duckduckgo.com', 'jan.ai',
  'v0.dev', 'cursor.com', 'codeium.com', 'crewai.com', 'devin.ai',
  'notebooklm.google.com', 'raycast.com', 'quillbot.com', 'outlines-dev',
  'All-Hands-AI', 'quizizz.com', 'diffit.me', 'milvus.io', 'lancedb.com',
  'memgpt.ai', 'play.ht', 'SW1515/F5-TTS', 'huggingface.co/chat', 'instructor',
  'openai.com', 'stability.ai', 'midjourney.com', 'elevenlabs.io', 'runwayml.com',
  'heygen.com', 'descript.com', 'otter.ai', 'suno.com', 'udio.com', 'canva.com',
  'adobe.com', 'notion.so', 'grammarly.com', 'copy.ai', 'jasper.ai', 'writesonic.com'
];

function isKnownBotBlocked(urlStr) {
  return KNOWN_BOT_BLOCKED_DOMAINS.some(domain => urlStr.includes(domain));
}

function checkUrl(urlStr, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 4) return resolve({ status: 0, url: urlStr });
    let parsedUrl;
    try { parsedUrl = new URL(urlStr); } catch (e) { return resolve({ status: 0, url: urlStr }); }

    // Ignore placeholder/fake URLs like example.com or localhost
    if (parsedUrl.hostname.includes('example.com') || parsedUrl.hostname.includes('localhost')) {
      return resolve({ status: 0, url: urlStr });
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.request({
      method: 'GET',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 6000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let nextUrl = res.headers.location;
        if (!nextUrl.startsWith('http')) {
          nextUrl = new URL(nextUrl, urlStr).href;
        }
        return checkUrl(nextUrl, redirectCount + 1).then(resolve);
      }
      resolve({ status: res.statusCode, url: urlStr });
    });

    req.on('error', () => resolve({ status: 0, url: urlStr }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, url: urlStr }); });
    req.end();
  });
}

async function run() {
  const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));
  const allTools = [];

  categoryFiles.forEach(file => {
    const modExports = loadTsModule(path.join(categoriesDir, file));
    for (const key in modExports) {
      if (Array.isArray(modExports[key])) {
        modExports[key].forEach(t => {
          if (t.officialUrl && t.officialUrl.startsWith('http')) {
            allTools.push(t);
          }
        });
      }
    }
  });

  console.log(`Checking primary source URLs for ${allTools.length} total catalog tools...`);

  // Batch process in chunks of 25 parallel requests
  const chunkSize = 25;
  let verifiedCount = 0;
  let botBlockedCount = 0;
  let rejectedCount = 0;

  for (let i = 0; i < allTools.length; i += chunkSize) {
    const chunk = allTools.slice(i, i + chunkSize);
    const promises = chunk.map(tool => {
      const url = tool.officialUrl.trim();
      if (urlCache[url]) {
        return Promise.resolve({ url, cached: true, status: urlCache[url] });
      }
      return checkUrl(url).then(res => {
        if (res.status >= 200 && res.status < 300) {
          urlCache[url] = 'verified';
        } else if (res.status === 403 || res.status === 401 || res.status === 405 || isKnownBotBlocked(url)) {
          urlCache[url] = 'bot_blocked';
        } else {
          urlCache[url] = 'rejected';
        }
        return { url, cached: false, status: urlCache[url] };
      });
    });

    await Promise.all(promises);

    if ((i + chunkSize) % 100 === 0 || i + chunkSize >= allTools.length) {
      fs.writeFileSync(cachePath, JSON.stringify(urlCache, null, 2), 'utf8');
      // Count current cache states
      const verifiedTotal = Object.values(urlCache).filter(v => v === 'verified').length;
      const botBlockedTotal = Object.values(urlCache).filter(v => v === 'bot_blocked').length;
      console.log(`Processed ${Math.min(i + chunkSize, allTools.length)}/${allTools.length}... (Cache Total Verified: ${verifiedTotal}, Bot Blocked: ${botBlockedTotal})`);
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(urlCache, null, 2), 'utf8');
  console.log('Full catalog network verification complete!');
}

run();
