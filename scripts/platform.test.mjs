import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/platform.js';

const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });
Object.assign(process.env, { SUPABASE_URL: 'https://database.test', SUPABASE_ANON_KEY: 'test-anon', SUPABASE_SERVICE_ROLE_KEY: 'test-service', ADMIN_USER_IDS: 'admin-id', OPENAI_API_KEY: 'test-model', PRACTICE_TOKEN_SECRET: 'test-signing-secret' });
let rows = [], modelScores = [15,15,20,15,10,10,5,10], allowed = true;
globalThis.fetch = async (url, init = {}) => {
  if (String(url).includes('/auth/v1/user')) return Response.json({ id: init.headers.Authorization === 'Bearer admin' ? 'admin-id' : 'public-id' });
  if (String(url).includes('/rpc/')) return Response.json(allowed);
  if (String(url).includes('/rest/v1/academy_tools')) {
    if (init.method === 'POST') { const row = JSON.parse(init.body); rows = [row]; return new Response(null, { status: 204 }); }
    return Response.json(rows);
  }
  if (String(url).includes('/responses')) {
    const request = JSON.parse(init.body);
    assert.equal(request.store, false);
    return Response.json({ output: [{ content: [{ type: 'output_text', text: request.text ? JSON.stringify({ sections: modelScores.map(score => ({ score, evidence: 'Quoted prompt evidence', feedback: 'Specific improvement' })) }) : 'Execution preview' }] }] });
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
test('all protected management operations reject unauthenticated users', async () => {
  for (const action of ['session','draft','save']) assert.equal((await call(action, { method: action === 'save' ? 'POST' : 'GET', body: { tool, questions: Array(50).fill(null) } })).statusCode, 401);
});
test('authenticated non-admin cannot write', async () => assert.equal((await call('save', { method: 'POST', token: 'public', body: { tool, questions: Array(50).fill(null) } })).statusCode, 403));
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
