import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';

// 1. Verify build bundle files exist
const root = resolve('dist');
const server = createServer(async (req, res) => {
  try {
    let p = resolve(root, '.' + new URL(req.url, 'http://local').pathname);
    if (!p.startsWith(root)) throw Error();
    if (!extname(p)) p = resolve(root, 'index.html');
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.pdf': 'application/pdf' })[extname(p)] || 'application/octet-stream');
    res.end(await readFile(p));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(r => server.listen(4180, '127.0.0.1', r));

console.log('[Test Server] Running on http://127.0.0.1:4180');

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('dialog', dialog => {
    console.log(`[Browser Dialog] auto-accepting: ${dialog.message()}`);
    dialog.accept().catch(() => {});
  });
  const pageErrors = [];
  page.on('pageerror', err => {
    console.error('[Browser PageError]', err.message);
    pageErrors.push(err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('[Browser Console Error]', msg.text());
  });

  // Mock upload target for storage PUT
  await page.route('**/mock-upload**', route => route.fulfill({ status: 200, body: 'OK' }));

  // Mock platform API calls for isolated admin UI interaction
  let savedTool = null;
  await page.route('**/api/platform?**', async route => {
    const url = new URL(route.request().url());
    const action = url.searchParams.get('action');

    if (action === 'login') {
      return route.fulfill({ json: { token: 'admin-test-token' } });
    }
    if (action === 'session') {
      return route.fulfill({ json: { authorized: true, user: { id: 'admin-user', email: 'admin@aiverse.test' } } });
    }
    if (action === 'themes' || action === 'themes-live') {
      return route.fulfill({ json: { themes: [] } });
    }
    if (action === 'request_guide_upload') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        json: {
          uploadUrl: 'http://127.0.0.1:4180/mock-upload',
          path: `guide-${body.filename || 'test'}.pdf`,
          bucket: 'tool-guides',
          token: 'mock-ticket-12345',
          ticket: 'mock-ticket-12345',
          publicUrl: 'https://database.test/storage/v1/object/public/tool-guides/mock-guide.pdf'
        }
      });
    }
    if (action === 'verify_guide_upload') {
      return route.fulfill({
        json: {
          verified: true,
          url: 'https://database.test/storage/v1/object/public/tool-guides/mock-guide.pdf'
        }
      });
    }
    if (action === 'upload_guide_document') {
      return route.fulfill({
        json: {
          url: 'https://database.test/storage/v1/object/public/tool-guides/uploaded-guide.pdf',
          path: 'tool-guides/uploaded-guide.pdf',
          size: 102400
        }
      });
    }
    if (action === 'save') {
      const body = route.request().postDataJSON();
      savedTool = body.tool;
      return route.fulfill({ json: { saved: true, assessmentPublished: false } });
    }
    if (action === 'tool') {
      const slug = url.searchParams.get('slug');
      if (savedTool && slug === savedTool.slug) {
        return route.fulfill({ json: savedTool });
      }
      return route.fulfill({ json: null });
    }
    return route.continue();
  });

  // Step 1: Login to Admin
  await page.goto('http://127.0.0.1:4180/admin');
  await page.getByPlaceholder('Email', { exact: true }).fill('admin@example.test');
  await page.getByPlaceholder('Password', { exact: true }).fill('secretpassword');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).waitFor();
  console.log('✓ Admin login successful');

  // Step 2: Open Tool Form (Click "Add AI Tool" or edit)
  await page.getByRole('button', { name: 'Add AI Tool' }).first().click();
  await page.getByRole('heading', { name: 'Add New AI Tool' }).waitFor();
  console.log('✓ Add New AI Tool form opened');

  // Step 3: Check "AI VERSE Learning Guide" section exists in form
  const guideHeading = page.locator('text=AI VERSE Learning Guide (PDF Document)');
  assert.ok(await guideHeading.isVisible(), 'Learning Guide section must be present in Tool form');
  console.log('✓ AI VERSE Learning Guide section confirmed in Admin form');

  // Step 4: Verify initial state of Learning Guide upload box
  const uploadBox = page.locator('text=Upload Learning Guide PDF');
  assert.ok(await uploadBox.isVisible(), 'Upload prompt box must be visible when no guide is attached');
  console.log('✓ Upload prompt box is visible');

  // Step 5: Simulate file selection of a valid PDF
  await page.locator('input[accept*="pdf"]').setInputFiles({
    name: 'prompt-engineering-mastery.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF')
  });

  // Step 6: Wait for upload to complete and verify action buttons
  await page.waitForSelector('text=Verified PDF Document');
  console.log('✓ PDF upload completed; "Verified PDF Document" card rendered');

  // Check actions: Copy URL, View PDF, Download PDF, Replace PDF, Remove
  const copyBtn = page.getByRole('button', { name: /Copy URL|Copied!/ });
  const viewLink = page.getByRole('link', { name: 'View PDF' });
  const downloadLink = page.getByRole('link', { name: 'Download PDF' });
  const replaceBtn = page.getByRole('button', { name: 'Replace PDF' });
  const removeBtn = page.getByRole('button', { name: 'Remove' });
  const previewToggle = page.getByRole('button', { name: 'Preview PDF' });

  assert.ok(await copyBtn.isVisible(), 'Copy URL button must be visible');
  assert.ok(await viewLink.isVisible(), 'View PDF link must be visible');
  assert.ok(await downloadLink.isVisible(), 'Download PDF link must be visible');
  assert.ok(await replaceBtn.isVisible(), 'Replace PDF button must be visible');
  assert.ok(await removeBtn.isVisible(), 'Remove button must be visible');
  assert.ok(await previewToggle.isVisible(), 'Preview PDF toggle button must be visible');
  console.log('✓ All 5 action controls (Copy, View, Download, Replace, Remove) verified');

  // Step 7: Test Copy URL
  await copyBtn.click();
  await page.waitForSelector('text=Copied!');
  console.log('✓ Copy URL button successfully copies and shows feedback "Copied!"');

  // Step 8: Test Preview PDF toggle
  await previewToggle.click();
  const iframe = page.locator('iframe[title="PDF Guide Preview"]');
  assert.ok(await iframe.isVisible(), 'PDF preview iframe must be visible after toggling Preview');
  console.log('✓ In-dashboard PDF preview iframe rendered correctly');

  // Step 9: Test Remove PDF
  await removeBtn.click();
  await page.waitForSelector('text=Upload Learning Guide PDF');
  console.log('✓ Remove PDF restores the original upload state');

  // Step 10: Re-upload and save tool
  await page.locator('input[accept*="pdf"]').setInputFiles({
    name: 'verified-final-guide.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF')
  });
  await page.waitForSelector('text=Verified PDF Document');

  // Fill in required tool fields to test save
  await page.locator('label:has-text("AI Tool Name") + input').fill('Test Guide AI');
  await page.locator('label:has-text("URL Slug") + input').fill('test-guide-ai');
  await page.locator('label:has-text("Short Description") + textarea').fill('A tool testing universal learning guide uploads.');
  await page.locator('label:has-text("Full Description") + textarea').fill('Detailed description for the test guide tool in AI Verse.');
  await page.locator('label:has-text("Official Tool URL") + input').fill('https://testguide.ai');
  await page.locator('label:has-text("Documentation URL") + input').fill('https://testguide.ai/docs');

  // Verify Video Tutorial fields in Admin form
  const videoNameInput = page.locator('label:has-text("Video Tutorial Name") + input');
  const videoUrlInput = page.locator('label:has-text("Video Tutorial URL") + input');
  assert.ok(await videoNameInput.isVisible(), 'Video Tutorial Name input must be visible');
  assert.ok(await videoUrlInput.isVisible(), 'Video Tutorial URL input must be visible');
  await videoNameInput.fill('Test AI Video Masterclass');
  await videoUrlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  console.log('✓ Video Tutorial Name and URL inputs filled in Admin form');

  // Verify Watch Tutorial test link preview appears
  const testWatchBtn = page.locator('a:has-text("Watch Tutorial")').first();
  assert.ok(await testWatchBtn.isVisible(), 'Watch Tutorial preview link must be visible when URL is set');
  console.log('✓ Video Tutorial preview and test link confirmed in Admin Dashboard');

  // Save the tool
  await page.getByRole('button', { name: 'Save Tool' }).click();
  await page.waitForSelector('text=Tool saved!');
  console.log('✓ Tool with learning guide & video tutorial saved successfully');
  assert.ok(savedTool.learningGuide, 'Saved tool payload must include learningGuide object');
  assert.ok(savedTool.learningGuide.url, 'learningGuide must have a public URL');
  assert.equal(savedTool.docsUrl, 'https://testguide.ai/docs', 'Official documentation URL must be preserved separately');
  assert.ok(savedTool.tutorialVideo, 'Saved tool payload must include tutorialVideo object');
  assert.equal(savedTool.tutorialVideo.title, 'Test AI Video Masterclass', 'Video tutorial title must be persisted');
  assert.equal(savedTool.tutorialVideo.url, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Video tutorial URL must be persisted');

  // Step 11: Public Tool Page verification (ElevenLabs)
  await page.goto('http://127.0.0.1:4180/tools/elevenlabs');
  await page.waitForSelector('text=HANDWRITTEN LEARNING GUIDE');
  console.log('✓ Public tool page displays badge "HANDWRITTEN LEARNING GUIDE"');

  // Verify Public Video Tutorial section
  const publicWatchLink = page.locator('#video-tutorial a:has-text("Watch Tutorial")');
  assert.ok(await publicWatchLink.isVisible(), 'Public tool page must display Watch Tutorial link');
  const publicVideoTitle = page.locator('#video-tutorial h4');
  assert.ok((await publicVideoTitle.textContent()).includes('ElevenLabs'), 'Public tool page must display Video Tutorial title');
  console.log('✓ Public tool page Watch Tutorial link and video title confirmed');

  const publicViewBtn = page.getByRole('link', { name: 'View PDF' }).first();
  const publicDownloadBtn = page.getByRole('link', { name: 'Download PDF' }).first();
  assert.ok(await publicViewBtn.isVisible(), 'Public page must display View PDF button');
  assert.ok(await publicDownloadBtn.isVisible(), 'Public page must display Download PDF button');
  console.log('✓ Public page View PDF and Download PDF buttons verified');

  const publicIframe = page.locator('#learning-guide iframe');
  await publicIframe.scrollIntoViewIfNeeded();
  assert.ok(await publicIframe.isVisible(), 'Public page embedded PDF iframe verified');
  console.log('✓ Public embedded PDF iframe verified');

  // Verify Official Docs section is preserved separately
  const officialDocsSection = page.locator('#documentation');
  await officialDocsSection.scrollIntoViewIfNeeded();
  assert.ok(await officialDocsSection.isVisible(), 'Official documentation section preserved');
  console.log('✓ Section 9B Official Documentation preserved separately');

  assert.equal(pageErrors.length, 0, `Page errors encountered: ${pageErrors.join(', ')}`);
  console.log('\n=== ALL BROWSER VERIFICATIONS PASSED SUCCESSFULLY ===');
} finally {
  await browser.close();
  server.close();
}
