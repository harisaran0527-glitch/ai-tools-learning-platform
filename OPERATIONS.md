# Academy management and practice

The existing bundled catalog remains the baseline. `academy_tools` stores durable overrides and new records in Supabase Postgres. Public lists receive only summary fields; detail records load on demand through the existing cached category loaders. There is no bulk migration, destructive delete, or browser-only admin database.

## Production setup

1. Create a Supabase project and run `database/setup.sql` in its SQL editor.
2. Create administrator accounts in Supabase Auth. Disable public signups if they are not needed. Copy the authorized users' UUIDs into `ADMIN_USER_IDS` (comma-separated).
3. Configure the six server-only variables listed in `.env.example` in the **existing** `ai-tools-learning-platform` Vercel project. `PRACTICE_TOKEN_SECRET` should be a cryptographically random value of at least 32 bytes. `OPENAI_MODEL` is optional.
4. Redeploy the existing project after configuration. For local serverless testing use `vercel dev`, rather than Vite alone.

The Supabase service key, model key and signing secret never enter Vite or browser code. Management requests validate Supabase access tokens against the user endpoint and check the server allowlist. Browser access tokens are held in memory and discarded on sign out or refresh. No token or password is written to localStorage. Supabase handles password verification and authentication throttling. Configure Vercel Firewall rate limits for `/api/platform?action=login` as an additional deployment control.

RLS blocks direct anonymous/authenticated database access. All database calls use the server route. The atomic Postgres quota limits paid practice requests to 20 per IP hash per hour and 200 globally per hour. IPs are stored only as keyed hashes; expired quota rows can be periodically removed. No prompt is persisted by this application; provider requests set `store: false`.

## Assessments

Existing generated assessments remain intact until an administrator completes a replacement. Each tool has 50 private manual draft slots. All 50 must have text, four options and an answer before publishing. Incomplete edits preserve the last published version. Newly added tools show an unavailable assessment state until publication; no questions, answers or resource URLs are invented. The existing public experience still presents 25 questions for 50 marks; manual pools contain 50 questions. Their answer keys and grading stay on the server.

## Prompt practice

The model evaluates eight components for presence, clarity, specificity, relevance and completeness, using weights 15/15/20/15/10/10/5/10. The server validates every mark and derives the total and status. This is AI-assisted feedback, not a deterministic certification grade. Execution requires a signed, expiring result of at least 70 tied to the exact prompt and challenge. Editing a prompt invalidates the UI analysis. Execution produces a text preview; it does not deploy apps, run code or create image assets. Practice writes no learning progress, certificate or assessment scores.

## Validation

Run `npm test`, `npx tsc --noEmit`, `npm run build` and `git diff --check`. For optional browser QA, install Playwright without saving it (`npm install --no-save --package-lock=false playwright`) and run `node scripts/browser-check.mjs`; Chrome must be installed. Pass the production URL as an argument to run its read-only public checks. API and admin browser tests mock providers and use fixtures only in tests; they do not establish real provider connectivity. After configuration, verify real admin sign-in, persistence across reload/redeploy, manual resource changes on public pages, complete assessment publication/grading, and model scoring/execution. Never report those checks as passed before running them against configured services.
