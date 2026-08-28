import { AITool } from '../../types/tool';
import { audio_voice_tools } from './categories/audio_voice';
import { chatbots_assistants_tools } from './categories/chatbots_assistants';
import { document_writing_tools } from './categories/document_writing';
import { education_tools } from './categories/education';
import { gaming_3d_tools } from './categories/gaming_3d';
import { image_generation_tools } from './categories/image_generation';
import { music_generation_tools } from './categories/music_generation';
import { photo_editing_tools } from './categories/photo_editing';
import { ppt_presentation_creation_tools } from './categories/ppt_presentation_creation';
import { search_research_tools } from './categories/search_research';
import { speech_to_text_tools } from './categories/speech_to_text';
import { video_generation_tools } from './categories/video_generation';

export const ALL_TOOLS: AITool[] = [
  ...audio_voice_tools,
  ...chatbots_assistants_tools,
  ...document_writing_tools,
  ...education_tools,
  ...gaming_3d_tools,
  ...image_generation_tools,
  ...music_generation_tools,
  ...photo_editing_tools,
  ...ppt_presentation_creation_tools,
  ...search_research_tools,
  ...speech_to_text_tools,
  ...video_generation_tools
];
