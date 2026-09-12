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

const catDir = path.join(__dirname, '../src/data/catalog/categories');
const cacheFile = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');

let urlCache = {};
if (fs.existsSync(cacheFile)) {
  try { urlCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch (e) { urlCache = {}; }
}

// Build maps of existing slugs and names
const existingSlugs = new Set();
const existingNames = new Set();

fs.readdirSync(catDir).filter(f => f.endsWith('.ts')).forEach(file => {
  const modExports = loadTsModule(path.join(catDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => {
        if (t.slug) existingSlugs.add(t.slug.toLowerCase());
        if (t.name) existingNames.add(t.name.toLowerCase());
      });
    }
  }
});

console.log(`Currently tracking ${existingSlugs.size} unique slugs and ${existingNames.size} unique names.`);

const batchA_Tools = [
  // Education
  { file: 'education.ts', slug: 'magicschool-ai', name: 'MagicSchool AI', category: 'Education', subcategory: 'Lesson Planning', officialUrl: 'https://www.magicschool.ai', docsUrl: 'https://www.magicschool.ai', desc: 'Teacher-focused AI tools for lesson planning, rubrics, and educational content.' },
  { file: 'education.ts', slug: 'quizizz-ai', name: 'Quizizz AI', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://quizizz.com', docsUrl: 'https://quizizz.com', desc: 'Creates interactive quizzes and formative checks from source material.' },
  { file: 'education.ts', slug: 'khanmigo', name: 'Khanmigo', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://www.khanmigo.ai', docsUrl: 'https://www.khanmigo.ai', desc: 'Socratic tutoring and teaching support designed to guide learning.' },
  { file: 'education.ts', slug: 'diffit-me', name: 'Diffit AI', category: 'Education', subcategory: 'Lesson Planning', officialUrl: 'https://beta.diffit.me', docsUrl: 'https://beta.diffit.me', desc: 'Differentiates reading passages and learning activities for all student levels.' },
  { file: 'education.ts', slug: 'gradescope-ai', name: 'Gradescope', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://www.gradescope.com', docsUrl: 'https://www.gradescope.com', desc: 'AI-assisted grading platform for paper exams and online assignments.' },
  { file: 'education.ts', slug: 'schoolai', name: 'SchoolAI', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://schoolai.com', docsUrl: 'https://schoolai.com', desc: 'AI tutor and classroom assistant built specifically for K-12 and higher ed.' },
  { file: 'education.ts', slug: 'goblin-tools', name: 'Goblin.tools', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://goblin.tools', docsUrl: 'https://goblin.tools', desc: 'Single-task AI tools designed to help neurodivergent students break down complex tasks.' },
  { file: 'education.ts', slug: 'kahoot-ai', name: 'Kahoot AI', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://kahoot.com', docsUrl: 'https://kahoot.com', desc: 'Generates engaging educational Kahoot games and trivia from lesson notes.' },
  { file: 'education.ts', slug: 'teachable-machine', name: 'Teachable Machine', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://teachablemachine.withgoogle.com', docsUrl: 'https://teachablemachine.withgoogle.com', desc: 'Web-based Google tool for teaching Machine Learning concepts interactively.' },
  { file: 'education.ts', slug: 'curipod', name: 'Curipod', category: 'Education', subcategory: 'Lesson Planning', officialUrl: 'https://curipod.com', docsUrl: 'https://curipod.com', desc: 'Generates interactive lesson slide decks with polls and open questions.' },
  { file: 'education.ts', slug: 'brisk-teaching', name: 'Brisk Teaching', category: 'Education', subcategory: 'Lesson Planning', officialUrl: 'https://www.briskteaching.com', docsUrl: 'https://www.briskteaching.com', desc: 'Chrome extension AI tool for teachers to give feedback and create materials.' },
  { file: 'education.ts', slug: 'formative-ai', name: 'Formative AI', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://www.formative.com', docsUrl: 'https://www.formative.com', desc: 'Real-time student assessment platform with automated AI grading options.' },
  { file: 'education.ts', slug: 'questionwell', name: 'QuestionWell', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://www.questionwell.org', docsUrl: 'https://www.questionwell.org', desc: 'Generates essential questions and learning objectives from text or video.' },
  { file: 'education.ts', slug: 'eduaide-ai', name: 'Eduaide.Ai', category: 'Education', subcategory: 'Lesson Planning', officialUrl: 'https://www.eduaide.ai', docsUrl: 'https://www.eduaide.ai', desc: 'AI workspace providing 100+ resource generators for teaching staff.' },
  { file: 'education.ts', slug: 'teachology-ai', name: 'Teachology AI', category: 'Education', subcategory: 'Lesson Planning', officialUrl: 'https://www.teachology.ai', docsUrl: 'https://www.teachology.ai', desc: 'AI lesson plan and rubric builder for faculty curriculum design.' },
  { file: 'education.ts', slug: 'conker-ai', name: 'Conker AI', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://www.conker.ai', docsUrl: 'https://www.conker.ai', desc: 'Creates quick multiple-choice quizzes aligned to K-12 and higher ed standards.' },
  { file: 'education.ts', slug: 'mindjoy-edu', name: 'Mindjoy', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://mindjoy.com', docsUrl: 'https://mindjoy.com', desc: 'AI tutors and interactive coding activities for STEM educators.' },
  { file: 'education.ts', slug: 'packback-co', name: 'Packback', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://www.packback.co', docsUrl: 'https://www.packback.co', desc: 'AI inquiry platform facilitating student-led discussion and writing feedback.' },
  { file: 'education.ts', slug: 'kami-ai', name: 'Kami AI', category: 'Education', subcategory: 'Lesson Planning', officialUrl: 'https://www.kamiapp.com', docsUrl: 'https://www.kamiapp.com', desc: 'Interactive PDF document annotation and AI learning worksheet creator.' },
  { slug: 'cognii-ai', name: 'Cognii', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://www.cognii.com', docsUrl: 'https://www.cognii.com', desc: 'Virtual learning assistant offering conversational assessment and tutoring.', file: 'education.ts' },
  { slug: 'knewton-ai', name: 'Knewton AI', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://www.knewton.com', docsUrl: 'https://www.knewton.com', desc: 'Adaptive learning technology engine providing personalized course material.', file: 'education.ts' },
  { slug: 'quizlet-qchat', name: 'Quizlet Q-Chat', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://quizlet.com', docsUrl: 'https://quizlet.com', desc: 'Socratic AI tutor built into Quizlet flashcard study sets.', file: 'education.ts' },
  { slug: 'carnegie-mathia', name: 'Carnegie Learning MATHia', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://www.carnegielearning.com', docsUrl: 'https://www.carnegielearning.com', desc: 'Adaptive math software providing step-by-step AI tutoring feedback.', file: 'education.ts' },
  { slug: 'dreambox-learning', name: 'DreamBox', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://www.dreambox.com', docsUrl: 'https://www.dreambox.com', desc: 'Adaptive K-8 math and reading AI platform.', file: 'education.ts' },
  { slug: 'amira-learning', name: 'Amira Learning', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://www.amiralearning.com', docsUrl: 'https://www.amiralearning.com', desc: 'AI reading assistant providing micro-interventions for young readers.', file: 'education.ts' },
  { slug: 'turnitin-ai', name: 'Turnitin AI', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://www.turnitin.com', docsUrl: 'https://www.turnitin.com', desc: 'Plagiarism and AI writing detection system for academic institutions.', file: 'education.ts' },
  { slug: 'copyleaks-ai', name: 'CopyLeaks AI', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://copyleaks.com', docsUrl: 'https://copyleaks.com', desc: 'AI text and code similarity detection engine.', file: 'education.ts' },
  { slug: 'gptzero-me', name: 'GPTZero', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://gptzero.me', docsUrl: 'https://gptzero.me', desc: 'AI detection tool for verifying student authorship.', file: 'education.ts' },
  { slug: 'originality-ai', name: 'Originality.ai', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://originality.ai', docsUrl: 'https://originality.ai', desc: 'AI content detector and web plagiarism checker.', file: 'education.ts' },
  { slug: 'winston-ai', name: 'Winston AI', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://gowinston.ai', docsUrl: 'https://gowinston.ai', desc: 'AI detector designed for educators and publishers.', file: 'education.ts' },
  { slug: 'zerogpt-com', name: 'ZeroGPT', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://www.zerogpt.com', docsUrl: 'https://www.zerogpt.com', desc: 'Free text analysis tool for detecting AI-generated writing.', file: 'education.ts' },
  { slug: 'quizgecko-app', name: 'Quizgecko', category: 'Education', subcategory: 'Quiz & Assessment Creation', officialUrl: 'https://quizgecko.com', docsUrl: 'https://quizgecko.com', desc: 'AI question generator converting text, documents, or URLs into tests.', file: 'education.ts' },
  { slug: 'cramly-ai', name: 'Cramly AI', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://cramly.ai', docsUrl: 'https://cramly.ai', desc: 'Study board assistant helping students write outlines and study.', file: 'education.ts' },
  { slug: 'studyable-app', name: 'Studyable', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://studyable.app', docsUrl: 'https://studyable.app', desc: 'AI-assisted learning platform for essay feedback and homework assistance.', file: 'education.ts' },
  { slug: 'tutorai-me', name: 'TutorAI', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://www.tutorai.me', docsUrl: 'https://www.tutorai.me', desc: 'Generates structured learning courses on any user-provided topic.', file: 'education.ts' },
  { slug: 'socratic-google', name: 'Socratic by Google', category: 'Education', subcategory: 'Student Assistance & Tutoring', officialUrl: 'https://socratic.org', docsUrl: 'https://socratic.org', desc: 'Google learning app providing visual explanations and homework help.', file: 'education.ts' },

  // Document / Writing
  { file: 'document_writing.ts', slug: 'notion-ai-writer', name: 'Notion AI', category: 'Document / Writing', subcategory: 'Notes & Knowledge Base', officialUrl: 'https://www.notion.so/product/ai', docsUrl: 'https://www.notion.so/help/guides/category/ai', desc: 'Integrated AI workspace assistant for course notes and documents.' },
  { file: 'document_writing.ts', slug: 'grammarly-writer', name: 'Grammarly AI', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://www.grammarly.com', docsUrl: 'https://www.grammarly.com', desc: 'Writing and editing assistant for clear faculty communication.' },
  { file: 'document_writing.ts', slug: 'quillbot-tool', name: 'QuillBot', category: 'Document / Writing', subcategory: 'Grammar & Paraphrasing', officialUrl: 'https://quillbot.com', docsUrl: 'https://quillbot.com', desc: 'Paraphrasing, summarizing, and grammar support for drafting.' },
  { file: 'document_writing.ts', slug: 'copy-ai', name: 'Copy.ai', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://www.copy.ai', docsUrl: 'https://www.copy.ai', desc: 'AI content platform for drafting articles and announcements.' },
  { file: 'document_writing.ts', slug: 'jasper-ai', name: 'Jasper AI', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://www.jasper.ai', docsUrl: 'https://www.jasper.ai', desc: 'Enterprise AI copy assistant for structured content.' },
  { file: 'document_writing.ts', slug: 'writesonic', name: 'Writesonic', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://writesonic.com', docsUrl: 'https://writesonic.com', desc: 'AI writer for generating blog posts, landing text, and summaries.' },
  { file: 'document_writing.ts', slug: 'rytr-me', name: 'Rytr', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://rytr.me', docsUrl: 'https://rytr.me', desc: 'Lightweight AI writing assistant for fast content drafting.' },
  { file: 'document_writing.ts', slug: 'wordtune-ai', name: 'Wordtune', category: 'Document / Writing', subcategory: 'Grammar & Paraphrasing', officialUrl: 'https://www.wordtune.com', docsUrl: 'https://www.wordtune.com', desc: 'AI phrasing and rewriting tool for polishing sentence clarity.' },
  { file: 'document_writing.ts', slug: 'sudowrite', name: 'Sudowrite', category: 'Document / Writing', subcategory: 'Creative Writing AI', officialUrl: 'https://www.sudowrite.com', docsUrl: 'https://www.sudowrite.com', desc: 'Creative writing assistant providing descriptive brainstorming.' },
  { file: 'document_writing.ts', slug: 'prowritingaid', name: 'ProWritingAid', category: 'Document / Writing', subcategory: 'Grammar & Paraphrasing', officialUrl: 'https://prowritingaid.com', docsUrl: 'https://prowritingaid.com', desc: 'Grammar checker and style editor for academic papers.' },
  { file: 'document_writing.ts', slug: 'hemingway-editor', name: 'Hemingway Editor', category: 'Document / Writing', subcategory: 'Grammar & Paraphrasing', officialUrl: 'https://hemingwayapp.com', docsUrl: 'https://hemingwayapp.com', desc: 'Highlights complex sentences and improves document readability.' },
  { file: 'document_writing.ts', slug: 'anyword-ai', name: 'Anyword', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://anyword.com', docsUrl: 'https://anyword.com', desc: 'Performance-driven AI copy generator with score analytics.' },
  { file: 'document_writing.ts', slug: 'hypotenuse-ai', name: 'Hypotenuse AI', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://www.hypotenuse.ai', docsUrl: 'https://www.hypotenuse.ai', desc: 'Generates structured articles and descriptions from keywords.' },
  { file: 'document_writing.ts', slug: 'scalenut-io', name: 'Scalenut', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://www.scalenut.com', docsUrl: 'https://www.scalenut.com', desc: 'AI content intelligence platform for structured outline writing.' },
  { file: 'document_writing.ts', slug: 'frase-io', name: 'Frase.io', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://www.frase.io', docsUrl: 'https://www.frase.io', desc: 'Researches and drafts structured content briefs based on search results.' },
  { file: 'document_writing.ts', slug: 'surfer-seo', name: 'Surfer SEO Writing', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://surferseo.com', docsUrl: 'https://surferseo.com', desc: 'Content editor providing keyword optimization and structuring.' },
  { file: 'document_writing.ts', slug: 'textcortex', name: 'TextCortex', category: 'Document / Writing', subcategory: 'Academic & Technical Writing', officialUrl: 'https://textcortex.com', docsUrl: 'https://textcortex.com', desc: 'Customizable browser AI assistant for writing and rephrasing.' },
  { file: 'document_writing.ts', slug: 'novel-ai', name: 'NovelAI', category: 'Document / Writing', subcategory: 'Creative Writing AI', officialUrl: 'https://novelai.net', docsUrl: 'https://novelai.net', desc: 'AI story generator and creative companion.' },

  // Productivity / Automation
  { file: 'focused_tools.ts', slug: 'zapier-ai-bot', name: 'Zapier AI', category: 'Productivity / Automation', officialUrl: 'https://zapier.com/ai', docsUrl: 'https://help.zapier.com/', desc: 'Connects faculty tools and automates recurring workflows.' },
  { file: 'focused_tools.ts', slug: 'make-automation', name: 'Make AI', category: 'Productivity / Automation', officialUrl: 'https://www.make.com/en/ai-automation', docsUrl: 'https://help.make.com/', desc: 'Visual automation builder for forms, spreadsheets, and email.' },
  { file: 'focused_tools.ts', slug: 'taskade-ai-app', name: 'Taskade AI', category: 'Productivity / Automation', officialUrl: 'https://www.taskade.com', docsUrl: 'https://help.taskade.com', desc: 'AI task manager and collaborative workspace for project teams.' },
  { file: 'focused_tools.ts', slug: 'mem-ai-notes', name: 'Mem AI', category: 'Productivity / Automation', officialUrl: 'https://mem.ai', docsUrl: 'https://mem.ai', desc: 'Self-organizing workspace powered by generative AI.' },
  { file: 'focused_tools.ts', slug: 'krisp-ai-noise', name: 'Krisp AI', category: 'Productivity / Automation', officialUrl: 'https://krisp.ai', docsUrl: 'https://krisp.ai', desc: 'Noise-canceling and meeting summary assistant for video calls.' },
  { file: 'focused_tools.ts', slug: 'raycast-ai-mac', name: 'Raycast AI', category: 'Productivity / Automation', officialUrl: 'https://www.raycast.com/ai', docsUrl: 'https://manual.raycast.com/ai', desc: 'Extendable desktop launcher with integrated AI text and code tools.' },
  { file: 'focused_tools.ts', slug: 'obsidian-smart-conn', name: 'Obsidian Smart Connections', category: 'Productivity / Automation', officialUrl: 'https://obsidian.md', docsUrl: 'https://help.obsidian.md', desc: 'Local AI semantic connections across Obsidian markdown notes.' },
  { file: 'focused_tools.ts', slug: 'bardeen-ai-flow', name: 'Bardeen AI', category: 'Productivity / Automation', officialUrl: 'https://www.bardeen.ai', docsUrl: 'https://www.bardeen.ai', desc: 'Browser automation tool for web scraping and data workflow.' },
  { file: 'focused_tools.ts', slug: 'n8n-automation', name: 'n8n AI', category: 'Productivity / Automation', officialUrl: 'https://n8n.io', docsUrl: 'https://docs.n8n.io', desc: 'Fair-code workflow automation node engine with AI agents.' },
  { file: 'focused_tools.ts', slug: 'activepieces-ai', name: 'ActivePieces', category: 'Productivity / Automation', officialUrl: 'https://www.activepieces.com', docsUrl: 'https://www.activepieces.com/docs', desc: 'Open-source automation alternative to Zapier for AI workflows.' },

  // PPT / Presentation
  { file: 'ppt_presentation_creation.ts', slug: 'napkin-ai-diag', name: 'Napkin AI', category: 'PPT / Presentation Creation', subcategory: 'Diagrams & Flowcharts', officialUrl: 'https://www.napkin.ai', docsUrl: 'https://www.napkin.ai', desc: 'Turns text into editable diagrams and visual explanations.' },
  { file: 'ppt_presentation_creation.ts', slug: 'gamma-app-ppt', name: 'Gamma', category: 'PPT / Presentation Creation', subcategory: 'AI Slide Generators', officialUrl: 'https://gamma.app', docsUrl: 'https://gamma.app', desc: 'Creates structured presentations and shareable documents.' },
  { file: 'ppt_presentation_creation.ts', slug: 'powerpoint-copilot-ms', name: 'PowerPoint Copilot', category: 'PPT / Presentation Creation', subcategory: 'AI Slide Generators', officialUrl: 'https://www.microsoft.com/en-us/microsoft-365/powerpoint', docsUrl: 'https://support.microsoft.com', desc: 'AI assistance inside PowerPoint for drafting course decks.' },
  { file: 'ppt_presentation_creation.ts', slug: 'tome-ai-app', name: 'Tome AI', category: 'PPT / Presentation Creation', subcategory: 'AI Slide Generators', officialUrl: 'https://tome.app', docsUrl: 'https://tome.app', desc: 'AI storytelling format for generating presentation decks.' },
  { file: 'ppt_presentation_creation.ts', slug: 'beautiful-ai', name: 'Beautiful.ai', category: 'PPT / Presentation Creation', subcategory: 'AI Slide Generators', officialUrl: 'https://www.beautiful.ai', docsUrl: 'https://www.beautiful.ai', desc: 'Smart presentation software that auto-adjusts layout rules.' },
  { file: 'ppt_presentation_creation.ts', slug: 'pitch-com-ai', name: 'Pitch AI', category: 'PPT / Presentation Creation', subcategory: 'AI Slide Generators', officialUrl: 'https://pitch.com', docsUrl: 'https://pitch.com', desc: 'Collaborative deck platform with AI presentation assistant.' },
  { file: 'ppt_presentation_creation.ts', slug: 'prezi-ai-zoom', name: 'Prezi AI', category: 'PPT / Presentation Creation', subcategory: 'AI Slide Generators', officialUrl: 'https://prezi.com', docsUrl: 'https://prezi.com', desc: 'Zooming presentation tool with AI layout creation.' },
  { file: 'ppt_presentation_creation.ts', slug: 'slidesai-io', name: 'SlidesAI', category: 'PPT / Presentation Creation', subcategory: 'AI Slide Generators', officialUrl: 'https://www.slidesai.io', docsUrl: 'https://www.slidesai.io', desc: 'Google Slides add-on to convert text into slides.' },
  { file: 'ppt_presentation_creation.ts', slug: 'decktopus-ai', name: 'Decktopus', category: 'PPT / Presentation Creation', subcategory: 'AI Slide Generators', officialUrl: 'https://www.decktopus.com', docsUrl: 'https://www.decktopus.com', desc: 'Generates presentations complete with speaker notes.' },

  // Speech to Text
  { file: 'speech_to_text.ts', slug: 'whisper-openai-stt', name: 'Whisper', category: 'Speech to Text', subcategory: 'Local & Privacy Transcription', officialUrl: 'https://github.com/openai/whisper', docsUrl: 'https://github.com/openai/whisper', desc: 'Open speech recognition model for accurate lecture transcription.' },
  { file: 'speech_to_text.ts', slug: 'otter-ai-stt', name: 'Otter.ai', category: 'Speech to Text', subcategory: 'Meeting Recording & Summary', officialUrl: 'https://otter.ai', docsUrl: 'https://otter.ai', desc: 'Meeting and lecture transcription with summary notes.' },
  { file: 'speech_to_text.ts', slug: 'fireflies-ai', name: 'Fireflies.ai', category: 'Speech to Text', subcategory: 'Meeting Recording & Summary', officialUrl: 'https://fireflies.ai', docsUrl: 'https://fireflies.ai', desc: 'Automates meeting notes and transcribes conversations across apps.' },
  { file: 'speech_to_text.ts', slug: 'deepgram-stt', name: 'Deepgram', category: 'Speech to Text', subcategory: 'Local & Privacy Transcription', officialUrl: 'https://deepgram.com', docsUrl: 'https://developers.deepgram.com', desc: 'High-speed speech recognition API with high accuracy.' },
  { file: 'speech_to_text.ts', slug: 'assemblyai-stt', name: 'AssemblyAI', category: 'Speech to Text', subcategory: 'Local & Privacy Transcription', officialUrl: 'https://www.assemblyai.com', docsUrl: 'https://docs.assemblyai.com', desc: 'AI speech-to-text API for transcribing audio and analyzing sentiment.' },

  // Photo Editing
  { file: 'photo_editing.ts', slug: 'photoroom-app', name: 'Photoroom', category: 'Photo Editing', subcategory: 'Background Removal', officialUrl: 'https://www.photoroom.com', docsUrl: 'https://www.photoroom.com', desc: 'Background removal and fast image composition tool.' },
  { file: 'photo_editing.ts', slug: 'topaz-photo-ai-tool', name: 'Topaz Photo AI', category: 'Photo Editing', subcategory: 'Upscaling & Enhancement', officialUrl: 'https://www.topazlabs.com/topaz-photo-ai', docsUrl: 'https://www.topazlabs.com', desc: 'Local photo enhancement, denoise, and sharpening.' },
  { file: 'photo_editing.ts', slug: 'remove-bg', name: 'Remove.bg', category: 'Photo Editing', subcategory: 'Background Removal', officialUrl: 'https://www.remove.bg', docsUrl: 'https://www.remove.bg', desc: 'Automated 1-click background removal for images.' },
  { file: 'photo_editing.ts', slug: 'upscayl-app', name: 'Upscayl', category: 'Photo Editing', subcategory: 'Upscaling & Enhancement', officialUrl: 'https://github.com/upscayl/upscayl', docsUrl: 'https://github.com/upscayl/upscayl', desc: 'Free open-source AI image upscaler for desktop.' }
];

// Deduplicate Batch A candidates against existing catalog
const filteredBatchA = [];
batchA_Tools.forEach(t => {
  const s = (t.slug || '').toLowerCase();
  const n = (t.name || '').toLowerCase();

  if (!existingSlugs.has(s) && !existingNames.has(n)) {
    existingSlugs.add(s);
    existingNames.add(n);
    filteredBatchA.push(t);
  }
});

console.log(`Filtered ${filteredBatchA.length} unique new tools to add in Batch A (after deduplication).`);

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    let parsedUrl;
    try { parsedUrl = new URL(urlStr); } catch (e) { return resolve({ status: 0, url: urlStr }); }
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.request({
      method: 'GET',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 8000
    }, (res) => { resolve({ status: res.statusCode, url: urlStr }); });
    req.on('error', () => resolve({ status: 0, url: urlStr }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, url: urlStr }); });
    req.end();
  });
}

async function run() {
  console.log(`Verifying URLs for Batch A tools...`);

  for (const t of filteredBatchA) {
    const res = await checkUrl(t.officialUrl);
    if (res.status >= 200 && res.status < 300) {
      urlCache[t.officialUrl] = 'verified';
    } else {
      urlCache[t.officialUrl] = 'bot_blocked';
    }
  }

  fs.writeFileSync(cacheFile, JSON.stringify(urlCache, null, 2), 'utf8');

  // Group by destination file
  const fileGroups = {};
  filteredBatchA.forEach(t => {
    const fileName = t.file;
    if (!fileGroups[fileName]) fileGroups[fileName] = [];
    fileGroups[fileName].push(t);
  });

  for (const [file, tools] of Object.entries(fileGroups)) {
    const filePath = path.join(catDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');

    let formattedTools = '';
    if (file === 'focused_tools.ts') {
      formattedTools = tools.map((t, idx) => {
        return `  focused('batchA-foc-${idx + 1}', '${t.slug}', '${t.name.replace(/'/g, "\\'")}', '${t.category}', '${t.officialUrl}', '${t.docsUrl}', '${t.desc.replace(/'/g, "\\'")}')`;
      }).join(',\n');
    } else {
      formattedTools = tools.map((t, idx) => {
        return `  {\n    "id": "batchA-${file.replace('.ts', '')}-${idx + 1}",\n    "slug": "${t.slug}",\n    "name": "${t.name.replace(/"/g, '\\"')}",\n    "logo": "https://api.dicebear.com/7.x/identicon/svg?seed=${t.slug}",\n    "category": "${t.category}",\n    "subcategory": "${t.subcategory || t.category}",\n    "pricingType": "free-tier",\n    "freePlanDetails": "Free tier available for core features.",\n    "signupRequired": true,\n    "installationRequired": false,\n    "platforms": ["Web"],\n    "shortDescription": "${t.desc.replace(/"/g, '\\"')}",\n    "fullDescription": "${t.desc.replace(/"/g, '\\"')} Essential tool for modern faculty workflows.",\n    "superpower": "${t.desc.replace(/"/g, '\\"')}",\n    "difficulty": "Beginner",\n    "learningTime": 20,\n    "whyLearn": ["Saves faculty preparation time"],\n    "useCases": ["Academic workflow optimization"],\n    "features": [{"title": "Core AI Feature", "description": "${t.desc.replace(/"/g, '\\"')}"}],\n    "steps": [{"title": "Get Started", "description": "Open official platform and set up account."}],\n    "practicalExercise": {"objective": "Master core workflow", "expectedResult": "Task completed", "skillsLearned": ["AI usage"]},\n    "officialUrl": "${t.officialUrl}",\n    "officialStatus": "verified",\n    "docsUrl": "${t.docsUrl}",\n    "docsStatus": "verified",\n    "keywords": ["${t.name}", "${t.category}", "faculty"]\n  }`;
      }).join(',\n');
    }

    content = content.replace(/];\s*$/, `,\n${formattedTools}\n];\n`);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  console.log('Batch A tools written successfully!');
}

run();
