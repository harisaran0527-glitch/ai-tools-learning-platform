import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/platform.js';

const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });
Object.assign(process.env, { SUPABASE_URL: 'https://database.test', SUPABASE_ANON_KEY: 'test-anon', SUPABASE_SERVICE_ROLE_KEY: 'test-service', ADMIN_USER_IDS: 'admin-id', OPENAI_API_KEY: 'test-model', PRACTICE_TOKEN_SECRET: 'test-signing-secret' });
let rows = [], modelScores = [15,15,20,15,10,10,5,10], allowed = true;
let themeRows = [], bindingRows = [];
export const storageObjects = new Map();
globalThis.fetch = async (url, init = {}) => {
  if (String(url).includes('/auth/v1/token')) {
    const body=JSON.parse(init.body);
    if (body.password !== 'test-password') return Response.json({error:'Invalid credentials'},{status:400});
    return Response.json({access_token:body.email === 'admin@example.test' ? 'admin':'public'});
  }
  if (String(url).includes('/auth/v1/user') && init.headers.Authorization === 'Bearer expired') return Response.json({error:'Expired'},{status:401});
  if (String(url).includes('/auth/v1/user')) return Response.json({ id: init.headers.Authorization === 'Bearer admin' ? 'admin-id' : 'public-id' });
  if (String(url).includes('/rpc/')) return Response.json(allowed);
  if (String(url).includes('/rest/v1/academy_tools')) {
    if (init.method === 'POST') { const row = JSON.parse(init.body); rows = [row]; return new Response(null, { status: 204 }); }
    return Response.json(rows);
  }
  if (String(url).includes('/rest/v1/academy_themes')) {
    if (init.method === 'POST') {
      const row = JSON.parse(init.body);
      themeRows = themeRows.filter(t => t.id !== row.id).concat(row);
      return new Response(null, { status: 204 });
    }
    if (init.method === 'DELETE') {
      return new Response(null, { status: 204 });
    }
    return Response.json(themeRows);
  }
  if (String(url).includes('/rest/v1/academy_theme_bindings')) {
    if (init.method === 'POST') {
      const row = JSON.parse(init.body);
      bindingRows = bindingRows.filter(b => b.page_target !== row.page_target).concat(row);
      return new Response(null, { status: 204 });
    }
    if (init.method === 'DELETE') {
      return new Response(null, { status: 204 });
    }
    return Response.json(bindingRows);
  }
  if (String(url).includes('/responses')) {
    const request = JSON.parse(init.body);
    assert.equal(request.store, false);
    return Response.json({ output: [{ content: [{ type: 'output_text', text: request.text ? JSON.stringify({ sections: modelScores.map(score => ({ score, evidence: 'Quoted prompt evidence', feedback: 'Specific improvement' })) }) : 'Execution preview' }] }] });
  }
  if (String(url).includes('/storage/v1/object/upload/sign/theme-assets/')) {
    const parts = String(url).split('/upload/sign/theme-assets/');
    const path = parts[1]?.split('?')[0];
    return Response.json({
      url: `https://database.test/storage/v1/object/theme-assets/${path}?token=mock-jwt`,
    });
  }
  if (String(url).includes('/storage/v1/object/theme-assets')) {
    const urlStr = String(url);
    if (init.method === 'DELETE') {
      const b = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
      const prefixes = b?.prefixes || [];
      for (const p of prefixes) storageObjects.delete(p);
      return Response.json({ message: 'Deleted' });
    }
    const path = urlStr.split('/theme-assets/')[1]?.split('?')[0];
    if (init.method === 'POST' || init.method === 'PUT') {
      const data = Buffer.isBuffer(init.body) ? init.body : Buffer.from(init.body || '');
      storageObjects.set(path, data);
      return Response.json({ Key: `theme-assets/${path}` });
    }
    if (init.method === 'GET' || !init.method) {
      const asset = storageObjects.get(path);
      if (!asset) return new Response('Not Found', { status: 404 });
      const range = init.headers?.Range;
      if (range) {
        const slice = asset.subarray(0, 8192);
        return new Response(slice, {
          status: 206,
          headers: {
            'content-range': `bytes 0-${slice.length - 1}/${asset.length}`,
            'content-length': String(slice.length),
          },
        });
      }
      return new Response(asset, {
        status: 200,
        headers: {
          'content-length': String(asset.length),
        },
      });
    }
  }
  throw new Error(`Unexpected request ${url}`);
};
async function call(action, { method = 'GET', body, token, slug } = {}) {
  const response = { statusCode: 200, headers: {}, setHeader(k,v) { this.headers[k] = v; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
  await handler({ url: `/api/platform?action=${action}${slug ? `&slug=${encodeURIComponent(slug)}` : ''}`, method, body, headers: token ? { authorization: `Bearer ${token}` } : {} }, response);
  return response;
}
const tool = { id: 'test-tool', slug: 'test-tool', name: 'Test fixture', category: 'Coding', shortDescription: 'Fixture only', fullDescription: 'Fixture only', officialUrl: 'https://example.test', pricingType: 'free', difficulty: 'Beginner', learningTime: 10, keywords: [], platforms: [], whyLearn: [], useCases: [], features: [], steps: [], practicalExercise: { objective: '', expectedResult: '', skillsLearned: [] } };
const question = { question: 'Fixture question', options: ['A','B','C','D'], correctAnswer: 1, explanation: '' };

test('login validates credentials and server-side administrator membership', async () => {
  assert.equal((await call('login',{method:'POST',body:{email:'admin@example.test',password:'wrong'}})).statusCode,401);
  const denied=await call('login',{method:'POST',body:{email:'member@example.test',password:'test-password'}});
  assert.equal(denied.statusCode,403);assert.equal(denied.body.token,undefined);
  assert.equal((await call('login',{method:'POST',body:{email:'admin@example.test',password:'test-password'}})).body.token,'admin');
});

test('expired credentials cannot access private admin operations', async () => {
  for(const action of ['session','draft','save','themes','save_theme','publish_theme','restore_theme','delete_theme','rollback_theme']) {
    assert.equal((await call(action,{method:['session','draft','themes'].includes(action)?'GET':'POST',token:'expired',body:{}})).statusCode,401);
  }
});
test('all protected management operations reject unauthenticated users', async () => {
  for (const action of ['session','draft','save']) assert.equal((await call(action, { method: action === 'save' ? 'POST' : 'GET', body: { tool, questions: Array(50).fill(null) } })).statusCode, 401);
});
test('authenticated non-admin cannot write', async () => assert.equal((await call('save', { method: 'POST', token: 'public', body: { tool, questions: Array(50).fill(null) } })).statusCode, 403));

test('theme mutations require admin authorization', async () => {
  for (const action of ['themes','theme-save','theme-publish','theme-reset','save_theme','publish_theme','rollback_theme','restore_theme','delete_theme']) {
    assert.equal((await call(action, { method: action === 'themes' ? 'GET':'POST', body:{}, token:'public' })).statusCode,403);
    assert.equal((await call(action, { method: action === 'themes' ? 'GET':'POST', body:{} })).statusCode,401);
  }
});

test('explicit publishing rejects incomplete questions and saving complete drafts does not publish', async () => {
  assert.equal((await call('save', {method:'POST',token:'admin',body:{tool,questions:Array(50).fill(null),publish:true}})).statusCode,400);
  const saved=await call('save',{method:'POST',token:'admin',body:{tool,questions:Array(50).fill(question),publish:false}});
  assert.equal(saved.statusCode,200);
  assert.equal(saved.body.assessmentPublished,false);
  assert.equal((await call('draft',{token:'admin',slug:tool.slug})).body[0].question,question.question);
});
test('draft persistence, summary merge payload and public detail updates', async () => {
  const saved = await call('save', { method: 'POST', token: 'admin', body: { tool, questions: Array(50).fill(null) } });
  assert.equal(saved.statusCode, 200); assert.equal(saved.body.assessmentPublished, false);
  assert.equal((await call('draft', { token: 'admin', slug: tool.slug })).body.length, 50);
  assert.equal((await call('tool', { slug: tool.slug })).body.name, tool.name);
  assert.equal((await call('catalog')).body[0].name, tool.name);
  assert.equal((await call('catalog')).body[0].fullDescription, undefined);
});
test('HTTPS validation and 50-slot enforcement', async () => {
  assert.equal((await call('save', { method: 'POST', token: 'admin', body: { tool: { ...tool, docsUrl: 'javascript:alert(1)' }, questions: Array(50).fill(null) } })).statusCode, 400);
  assert.equal((await call('save', { method: 'POST', token: 'admin', body: { tool: { ...tool, logo: 'javascript:alert(1)' }, questions: Array(50).fill(null) } })).statusCode, 400);
  assert.equal((await call('save', { method: 'POST', token: 'admin', body: { tool: { ...tool, logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }, questions: Array(50).fill(null) } })).statusCode, 200);
  assert.equal((await call('save', { method: 'POST', token: 'admin', body: { tool, questions: [] } })).statusCode, 400);
  assert.equal((await call('tool', { slug: 'x,or=(true)' })).statusCode, 400);
});
test('50 valid questions publish, answer keys stay server-side, grading validates question IDs', async () => {
  const saved = await call('save', { method: 'POST', token: 'admin', body: { tool, questions: Array(50).fill(question) } });
  assert.equal(saved.body.assessmentPublished, true);
  const questions = (await call('assessment', { slug: tool.slug })).body;
  assert.equal(questions.length, 50); assert.equal(questions[0].correctAnswer, undefined);
  const ids = questions.slice(0,25).map(q => q.id);
  const result = await call('grade', { method: 'POST', slug: tool.slug, body: { ids, answers: Object.fromEntries(ids.map(id => [id,1])) } });
  assert.equal(result.body.score, 50);
  assert.equal((await call('grade', { method: 'POST', slug: tool.slug, body: { ids: Array(25).fill(ids[0]) } })).statusCode, 400);
  await call('save', { method: 'POST', token: 'admin', body: { tool, questions: Array(50).fill(null) } });
  assert.equal((await call('assessment', { slug: tool.slug })).body.length, 50);
});
test('empty prompt is zero, weights total exactly 100', async () => {
  const result = await call('analyze', { method: 'POST', body: { prompt: '', challenge: 0 } });
  assert.equal(result.body.score, 0); assert.equal(result.body.sections.reduce((n,s) => n+s.max,0),100);
  assert.ok(result.body.sections.every(s => s.status === 'Missing'));
});
test('poor, partial, strong and exact-threshold analysis; server execution gate and prompt binding', async () => {
  for (const scores of [[0,0,0,0,0,0,0,0],[10,5,10,5,0,5,2,3],[15,15,20,15,10,10,5,10],[10,10,15,10,5,10,5,5]]) {
    modelScores = scores;
    const prompt = 'A test-only prompt fixture';
    const result = await call('analyze', { method: 'POST', body: { prompt, challenge: 0 } });
    assert.equal(result.body.score, scores.reduce((a,b) => a+b,0));
    if (result.body.score < 70) assert.equal(result.body.ticket, undefined);
    else {
      assert.ok(result.body.ticket);
      assert.equal((await call('execute', { method: 'POST', body: { prompt, challenge: 0, ticket: result.body.ticket } })).body.output, 'Execution preview');
      assert.equal((await call('execute', { method: 'POST', body: { prompt: 'Edited prompt', challenge: 0, ticket: result.body.ticket } })).statusCode, 403);
    }
  }
  assert.equal((await call('execute', { method: 'POST', body: { prompt: 'Test', challenge: 0, ticket: 'forged.token' } })).statusCode, 403);
});
test('invalid model marks and durable quota fail closed', async () => {
  modelScores = [16,15,20,15,10,10,5,10];
  assert.equal((await call('analyze', { method: 'POST', body: { prompt: 'Test', challenge: 0 } })).statusCode, 502);
  allowed = false;
  assert.equal((await call('analyze', { method: 'POST', body: { prompt: 'Test', challenge: 0 } })).statusCode, 429);
});


test('theme management: public read, admin save, publish, rollback, and preset protection', async () => {
  // 1. Unauthenticated write must fail
  const customTheme = {
    id: 'custom-aurora',
    name: 'Custom Aurora Night',
    pageTarget: 'home',
    bgType: 'gradient',
    motionType: 'aurora_lights',
    solidColor: '#070913',
    layers: [],
    motionSettings: { particleCount: 60, speed: 1 },
    gradient: { stops: [{color:'#070913',position:0},{color:'#ffffff',position:100}] },
  };
  const unauthSave = await call('save_theme', { method: 'POST', body: { theme: customTheme } });
  assert.equal(unauthSave.statusCode, 401);

  // 2. Admin save draft
  const saved = await call('save_theme', { method: 'POST', token: 'admin', body: { theme: customTheme } });
  assert.equal(saved.statusCode, 200);
  assert.equal(saved.body.saved, true);

  // 3. Admin publish to home target
  const published = await call('publish_theme', { method: 'POST', token: 'admin', body: { theme: customTheme, target: 'home' } });
  assert.equal(published.statusCode, 200);
  assert.equal(published.body.published, true);

  // 4. Public read active theme for home target
  const readHome = await call('theme', { method: 'GET' });
  assert.equal(readHome.statusCode, 200);

  // 5. Rollback restores previous or reverts to default
  const rolledBack = await call('rollback_theme', { method: 'POST', token: 'admin', body: { target: 'home' } });
  assert.equal(rolledBack.statusCode, 200);
  assert.ok(rolledBack.body.rolledBack);

  // 6. Delete built-in preset must fail
  const deletePreset = await call('delete_theme', { method: 'POST', token: 'admin', body: { id: 'preset-original-default' } });
  assert.equal(deletePreset.statusCode, 400);

  // 7. Delete custom theme succeeds
  const deleteCustom = await call('delete_theme', { method: 'POST', token: 'admin', body: { id: 'custom-aurora' } });
  assert.equal(deleteCustom.statusCode, 200);
  assert.ok(deleteCustom.body.deleted);
});


test('theme media validation: rejects dangerous schemes and enforces size limits', async () => {
  const badImageTheme = {
    id: 'bad-image-theme',
    name: 'Malicious Image Test',
    pageTarget: 'global',
    bgType: 'image',
    imageUrl: 'javascript:alert("xss")',
    motionType: 'none',
  };
  const badImgRes = await call('save_theme', { method: 'POST', token: 'admin', body: { theme: badImageTheme } });
  assert.equal(badImgRes.statusCode, 400);

  const badVideoTheme = {
    id: 'bad-video-theme',
    name: 'Malicious Video Test',
    pageTarget: 'global',
    bgType: 'cinematic',
    videoUrl: 'ftp://unsafe.test/video.mp4',
    motionType: 'none',
  };
  const badVidRes = await call('save_theme', { method: 'POST', token: 'admin', body: { theme: badVideoTheme } });
  assert.equal(badVidRes.statusCode, 400);

  const safeTheme = {
    id: 'safe-media-theme',
    name: 'Safe Media Test',
    pageTarget: 'global',
    bgType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
    motionType: 'none',
  };
  const safeRes = await call('save_theme', { method: 'POST', token: 'admin', body: { theme: safeTheme } });
  assert.equal(safeRes.statusCode, 200);
  assert.equal(safeRes.body.saved, true);
});

test('upload_theme_media: enforces admin auth, MIME validation, magic byte content inspection, and size limits', async () => {
  // 1. Unauthenticated request rejected
  const unauth = await call('upload_theme_media', { method: 'POST', body: { data: 'test', mimeType: 'image/png' } });
  assert.equal(unauth.statusCode, 401);

  // 2. Unsupported MIME type rejected
  const badMime = await call('upload_theme_media', {
    method: 'POST',
    token: 'admin',
    body: { data: 'test', mimeType: 'text/html' },
  });
  assert.equal(badMime.statusCode, 400);

  // 3. Spoofed content (claiming to be PNG but containing text) rejected by magic bytes check
  const fakePng = Buffer.from('NOT_A_REAL_PNG_FILE_CONTENT').toString('base64');
  const spoofed = await call('upload_theme_media', {
    method: 'POST',
    token: 'admin',
    body: { data: fakePng, mimeType: 'image/png' },
  });
  assert.equal(spoofed.statusCode, 400);

  // 4. Valid PNG with real magic bytes accepted
  const realPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const validRes = await call('upload_theme_media', {
    method: 'POST',
    token: 'admin',
    body: { data: realPngBase64, mimeType: 'image/png' },
  });
  assert.equal(validRes.statusCode, 200);
  assert.equal(validRes.body.uploaded, true);
  assert.ok(validRes.body.url);
  assert.equal(validRes.body.mimeType, 'image/png');
});

test('direct signed upload: request permissions, near-max size test (4.9MB image & 14.8MB video), and rejection of >5MB / >15MB', async () => {
  // 1. Unauthenticated request rejected
  const unauth = await call('request_theme_upload', { method: 'POST', body: { filename: 'hero.jpg', mimeType: 'image/jpeg', size: 1000 } });
  assert.equal(unauth.statusCode, 401);

  // 2. Reject unsupported MIME type
  const badMime = await call('request_theme_upload', { method: 'POST', token: 'admin', body: { filename: 'hack.exe', mimeType: 'application/x-msdownload', size: 1000 } });
  assert.equal(badMime.statusCode, 400);

  // 3. Reject oversized image request (> 5MB)
  const overImage = await call('request_theme_upload', { method: 'POST', token: 'admin', body: { filename: 'large.jpg', mimeType: 'image/jpeg', size: 5.5 * 1024 * 1024 } });
  assert.equal(overImage.statusCode, 400);

  // 4. Reject oversized video request (> 15MB)
  const overVideo = await call('request_theme_upload', { method: 'POST', token: 'admin', body: { filename: 'large.mp4', mimeType: 'video/mp4', size: 16 * 1024 * 1024 } });
  assert.equal(overVideo.statusCode, 400);

  // 5. Near-max size image test: 4.9 MB JPEG
  const imageSize = 4.9 * 1024 * 1024;
  const imgPermRes = await call('request_theme_upload', { method: 'POST', token: 'admin', body: { filename: 'near-max-hero.jpg', mimeType: 'image/jpeg', size: imageSize } });
  assert.equal(imgPermRes.statusCode, 200);
  assert.ok(imgPermRes.body.uploadUrl);
  assert.ok(imgPermRes.body.path);
  assert.ok(imgPermRes.body.token);

  // Simulate client direct upload of 4.9 MB JPEG buffer to Supabase Storage
  const imgBuffer = Buffer.alloc(Math.floor(imageSize));
  imgBuffer[0] = 0xFF; imgBuffer[1] = 0xD8; imgBuffer[2] = 0xFF; // JPEG magic bytes
  storageObjects.set(imgPermRes.body.path, imgBuffer);

  // Server verifies uploaded media
  const imgVerifyRes = await call('verify_theme_media', { method: 'POST', token: 'admin', body: { path: imgPermRes.body.path, token: imgPermRes.body.token, mimeType: 'image/jpeg' } });
  assert.equal(imgVerifyRes.statusCode, 200);
  assert.equal(imgVerifyRes.body.verified, true);
  assert.equal(imgVerifyRes.body.size, Math.floor(imageSize));
  assert.ok(imgVerifyRes.body.url.includes(imgPermRes.body.path));

  // 6. Near-max size video test: 14.8 MB MP4
  const videoSize = 14.8 * 1024 * 1024;
  const vidPermRes = await call('request_theme_upload', { method: 'POST', token: 'admin', body: { filename: 'near-max-bg.mp4', mimeType: 'video/mp4', size: videoSize } });
  assert.equal(vidPermRes.statusCode, 200);
  assert.ok(vidPermRes.body.uploadUrl);

  // Simulate client direct upload of 14.8 MB MP4 buffer to Supabase Storage
  const vidBuffer = Buffer.alloc(Math.floor(videoSize));
  vidBuffer.write('ftyp', 4, 4, 'ascii'); // MP4 magic box header at offset 4
  storageObjects.set(vidPermRes.body.path, vidBuffer);

  // Server verifies uploaded video
  const vidVerifyRes = await call('verify_theme_media', { method: 'POST', token: 'admin', body: { path: vidPermRes.body.path, token: vidPermRes.body.token, mimeType: 'video/mp4' } });
  assert.equal(vidVerifyRes.statusCode, 200);
  assert.equal(vidVerifyRes.body.verified, true);
  assert.equal(vidVerifyRes.body.size, Math.floor(videoSize));
  assert.ok(vidVerifyRes.body.url.includes(vidPermRes.body.path));
});

test('direct signed upload verification: rejects spoofed content and auto-cleans invalid storage files', async () => {
  // 1. Request valid signed upload for JPEG
  const permRes = await call('request_theme_upload', { method: 'POST', token: 'admin', body: { filename: 'test.jpg', mimeType: 'image/jpeg', size: 50000 } });
  assert.equal(permRes.statusCode, 200);

  // 2. Client uploads file with corrupted/spoofed magic bytes (plain HTML instead of JPEG)
  const corruptedBuffer = Buffer.from('<html><body>Spoofed content</body></html>');
  storageObjects.set(permRes.body.path, corruptedBuffer);
  assert.equal(storageObjects.has(permRes.body.path), true);

  // 3. Server verification detects content mismatch, rejects with 400, and DELETES file from storage
  const verifyRes = await call('verify_theme_media', { method: 'POST', token: 'admin', body: { path: permRes.body.path, token: permRes.body.token, mimeType: 'image/jpeg' } });
  assert.equal(verifyRes.statusCode, 400);
  assert.ok(verifyRes.body.error.includes('File deleted'));

  // 4. Confirm corrupted file was deleted from storage
  assert.equal(storageObjects.has(permRes.body.path), false);

  // 5. Test tampered token rejection
  const tamperedRes = await call('verify_theme_media', { method: 'POST', token: 'admin', body: { path: permRes.body.path, token: 'tampered.ticket', mimeType: 'image/jpeg' } });
  assert.equal(tamperedRes.statusCode, 403);
});

test('settings integrity: admin session authorized, revision inspection, and catalog summary protection', async () => {
  // Verify session check requires valid admin token
  const unauthSession = await call('session');
  assert.equal(unauthSession.statusCode, 401);

  const authSession = await call('session', { token: 'admin' });
  assert.equal(authSession.statusCode, 200);
  assert.equal(authSession.body.authorized, true);

  // Verify catalog summaries do not leak fullDescription or internal draft
  const catalogRes = await call('catalog');
  assert.equal(catalogRes.statusCode, 200);
  assert.ok(Array.isArray(catalogRes.body));
  if (catalogRes.body.length > 0) {
    assert.equal(catalogRes.body[0].fullDescription, undefined);
    assert.equal(catalogRes.body[0].draft, undefined);
  }
});
