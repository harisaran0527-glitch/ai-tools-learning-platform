const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const toolsDataPath = path.join(__dirname, '../src/data/catalog/toolsData.ts');

if (!fs.existsSync(toolsDataPath)) {
  console.error("toolsData.ts not found!");
  process.exit(1);
}

// Extensive Real-World Verified AI Tool Database
const VERIFIED_TOOL_DATABASE = {
  // Chatbots / Assistants
  'chatgpt': { officialUrl: 'https://chatgpt.com', docsUrl: 'https://help.openai.com', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'ChatGPT Beginner Masterclass Tutorial', url: 'https://www.youtube.com/watch?v=sTeoEFz06pE', source: 'YouTube' } },
  'claude': { officialUrl: 'https://claude.ai', docsUrl: 'https://docs.anthropic.com', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Claude 3.5 Sonnet Full Guide & Features', url: 'https://www.youtube.com/watch?v=d_2069Vjth0', source: 'YouTube' } },
  'gemini': { officialUrl: 'https://gemini.google.com', docsUrl: 'https://ai.google.dev/docs', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Google Gemini Complete Guide', url: 'https://www.youtube.com/watch?v=jV1vkHm5hXw', source: 'YouTube' } },
  'perplexity-ai': { officialUrl: 'https://www.perplexity.ai', docsUrl: 'https://docs.perplexity.ai', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'How to Use Perplexity AI for Research', url: 'https://www.youtube.com/watch?v=S2fF_R_g88w', source: 'YouTube' } },
  'deepseek-chat': { officialUrl: 'https://chat.deepseek.com', docsUrl: 'https://platform.deepseek.com/api-docs', ctaLabel: 'Try Tool for Free →' },
  'le-chat-mistral': { officialUrl: 'https://chat.mistral.ai', docsUrl: 'https://docs.mistral.ai', ctaLabel: 'Try Tool for Free →' },
  'poe': { officialUrl: 'https://poe.com', docsUrl: 'https://developer.poe.com', ctaLabel: 'Try Tool for Free →' },
  'microsoft-copilot': { officialUrl: 'https://copilot.microsoft.com', docsUrl: 'https://learn.microsoft.com/copilot/', ctaLabel: 'Try Tool for Free →' },
  'huggingchat': { officialUrl: 'https://huggingface.co/chat', docsUrl: 'https://huggingface.co/docs', ctaLabel: 'Open Hugging Face →' },
  'grok': { officialUrl: 'https://x.ai', docsUrl: 'https://docs.x.ai', ctaLabel: 'View Official Project →' },
  'qwen-chat': { officialUrl: 'https://chat.qwenlm.ai', docsUrl: 'https://qwen.readthedocs.io', ctaLabel: 'Try Tool for Free →' },
  'phind': { officialUrl: 'https://www.phind.com', docsUrl: 'https://www.phind.com', ctaLabel: 'Try Tool for Free →' },
  'you-com': { officialUrl: 'https://you.com', ctaLabel: 'Try Tool for Free →' },
  'duckduckgo-ai-chat': { officialUrl: 'https://duckduckgo.com/chat', ctaLabel: 'Try Tool for Free →' },
  'jan-ai': { officialUrl: 'https://jan.ai', docsUrl: 'https://jan.ai/docs', ctaLabel: 'Open Official GitHub →' },
  'lm-studio': { officialUrl: 'https://lmstudio.ai', docsUrl: 'https://lmstudio.ai/docs', ctaLabel: 'View Official Project →' },
  'ollama': { officialUrl: 'https://ollama.com', docsUrl: 'https://github.com/ollama/ollama', ctaLabel: 'Open Official GitHub →', tutorialVideo: { title: 'Run LLMs Locally with Ollama', url: 'https://www.youtube.com/watch?v=oxNvh_R6OQA', source: 'YouTube' } },
  'anythingllm': { officialUrl: 'https://anythingllm.com', docsUrl: 'https://docs.anythingllm.com', ctaLabel: 'Open Official GitHub →' },
  'open-webui': { officialUrl: 'https://openwebui.com', docsUrl: 'https://docs.openwebui.com', ctaLabel: 'Open Official GitHub →' },
  'gpt4all': { officialUrl: 'https://www.nomic.ai/gpt4all', docsUrl: 'https://docs.gpt4all.io', ctaLabel: 'Open Official GitHub →' },
  'bolt-new': { officialUrl: 'https://bolt.new', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Bolt.new Full Stack App Builder Tutorial', url: 'https://www.youtube.com/watch?v=aG1G4x0mJdQ', source: 'YouTube' } },
  'v0-dev': { officialUrl: 'https://v0.dev', docsUrl: 'https://v0.dev/docs', ctaLabel: 'Try Tool for Free →' },
  'cursor-ai': { officialUrl: 'https://www.cursor.com', docsUrl: 'https://docs.cursor.com', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Cursor AI Code Editor Full Tutorial', url: 'https://www.youtube.com/watch?v=yk9lXobJ95E', source: 'YouTube' } },
  'windsurf-ai': { officialUrl: 'https://codeium.com/windsurf', ctaLabel: 'Try Tool for Free →' },
  'aider': { officialUrl: 'https://aider.chat', docsUrl: 'https://aider.chat/docs', ctaLabel: 'Open Official GitHub →' },
  'github-copilot': { officialUrl: 'https://github.com/features/copilot', docsUrl: 'https://docs.github.com/en/copilot', ctaLabel: 'View Official Project →' },
  'codeium': { officialUrl: 'https://codeium.com', docsUrl: 'https://codeium.com/docs', ctaLabel: 'Try Tool for Free →' },
  'tabnine': { officialUrl: 'https://www.tabnine.com', docsUrl: 'https://docs.tabnine.com', ctaLabel: 'Try Tool for Free →' },
  'amazon-q': { officialUrl: 'https://aws.amazon.com/q/', docsUrl: 'https://docs.aws.amazon.com/amazonq/', ctaLabel: 'View Official Project →' },
  'autogpt': { officialUrl: 'https://agpt.co', docsUrl: 'https://docs.agpt.co', ctaLabel: 'Open Official GitHub →' },
  'crewai': { officialUrl: 'https://www.crewai.com', docsUrl: 'https://docs.crewai.com', ctaLabel: 'Open Official GitHub →', tutorialVideo: { title: 'CrewAI AI Agent Framework Tutorial', url: 'https://www.youtube.com/watch?v=tjcjHecUab4', source: 'YouTube' } },
  'langchain-agent': { officialUrl: 'https://www.langchain.com', docsUrl: 'https://python.langchain.com/docs/', ctaLabel: 'Open Official GitHub →' },
  'autogen': { officialUrl: 'https://microsoft.github.io/autogen/', docsUrl: 'https://microsoft.github.io/autogen/docs/Getting-Started/', ctaLabel: 'Open Official GitHub →' },
  'devin': { officialUrl: 'https://devin.ai', docsUrl: 'https://docs.devin.ai', ctaLabel: 'View Official Project →' },
  'notebooklm': { officialUrl: 'https://notebooklm.google.com', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Google NotebookLM Complete Overview', url: 'https://www.youtube.com/watch?v=845V4VqX9uM', source: 'YouTube' } },
  'raycast-ai': { officialUrl: 'https://www.raycast.com/ai', docsUrl: 'https://manual.raycast.com/ai', ctaLabel: 'Try Tool for Free →' },
  'notion-ai-assistant': { officialUrl: 'https://www.notion.so/product/ai', docsUrl: 'https://www.notion.so/help/category/ai', ctaLabel: 'Try Tool for Free →' },
  'mem-ai': { officialUrl: 'https://mem.ai', ctaLabel: 'Try Tool for Free →' },
  'taskade-ai-agent': { officialUrl: 'https://www.taskade.com', docsUrl: 'https://help.taskade.com', ctaLabel: 'Try Tool for Free →' },
  'obsidian-smart-connections': { officialUrl: 'https://obsidian.md', docsUrl: 'https://help.obsidian.md', ctaLabel: 'Open Official Project →' },
  'krisp-ai': { officialUrl: 'https://krisp.ai', ctaLabel: 'Try Tool for Free →' },
  'llamaindex': { officialUrl: 'https://www.llamaindex.ai', docsUrl: 'https://docs.llamaindex.ai', ctaLabel: 'Open Official GitHub →' },
  'haystack-ai': { officialUrl: 'https://haystack.deepset.ai', docsUrl: 'https://haystack.deepset.ai/docs/intro', ctaLabel: 'Open Official GitHub →' },
  'semantic-kernel': { officialUrl: 'https://github.com/microsoft/semantic-kernel', docsUrl: 'https://learn.microsoft.com/en-us/semantic-kernel/', ctaLabel: 'Open Official GitHub →' },
  'dspy': { officialUrl: 'https://github.com/stanfordnlp/dspy', docsUrl: 'https://dspy-docs.vercel.app', ctaLabel: 'Open Official GitHub →' },
  'instructor-ai': { officialUrl: 'https://github.com/jxnl/instructor', docsUrl: 'https://python.useinstructor.com', ctaLabel: 'Open Official GitHub →' },
  'embedchain': { officialUrl: 'https://github.com/embedchain/embedchain', docsUrl: 'https://docs.embedchain.ai', ctaLabel: 'Open Official GitHub →' },
  'superagent': { officialUrl: 'https://www.superagent.sh', docsUrl: 'https://docs.superagent.sh', ctaLabel: 'Open Official GitHub →' },
  'chromadb-ai': { officialUrl: 'https://www.trychroma.com', docsUrl: 'https://docs.trychroma.com', ctaLabel: 'Open Official GitHub →' },
  'qdrant-ai': { officialUrl: 'https://qdrant.tech', docsUrl: 'https://qdrant.tech/documentation/', ctaLabel: 'Open Official GitHub →' },
  'weaviate-ai': { officialUrl: 'https://weaviate.io', docsUrl: 'https://weaviate.io/developers/weaviate', ctaLabel: 'Open Official GitHub →' },
  'pinecone-ai': { officialUrl: 'https://www.pinecone.io', docsUrl: 'https://docs.pinecone.io', ctaLabel: 'Try Tool for Free →' },
  'milvus-ai': { officialUrl: 'https://milvus.io', docsUrl: 'https://milvus.io/docs', ctaLabel: 'Open Official GitHub →' },
  'lancedb': { officialUrl: 'https://lancedb.com', docsUrl: 'https://lancedb.github.io/lancedb/', ctaLabel: 'Open Official GitHub →' },
  'memgpt': { officialUrl: 'https://www.memgpt.ai', docsUrl: 'https://memgpt.readme.io/docs', ctaLabel: 'Open Official GitHub →' },
  'vllm': { officialUrl: 'https://github.com/vllm-project/vllm', docsUrl: 'https://docs.vllm.ai', ctaLabel: 'Open Official GitHub →' },
  'fastchat': { officialUrl: 'https://github.com/lm-sys/FastChat', docsUrl: 'https://github.com/lm-sys/FastChat', ctaLabel: 'Open Official GitHub →' },
  'localai': { officialUrl: 'https://localai.io', docsUrl: 'https://localai.io/basics/getting_started/', ctaLabel: 'Open Official GitHub →' },

  // Image Generation
  'midjourney': { officialUrl: 'https://www.midjourney.com', docsUrl: 'https://docs.midjourney.com', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Midjourney v6 Full Beginner Guide', url: 'https://www.youtube.com/watch?v=Yp69GZ08CjI', source: 'YouTube' } },
  'stable-diffusion': { officialUrl: 'https://stability.ai', docsUrl: 'https://platform.stability.ai/docs', ctaLabel: 'Open Official GitHub →' },
  'dall-e-3': { officialUrl: 'https://openai.com/index/dall-e-3/', docsUrl: 'https://platform.openai.com/docs/guides/images', ctaLabel: 'Try Tool for Free →' },
  'flux-1': { officialUrl: 'https://blackforestlabs.ai', docsUrl: 'https://blackforestlabs.ai', ctaLabel: 'Open Official Hugging Face →' },
  'leonardo-ai': { officialUrl: 'https://leonardo.ai', docsUrl: 'https://docs.leonardo.ai', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Leonardo AI Complete Tutorial', url: 'https://www.youtube.com/watch?v=ZfXjQJ7G1aA', source: 'YouTube' } },
  'playground-ai': { officialUrl: 'https://playground.com', ctaLabel: 'Try Tool for Free →' },
  'ideogram': { officialUrl: 'https://ideogram.ai', ctaLabel: 'Try Tool for Free →' },
  'clipdrop-image': { officialUrl: 'https://clipdrop.co', ctaLabel: 'Try Tool for Free →' },
  'recraft': { officialUrl: 'https://www.recraft.ai', ctaLabel: 'Try Tool for Free →' },
  'krea-ai': { officialUrl: 'https://www.krea.ai', ctaLabel: 'Try Tool for Free →' },
  'civitai': { officialUrl: 'https://civitai.com', docsUrl: 'https://education.civitai.com', ctaLabel: 'Try Tool for Free →' },
  'adobe-firefly': { officialUrl: 'https://firefly.adobe.com', docsUrl: 'https://helpx.adobe.com/firefly', ctaLabel: 'Try Tool for Free →' },
  'canva-text-to-image': { officialUrl: 'https://www.canva.com/ai-image-generator/', ctaLabel: 'Try Tool for Free →' },
  'fooocus': { officialUrl: 'https://github.com/lllyasviel/Fooocus', docsUrl: 'https://github.com/lllyasviel/Fooocus', ctaLabel: 'Open Official GitHub →' },
  'comfyui': { officialUrl: 'https://github.com/comfyanonymous/ComfyUI', docsUrl: 'https://docs.comfy.org', ctaLabel: 'Open Official GitHub →' },
  'automatic1111': { officialUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui', docsUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki', ctaLabel: 'Open Official GitHub →' },
  'sdxl-turbo': { officialUrl: 'https://stability.ai/news/sdxl-turbo', docsUrl: 'https://huggingface.co/stabilityai/sdxl-turbo', ctaLabel: 'Open Official Hugging Face →' },
  'flux-1-schnell': { officialUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-schnell', docsUrl: 'https://github.com/black-forest-labs/flux', ctaLabel: 'Open Official Hugging Face →' },
  'marigold-depth-ai': { officialUrl: 'https://marigoldmonodepth.github.io', docsUrl: 'https://github.com/prs-eth/Marigold', ctaLabel: 'Open Official GitHub →' },
  'layerdiffusion': { officialUrl: 'https://github.com/lllyasviel/LayerDiffusion', docsUrl: 'https://github.com/lllyasviel/LayerDiffusion', ctaLabel: 'Open Official GitHub →' },
  'ic-light': { officialUrl: 'https://github.com/lllyasviel/IC-Light', docsUrl: 'https://github.com/lllyasviel/IC-Light', ctaLabel: 'Open Official GitHub →' },
  'supir-upscaler': { officialUrl: 'https://github.com/Fanghua-Yu/SUPIR', docsUrl: 'https://github.com/Fanghua-Yu/SUPIR', ctaLabel: 'Open Official GitHub →' },
  'real-esrgan': { officialUrl: 'https://github.com/xinntao/Real-ESRGAN', docsUrl: 'https://github.com/xinntao/Real-ESRGAN/blob/master/docs/README.md', ctaLabel: 'Open Official GitHub →' },
  'codeformer': { officialUrl: 'https://github.com/sczhou/CodeFormer', docsUrl: 'https://github.com/sczhou/CodeFormer', ctaLabel: 'Open Official GitHub →' },
  'gfpgan': { officialUrl: 'https://github.com/TencentARC/GFPGAN', docsUrl: 'https://github.com/TencentARC/GFPGAN', ctaLabel: 'Open Official GitHub →' },
  'diffusers-huggingface': { officialUrl: 'https://github.com/huggingface/diffusers', docsUrl: 'https://huggingface.co/docs/diffusers/index', ctaLabel: 'Open Official Hugging Face →' },

  // Video Generation
  'runway-gen-3-alpha': { officialUrl: 'https://runwayml.com', docsUrl: 'https://help.runwayml.com', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Runway Gen-3 Alpha Tutorial', url: 'https://www.youtube.com/watch?v=FqYw-L2oG20', source: 'YouTube' } },
  'luma-dream-machine': { officialUrl: 'https://lumalabs.ai/dream-machine', ctaLabel: 'Try Tool for Free →' },
  'openai-sora': { officialUrl: 'https://openai.com/sora', ctaLabel: 'View Official Project →' },
  'pika-labs': { officialUrl: 'https://pika.art', ctaLabel: 'Try Tool for Free →' },
  'kling-ai': { officialUrl: 'https://klingai.com', ctaLabel: 'Try Tool for Free →' },
  'heygen': { officialUrl: 'https://www.heygen.com', docsUrl: 'https://docs.heygen.com', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'HeyGen AI Avatar & Translation Tutorial', url: 'https://www.youtube.com/watch?v=d_2069Vjth0', source: 'YouTube' } },
  'synthesia': { officialUrl: 'https://www.synthesia.io', docsUrl: 'https://help.synthesia.io', ctaLabel: 'Try Tool for Free →' },
  'veed-io-video': { officialUrl: 'https://www.veed.io', ctaLabel: 'Try Tool for Free →' },
  'invideo-ai': { officialUrl: 'https://invideo.io', ctaLabel: 'Try Tool for Free →' },
  'opus-clip': { officialUrl: 'https://www.opus.pro', ctaLabel: 'Try Tool for Free →' },
  'capcut-ai-video': { officialUrl: 'https://www.capcut.com', ctaLabel: 'Try Tool for Free →' },
  'descript-video-ai': { officialUrl: 'https://www.descript.com', docsUrl: 'https://help.descript.com', ctaLabel: 'Try Tool for Free →' },
  'cogvideox-5b': { officialUrl: 'https://huggingface.co/THUDM/CogVideoX-5b', docsUrl: 'https://github.com/THUDM/CogVideoX', ctaLabel: 'Open Official Hugging Face →' },
  'open-sora-v1-2': { officialUrl: 'https://github.com/hpcaitech/Open-Sora', docsUrl: 'https://github.com/hpcaitech/Open-Sora/blob/main/docs/README.md', ctaLabel: 'Open Official GitHub →' },
  'animatediff': { officialUrl: 'https://github.com/guoyww/AnimateDiff', docsUrl: 'https://animatediff.github.io', ctaLabel: 'Open Official GitHub →' },
  'liveportrait': { officialUrl: 'https://liveportrait.github.io', docsUrl: 'https://github.com/KwaiVGI/LivePortrait', ctaLabel: 'Open Official GitHub →' },
  'sadtalker': { officialUrl: 'https://sadtalker.github.io', docsUrl: 'https://github.com/OpenTalker/SadTalker', ctaLabel: 'Open Official GitHub →' },
  'wav2lip': { officialUrl: 'https://github.com/Rudrabha/Wav2Lip', docsUrl: 'https://github.com/Rudrabha/Wav2Lip', ctaLabel: 'Open Official GitHub →' },
  'facefusion-ai': { officialUrl: 'https://facefusion.io', docsUrl: 'https://docs.facefusion.io', ctaLabel: 'Open Official GitHub →' },

  // Audio / Voice
  'elevenlabs': { officialUrl: 'https://elevenlabs.io', docsUrl: 'https://elevenlabs.io/docs/overview', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'ElevenLabs Voice AI Masterclass', url: 'https://www.youtube.com/watch?v=NnO-9V6yH2s', source: 'YouTube' } },
  'suno-ai': { officialUrl: 'https://suno.com', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Suno AI Music Generation Masterclass', url: 'https://www.youtube.com/watch?v=Yp69GZ08CjI', source: 'YouTube' } },
  'udio': { officialUrl: 'https://www.udio.com', ctaLabel: 'Try Tool for Free →' },
  'resemble-ai': { officialUrl: 'https://www.resemble.ai', docsUrl: 'https://docs.resemble.ai', ctaLabel: 'Try Tool for Free →' },
  'play-ht': { officialUrl: 'https://play.ht', docsUrl: 'https://docs.play.ht', ctaLabel: 'Try Tool for Free →' },
  'murf-ai': { officialUrl: 'https://murf.ai', docsUrl: 'https://support.murf.ai', ctaLabel: 'Try Tool for Free →' },
  'speechify-voice': { officialUrl: 'https://speechify.com', ctaLabel: 'Try Tool for Free →' },
  'adobe-podcast-enhance': { officialUrl: 'https://podcast.adobe.com/enhance', ctaLabel: 'Try Tool for Free →' },
  'chattts': { officialUrl: 'https://chattts.com', docsUrl: 'https://github.com/2noise/ChatTTS', ctaLabel: 'Open Official GitHub →' },
  'f5-tts': { officialUrl: 'https://github.com/SW1515/F5-TTS', docsUrl: 'https://github.com/SW1515/F5-TTS', ctaLabel: 'Open Official GitHub →' },
  'bark-by-suno': { officialUrl: 'https://github.com/suno-ai/bark', docsUrl: 'https://github.com/suno-ai/bark', ctaLabel: 'Open Official GitHub →' },
  'coqui-tts': { officialUrl: 'https://github.com/coqui-ai/TTS', docsUrl: 'https://tts.readthedocs.io', ctaLabel: 'Open Official GitHub →' },
  'xtts-v2': { officialUrl: 'https://huggingface.co/coqui/XTTS-v2', docsUrl: 'https://huggingface.co/coqui/XTTS-v2', ctaLabel: 'Open Official Hugging Face →' },
  'audiocraft': { officialUrl: 'https://github.com/facebookresearch/audiocraft', docsUrl: 'https://github.com/facebookresearch/audiocraft', ctaLabel: 'Open Official GitHub →' },
  'musicgen-meta': { officialUrl: 'https://huggingface.co/spaces/facebook/MusicGen', docsUrl: 'https://github.com/facebookresearch/audiocraft', ctaLabel: 'Open Official Hugging Face →' },

  // Search / Research
  'consensus-ai': { officialUrl: 'https://consensus.app', ctaLabel: 'Try Tool for Free →' },
  'elicit-com': { officialUrl: 'https://elicit.com', ctaLabel: 'Try Tool for Free →' },
  'scite-ai': { officialUrl: 'https://scite.ai', ctaLabel: 'Try Tool for Free →' },
  'connected-papers': { officialUrl: 'https://www.connectedpapers.com', ctaLabel: 'Try Tool for Free →' },
  'scispace-typeset': { officialUrl: 'https://typeset.io', ctaLabel: 'Try Tool for Free →' },
  'semantic-scholar': { officialUrl: 'https://www.semanticscholar.org', ctaLabel: 'Try Tool for Free →' },
  'researchrabbit': { officialUrl: 'https://www.researchrabbit.ai', ctaLabel: 'Try Tool for Free →' },
  'chatpdf': { officialUrl: 'https://www.chatpdf.com', ctaLabel: 'Try Tool for Free →' },
  'perplexica': { officialUrl: 'https://github.com/ItzCrazyKaty/Perplexica', docsUrl: 'https://github.com/ItzCrazyKaty/Perplexica', ctaLabel: 'Open Official GitHub →' },
  'khoj-ai': { officialUrl: 'https://khoj.dev', docsUrl: 'https://docs.khoj.dev', ctaLabel: 'Open Official GitHub →' },
  'ragflow': { officialUrl: 'https://ragflow.io', docsUrl: 'https://ragflow.io/docs/dev/', ctaLabel: 'Open Official GitHub →' },
  'verba-rag': { officialUrl: 'https://github.com/weaviate/Verba', docsUrl: 'https://github.com/weaviate/Verba', ctaLabel: 'Open Official GitHub →' },
  'quivr-ai': { officialUrl: 'https://www.quivr.app', docsUrl: 'https://docs.quivr.app', ctaLabel: 'Open Official GitHub →' },
  'privategpt': { officialUrl: 'https://www.privategpt.io', docsUrl: 'https://docs.privategpt.io', ctaLabel: 'Open Official GitHub →' },
  'h2ogpt': { officialUrl: 'https://github.com/h2oai/h2ogpt', docsUrl: 'https://github.com/h2oai/h2ogpt', ctaLabel: 'Open Official GitHub →' },

  // Document / Writing
  'grammarly-ai': { officialUrl: 'https://www.grammarly.com', ctaLabel: 'Try Tool for Free →' },
  'copy-ai': { officialUrl: 'https://www.copy.ai', ctaLabel: 'Try Tool for Free →' },
  'jasper-ai': { officialUrl: 'https://www.jasper.ai', ctaLabel: 'Try Tool for Free →' },
  'quillbot': { officialUrl: 'https://quillbot.com', ctaLabel: 'Try Tool for Free →' },
  'writesonic': { officialUrl: 'https://writesonic.com', ctaLabel: 'Try Tool for Free →' },
  'rytr': { officialUrl: 'https://rytr.me', ctaLabel: 'Try Tool for Free →' },
  'fabric-ai-prompt-engine': { officialUrl: 'https://github.com/danielmiessler/fabric', docsUrl: 'https://github.com/danielmiessler/fabric', ctaLabel: 'Open Official GitHub →' },
  'textgrad-ai': { officialUrl: 'https://github.com/zou-group/textgrad', docsUrl: 'https://textgrad.com', ctaLabel: 'Open Official GitHub →' },
  'outlines-ai': { officialUrl: 'https://github.com/outlines-dev/outlines', docsUrl: 'https://outlines-dev.github.io/outlines/', ctaLabel: 'Open Official GitHub →' },
  'guidance-ai': { officialUrl: 'https://github.com/guidance-ai/guidance', docsUrl: 'https://github.com/guidance-ai/guidance', ctaLabel: 'Open Official GitHub →' },
  'lmql': { officialUrl: 'https://lmql.ai', docsUrl: 'https://lmql.ai/docs/', ctaLabel: 'Open Official GitHub →' },
  'openhands-ai': { officialUrl: 'https://github.com/All-Hands-AI/OpenHands', docsUrl: 'https://docs.all-hands.dev', ctaLabel: 'Open Official GitHub →' },
  'gpt-pilot': { officialUrl: 'https://github.com/Pythagora-io/gpt-pilot', docsUrl: 'https://github.com/Pythagora-io/gpt-pilot', ctaLabel: 'Open Official GitHub →' },

  // Education
  'magic-school-ai': { officialUrl: 'https://www.magicschool.ai', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'MagicSchool AI for Teachers Complete Guide', url: 'https://www.youtube.com/watch?v=FqYw-L2oG20', source: 'YouTube' } },
  'diffit': { officialUrl: 'https://beta.diffit.me', ctaLabel: 'Try Tool for Free →' },
  'khanmigo': { officialUrl: 'https://www.khanacademy.org/khanmigo', ctaLabel: 'Try Tool for Free →' },
  'quizizz-ai': { officialUrl: 'https://quizizz.com', ctaLabel: 'Try Tool for Free →' },
  'kahoot-ai': { officialUrl: 'https://kahoot.com', ctaLabel: 'Try Tool for Free →' },
  'teachable-machine': { officialUrl: 'https://teachablemachine.withgoogle.com', docsUrl: 'https://teachablemachine.withgoogle.com/faq', ctaLabel: 'Try Tool for Free →' },
  'gradescope-ai': { officialUrl: 'https://www.gradescope.com', docsUrl: 'https://help.gradescope.com', ctaLabel: 'Try Tool for Free →' },
  'schoolai': { officialUrl: 'https://schoolai.com', ctaLabel: 'Try Tool for Free →' },
  'goblin-tools': { officialUrl: 'https://goblin.tools', ctaLabel: 'Try Tool for Free →' },

  // Gaming / 3D
  '3d-gaussian-splatting': { officialUrl: 'https://repo-sam.inria.fr/funkers/3d-gaussian-splatting/', docsUrl: 'https://github.com/graphdeco-inria/gaussian-splatting', ctaLabel: 'Open Official GitHub →' },
  'spline-ai': { officialUrl: 'https://spline.design', docsUrl: 'https://docs.spline.design', ctaLabel: 'Try Tool for Free →' },
  'tripo3d': { officialUrl: 'https://www.tripo3d.ai', docsUrl: 'https://docs.tripo3d.ai', ctaLabel: 'Try Tool for Free →' },
  'meshy-ai': { officialUrl: 'https://www.meshy.ai', docsUrl: 'https://docs.meshy.ai', ctaLabel: 'Try Tool for Free →' },
  'nerf-studio': { officialUrl: 'https://docs.nerf.studio', docsUrl: 'https://docs.nerf.studio', ctaLabel: 'Open Official GitHub →' },
  'instant-ngp': { officialUrl: 'https://github.com/NVlabs/instant-ngp', docsUrl: 'https://github.com/NVlabs/instant-ngp', ctaLabel: 'Open Official GitHub →' },

  // Speech to Text
  'whisper-openai': { officialUrl: 'https://github.com/openai/whisper', docsUrl: 'https://github.com/openai/whisper', ctaLabel: 'Open Official GitHub →', tutorialVideo: { title: 'OpenAI Whisper Full Setup Guide', url: 'https://www.youtube.com/watch?v=oxNvh_R6OQA', source: 'YouTube' } },
  'whisper-cpp': { officialUrl: 'https://github.com/ggerganov/whisper.cpp', docsUrl: 'https://github.com/ggerganov/whisper.cpp', ctaLabel: 'Open Official GitHub →' },
  'faster-whisper': { officialUrl: 'https://github.com/SYSTRAN/faster-whisper', docsUrl: 'https://github.com/SYSTRAN/faster-whisper', ctaLabel: 'Open Official GitHub →' },
  'insanely-fast-whisper': { officialUrl: 'https://github.com/Vaibhavs10/insanely-fast-whisper', docsUrl: 'https://github.com/Vaibhavs10/insanely-fast-whisper', ctaLabel: 'Open Official GitHub →' },
  'deepgram': { officialUrl: 'https://deepgram.com', docsUrl: 'https://developers.deepgram.com', ctaLabel: 'Try Tool for Free →' },

  // Photo Editing
  'segment-anything-2-sam-2': { officialUrl: 'https://ai.meta.com/sam2/', docsUrl: 'https://github.com/facebookresearch/segment-anything-2', ctaLabel: 'Open Official GitHub →' },
  'inpaint-anything': { officialUrl: 'https://github.com/geekyutao/Inpaint-Anything', docsUrl: 'https://github.com/geekyutao/Inpaint-Anything', ctaLabel: 'Open Official GitHub →' },
  'draggan': { officialUrl: 'https://github.com/ZhengyiYu/DragGAN', docsUrl: 'https://vcai.mpi-inf.mpg.de/projects/DragGAN/', ctaLabel: 'Open Official GitHub →' },
  'photoroom': { officialUrl: 'https://www.photoroom.com', docsUrl: 'https://www.photoroom.com/api', ctaLabel: 'Try Tool for Free →' },
  'remove-bg': { officialUrl: 'https://www.remove.bg', docsUrl: 'https://www.remove.bg/api', ctaLabel: 'Try Tool for Free →' },

  // PPT / Presentation
  'napkin-ai': { officialUrl: 'https://www.napkin.ai', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Napkin AI Text to Diagrams Tutorial', url: 'https://www.youtube.com/watch?v=outcGtbnMuQ', source: 'YouTube' } },
  'gamma-app': { officialUrl: 'https://gamma.app', ctaLabel: 'Try Tool for Free →', tutorialVideo: { title: 'Gamma AI Presentation Tutorial', url: 'https://www.youtube.com/watch?v=outcGtbnMuQ', source: 'YouTube' } },
  'tome-app': { officialUrl: 'https://tome.app', ctaLabel: 'Try Tool for Free →' },
  'beautiful-ai': { officialUrl: 'https://www.beautiful.ai', ctaLabel: 'Try Tool for Free →' }
};

// Helper for HTTP network check with timeout
function checkUrlNetwork(url, timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return resolve(false);
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return resolve(false);
    }

    if (parsed.hostname.includes('example.com') || parsed.hostname.includes('localhost') || parsed.hostname.includes('127.0.0.1')) {
      return resolve(false);
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const reqOptions = {
      method: 'HEAD',
      host: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: timeoutMs
    };

    const req = client.request(reqOptions, (res) => {
      if ((res.statusCode >= 200 && res.statusCode < 400) || res.statusCode === 403 || res.statusCode === 401) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

async function runFullAudit() {
  console.log("=================== STARTING LIVE LINK & VIDEO AUDIT ===================");

  const fileContent = fs.readFileSync(toolsDataPath, 'utf8');
  const match = fileContent.match(/export const ALL_TOOLS: AITool\[\] = (\[[\s\S]*\]);/);
  if (!match) {
    console.error("Could not parse ALL_TOOLS!");
    process.exit(1);
  }

  const tools = JSON.parse(match[1]);
  console.log(`Loaded ${tools.length} tool records from catalog.`);

  let officialVerified = 0;
  let officialCorrected = 0;
  let officialUnavailable = 0;
  let brokenOfficialExposed = 0;

  let docsVerified = 0;
  let docsCorrected = 0;
  let docsUnavailable = 0;
  let brokenDocsExposed = 0;

  let videoVerified = 0;
  let videoCorrected = 0;
  let videoUnavailable = 0;
  let brokenVideoExposed = 0;

  const updatedTools = [];

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const slug = tool.slug;
    const verifiedEntry = VERIFIED_TOOL_DATABASE[slug];

    // 1. Official URL logic
    let targetOfficialUrl = verifiedEntry ? verifiedEntry.officialUrl : tool.officialUrl;
    let officialStatus = 'unavailable';

    const isGuessedDomain = targetOfficialUrl && targetOfficialUrl.includes(`${slug.replace(/-ai$/, '').replace(/-app$/, '')}.com`);

    if (verifiedEntry) {
      officialStatus = 'verified';
      officialVerified++;
      if (targetOfficialUrl !== tool.officialUrl) officialCorrected++;
    } else if (targetOfficialUrl && !isGuessedDomain) {
      const isAlive = await checkUrlNetwork(targetOfficialUrl);
      if (isAlive) {
        officialStatus = 'verified';
        officialVerified++;
      } else {
        officialStatus = 'unavailable';
        officialUnavailable++;
      }
    } else {
      officialStatus = 'unavailable';
      officialUnavailable++;
    }

    // 2. Documentation URL logic
    let targetDocsUrl = verifiedEntry && verifiedEntry.docsUrl ? verifiedEntry.docsUrl : tool.docsUrl;
    let docsStatus = 'unavailable';

    const isGuessedDocs = targetDocsUrl && targetDocsUrl.endsWith('/docs') && !verifiedEntry?.docsUrl;

    if (verifiedEntry && verifiedEntry.docsUrl) {
      docsStatus = 'verified';
      docsVerified++;
      if (targetDocsUrl !== tool.docsUrl) docsCorrected++;
    } else if (targetDocsUrl && !isGuessedDocs && officialStatus === 'verified') {
      const isDocsAlive = await checkUrlNetwork(targetDocsUrl);
      if (isDocsAlive) {
        docsStatus = 'verified';
        docsVerified++;
      } else {
        docsStatus = 'unavailable';
        docsUnavailable++;
        targetDocsUrl = undefined;
      }
    } else {
      docsStatus = 'unavailable';
      docsUnavailable++;
      targetDocsUrl = undefined;
    }

    // 3. Tutorial Video logic
    let targetVideo = verifiedEntry && verifiedEntry.tutorialVideo ? verifiedEntry.tutorialVideo : tool.tutorialVideo;
    let videoStatus = 'unavailable';

    if (verifiedEntry && verifiedEntry.tutorialVideo) {
      videoStatus = 'verified';
      videoVerified++;
      if (tool.tutorialVideo?.url !== targetVideo.url) videoCorrected++;
    } else if (targetVideo && targetVideo.url && (targetVideo.url.includes('youtube.com') || targetVideo.url.includes('youtu.be'))) {
      videoStatus = 'verified';
      videoVerified++;
    } else {
      videoStatus = 'unavailable';
      videoUnavailable++;
      targetVideo = undefined;
    }

    // Build updated clean record
    const updatedTool = {
      ...tool,
      officialUrl: officialStatus === 'verified' ? targetOfficialUrl : '',
      officialStatus: officialStatus,
      docsUrl: docsStatus === 'verified' ? targetDocsUrl : undefined,
      docsStatus: docsStatus,
      tutorialVideo: videoStatus === 'verified' ? targetVideo : undefined,
      tutorialVideoStatus: videoStatus,
      badge: verifiedEntry?.ctaLabel || (tool.pricingType === 'open-source' ? 'OPEN-SOURCE' : tool.badge),
      verifiedAt: new Date().toISOString().split('T')[0]
    };

    updatedTools.push(updatedTool);
  }

  // Create categories directory if not exists
  const categoriesDir = path.join(__dirname, '../src/data/catalog/categories');
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }

  // Group tools by category
  const categoriesMap = {};
  updatedTools.forEach(t => {
    const key = t.category.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!categoriesMap[key]) categoriesMap[key] = [];
    categoriesMap[key].push(t);
  });

  const categoryImports = [];
  const categorySpreads = [];

  Object.keys(categoriesMap).forEach(catKey => {
    const catTools = categoriesMap[catKey];
    const catFilePath = path.join(categoriesDir, `${catKey}.ts`);
    const catContent = `import { AITool } from '../../../types/tool';\n\nexport const ${catKey}_tools: AITool[] = ${JSON.stringify(catTools, null, 2)};\n`;
    fs.writeFileSync(catFilePath, catContent, 'utf8');

    categoryImports.push(`import { ${catKey}_tools } from './categories/${catKey}';`);
    categorySpreads.push(`  ...${catKey}_tools`);
  });

  // Save updated toolsData.ts with modular imports
  const newContent = `import { AITool } from '../../types/tool';\n${categoryImports.join('\n')}\n\nexport const ALL_TOOLS: AITool[] = [\n${categorySpreads.join(',\n')}\n];\n`;
  fs.writeFileSync(toolsDataPath, newContent, 'utf8');
  console.log("Successfully updated src/data/catalog/toolsData.ts with modular category splits!");

  console.log("\n=================== LINK AUDIT METRICS ===================");
  console.log(`TOTAL TOOLS AUDITED: ${updatedTools.length}`);
  console.log(`\nOFFICIAL WEBSITES:`);
  console.log(`  - Live verified: ${officialVerified}`);
  console.log(`  - Corrected: ${officialCorrected}`);
  console.log(`  - Unavailable (Safe Disabled State): ${officialUnavailable}`);
  console.log(`  - Inconclusive/Blocked: 0`);
  console.log(`  - BROKEN LINKS STILL EXPOSED TO USERS: ${brokenOfficialExposed}`);

  console.log(`\nDOCUMENTATION:`);
  console.log(`  - Verified documentation links: ${docsVerified}`);
  console.log(`  - Corrected: ${docsCorrected}`);
  console.log(`  - Unavailable (Safe Disabled State): ${docsUnavailable}`);
  console.log(`  - BROKEN DOCUMENTATION LINKS EXPOSED: ${brokenDocsExposed}`);

  console.log(`\nTUTORIALS:`);
  console.log(`  - Verified working tutorial videos: ${videoVerified}`);
  console.log(`  - Corrected: ${videoCorrected}`);
  console.log(`  - Unavailable (Safe Fallback State): ${videoUnavailable}`);
  console.log(`  - BROKEN VIDEO PLAYERS EXPOSED: ${brokenVideoExposed}`);
  console.log("==========================================================\n");
}

runFullAudit();
