-- ============================================================================
-- AI VERSE — Prompt Learning Content & Example Manager Database Schema
-- Additive, safely repeatable, zero-trust migration script for Supabase.
-- ============================================================================

-- 1. Create Academy Prompt Examples Table
create table if not exists public.academy_prompt_examples (
  id text primary key,
  component text not null, -- One of the 8 scoring criteria: 'Task / Goal', 'Context', 'Requirements', 'Constraints', 'Input / Reference', 'Output Format', 'Style / Tone', 'Validation / Success Criteria'
  title text not null,
  explanation text not null,
  weak_prompt text not null,
  improved_prompt text not null,
  why_better text not null,
  tips text[] not null default '{}',
  common_mistakes text[] not null default '{}',
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  language text not null check (language in ('english', 'tamil', 'tanglish')),
  image_url text,
  status text not null default 'published' check (status in ('draft', 'published')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- 2. Performance & Query Index
create index if not exists idx_prompt_examples_comp_status
  on public.academy_prompt_examples(component, status, display_order asc);

create index if not exists idx_prompt_examples_lang_diff
  on public.academy_prompt_examples(language, difficulty);

-- 3. Row Level Security & Access Control
-- Public and admin clients interact with prompt examples through the authenticated backend API (/api/platform).
alter table public.academy_prompt_examples enable row level security;

-- Revoke dangerous direct write access from anon and authenticated roles
revoke insert, update, delete on public.academy_prompt_examples from anon, authenticated;

-- Allow public read-only access for published examples
drop policy if exists "Public read published prompt examples" on public.academy_prompt_examples;
create policy "Public read published prompt examples"
  on public.academy_prompt_examples
  for select
  using (status = 'published');

-- Allow service role full management access
grant all on public.academy_prompt_examples to service_role;

-- 4. Initial Seed Examples (Additive, never overwrites existing rows)
insert into public.academy_prompt_examples (
  id, component, title, explanation, weak_prompt, improved_prompt, why_better,
  tips, common_mistakes, difficulty, language, status, display_order
) values
  (
    'ex-task-01',
    'Task / Goal',
    'Beginner Python Tutorial Goal',
    'Replaces vague inquiry with a distinct, actionable goal and named deliverable.',
    'Write something about Python.',
    'Write a comprehensive 5-step tutorial teaching complete beginners how to install Python 3.12 on Windows and run their first ''Hello, World!'' script in VS Code.',
    'The improved version clearly specifies the task (''write a 5-step tutorial''), target user (''complete beginners''), topic (''install Python 3.12 and run Hello World''), and environment (''Windows with VS Code'').',
    array['Use strong action verbs like ''Write'', ''Build'', ''Summarize'', ''Refactor''.', 'Specify the exact scope and end asset produced.'],
    array['Using ''Tell me about...'' which leads to essays rather than structured solutions.', 'Leaving the scope open-ended.'],
    'beginner', 'english', 'published', 1
  ),
  (
    'ex-task-02',
    'Task / Goal',
    'React Hook Explanation (Tanglish)',
    'Provides clear scope and target audience in conversational Tanglish.',
    'ReactJS pathi explain pannu.',
    'ReactJS functional components la useState hook epdi work aaguthu nu 3 practical code examples oda complete beginners ku puriyura maari explain pannu.',
    'General ah kekama, specific ah useState hook, 3 practical examples, and complete beginners kaga clarify pannirukku.',
    array['Topic ah specific ah narrow down pannunga (e.g. useState).', 'Ethana examples venum nu mention pannunga.'],
    array['Moththa React pathiyum ore prompt la kekurathu.', 'Audience level mention pannama vidurathu.'],
    'beginner', 'tanglish', 'published', 2
  ),
  (
    'ex-ctx-01',
    'Context',
    'High School Physics Teacher Persona',
    'Provides teaching background, audience grade level, and specific student challenges.',
    'I am a teacher explaining physics.',
    'You are an experienced high school physics teacher. Your audience is 10th-grade students preparing for their first board examination who find electromagnetic induction confusing and abstract.',
    'Identifies the instructor persona, the exact grade level, the upcoming examination context, and the psychological hurdle (confusing/abstract concept).',
    array['Describe the audience''s current understanding level.', 'Highlight specific pain points or misconceptions they face.'],
    array['Stating ''I am a teacher'' without describing the students or curriculum.', 'Assuming the AI knows the age level automatically.'],
    'beginner', 'english', 'published', 1
  ),
  (
    'ex-req-01',
    'Requirements',
    'Full-Stack API Design Deliverables',
    'Numbers every mandatory feature and technical specification.',
    'Include good authentication and API details.',
    'Mandatory Requirements:
1. Express.js REST route for /api/login with bcrypt password comparison.
2. JWT generation with 1-hour expiration and signed secret.
3. HttpOnly cookie storage configuration to prevent XSS.
4. Error response returning RFC 7807 standard JSON format.',
    'Replaces vague ''good authentication'' with 4 numbered, testable, concrete deliverables with exact security standards (bcrypt, JWT 1hr, HttpOnly, RFC 7807).',
    array['Use numbered lists for mandatory elements.', 'Specify library versions, security standards, and exact parameter names.'],
    array['Writing ''make it secure'' without naming security mechanisms.', 'Mixing requirements into a long unstructured paragraph.'],
    'advanced', 'english', 'published', 1
  ),
  (
    'ex-con-01',
    'Constraints',
    'Zero-Dependency JavaScript Constraints',
    'Imposes strict length limits and forbids external dependencies.',
    'Keep it simple and not too long.',
    'Strict Constraints:
- Maximum word count: 200 words.
- Do NOT import any external packages (no npm, no Lodash, no jQuery); use only native ES2022 JavaScript.
- Do NOT write commentary before or after the code block.
- Avoid any marketing fluff or conversational intros.',
    'Quantifies the word ceiling (200 words), forbids external dependencies categorically, and eliminates conversational filler.',
    array['Give an exact word or character ceiling.', 'State explicit negative rules using ''Do NOT...''.'],
    array['Writing ''Keep it short'' (which could mean 10 words or 500 words to an AI).', 'Forgetting to ban third-party dependencies when writing embedded code.'],
    'beginner', 'english', 'published', 1
  ),
  (
    'ex-inp-01',
    'Input / Reference',
    'Customer Support Log Analysis',
    'Anchors the answer strictly in verified quotation data.',
    'Look at our customer problems and summarize them.',
    'Reference the following customer support ticket verbatim:
"Ticket #4092: After updating to v2.4, the bulk export button triggers error code 504 Gateway Timeout whenever CSV rows exceed 10,000."
Analyze solely the error stated above. Do not infer any unmentioned server causes.',
    'Quotes the exact ticket text and forbids the AI from fabricating unstated causes.',
    array['Wrap raw reference text in quotes or triple backticks.', 'Instruct: ''Do not extrapolate beyond the provided text''.'],
    array['Referencing ''our past tickets'' without providing the text.', 'Allowing the model to speculate on missing information.'],
    'intermediate', 'english', 'published', 1
  ),
  (
    'ex-out-01',
    'Output Format',
    'Structured Markdown Table Specifications',
    'Defines exact table headers and code block presentation.',
    'Give me the result in a table.',
    'Format the output as a Markdown table with exactly 4 columns: | Step Number | Command | Purpose | Expected Output |. Below the table, provide a separate ```bash code block containing the complete execution sequence.',
    'Explicitly names all 4 table headers and specifies the secondary code block with language identifier.',
    array['Provide literal column names in pipes: | Col 1 | Col 2 |.', 'State whether a code block, JSON schema, or list is expected.'],
    array['Asking for ''a nice table'' without specifying what data goes in each column.', 'Allowing explanatory chat before or after the requested format.'],
    'beginner', 'english', 'published', 1
  ),
  (
    'ex-sty-01',
    'Style / Tone',
    'Executive Technical Retrospective Tone',
    'Sets professional, objective, and blameless tone for leadership.',
    'Be professional.',
    'Adopt an objective, empathetic, and blameless post-mortem tone. Write in concise active voice suitable for an engineering VP reviewing an incident retrospective. Avoid emotional exaggeration.',
    'Combines 3 specific tone descriptors (''objective'', ''empathetic'', ''blameless'') and targets executive-level communication.',
    array['Specify voice (active vs passive) and emotional posture.', 'Name the recipient''s seniority (e.g. VP level).'],
    array['Using generic words like ''good tone'' or ''be polite''.', 'Requesting conflicting tones like ''be hilarious yet extremely grave''.'],
    'advanced', 'english', 'published', 1
  ),
  (
    'ex-val-01',
    'Validation / Success Criteria',
    'Pre-Flight Self-Verification Audit',
    'Provides the model with explicit self-auditing checklist before finalizing.',
    'Make sure everything is right.',
    'Before generating the final answer, self-validate against these criteria:
1. Does the code contain null/undefined safety checks?
2. Are all 3 requirements from Section 3 addressed?
3. Is the total word count between 180 and 220 words?
If any check fails, revise before printing.',
    'Forces the LLM''s reasoning engine to evaluate its own draft against numbered, measurable quality gates before returning output.',
    array['Include a revision command: ''If any check fails, revise before output''.', 'Check both content completeness and length constraints.'],
    array['Assuming the AI performs thorough self-auditing without an explicit directive.', 'Writing qualitative checks that cannot be verified numerically.'],
    'advanced', 'english', 'published', 1
  )
on conflict (id) do nothing;
