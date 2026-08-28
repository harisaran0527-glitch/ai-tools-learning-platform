export interface LearningPathModule {
  id: string;
  title: string;
  description: string;
  recommendedToolSlugs: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  targetAudience: string;
  description: string;
  icon: string;
  badge: string;
  modules: LearningPathModule[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'ai-for-faculty',
    title: 'AI for Faculty & Educators',
    targetAudience: 'Professors, Teachers, Academic Instructors',
    description: 'Master AI tools designed to transform lesson preparation, student assessment, grading, and academic research.',
    icon: '🎓',
    badge: 'FACULTY SPECIAL',
    modules: [
      {
        id: 'fac-mod-1',
        title: '1. AI Fundamentals & Ethics',
        description: 'Understand core AI concepts, ethical guidelines, academic integrity, and detection tools.',
        recommendedToolSlugs: ['chatgpt', 'claude', 'magicschool-ai', 'turnitin-ai-detector']
      },
      {
        id: 'fac-mod-2',
        title: '2. Effective Educational Prompting',
        description: 'Master prompt framing techniques for creating syllabus content, rubrics, and discussion prompts.',
        recommendedToolSlugs: ['claude', 'gemini', 'chatgpt']
      },
      {
        id: 'fac-mod-3',
        title: '3. Lesson Planning & Content Adaptation',
        description: 'Generate differentiated reading levels, unit plans, and classroom activity guides in seconds.',
        recommendedToolSlugs: ['diffit', 'magicschool-ai', 'eduaide-ai', 'brisk-teaching']
      },
      {
        id: 'fac-mod-4',
        title: '4. AI for Presentation & Slide Design',
        description: 'Convert lecture notes and raw text into visually engaging slide decks and visual flowcharts.',
        recommendedToolSlugs: ['napkin-ai', 'gamma-app', 'tome-app', 'beautiful-ai']
      },
      {
        id: 'fac-mod-5',
        title: '5. Academic Literature Review & Research',
        description: 'Accelerate paper analysis, citation discovery, and document synthesis with AI research engines.',
        recommendedToolSlugs: ['perplexity-ai', 'consensus-ai', 'elicit-com', 'scite-ai', 'scispace-typeset']
      },
      {
        id: 'fac-mod-6',
        title: '6. Academic Writing & Formatting',
        description: 'Refine research grant proposals, journal papers, and executive summaries.',
        recommendedToolSlugs: ['grammarly-ai', 'paperpal', 'quillbot', 'jenni-ai']
      },
      {
        id: 'fac-mod-7',
        title: '7. Automated Quiz & Test Generation',
        description: 'Create interactive 50-mark assessments, MCQs, and question banks automatically.',
        recommendedToolSlugs: ['quizizz-ai', 'questionwell', 'monic-ai', 'kahoot-ai']
      },
      {
        id: 'fac-mod-8',
        title: '8. Grading, Rubrics & Feedback Automation',
        description: 'Provide detailed, constructive feedback on student essays and lab reports efficiently.',
        recommendedToolSlugs: ['gradescope-ai', 'brisk-teaching', 'magicschool-ai']
      },
      {
        id: 'fac-mod-9',
        title: '9. Educational Diagram & Visual Creation',
        description: 'Design educational infographics, schematics, and concept graphics for lecture notes.',
        recommendedToolSlugs: ['napkin-ai', 'canva-text-to-image', 'photoroom']
      },
      {
        id: 'fac-mod-10',
        title: '10. Video & Micro-Lecture Generation',
        description: 'Produce synthetic avatar announcements, video lectures, and video captions.',
        recommendedToolSlugs: ['heygen', 'synthesia', 'veed-io-video', 'invideo-ai']
      },
      {
        id: 'fac-mod-11',
        title: '11. Student Engagement & Socratic Tutoring',
        description: 'Incorporate AI tutors into courses for 24/7 student guidance without revealing direct answers.',
        recommendedToolSlugs: ['khanmigo', 'curipod', 'goblin-tools']
      },
      {
        id: 'fac-mod-12',
        title: '12. AI Policy, Integrity & Verification',
        description: 'Set clear AI usage boundaries for coursework and verify student submission authenticity.',
        recommendedToolSlugs: ['gptzero', 'turnitin-ai-detector', 'copyleaks-ai-detector']
      }
    ]
  },
  {
    id: 'ai-beginner',
    title: 'AI Beginner Essentials',
    targetAudience: 'First-time AI Learners',
    description: 'A smooth starter path taking learners from zero knowledge to confident AI user in under 2 hours.',
    icon: '🚀',
    badge: 'STARTER',
    modules: [
      {
        id: 'beg-1',
        title: '1. Conversational AI Basics',
        description: 'Start with ChatGPT, Claude, and Gemini for general everyday questions.',
        recommendedToolSlugs: ['chatgpt', 'claude', 'gemini']
      },
      {
        id: 'beg-2',
        title: '2. Smart AI Search',
        description: 'Learn how Perplexity AI replaces traditional web search with instant cited answers.',
        recommendedToolSlugs: ['perplexity-ai', 'you-com']
      },
      {
        id: 'beg-3',
        title: '3. Writing & Grammar Editing',
        description: 'Enhance your emails and reports effortlessly.',
        recommendedToolSlugs: ['grammarly-ai', 'notion-ai']
      },
      {
        id: 'beg-4',
        title: '4. Instant Presentation Creation',
        description: 'Build your first 5-slide visual presentation using Napkin AI and Gamma.',
        recommendedToolSlugs: ['napkin-ai', 'gamma-app']
      },
      {
        id: 'beg-5',
        title: '5. Creative Image Synthesis',
        description: 'Generate custom graphics from simple prompts.',
        recommendedToolSlugs: ['canva-text-to-image', 'microsoft-designer']
      }
    ]
  },
  {
    id: 'ai-researcher',
    title: 'Academic & Data Researcher',
    targetAudience: 'Scholars, PhD Students, R&D Engineers',
    description: 'Streamline paper discovery, PDF synthesis, methodology cross-checking, and data extraction.',
    icon: '🔬',
    badge: 'RESEARCH',
    modules: [
      {
        id: 'res-1',
        title: '1. Systematic Literature Search',
        description: 'Discover relevant papers and visual citation maps.',
        recommendedToolSlugs: ['consensus-ai', 'elicit-com', 'connected-papers']
      },
      {
        id: 'res-2',
        title: '2. Deep PDF & Document Chat',
        description: 'Extract equations, methodologies, and findings from complex 50-page PDFs.',
        recommendedToolSlugs: ['chatpdf', 'humata-ai', 'scispace-typeset']
      },
      {
        id: 'res-3',
        title: '3. Citation Verification & Claims Matrix',
        description: 'Verify if scientific papers support or dispute specific hypotheses.',
        recommendedToolSlugs: ['scite-ai', 'scholarcy']
      }
    ]
  }
];
