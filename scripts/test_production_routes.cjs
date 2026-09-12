/**
 * test_production_routes.cjs
 * Validates live HTTP response status & content on https://ai-tools-learning-platform.vercel.app
 */

const https = require('https');

const BASE_URL = 'https://ai-tools-learning-platform.vercel.app';

const routesToTest = [
  { path: '/', label: 'Homepage' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/tools/vllm-project', label: 'Newly Exposed Tool (vLLM)' },
  { path: '/tools/ollama-ai', label: 'Newly Exposed Tool (Ollama)' },
  { path: '/tools/flux1-black-forest-labs', label: 'Newly Exposed Tool (FLUX.1)' },
  { path: '/tools/github-copilot', label: 'Original Tool (GitHub Copilot)' },
  { path: '/assessment/vllm-project', label: 'Assessment (vLLM)' },
  { path: '/assessment/github-copilot', label: 'Assessment (GitHub Copilot)' },
];

function fetchRoute(routeObj) {
  const targetUrl = `${BASE_URL}${routeObj.path}`;
  return new Promise(resolve => {
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          label: routeObj.label,
          path: routeObj.path,
          status: res.statusCode,
          ok: res.statusCode === 200,
          hasAppHtml: body.includes('id="root"')
        });
      });
    }).on('error', err => {
      resolve({ label: routeObj.label, path: routeObj.path, status: 'ERROR', ok: false, error: err.message });
    });
  });
}

async function runLiveTests() {
  console.log(`Running Live Production Verification on ${BASE_URL}...\n`);
  const results = await Promise.all(routesToTest.map(r => fetchRoute(r)));

  let allPassed = true;
  results.forEach(r => {
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} [${r.status}] ${r.label.padEnd(35)} Path: ${r.path}`);
    if (!r.ok) allPassed = false;
  });

  console.log(`\nLive Production Route Test Status: ${allPassed ? 'ALL 200 OK — PASSED' : 'FAILED'}`);
}

runLiveTests();
