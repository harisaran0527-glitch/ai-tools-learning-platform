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
  try {
    urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    urlCache = {};
  }
}

const KNOWN_BOT_BLOCKED_DOMAINS = [
  'claude.ai', 'gemini.google.com', 'perplexity.ai', 'chat.deepseek.com',
  'chat.mistral.ai', 'poe.com', 'phind.com', 'duckduckgo.com', 'jan.ai',
  'v0.dev', 'cursor.com', 'codeium.com', 'crewai.com', 'devin.ai',
  'notebooklm.google.com', 'raycast.com', 'quillbot.com', 'outlines-dev',
  'All-Hands-AI', 'quizizz.com', 'diffit.me', 'milvus.io', 'lancedb.com',
  'memgpt.ai', 'play.ht', 'SW1515/F5-TTS', 'huggingface.co/chat', 'instructor'
];

function isKnownBotBlocked(urlStr) {
  return KNOWN_BOT_BLOCKED_DOMAINS.some(domain => urlStr.includes(domain));
}

function checkUrl(urlStr, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 5) {
      return resolve({ status: 0, finalUrl: urlStr, error: 'too_many_redirects' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(urlStr);
    } catch (e) {
      return resolve({ status: 0, finalUrl: urlStr, error: 'invalid_url' });
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      method: 'GET',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 8000
    };

    const req = client.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let nextUrl = res.headers.location;
        if (!nextUrl.startsWith('http')) {
          nextUrl = new URL(nextUrl, urlStr).href;
        }
        return checkUrl(nextUrl, redirectCount + 1).then(resolve);
      }
      resolve({ status: res.statusCode, finalUrl: urlStr });
    });

    req.on('error', (err) => {
      resolve({ status: 0, finalUrl: urlStr, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, finalUrl: urlStr, error: 'timeout' });
    });

    req.end();
  });
}

async function revalidate() {
  const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));
  const legacyVerifiedTools = [];

  categoryFiles.forEach(file => {
    const modExports = loadTsModule(path.join(categoriesDir, file));
    for (const key in modExports) {
      if (Array.isArray(modExports[key])) {
        modExports[key].forEach(t => {
          if (t.officialStatus === 'verified' && t.officialUrl) {
            legacyVerifiedTools.push(t);
          }
        });
      }
    }
  });

  console.log(`Revalidating ${legacyVerifiedTools.length} legacy verified records...`);

  let verifiedReachableCount = 0;
  let botBlockedCount = 0;
  let rejectedCount = 0;

  for (let i = 0; i < legacyVerifiedTools.length; i++) {
    const tool = legacyVerifiedTools[i];
    const url = tool.officialUrl.trim();

    const res = await checkUrl(url);

    if (res.status >= 200 && res.status < 300) {
      urlCache[url] = 'verified';
      verifiedReachableCount++;
    } else if (res.status === 403 || res.status === 401 || res.status === 405 || isKnownBotBlocked(url)) {
      urlCache[url] = 'bot_blocked';
      botBlockedCount++;
    } else {
      urlCache[url] = 'rejected';
      rejectedCount++;
    }

    if ((i + 1) % 20 === 0 || i === legacyVerifiedTools.length - 1) {
      console.log(`Processed ${i + 1}/${legacyVerifiedTools.length}... (Reachable: ${verifiedReachableCount}, Bot Blocked: ${botBlockedCount}, Rejected: ${rejectedCount})`);
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(urlCache, null, 2), 'utf8');
  console.log('Revalidation complete! Cache updated at src/data/catalog/url_verification_cache.json');
}

revalidate();
