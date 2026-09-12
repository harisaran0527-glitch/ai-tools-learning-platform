/**
 * test_production_routes.cjs
 * Tests all required live production endpoints on https://ai-tools-learning-platform.vercel.app
 */

const https = require('https');

const BASE_URL = 'https://ai-tools-learning-platform.vercel.app';

const routesToTest = [
  '/',
  '/dashboard',
  '/tools/github-copilot',
  '/tools/cursor',
  '/tools/perplexity-ai',
  '/tools/chatgpt',
  '/assessment/github-copilot',
  '/assessment/cursor',
  '/assessment/perplexity-ai',
  '/learning-paths',
  '/compare',
  '/bookmarks',
];

function fetchRoute(route) {
  const targetUrl = `${BASE_URL}${route}`;
  return new Promise(resolve => {
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, res => {
      resolve({ route, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    }).on('error', err => {
      resolve({ route, status: 'ERROR', ok: false, error: err.message });
    });
  });
}

async function runTests() {
  console.log(`Testing Production Deployment Routes on ${BASE_URL}...\n`);
  const results = await Promise.all(routesToTest.map(r => fetchRoute(r)));
  
  let allOk = true;
  results.forEach(r => {
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} Route ${r.route.padEnd(30)} Status: ${r.status}`);
    if (!r.ok) allOk = false;
  });

  console.log(`\nProduction Route Testing Result: ${allOk ? 'ALL PASSED' : 'SOME FAILED'}`);
}

runTests();
