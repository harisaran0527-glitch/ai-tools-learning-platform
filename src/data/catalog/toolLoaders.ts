import { AITool, ToolSummary } from '../../types/tool';
import { catalogSummaries } from './summaryData';

type ToolModule = { default?: AITool[]; [key: string]: unknown };

const loaders: Record<string, () => Promise<ToolModule>> = {
  'Chatbots / Assistants': () => import('./categories/chatbots_assistants'),
  'Document / Writing': () => import('./categories/document_writing'),
  Education: () => import('./categories/education'),
  'Search / Research': () => import('./categories/search_research'),
  'PPT / Presentation Creation': () => import('./categories/ppt_presentation_creation'),
  'Image Generation': () => import('./categories/image_generation'),
  'Video Generation': () => import('./categories/video_generation'),
  'Audio / Voice': () => import('./categories/audio_voice'),
  'Speech to Text': () => import('./categories/speech_to_text'),
  'Photo Editing': () => import('./categories/photo_editing'),
  'Gaming / 3D': () => import('./categories/gaming_3d'),
  'Music Generation': () => import('./categories/music_generation'),
  'Website / App Creation': () => import('./categories/website_app_creation'),
  Coding: () => import('./categories/focused_tools'),
  'Productivity / Automation': () => import('./categories/focused_tools')
};

// Cache for loaded category modules to avoid re-fetching
const moduleCache = new Map<string, Promise<ToolModule>>();

/**
 * Load a category module, using cache to prevent duplicate network requests.
 */
function loadCategoryModule(category: string): Promise<ToolModule> {
  if (!moduleCache.has(category)) {
    const loader = loaders[category];
    if (!loader) throw new Error(`No loader found for category: ${category}`);
    moduleCache.set(category, loader());
  }
  return moduleCache.get(category)!;
}

const exportNames: Record<string, string> = {
  'Chatbots / Assistants': 'chatbots_assistants_tools', 'Document / Writing': 'document_writing_tools', Education: 'education_tools',
  'Search / Research': 'search_research_tools', 'PPT / Presentation Creation': 'ppt_presentation_creation_tools', 'Image Generation': 'image_generation_tools',
  'Video Generation': 'video_generation_tools', 'Audio / Voice': 'audio_voice_tools', 'Speech to Text': 'speech_to_text_tools', 'Photo Editing': 'photo_editing_tools',
  'Gaming / 3D': 'gaming_3d_tools', 'Music Generation': 'music_generation_tools', 'Website / App Creation': 'website_app_creation_tools', Coding: 'focused_tools', 'Productivity / Automation': 'focused_tools'
};

export const getSummaryBySlug = (slug: string): ToolSummary | undefined => catalogSummaries.find(tool => tool.slug === slug);

export async function loadToolBySlug(slug: string): Promise<AITool | undefined> {
  const summary = getSummaryBySlug(slug);
  if (!summary) return undefined;
  const module = await loadCategoryModule(summary.category);
  const tools = module[exportNames[summary.category]] as AITool[] | undefined;
  return tools?.find(tool => tool.slug === slug);
}