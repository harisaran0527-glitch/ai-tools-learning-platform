import { AITool, ToolSummary } from '../../types/tool';
import { catalogSummaries, toolModuleBySlug } from './summaryData';

type ToolModule = { default?: AITool[]; [key: string]: unknown };

const loaders: Record<string, () => Promise<ToolModule>> = {
  chatbots_assistants: () => import('./categories/chatbots_assistants'),
  document_writing: () => import('./categories/document_writing'),
  education: () => import('./categories/education'),
  search_research: () => import('./categories/search_research'),
  ppt_presentation_creation: () => import('./categories/ppt_presentation_creation'),
  image_generation: () => import('./categories/image_generation'),
  video_generation: () => import('./categories/video_generation'),
  audio_voice: () => import('./categories/audio_voice'),
  speech_to_text: () => import('./categories/speech_to_text'),
  photo_editing: () => import('./categories/photo_editing'),
  gaming_3d: () => import('./categories/gaming_3d'),
  music_generation: () => import('./categories/music_generation'),
  website_app_creation: () => import('./categories/website_app_creation'),
  focused_tools: () => import('./categories/focused_tools'),
  verified_expansion_batch_1: () => import('./categories/verified_expansion_batch_1'),
  verified_expansion_batch_2: () => import('./categories/verified_expansion_batch_2')
};

// Cache for loaded category modules to avoid re-fetching
const moduleCache = new Map<string, Promise<ToolModule>>();

/**
 * Load a category module, using cache to prevent duplicate network requests.
 */
async function loadToolModule(moduleKey: string): Promise<ToolModule> {
  if (!moduleCache.has(moduleKey)) {
    const loader = loaders[moduleKey];
    if (!loader) throw new Error(`No loader found for module: ${moduleKey}`);
    moduleCache.set(moduleKey, loader());
  }
  return moduleCache.get(moduleKey)!;
}

const exportNames: Record<string, string> = {
  chatbots_assistants: 'chatbots_assistants_tools', document_writing: 'document_writing_tools', education: 'education_tools',
  search_research: 'search_research_tools', ppt_presentation_creation: 'ppt_presentation_creation_tools', image_generation: 'image_generation_tools',
  video_generation: 'video_generation_tools', audio_voice: 'audio_voice_tools', speech_to_text: 'speech_to_text_tools', photo_editing: 'photo_editing_tools',
  gaming_3d: 'gaming_3d_tools', music_generation: 'music_generation_tools', website_app_creation: 'website_app_creation_tools', focused_tools: 'focused_tools',
  verified_expansion_batch_1: 'verified_expansion_batch_1_tools', verified_expansion_batch_2: 'verified_expansion_batch_2_tools'
};

export const getSummaryBySlug = (slug: string): ToolSummary | undefined => catalogSummaries.find(tool => tool.slug === slug);

export async function loadToolBySlug(slug: string): Promise<AITool | undefined> {
  const summary = getSummaryBySlug(slug);
  if (!summary) return undefined;
  const moduleKey = toolModuleBySlug[summary.slug];
  if (!moduleKey) return undefined;
  const module = await loadToolModule(moduleKey);
  const tools = module[exportNames[moduleKey]] as AITool[] | undefined;
  return tools?.find(tool => tool.slug === slug);
}