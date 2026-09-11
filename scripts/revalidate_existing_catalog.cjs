/**
 * revalidate_existing_catalog.cjs
 * Validates URLs of existing unverified catalog tools in parallel.
 * Updates url_verification_cache.json with reachable / bot_blocked / rejected.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const http = require('http');
const https = require('https');

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
const cachePath = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');
let urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

const files = fs.readdirSync(catDir).filter(f => f.endsWith('.ts'));
let allTools = [];

files.forEach(f => {
  const modExports = loadTsModule(path.join(catDir, f));
  for (const k in modExports) {
    if (Array.isArray(modExports[k])) {
      allTools.push(...modExports[k]);
    }
  }
});

console.log(`Loaded ${allTools.length} total catalog records.`);

// Extract unique URLs that are not yet verified/bot_blocked in cache, and not fake
const urlsToTest = [];
const seen = new Set();

allTools.forEach(t => {
  const url = (t.officialUrl || '').trim();
  if (!url) return;
  if (url.includes('ai-tools-learning')) return;
  if (seen.has(url)) return;
  seen.add(url);

  // If already in cache and not rejected, skip testing
  if (urlCache[url] === 'verified' || urlCache[url] === 'bot_blocked') return;
  urlsToTest.push(url);
});

console.log(`Found ${urlsToTest.length} uncached / unverified unique URLs to validate.`);

function checkUrl(url, timeoutMs = 7000) {
  return new Promise(resolve => {
    try {
      const parsed = new URL(url);
      const transport = parsed.protocol === 'https:' ? https : http;
      const req = transport.request(url, {
        method: 'HEAD',
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, res => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve('verified');
        } else if (res.statusCode === 403 || res.statusCode === 401 || res.statusCode === 429 || res.statusCode === 503) {
          resolve('bot_blocked');
        } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve('verified');
        } else {
          // Try GET fallback
          const getReq = transport.request(url, {
            method: 'GET',
            timeout: timeoutMs,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          }, getRes => {
            if (getRes.statusCode >= 200 && getRes.statusCode < 400) resolve('verified');
            else if (getRes.statusCode === 403 || getRes.statusCode === 401 || getRes.statusCode === 429 || getRes.statusCode === 503) resolve('bot_blocked');
            else resolve('rejected');
          });
          getReq.on('error', () => resolve('rejected'));
          getReq.on('timeout', () => { getReq.destroy(); resolve('rejected'); });
          getReq.end();
        }
      });
      req.on('error', err => {
        // Try GET fallback on socket errors
        const getReq = transport.request(url, {
          method: 'GET',
          timeout: timeoutMs,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }, getRes => {
          if (getRes.statusCode >= 200 && getRes.statusCode < 400) resolve('verified');
          else if (getRes.statusCode === 403 || getRes.statusCode === 401 || getRes.statusCode === 429 || getRes.statusCode === 503) resolve('bot_blocked');
          else resolve('rejected');
        });
        getReq.on('error', () => resolve('rejected'));
        getReq.on('timeout', () => { getReq.destroy(); resolve('rejected'); });
        getReq.end();
      });
      req.on('timeout', () => { req.destroy(); resolve('rejected'); });
      req.end();
    } catch (e) {
      resolve('rejected');
    }
  });
}

async function runBatch() {
  const BATCH_SIZE = 25;
  let newVerified = 0;
  let newBotBlocked = 0;
  let newRejected = 0;

  for (let i = 0; i < urlsToTest.length; i += BATCH_SIZE) {
    const batch = urlsToTest.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i + 1}-${i + batch.length} of ${urlsToTest.length}...`);
    const results = await Promise.all(batch.map(url => checkUrl(url)));
    
    batch.forEach((url, idx) => {
      const res = results[idx];
      urlCache[url] = res;
      if (res === 'verified') newVerified++;
      else if (res === 'bot_blocked') newBotBlocked++;
      else newRejected++;
    });

    // Save incrementally
    fs.writeFileSync(cachePath, JSON.stringify(urlCache, null, 2));
  }

  console.log(`\nRevalidation complete: +${newVerified} verified, +${newBotBlocked} bot_blocked, ${newRejected} rejected.`);
}

runBatch();
