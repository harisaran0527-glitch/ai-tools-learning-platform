// Optional browser QA: npm install --no-save --package-lock=false playwright
// Uses local fixtures only. Pass a production URL for read-only public verification.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import handler from '../api/platform.js';

const external = process.argv[2];
const root = resolve('dist');
const server = external ? null : createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/platform')) {
      let body = ''; for await (const chunk of req) body += chunk;
      req.body = body ? JSON.parse(body) : undefined;
      res.status = code => { res.statusCode = code; return res; };
      res.json = data => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(data)); return res; };
      return handler(req, res);
    }
    let file = resolve(root, '.' + new URL(req.url,'http://local').pathname);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (!extname(file)) file = resolve(root,'index.html');
    const content = await readFile(file);
    res.setHeader('Content-Type', ({ '.js':'text/javascript', '.css':'text/css', '.html':'text/html', '.jpg':'image/jpeg', '.png':'image/png' })[extname(file)] || 'application/octet-stream'); res.end(content);
  } catch { res.writeHead(404); res.end(); }
});
if (server) await new Promise(r => server.listen(4173,'127.0.0.1',r));
const base = external || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base); await page.getByRole('heading', { name: 'Learn. Practice. Master AI.' }).waitFor();
  assert.deepEqual(await page.locator('nav[aria-label="Main navigation"] a').allTextContents(), ['Explore Catalog','Prompting']);
  assert.ok((await page.locator('.hero').evaluate(el => getComputedStyle(el).backgroundImage)).includes('anime-ai-hero.jpg'));
  await page.locator('.tool-card').first().waitFor();
  assert.equal(await page.locator('.tool-card').count(), 24);
  const first = await page.locator('.tool-card h3').first().textContent();
  await page.locator('.pagination-row').getByRole('button', { name: '2', exact: true }).click();
  assert.notEqual(await page.locator('.tool-card h3').first().textContent(),first);
  assert.equal(await page.locator('.tool-card').count(),24);
  const search = page.getByPlaceholder('Search by tool name', { exact: false });
  await search.fill('ElevenLabs'); assert.equal(await page.locator('.tool-card').count(),1);
  await search.fill('');
  await page.locator('.nav-tabs').getByRole('button', { name: /Coding/ }).click();
  assert.ok(await page.locator('.tool-card').count() > 0);
  await page.locator('.tool-card').first().click();
  await page.getByRole('heading', { name: /404/ }).waitFor({ state:'hidden' });
  await page.locator('#video-tutorial').waitFor();
  assert.ok(await page.locator('a[href^="https://"]').count() > 0);
  const toolUrl = page.url();
  await page.goto(toolUrl.replace('/tools/','/assessment/'));
  await page.getByText('Question 1', { exact: false }).first().waitFor();
  await page.goto(base + '/prompting'); await page.getByRole('link', { name: 'Start Practice' }).click();
  await page.getByLabel('Your complete prompt').waitFor();
  assert.ok(await page.getByRole('button', { name: 'Execute Prompt', exact:true }).isDisabled());
  await page.getByRole('button', { name: 'Analyze Prompt', exact:true }).click();
  await page.getByRole('heading', { name: 'Needs Improvement' }).waitFor();
  assert.equal(await page.locator('.score-orbit strong').textContent(),'0');
  await page.getByRole('button', { name: 'Next Challenge' }).click();
  await page.getByRole('heading', { name: 'Presentation creation' }).waitFor();
  await page.getByLabel('Your complete prompt').fill('Practice fixture');
  await page.getByRole('button', { name: 'Try Again' }).click();
  assert.equal(await page.getByLabel('Your complete prompt').inputValue(),'');
  if (!external) {
    await page.route('**/api/platform?**', async route => {
      const action = new URL(route.request().url()).searchParams.get('action');
      if (action === 'execute') return route.fulfill({ json: { output: 'Test-only execution preview' } });
      if (action !== 'analyze') return route.continue();
      const body = route.request().postDataJSON();
      const strong = body.prompt.includes('threshold');
      const maxima = [15,15,20,15,10,10,5,10];
      const scores = strong ? [10,10,15,10,5,10,5,5] : [5,5,5,5,0,0,0,0];
      return route.fulfill({ json: { score: strong ? 70 : 20, ticket: strong ? 'test-ticket' : undefined, sections: maxima.map((max,i) => ({ label:['Task / Goal','Context','Requirements','Constraints','Input / Reference','Output Format','Style / Tone','Validation / Success Criteria'][i], max, score:scores[i], status:scores[i] === 0 ? 'Missing' : 'Improve', evidence:'Test-only evidence', feedback:'Test-only feedback' })) } });
    });
    await page.getByLabel('Your complete prompt').fill('Poor prompt fixture');
    await page.getByRole('button',{ name:'Analyze Prompt', exact:true }).click();
    await page.getByRole('heading',{ name:'Needs Improvement' }).waitFor();
    assert.ok(await page.getByRole('button',{ name:'Execute Prompt',exact:true }).isDisabled());
    await page.getByLabel('Your complete prompt').fill('Exact threshold fixture');
    await page.getByRole('button',{ name:'Analyze Prompt', exact:true }).click();
    await page.getByRole('heading',{ name:'Good Prompt' }).waitFor();
    assert.equal(await page.locator('.score-orbit strong').textContent(),'70');
    await page.getByRole('button',{ name:'Execute Prompt',exact:true }).click();
    await page.getByText('Test-only execution preview',{ exact:true }).waitFor();
    await page.getByLabel('Your complete prompt').fill('Changed fixture');
    assert.ok(await page.getByRole('button',{ name:'Execute Prompt',exact:true }).isDisabled());
    await page.unroute('**/api/platform?**');
  }
  for (const width of [390,768]) {
    await page.setViewportSize({ width, height:844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const editor = await page.locator('.editor-panel').boundingBox(), analysis = await page.locator('.analysis-panel').boundingBox();
    if (width === 390) assert.ok(analysis.y > editor.y);
  }
  await page.screenshot({ path: '../practice-mobile.png', fullPage:true });
  await page.setViewportSize({ width:390,height:844 });
  await page.goto(base + '/admin'); await page.getByRole('heading', { name:'Academy control room.' }).waitFor();
  assert.equal(await page.getByRole('button', { name:'Add AI Tool' }).count(),0);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log('PASS rendered public UI: navigation, anime hero, 24-card pagination, search, category, detail, assessment, prompting, empty analysis, next/retry, mobile, protected admin');
  if (!external) {
    let savedTool;
    await page.route('**/api/platform?**', async route => {
      const action = new URL(route.request().url()).searchParams.get('action');
      if (action === 'login') return route.fulfill({ json: { token:'test-admin' } });
      if (action === 'session') return route.fulfill({ json: { authorized:true } });
      if (action === 'catalog') return route.fulfill({ json: savedTool ? [savedTool] : [] });
      if (action === 'tool' && savedTool && new URL(route.request().url()).searchParams.get('slug') === savedTool.slug) return route.fulfill({ json: savedTool });
      if (action === 'save') { savedTool = route.request().postDataJSON().tool; return route.fulfill({ json: { saved:true,assessmentPublished:false } }); }
      if (action === 'draft') return route.fulfill({ json: Array(50).fill(null) });
      return route.continue();
    });
    await page.getByLabel('Email').fill('admin@example.test'); await page.getByLabel('Password').fill('test-password');
    await page.getByRole('button', { name:'Sign in securely' }).click();
    await page.getByRole('heading', { name:'A place for every tool.' }).waitFor();
    const count = await page.locator('.category-manager .academy-card').count();
    const definitions = await readFile('src/data/categories.ts', 'utf8');
    assert.equal(count, (definitions.match(/name: '/g) || []).length);
    await page.locator('.category-manager .academy-card').first().getByRole('button',{ name:'Add Tool',exact:true }).click();
    await page.getByLabel('AI Tool Name',{ exact:true }).fill('Browser fixture');
    await page.getByLabel('URL Slug',{ exact:false }).fill('browser-fixture');
    await page.getByLabel('Short Description',{ exact:true }).fill('Browser-only test description');
    await page.getByLabel('Full Description',{ exact:true }).fill('Browser-only test description');
    await page.getByLabel('Official Tool URL',{ exact:true }).fill('https://example.test');
    await page.getByLabel('Tutorial Video URL',{ exact:true }).fill('https://example.test/tutorial');
    await page.getByLabel('Official Documentation URL',{ exact:true }).fill('https://example.test/docs');
    assert.equal(await page.locator('.question-map button').count(),50);
    await page.getByRole('button',{ name:'Question 50',exact:true }).click();
    await page.getByRole('heading',{ name:'Question 50 / 50' }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path:'../admin-mobile.png',fullPage:true });
    await page.getByRole('button',{ name:'Save',exact:true }).first().click();
    await page.getByRole('status').waitFor();
    assert.equal(savedTool.tutorialVideo.url,'https://example.test/tutorial');
    assert.equal(savedTool.docsUrl,'https://example.test/docs');
    await page.getByRole('button',{ name:'Tool library',exact:true }).click();
    await page.getByLabel('Search tools',{ exact:false }).fill('Browser fixture');
    assert.equal(await page.locator('.admin-table tbody tr').count(),1);
    await page.getByRole('button',{ name:'Edit Tool',exact:true }).click();
    await page.getByRole('heading',{ name:'Refine the details.' }).waitFor();
    assert.equal(await page.getByLabel('Tutorial Video URL',{ exact:true }).inputValue(),'https://example.test/tutorial');
    await page.goto(base + '/tools/browser-fixture');
    await page.locator('#video-tutorial a').waitFor();
    assert.equal(await page.locator('#video-tutorial a').getAttribute('href'),'https://example.test/tutorial');
    assert.ok(await page.locator('a[href="https://example.test/docs"]').count() > 0);
    await page.goto(base + '/admin');
    await page.getByRole('heading',{ name:'Academy control room.' }).waitFor();
    console.log(`PASS mocked admin UI: sign-in, all ${count} categories, category-prefilled add form, 50 question slots, question navigation, mobile`);
  }
  assert.deepEqual(errors,[]);
} finally { await browser.close(); if (server) await new Promise(r => server.close(r)); }
