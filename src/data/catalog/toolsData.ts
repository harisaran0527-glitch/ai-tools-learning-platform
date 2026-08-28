import { AITool } from '../../types/tool';
import { chatbots_assistants_tools } from './categories/chatbots_assistants';
import { image_generation_tools } from './categories/image_generation';
import { video_generation_tools } from './categories/video_generation';
import { audio_voice_tools } from './categories/audio_voice';
import { search_research_tools } from './categories/search_research';
import { document_writing_tools } from './categories/document_writing';
import { education_tools } from './categories/education';
import { gaming_3d_tools } from './categories/gaming_3d';
import { music_generation_tools } from './categories/music_generation';
import { speech_to_text_tools } from './categories/speech_to_text';
import { photo_editing_tools } from './categories/photo_editing';
import { ppt_presentation_creation_tools } from './categories/ppt_presentation_creation';

export const ALL_TOOLS: AITool[] = [
  ...chatbots_assistants_tools,
  ...image_generation_tools,
  ...video_generation_tools,
  ...audio_voice_tools,
  ...search_research_tools,
  ...document_writing_tools,
  ...education_tools,
  ...gaming_3d_tools,
  ...music_generation_tools,
  ...speech_to_text_tools,
  ...photo_editing_tools,
  ...ppt_presentation_creation_tools
];
