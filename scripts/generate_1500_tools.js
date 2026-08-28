const fs = require('fs');
const path = require('path');

// 12 core categories matching reference
const categories = [
  { id: 'chatbots', name: 'Chatbots / Assistants', icon: '💬', subcategories: ['General Assistants', 'Coding Assistants', 'Agentic AI', 'Business Assistants', 'Local LLMs', 'Productivity Assistants'] },
  { id: 'image-generation', name: 'Image Generation', icon: '🎨', subcategories: ['Text to Image', 'Design & Layout', 'Vector & SVG', 'Stock & Illustrative', '3D Rendering', 'ControlNet & Editing'] },
  { id: 'video-generation', name: 'Video Generation', icon: '🎬', subcategories: ['Text to Video', 'AI Avatars & Presenters', 'Shorts & Clip Generation', 'Video Editing AI', 'Animation & FX', 'Lip-Sync & Translation'] },
  { id: 'audio-voice', name: 'Audio / Voice', icon: '🎙️', subcategories: ['Text to Speech (TTS)', 'Voice Cloning & Changer', 'Audio Clean-up & Enhancer', 'Podcast & Studio Tools', 'Dubbing & Localization'] },
  { id: 'search-research', name: 'Search / Research', icon: '🔍', subcategories: ['AI Search Engines', 'Academic Literature Review', 'PDF & Document Chat', 'Citation & Synthesis', 'Data & Trend Research'] },
  { id: 'document-writing', name: 'Document / Writing', icon: '📝', subcategories: ['Copywriting & Marketing', 'Academic & Technical Writing', 'Grammar & Paraphrasing', 'Notes & Knowledge Base', 'Email & Communication'] },
  { id: 'education', name: 'Education', icon: '🎓', subcategories: ['Lesson Planning', 'Quiz & Assessment Creation', 'Student Assistance & Tutoring', 'Grading & Feedback', 'Special Education & Accessibility', 'Language Learning'] },
  { id: 'gaming-3d', name: 'Gaming / 3D', icon: '🎮', subcategories: ['Text/Image to 3D', 'Game Asset Creation', 'NPC & Dialogue AI', 'World Generation', 'Animation Rigging'] },
  { id: 'music-generation', name: 'Music Generation', icon: '🎵', subcategories: ['Full Song Generation', 'Background Tracks', 'Stem Separation', 'Sound Effects (SFX)', 'Adaptive Audio'] },
  { id: 'speech-to-text', name: 'Speech to Text', icon: '🗣️', subcategories: ['Meeting Recording & Summary', 'Local & Privacy Transcription', 'Real-time Subtitles', 'Medical & Legal Transcription', 'Multi-lingual Speech API'] },
  { id: 'photo-editing', name: 'Photo Editing', icon: '🖼️', subcategories: ['Background Removal', 'Upscaling & Enhancement', 'Magic Eraser & Inpainting', 'Portrait Retouching', 'Batch Image Processing'] },
  { id: 'ppt-presentation', name: 'PPT / Presentation Creation', icon: '📊', subcategories: ['AI Slide Generators', 'Diagrams & Flowcharts', 'Infographic Generators', 'Pitch Deck Builders', 'Presenter AI Assistants'] }
];

console.log("Generating 1500+ unique AI tools database...");
