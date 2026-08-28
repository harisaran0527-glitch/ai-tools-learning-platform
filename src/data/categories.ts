export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'chatbots',
    name: 'Chatbots / Assistants',
    icon: '💬',
    description: 'AI conversational agents, coding co-pilots, agentic frameworks, and reasoning assistants.',
    subcategories: [
      'General Assistants',
      'Coding Assistants',
      'Agentic AI',
      'Business Assistants',
      'Local LLMs',
      'Productivity Assistants'
    ]
  },
  {
    id: 'image-generation',
    name: 'Image Generation',
    icon: '🎨',
    description: 'Photorealistic image synthesis, concept art creation, vector graphics, and design generation.',
    subcategories: [
      'Text to Image',
      'Design & Layout',
      'Vector & SVG',
      'Stock & Illustrative',
      '3D Rendering',
      'ControlNet & Editing'
    ]
  },
  {
    id: 'video-generation',
    name: 'Video Generation',
    icon: '🎬',
    description: 'Text-to-video, AI avatars, video editing automation, subtitle generation, and motion graphics.',
    subcategories: [
      'Text to Video',
      'AI Avatars & Presenters',
      'Shorts & Clip Generation',
      'Video Editing AI',
      'Animation & FX',
      'Lip-Sync & Translation'
    ]
  },
  {
    id: 'audio-voice',
    name: 'Audio / Voice',
    icon: '🎙️',
    description: 'Realistic text-to-speech, voice cloning, audio enhancement, noise removal, and podcast production.',
    subcategories: [
      'Text to Speech (TTS)',
      'Voice Cloning & Changer',
      'Audio Clean-up & Enhancer',
      'Podcast & Studio Tools',
      'Dubbing & Localization'
    ]
  },
  {
    id: 'search-research',
    name: 'Search / Research',
    icon: '🔍',
    description: 'Academic paper analysis, citation discovery, search engines, literature review, and PDF chat.',
    subcategories: [
      'AI Search Engines',
      'Academic Literature Review',
      'PDF & Document Chat',
      'Citation & Synthesis',
      'Data & Trend Research'
    ]
  },
  {
    id: 'document-writing',
    name: 'Document / Writing',
    icon: '📝',
    description: 'Copywriting, essay editing, grammar enhancement, email automation, and structured notes.',
    subcategories: [
      'Copywriting & Marketing',
      'Academic & Technical Writing',
      'Grammar & Paraphrasing',
      'Notes & Knowledge Base',
      'Email & Communication'
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: '🎓',
    description: 'Teacher lesson planning, quiz creation, student tutoring, rubric grading, and interactive learning.',
    subcategories: [
      'Lesson Planning',
      'Quiz & Assessment Creation',
      'Student Assistance & Tutoring',
      'Grading & Feedback',
      'Special Education & Accessibility',
      'Language Learning'
    ]
  },
  {
    id: 'gaming-3d',
    name: 'Gaming / 3D',
    icon: '🎮',
    description: '3D model generation, texture creation, game assets, NPC dialogue engines, and spatial computing.',
    subcategories: [
      'Text/Image to 3D',
      'Game Asset Creation',
      'NPC & Dialogue AI',
      'World Generation',
      'Animation Rigging'
    ]
  },
  {
    id: 'music-generation',
    name: 'Music Generation',
    icon: '🎵',
    description: 'AI full song creation, backing track synthesis, stem separation, and adaptive soundtracking.',
    subcategories: [
      'Full Song Generation',
      'Background Tracks',
      'Stem Separation',
      'Sound Effects (SFX)',
      'Adaptive Audio'
    ]
  },
  {
    id: 'speech-to-text',
    name: 'Speech to Text',
    icon: '🗣️',
    description: 'Automated transcription, meeting summaries, real-time captioning, and voice notes indexing.',
    subcategories: [
      'Meeting Recording & Summary',
      'Local & Privacy Transcription',
      'Real-time Subtitles',
      'Medical & Legal Transcription',
      'Multi-lingual Speech API'
    ]
  },
  {
    id: 'photo-editing',
    name: 'Photo Editing',
    icon: '🖼️',
    description: 'Background removal, resolution upscaling, object removal, lighting adjustment, and portrait retouching.',
    subcategories: [
      'Background Removal',
      'Upscaling & Enhancement',
      'Magic Eraser & Inpainting',
      'Portrait Retouching',
      'Batch Image Processing'
    ]
  },
  {
    id: 'ppt-presentation',
    name: 'PPT / Presentation Creation',
    icon: '📊',
    description: 'AI deck generators, diagram creation, flowchart conversion, visual infographics, and slide design.',
    subcategories: [
      'AI Slide Generators',
      'Diagrams & Flowcharts',
      'Infographic Generators',
      'Pitch Deck Builders',
      'Presenter AI Assistants'
    ]
  }
];
