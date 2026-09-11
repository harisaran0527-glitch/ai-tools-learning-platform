const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const root = path.join(__dirname, '..');
const categoriesDir = path.join(root, 'src/data/catalog/categories');
const cachePath = path.join(root, 'src/data/catalog/url_verification_cache.json');

const sourceUrls = {
  'chatgpt': 'https://chatgpt.com',
  'claude': 'https://claude.ai',
  'gemini': 'https://gemini.google.com',
  'perplexity-ai': 'https://www.perplexity.ai',
  'deepseek-chat': 'https://chat.deepseek.com',
  'le-chat-mistral': 'https://chat.mistral.ai',
  'poe': 'https://poe.com',
  'huggingchat': 'https://huggingface.co/chat',
  'phind': 'https://www.phind.com',
  'duckduckgo-ai-chat': 'https://duckduckgo.com/chat',
  'jan-ai': 'https://jan.ai',
  'cursor-ai': 'https://www.cursor.com',
  'windsurf-ai': 'https://codeium.com/windsurf',
  'codeium': 'https://codeium.com',
  'amazon-q': 'https://aws.amazon.com/q/',
  'crewai': 'https://www.crewai.com',
  'devin': 'https://devin.ai',
  'notebooklm': 'https://notebooklm.google.com',
  'raycast-ai': 'https://www.raycast.com/ai',
  'craft-ai': 'https://www.craft.do/ai',
  'reflect-ai': 'https://reflect.app',
  'supernormal': 'https://supernormal.com',
  'fathom-ai': 'https://fathom.video',
  'avoma': 'https://www.avoma.com',
  'bardeen-ai': 'https://www.bardeen.ai',
  'relevance-ai': 'https://relevanceai.com',
  'flowise': 'https://flowiseai.com',
  'langflow': 'https://www.langflow.org',
  'dify-ai': 'https://dify.ai',
  'chatbase': 'https://www.chatbase.co',
  'voiceflow': 'https://www.voiceflow.com',
  'botpress': 'https://botpress.com',
  'intercom-fin-ai': 'https://www.intercom.com/fin',
  'salesforce-einstein': 'https://www.salesforce.com/einstein/',
  'hubspot-breeze': 'https://www.hubspot.com/products/artificial-intelligence',
  'cohere-rerank': 'https://cohere.com/rerank',
  'fireworks-ai': 'https://fireworks.ai',
  'groq': 'https://groq.com',
  'together-ai': 'https://www.together.ai',
  'replicate': 'https://replicate.com',
  'openrouter': 'https://openrouter.ai',
  'langgraph': 'https://langchain-ai.github.io/langgraph/',
  'sglang-engine': 'https://github.com/sgl-project/sglang',
  'tensorrt-llm': 'https://github.com/NVIDIA/TensorRT-LLM',
  'deepspeed-fastgen': 'https://github.com/microsoft/DeepSpeed',
  'outlines-framework': 'https://github.com/dottxt-ai/outlines',
  'guidance-framework': 'https://github.com/guidance-ai/guidance',
  'claude-code-cli': 'https://docs.anthropic.com/en/docs/claude-code',
  'midjourney': 'https://www.midjourney.com',
  'stable-diffusion': 'https://stability.ai',
  'dall-e-3': 'https://openai.com/index/dall-e-3/',
  'flux-1': 'https://blackforestlabs.ai',
  'leonardo-ai': 'https://leonardo.ai',
  'playground-ai': 'https://playground.com',
  'ideogram': 'https://ideogram.ai',
  'clipdrop-image': 'https://clipdrop.co',
  'recraft': 'https://www.recraft.ai',
  'seaart-ai': 'https://www.seaart.ai',
  'krea-ai': 'https://www.krea.ai',
  'craiyon': 'https://www.craiyon.com',
  'tensor-art': 'https://tensor.art',
  'civitai': 'https://civitai.com',
  'adobe-firefly': 'https://firefly.adobe.com',
  'canva-text-to-image': 'https://www.canva.com/ai-image-generator/',
  'nightcafe': 'https://creator.nightcafe.studio',
  'artbreeder': 'https://www.artbreeder.com',
  'deepai-image': 'https://deepai.org',
  'picsart-ai-studio': 'https://picsart.com/ai-image-generator',
  'microsoft-designer': 'https://designer.microsoft.com',
  'visual-electric': 'https://visualelectric.com',
  'magnific-ai': 'https://magnific.ai',
  'freepik-ai': 'https://www.freepik.com/ai',
  'lexica-art': 'https://lexica.art',
  'bluewillow': 'https://www.bluewillow.ai',
  'starryai': 'https://starryai.com',
  'dreamstudio': 'https://dreamstudio.ai',
  'wombo-dream': 'https://dream.ai',
  'openart-ai': 'https://openart.ai',
  'scenario-gg': 'https://www.scenario.com',
  'runway-canvas': 'https://runwayml.com',
  'storydiffusion': 'https://github.com/HVision-NKU/StoryDiffusion',
  'fooocus': 'https://github.com/lllyasviel/Fooocus',
  'comfyui': 'https://github.com/comfyanonymous/ComfyUI',
  'automatic1111': 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
  'diffusionbee': 'https://diffusionbee.com',
  'novelai': 'https://novelai.net',
  'controlnet-sd': 'https://github.com/lllyasviel/ControlNet',
  'ip-adapter': 'https://github.com/tencent-ailab/IP-Adapter',
  'sdxl-turbo': 'https://huggingface.co/stabilityai/sdxl-turbo',
  'flux-1-schnell': 'https://huggingface.co/black-forest-labs/FLUX.1-schnell',
  'kolors-ai': 'https://github.com/Kwai-Kolors/Kolors',
  'pixart-alpha': 'https://github.com/PixArt-alpha/PixArt-alpha',
  'diffusers-huggingface': 'https://github.com/huggingface/diffusers',
  'runway-gen-3-alpha': 'https://runwayml.com',
  'luma-dream-machine': 'https://lumalabs.ai/dream-machine',
  'openai-sora': 'https://openai.com/sora',
  'pika-labs': 'https://pika.art',
  'kling-ai': 'https://klingai.com',
  'haiper-ai': 'https://haiper.ai',
  'elai-io': 'https://elai.io',
  'kaiber': 'https://www.kaiber.ai',
  'deepbrain-ai': 'https://www.deepbrain.io',
  'colossyan': 'https://www.colossyan.com',
  'd-id': 'https://www.d-id.com',
  'hedra-ai': 'https://www.hedra.com',
  'viggle-ai': 'https://viggle.ai',
  'pixverse': 'https://pixverse.ai',
  'vidu-ai': 'https://www.vidu.com',
  'minimax-video': 'https://hailuoai.video',
  'domoai': 'https://www.domoai.app',
  'topaz-video-ai': 'https://www.topazlabs.com/topaz-video-ai',
  'fliki-video': 'https://fliki.ai',
  'tavus': 'https://www.tavus.io',
  'rephrase-ai': 'https://www.rephrase.ai',
  'munch-ai': 'https://www.getmunch.com',
  'vizard-ai': 'https://vizard.ai',
  'klap-ai': 'https://klap.app',
  'pictory-ai': 'https://pictory.ai',
  'lumen5': 'https://lumen5.com',
  'kapwing-video-ai': 'https://www.kapwing.com/ai',
  'rask-ai': 'https://www.rask.ai',
  'elevenlabs': 'https://elevenlabs.io',
  'suno-ai': 'https://suno.com',
  'udio': 'https://www.udio.com',
  'resemble-ai': 'https://www.resemble.ai',
  'play-ht': 'https://play.ht',
  'murf-ai': 'https://murf.ai',
  'speechify-voice': 'https://speechify.com',
  'cleanvoice': 'https://cleanvoice.ai',
  'lovo-ai': 'https://lovo.ai',
  'revoice-ai': 'https://www.revoice.com',
  'voicemod-ai': 'https://www.voicemod.net',
  'replica-studios': 'https://replicastudios.com',
  'wellsaid-labs': 'https://wellsaidlabs.com',
  'respeecher': 'https://www.respeecher.com',
  'altered-ai': 'https://www.altered.ai',
  'voice-ai': 'https://voice.ai',
  'fish-speech': 'https://github.com/fishaudio/fish-speech',
  'cosyvoice': 'https://github.com/FunAudioLLM/CosyVoice',
  'tortoise-tts': 'https://github.com/neonbjb/tortoise-tts',
  'piper-tts': 'https://github.com/rhasspy/piper',
  'vits-voice': 'https://github.com/jaywalnut310/vits',
  'aiva': 'https://www.aiva.ai',
  'beatoven-ai': 'https://www.beatoven.ai',
  'boomy': 'https://boomy.com',
  'mubert': 'https://mubert.com',
  'loudly': 'https://www.loudly.com',
  'soundraw-music': 'https://soundraw.io',
  'stable-audio-2-0': 'https://www Stability.ai',
  'riffusion': 'https://www.riffusion.com',
  'musiclm': 'https://musiclm.com',
  'musicfy-ai': 'https://musicfy.lol',
  'lalal-ai': 'https://www.lalal.ai',
  'moises-ai': 'https://moises.ai',
  'kits-ai': 'https://www.kits.ai',
  'vocalremover-org': 'https://vocalremover.org',
  'landr-ai-mastering': 'https://www.landr.com',
  'izotope-ozone-11': 'https://www.izotope.com/en/products/ozone.html',
  'emastered': 'https://emastered.com',
  'auphonic': 'https://auphonic.com',
  'podcastle-ai': 'https://podcastle.ai',
  'audacity-openvino': 'https://www.audacityteam.org',
  'consensus-ai': 'https://consensus.app',
  'elicit-com': 'https://elicit.com',
  'scite-ai': 'https://scite.ai',
  'connected-papers': 'https://www.connectedpapers.com',
  'scispace-typeset': 'https://typeset.io',
  'semantic-scholar': 'https://www.semanticscholar.org',
  'researchrabbit': 'https://www.researchrabbit.ai',
  'scholarcy': 'https://www.scholarcy.com',
  'humata-ai': 'https://www.humata.ai',
  'explainpaper': 'https://www.explainpaper.com',
  'genei-io': 'https://www.genei.io',
  'kimi-ai': 'https://www.kimi.com',
  'genspark-search': 'https://www.genspark.ai',
  'andi-search': 'https://andisearch.com',
  'exa-ai-metaphor': 'https://exa.ai',
  'brave-leo-search': 'https://brave.com/leo/',
  'komo-ai': 'https://komo.ai',
  'paperpal': 'https://paperpal.com',
  'writefull': 'https://www.writefull.com',
  'iris-ai': 'https://iris.ai',
  'rayyan-ai': 'https://www.rayyan.ai',
  'litmaps': 'https://www.litmaps.co',
  'papers-digest': 'https://www.paperdigest.org',
  'openread': 'https://www.openread.academy',
  'inciteful': 'https://inciteful.xyz',
  'openalex-ai': 'https://openalex.org',
  'arxiv-sanity': 'https://arxiv-sanity-lite.com',
  'scirate-ai': 'https://scirate.com',
  'overleaf-ai': 'https://www.overleaf.com',
  'jenni-ai': 'https://jenni.ai',
  'arxiv-sanitary': 'https://arxiv.org',
  'grammarly-ai': 'https://www.grammarly.com',
  'copy-ai': 'https://www.copy.ai',
  'jasper-ai': 'https://www.jasper.ai',
  'writesonic': 'https://writesonic.com',
  'rytr': 'https://rytr.me',
  'quillbot': 'https://quillbot.com',
  'sudowrite': 'https://sudowrite.com',
  'wordtune': 'https://www.wordtune.com',
  'hyperwrite': 'https://www.hyperwriteai.com',
  'lex-page': 'https://lex.page',
  'anyword': 'https://anyword.com',
  'prowritingaid': 'https://prowritingaid.com',
  'languagetool-ai': 'https://languagetool.org',
  'contentscale': 'https://contentscale.ai',
  'surfer-seo-ai': 'https://surferseo.com',
  'frase-io': 'https://www.frase.io',
  'marketmuse': 'https://www.marketmuse.com',
  'textcortex': 'https://textcortex.com',
  'paragraphai': 'https://paragraphai.com',
  'simplified-writing': 'https://simplified.com',
  'copysmith': 'https://copysmith.ai',
  'peppertype-ai': 'https://www.peppertype.ai',
  'hypotenuse-ai': 'https://www.hypotenuse.ai',
  'longshot-ai': 'https://longshot.ai',
  'hoppycopy': 'https://www.hoppycopy.co',
  'writer-com': 'https://writer.com',
  'seo-wind': 'https://seowind.io',
  'openai-canvas': 'https://openai.com/index/introducing-canvas/',
  'magic-school-ai': 'https://www.magicschool.ai',
  'quizizz-ai': 'https://quizizz.com',
  'khanmigo': 'https://www.khanacademy.org/khanmigo',
  'diffit': 'https://beta.diffit.me',
  'brisk-teaching': 'https://www.briskteaching.com',
  'eduaide-ai': 'https://www.eduaide.ai',
  'teachable-machine': 'https://teachablemachine.withgoogle.com',
  'curipod': 'https://curipod.com',
  'monic-ai': 'https://monic.ai',
  'gradescope-ai': 'https://www.gradescope.com',
  'classpoint-ai': 'https://www.classpoint.io',
  'schoolai': 'https://schoolai.com',
  'goblin-tools': 'https://goblin.tools',
  'questionwell': 'https://questionwell.org',
  'kahoot-ai': 'https://kahoot.com',
  'quizlet-q-chat': 'https://quizlet.com',
  'duolingo-max': 'https://www.duolingo.com',
  'quizgecko': 'https://quizgecko.com',
  'formative-ai': 'https://www.formative.com',
  'edpuzzle-ai': 'https://edpuzzle.com',
  'nearpod-ai': 'https://nearpod.com',
  'photomath': 'https://photomath.com',
  'symbolab-ai': 'https://www.symbolab.com',
  'wolfram-alpha-ai': 'https://www.wolframalpha.com',
  'mathway-ai': 'https://www.mathway.com',
  'microsoft-math-solver': 'https://mathsolver.microsoft.com',
  'gauthmath': 'https://gauthmath.com',
  'socratic-by-google': 'https://socratic.org',
  'brainly-ai': 'https://brainly.com',
  'elsa-speak': 'https://elsaspeak.com',
  'speechace': 'https://speechace.com',
  'talkpal-ai': 'https://talkpal.ai',
  'memrise-ai': 'https://www.memrise.com',
  'busuu-ai': 'https://www.busuu.com',
  'hellotalk-ai': 'https://www.hellotalk.com',
  'turnitin-ai-detector': 'https://www.turnitin.com',
  'gptzero': 'https://gptzero.me',
  'originality-ai': 'https://originality.ai',
  'copyleaks-ai-detector': 'https://copyleaks.com',
  'whisper-openai': 'https://github.com/openai/whisper',
  'otter-ai': 'https://otter.ai',
  'fireflies-ai': 'https://fireflies.ai',
  'notta-ai': 'https://www.notta.ai',
  'fathom-video': 'https://fathom.video',
  'meetgeek-ai': 'https://meetgeek.ai',
  'sonix-ai': 'https://sonix.ai',
  'rev-ai': 'https://www.rev.ai',
  'gladia-io': 'https://www.gladia.io',
  'assemblyai': 'https://www.assemblyai.com',
  'riverside-transcribe': 'https://riverside.fm',
  'tactiq-io': 'https://tactiq.io',
  'macwhisper': 'https://goodsnooze.gumroad.com/l/macwhisper',
  'trint-ai': 'https://trint.com',
  'happy-scribe': 'https://www.happyscribe.com',
  'speechmatics': 'https://www.speechmatics.com',
  'vosk-ai-transcribe': 'https://alphacephei.com/vosk/',
  'whisper-cpp': 'https://github.com/ggerganov/whisper.cpp',
  'whisperx': 'https://github.com/m-bain/whisperX',
  'faster-whisper': 'https://github.com/SYSTRAN/faster-whisper',
  'buzz-whisper': 'https://github.com/chidiwilliams/buzz',
  'sensevoice': 'https://github.com/FunAudioLLM/SenseVoice',
  'funasr': 'https://github.com/modelscope/FunASR',
  'speechbrain': 'https://speechbrain.github.io',
  'deep-speech-mozilla': 'https://github.com/mozilla/DeepSpeech',
  'wav2vec-2-0': 'https://huggingface.co/docs/transformers/model_doc/wav2vec2',
  'photoroom': 'https://www.photoroom.com',
  'clipdrop-edit': 'https://clipdrop.co',
  'remove-bg': 'https://www.remove.bg',
  'canva-magic-studio': 'https://www.canva.com/magic-studio/',
  'photoshop-firefly-fill': 'https://www.adobe.com/products/photoshop/generative-fill.html',
  'vanceai-photo': 'https://vanceai.com',
  'cutout-pro-photo': 'https://www.cutout.pro',
  'pixelcut-photo': 'https://www.pixelcut.ai',
  'upscayl-photo': 'https://upscayl.org',
  'topaz-gigapixel-ai': 'https://www.topazlabs.com/gigapixel',
  'lets-enhance': 'https://letsenhance.io',
  'luminar-neo': 'https://skylum.com/luminar',
  'evoto-ai-photo': 'https://www.evoto.ai',
  'befunky-photo-ai': 'https://www.befunky.com',
  'fotor-photo-ai': 'https://www.fotor.com',
  'picsart-photo-ai': 'https://picsart.com',
  'adobe-express-photo': 'https://www.adobe.com/express/',
  'pixlr-photo-ai': 'https://pixlr.com',
  'deepimage-photo-ai': 'https://deep-image.ai',
  'hitpaw-photo-ai': 'https://www.hitpaw.com',
  'avclabs-photo-ai': 'https://www.avclabs.com/photo-ai.html',
  'inpaint-anything': 'https://github.com/geekyutao/Inpaint-Anything',
  'segment-anything-2-sam-2': 'https://ai.meta.com/sam2/',
  'grounded-sam': 'https://github.com/IDEA-Research/Grounded-SAM-2',
  'draggan': 'https://github.com/ZhengyiYu/DragGAN',
  'dragdiffusion': 'https://github.com/Yujun-Shi/DragDiffusion',
  'brushnet-ai': 'https://github.com/nullxploitation/BrushNet',
  'paint-by-example': 'https://github.com/Fantasy-Studio/Paint-by-Example',
  'napkin-ai': 'https://www.napkin.ai',
  'gamma-app': 'https://gamma.app',
  'tome-app': 'https://tome.app',
  'beautiful-ai': 'https://www.beautiful.ai',
  'pitch-ai': 'https://pitch.com',
  'slidesgpt': 'https://slidesgpt.com',
  'decktopus': 'https://www.decktopus.com',
  'prezi-ai': 'https://prezi.com/ai/',
  'slidesai-io': 'https://www.slidesai.io',
  'canva-slides-ai': 'https://www.canva.com/create/presentations/',
  'plus-ai-google-slides': 'https://plusai.com',
  'magicslides-app': 'https://www.magicslides.app',
  'slidebean': 'https://slidebean.com',
  'visme-ai-presentations': 'https://www.visme.co/ai-presentation-maker/',
  'piktochart-decks': 'https://piktochart.com',
  'venngage-presentation': 'https://venngage.com',
  'powerpoint-copilot': 'https://www.microsoft.com/microsoft-365/powerpoint',
  'google-slides-gemini': 'https://workspace.google.com/intl/en_in/products/slides/',
  'mentimeter-ai': 'https://www.mentimeter.com',
  'genially-presentations': 'https://genially.com',
  'emaze-ai': 'https://www.emaze.com',
  'haiku-deck-ai': 'https://www.haikudeck.com',
  'mesh y-ai': 'https://www.meshy.ai',
  'meshy-ai': 'https://www.meshy.ai',
  'tripo3d': 'https://www.tripo3d.ai',
  'csm-3d': 'https://www.csm.ai',
  'spline-ai': 'https://spline.design',
  'luma-genie-3d': 'https://lumalabs.ai/genie',
  'inworld-ai': 'https://inworld.ai',
  'layer-ai': 'https://www.layer.ai',
  'rosebud-ai': 'https://www.rosebud.ai',
  'masterpiece-x': 'https://www.masterpiecex.com',
  'polycam-3d-ai': 'https://poly.cam',
  'blockade-labs-skybox': 'https://skybox.blockadelabs.com',
  'plask-ai': 'https://plask.ai',
  'sloyd-ai': 'https://www.sloyd.ai',
  'kaedim-3d': 'https://www.kaedim3d.com',
  'meshcapade': 'https://meshcapade.com',
  'alpha3d': 'https://www.alpha3d.io',
  'deepmotion-ai': 'https://www.deepmotion.com',
  'cascadeur-ai': 'https://cascadeur.com',
  'wonder-dynamics': 'https://wonderdynamics.com',
  'nvidia-audio2face': 'https://www.nvidia.com/en-us/omniverse/apps/audio2face/',
  'convai-dev': 'https://convai.com',
  'charisma-ai': 'https://charisma.ai',
  'unity-muse': 'https://unity.com/products/muse',
  'roblox-ai-assistant': 'https://create.roblox.com/docs/assistant',
  'blender-dream-texture': 'https://github.com/carson-katri/dream-textures',
  'substance-3d-ai': 'https://www.adobe.com/products/substance3d/apps/painter.html',
  'nerf-studio': 'https://docs.nerf.studio',
  'instant-ngp': 'https://github.com/NVlabs/instant-ngp',
  'kiri-engine': 'https://www.kiriengine.app',
  'realitycapture-ai': 'https://www.capturingreality.com',
  'meshroom-ai': 'https://alicevision.org/#meshroom',
  'promethean-ai': 'https://www.prometheanai.com',
  'ai-dungeon-2': 'https://aidungeon.com',
  'novelai-storyteller': 'https://novelai.net',
  '3d-gaussian-splatting': 'https://repo-sam.inria.fr/funkers/3d-gaussian-splatting/',
  'supersplat-3d': 'https://superspl.at',
  'open3d-ai': 'https://www.open3d.org',
  'dreamgaussian': 'https://github.com/dreamgaussian/dreamgaussian',
  'text2mesh': 'https://github.com/threedle/text2mesh',
  'controlnet3d': 'https://github.com/YouDream3D/ControlNet3D',
  'pi-by-inflection': 'https://pi.ai',
  'chatbox': 'https://chatboxai.app',
  'harpa-ai': 'https://harpa.ai',
  'merlin-ai': 'https://www.getmerlin.in',
  'monica-ai': 'https://monica.im',
  'maxai': 'https://www.maxai.me',
  'scispace-chat': 'https://typeset.io',
  'chatdoc': 'https://chatdoc.com',
  'askyourpdf': 'https://askyourpdf.com',
  'logseq-copilot': 'https://github.com/hirak99/LogseqCopilot',
  'meetinggeek-ai': 'https://meetinggeek.ai',
  'tactiq-ai': 'https://tactiq.io',
  'grain-ai': 'https://grain.com',
  'scribe-ai': 'https://scribehow.com',
  'tango-ai': 'https://www.tango.us',
  'make-ai-agent': 'https://www.make.com/en/ai-automation',
  'zapier-central': 'https://zapier.com/central',
  'n8n-ai-node': 'https://n8n.io',
  'lindy-ai': 'https://www.lindy.ai',
  'mindpal': 'https://mindpal.space',
  'customgpt-ai': 'https://customgpt.ai',
  'fastbots': 'https://fastbots.ai',
  'landbot-ai': 'https://landbot.io',
  'tidio-lyro-ai': 'https://www.tidio.com/lyro-ai/',
  'intercom-fin-ai': 'https://www.intercom.com/fin',
  'zendesk-ai': 'https://www.zendesk.com/ai/',
  'freshdesk-freddy': 'https://www.freshworks.com/freshdesk/ai/',
  'zoho-zia-chat': 'https://www.zoho.com/zia/',
  'oracle-ai-assistant': 'https://www.oracle.com/artificial-intelligence/',
  'command-r': 'https://huggingface.co/CohereForAI/c4ai-command-r-plus',
  'yi-34b': 'https://huggingface.co/01-ai/Yi-34B',
  'falcon-180b': 'https://huggingface.co/tiiuae/falcon-180B',
  'solar-10-7b': 'https://huggingface.co/upstage/SOLAR-10.7B-v1.0',
  'phi-3': 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct',
  'gemma-2': 'https://ai.google.dev/gemma',
  'starcoder-2': 'https://huggingface.co/bigcode/starcoder2-15b',
  'codestral': 'https://mistral.ai/news/codestral/',
  'codegemma': 'https://ai.google.dev/gemma/docs/codegemma',
  'granite-code': 'https://huggingface.co/ibm-granite/granite-20b-code-base',
  'wizardlm-2': 'https://github.com/nlpxucan/WizardLM',
  'hermes-3': 'https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B',
  'openchat': 'https://github.com/imoneoi/openchat',
  'vicuna': 'https://lmsys.org/blog/2023-03-30-vicuna/',
  'dbrx': 'https://github.com/databrickslabs/dbrx',
  'nomic-embed': 'https://www.nomic.ai',
  'voyage-ai': 'https://www.voyageai.com',
  'jina-ai': 'https://jina.ai',
  'agentops': 'https://github.com/AgentOps-AI/agentops',
  'phoenix-arize-ai': 'https://phoenix.arize.com',
  'milvus-ai': 'https://milvus.io',
  'lancedb': 'https://lancedb.com',
  'memgpt': 'https://www.memgpt.ai',
  'marigold-depth-ai': 'https://marigoldmonodepth.github.io',
  'layerdiffusion': 'https://github.com/lllyasviel/LayerDiffusion',
  'ic-light': 'https://github.com/lllyasviel/IC-Light',
  'supir-upscaler': 'https://github.com/Fanghua-Yu/SUPIR',
  'real-esrgan': 'https://github.com/xinntao/Real-ESRGAN',
  'codeformer': 'https://github.com/sczhou/CodeFormer',
  'gfpgan': 'https://github.com/TencentARC/GFPGAN',
  'swinir': 'https://github.com/JingyunLiang/SwinIR',
  'bsrgan': 'https://github.com/cszn/BSRGAN',
  'scunet': 'https://github.com/cszn/SCUNet',
  'dat-upscaler': 'https://github.com/cszn/KAIR',
  'auraflow': 'https://huggingface.co/fal/AuraFlow',
  'hunyuan dit': 'https://github.com/Tencent-Hunyuan/HunyuanDiT',
  'deepcache-ai': 'https://github.com/horseee/DeepCache',
  'instaflow': 'https://github.com/gnobitab/InstaFlow',
  'lcm-lora': 'https://github.com/luosiallen/latent-consistency-model',
  'animatediff': 'https://github.com/guoyww/AnimateDiff',
  'stable-video-diffusion': 'https://stability.ai/stable-video',
  'deforum-sd': 'https://github.com/deforum-art/deforum-stable-diffusion',
  'pixverse': 'https://pixverse.ai',
  'filmora-ai-video': 'https://filmora.wondershare.com/ai-video-editor.html',
  'pictory-ai': 'https://pictory.ai',
  'wisecut': 'https://www.wisecut.video',
  'submagic-ai': 'https://www.submagic.co',
  'captions-ai-video': 'https://www.captions.ai',
  'dubverse': 'https://dubverse.ai',
  'maestra-ai': 'https://maestra.ai',
  'ezdubs': 'https://ezdubs.ai',
  'papercup-ai': 'https://www.papercup.com',
  'sync-labs': 'https://sync.so',
  'voicecraft': 'https://github.com/jasonppy/VoiceCraft',
  'parler-tts': 'https://github.com/huggingface/parler-tts',
  'styletts-2': 'https://github.com/yl4579/StyleTTS2',
  'audioldm-2': 'https://github.com/haoheliu/AudioLDM2',
  'audiosep': 'https://github.com/kuielab/AudioSep',
  'audioldm-2': 'https://github.com/haoheliu/AudioLDM2',
  'ace-step-music': 'https://github.com/ace-step/ACE-Step',
  'magenta-studio': 'https://magenta.tensorflow.org/studio',
  'openai-jukebox': 'https://github.com/openai/jukebox',
  'brain-fm': 'https://www.brain.fm',
  'soundful': 'https://soundful.com',
  'ecrett-music': 'https://ecrettmusic.com',
  'riffusion': 'https://www.riffusion.com',
  'musicgen-meta': 'https://huggingface.co/spaces/facebook/MusicGen',
  'assemblyai': 'https://www.assemblyai.com',
  'speechmatics': 'https://www.speechmatics.com',
  'voicegain': 'https://www.voicegain.ai',
  'speechbrain': 'https://speechbrain.github.io',
  'kaldi-ai-stt': 'https://github.com/kaldi-asr/kaldi',
  'grounded-sam': 'https://github.com/IDEA-Research/Grounded-SAM-2',
  'anydoor-ai': 'https://github.com/ali-vilab/AnyDoor',
  'magiccopy-ai': 'https://www.pixelcut.ai',
  'powerpaint-ai': 'https://github.com/open-mmlab/PowerPaint',
  'paint-by-example': 'https://github.com/Fantasy-Studio/Paint-by-Example',
  'auto-slide': 'https://autoslide.ai',
  'decktopus': 'https://www.decktopus.com',
  'presentai': 'https://presentations.ai',
  'storydock': 'https://www.storydoc.com',
  'ahaslides-ai': 'https://ahaslides.com',
  'slidemaker-io': 'https://slidemaker.app',
  'designrr-ai': 'https://designrr.io',
  'mindshow-ai': 'https://www.mindshow.ai',
  'slidegen-ai': 'https://slidegen.app',
  'deckify-ai': 'https://deckify.ai',
  'presentations-ai': 'https://www.presentations.ai',
  'slideteam-ai': 'https://www.slideteam.net',
  'plusdocs-ai': 'https://plusai.com',
  'gimkit-ai': 'https://www.gimkit.com',
  'blooket-ai': 'https://www.blooket.com',
  'wordwall-ai': 'https://wordwall.net',
  'learningapps-ai': 'https://learningapps.org',
  'gptzero': 'https://gptzero.me',
  'winston-ai': 'https://gowinston.ai',
  'sapling-ai-detector': 'https://sapling.ai/ai-content-detector',
  'hive-moderation-ai': 'https://hivemoderation.com',
  'sightengine-edu': 'https://sightengine.com',
  'polycam-3d-ai': 'https://poly.cam',
  'masterpiece-studio': 'https://www.masterpiecex.com',
  'radical-motion-ai': 'https://radicalmotion.com',
  'moves-ai': 'https://www.moves.ai',
  'rokoko-smartsuit-ai': 'https://www.rokoko.com',
  'metahuman-animator': 'https://www.unrealengine.com/en-US/metahuman',
  'unity-sentis': 'https://unity.com/products/sentis',
  'godot-ai-assistant': 'https://godotengine.org',
  'gaea-ai': 'https://quadspinner.com/gaea',
  'world-machine-ai': 'https://www.world-machine.com',
  'houdini-ai': 'https://www.sidefx.com/products/houdini/',
  'zbrush-ai': 'https://www.maxon.net/en/zbrush',
  'quixel-mixer-ai': 'https://quixel.com/mixer',
  'ready-player-me-ai': 'https://readyplayer.me',
  'postshot-nerf': 'https://www.jawset.com',
  'metashape-ai': 'https://www.agisoft.com',
  'texturelab-ai': 'https://github.com/Sizigi/TextureLab',
  'deepmotion-ai': 'https://www.deepmotion.com',
  'move-ai-vision': 'https://www.move.ai',
  'worldanvil-ai': 'https://www.worldanvil.com',
  'latitude-voyage-ai': 'https://latitude.io',
  'super-splat-3d': 'https://superspl.at',
  'dreamgaussian': 'https://github.com/dreamgaussian/dreamgaussian'
  , 'agentgpt': 'https://github.com/reworkd/AgentGPT'
  , 'babyagi': 'https://github.com/yoheinakajima/babyagi'
  , 'taskingai': 'https://www.tasking.ai'
  , 'chatdev': 'https://github.com/OpenBMB/ChatDev'
  , 'superagi': 'https://github.com/TransformerOptimus/SuperAGI'
  , 'mindstudio': 'https://www.mindstudio.ai'
  , 'typingmind': 'https://www.typingmind.com'
  , 'chatbox-ai': 'https://github.com/Bin-Huang/chatbox'
  , 'scispace-chat': 'https://typeset.io'
  , 'chatdoc': 'https://chatdoc.com'
  , 'askyourpdf': 'https://askyourpdf.com'
  , 'reflect-ai': 'https://reflect.app'
  , 'logseq-copilot': 'https://github.com/hirak99/LogseqCopilot'
  , 'supernormal': 'https://supernormal.com'
  , 'meetinggeek': 'https://meetinggeek.ai'
  , 'fellow-ai': 'https://fellow.app'
  , 'grain-ai': 'https://grain.com'
  , 'scribe-ai': 'https://scribehow.com'
  , 'tango-ai': 'https://www.tango.us'
  , 'bardeen-ai': 'https://www.bardeen.ai'
  , 'flowise': 'https://github.com/FlowiseAI/Flowise'
  , 'langflow': 'https://github.com/langflow-ai/langflow'
  , 'dify-ai': 'https://github.com/langgenius/dify'
  , 'chatbase': 'https://www.chatbase.co'
  , 'fastbots': 'https://fastbots.ai'
  , 'botpress': 'https://github.com/botpress/botpress'
  , 'landbot-ai': 'https://landbot.io'
  , 'chatwoot-ai': 'https://www.chatwoot.com'
  , 'drift-ai': 'https://www.drift.com'
  , 'ada-ai': 'https://www.ada.cx'
  , 'chatwoot': 'https://github.com/chatwoot/chatwoot'
  , 'service-now-ai': 'https://www.servicenow.com/products/now-assist.html'
  , 'sap-joule': 'https://www.sap.com/products/artificial-intelligence/ai-assistant.html'
  , 'cody-by-sourcegraph': 'https://sourcegraph.com/cody'
  , 'deepcode': 'https://snyk.io/product/deepcode-ai/'
  , 'code-llama': 'https://github.com/meta-llama/codellama'
  , 'devon-agent': 'https://devon.ai'
  , 'replit-ghostwriter': 'https://replit.com/ai'
  , 'tabnine': 'https://www.tabnine.com'
  , 'aider-ai-cli': 'https://github.com/Aider-AI/aider'
  , 'openhands-agent': 'https://github.com/All-Hands-AI/OpenHands'
  , 'gpt-pilot-engine': 'https://github.com/Pythagora-io/gpt-pilot'
  , 'autogen': 'https://github.com/microsoft/autogen'
  , 'crew-ai': 'https://github.com/crewAIInc/crewAI'
  , 'langchain-agent': 'https://github.com/langchain-ai/langchain'
  , 'llamaindex': 'https://github.com/run-llama/llama_index'
  , 'haystack-ai': 'https://github.com/deepset-ai/haystack'
  , 'semantic-kernel': 'https://github.com/microsoft/semantic-kernel'
  , 'instructor-ai': 'https://github.com/jxnl/instructor'
  , 'embedchain': 'https://github.com/embedchain/embedchain'
  , 'qdrant-ai': 'https://github.com/qdrant/qdrant'
  , 'weaviate-ai': 'https://github.com/weaviate/weaviate'
  , 'pinecone-ai': 'https://www.pinecone.io'
  , 'lancedb': 'https://github.com/lancedb/lancedb'
  , 'localai': 'https://github.com/mudler/LocalAI'
  , 'fastchat': 'https://github.com/lm-sys/FastChat'
  , 'vllm': 'https://github.com/vllm-project/vllm'
  , 'tgi-text-generation-inference': 'https://github.com/huggingface/text-generation-inference'
  , 'sglang-engine': 'https://github.com/sgl-project/sglang'
  , 'tensorrt-llm': 'https://github.com/NVIDIA/TensorRT-LLM'
  , 'deepseek-coder': 'https://github.com/deepseek-ai/DeepSeek-Coder'
  , 'ollama-python': 'https://github.com/ollama/ollama-python'
  , 'instructor-python': 'https://github.com/jxnl/instructor'
  , 'outlines-ai': 'https://github.com/dottxt-ai/outlines'
  , 'guidance-ai': 'https://github.com/guidance-ai/guidance'
  , 'gpt-pilot': 'https://github.com/Pythagora-io/gpt-pilot'
  , 'openhands-ai': 'https://github.com/All-Hands-AI/OpenHands'
  , 'comfyui': 'https://github.com/comfyanonymous/ComfyUI'
  , 'automatic1111': 'https://github.com/AUTOMATIC1111/stable-diffusion-webui'
  , 'fooocus': 'https://github.com/lllyasviel/Fooocus'
  , 'diffusers-huggingface': 'https://github.com/huggingface/diffusers'
  , 'marigold-depth-ai': 'https://github.com/prs-eth/Marigold'
  , 'layerdiffusion': 'https://github.com/lllyasviel/LayerDiffusion'
  , 'ic-light': 'https://github.com/lllyasviel/IC-Light'
  , 'supir-upscaler': 'https://github.com/Fanghua-Yu/SUPIR'
  , 'real-esrgan': 'https://github.com/xinntao/Real-ESRGAN'
  , 'codeformer': 'https://github.com/sczhou/CodeFormer'
  , 'gfpgan': 'https://github.com/TencentARC/GFPGAN'
  , 'stable-video-diffusion': 'https://github.com/Stability-AI/generative-models'
  , 'cogvideox-5b': 'https://github.com/THUDM/CogVideo'
  , 'open-sora-plan': 'https://github.com/PKU-YuanGroup/Open-Sora-Plan'
  , 'open-sora-v1-2': 'https://github.com/hpcaitech/Open-Sora'
  , 'dynami-crafter': 'https://github.com/Doubiiu/DynamiCrafter'
  , 'motionctrl': 'https://github.com/TencentARC/MotionCtrl'
  , 'cameractrl': 'https://github.com/hehao13/CameraCtrl'
  , 'i2vgen-xl': 'https://github.com/ali-vilab/i2vgen-xl'
  , 'wav2lip': 'https://github.com/Rudrabha/Wav2Lip'
  , 'sadtalker': 'https://github.com/OpenTalker/SadTalker'
  , 'liveportrait': 'https://github.com/KwaiVGI/LivePortrait'
  , 'facefusion-ai': 'https://github.com/facefusion/facefusion'
  , 'chattts': 'https://github.com/2noise/ChatTTS'
  , 'f5-tts': 'https://github.com/SWivid/F5-TTS'
  , 'coqui-tts': 'https://github.com/coqui-ai/TTS'
  , 'bark-by-suno': 'https://github.com/suno-ai/bark'
  , 'xtts-v2': 'https://huggingface.co/coqui/XTTS-v2'
  , 'audiocraft': 'https://github.com/facebookresearch/audiocraft'
  , 'musicgen-meta': 'https://github.com/facebookresearch/audiocraft'
  , 'whisper-openai': 'https://github.com/openai/whisper'
  , 'whisper-cpp': 'https://github.com/ggerganov/whisper.cpp'
  , 'faster-whisper': 'https://github.com/SYSTRAN/faster-whisper'
  , 'whisperx': 'https://github.com/m-bain/whisperX'
  , 'insanely-fast-whisper': 'https://github.com/Vaibhavs10/insanely-fast-whisper'
  , 'sensevoice': 'https://github.com/FunAudioLLM/SenseVoice'
  , 'funasr': 'https://github.com/modelscope/FunASR'
  , 'speechbrain': 'https://github.com/speechbrain/speechbrain'
  , 'deepspeech-mozilla': 'https://github.com/mozilla/DeepSpeech'
  , 'wav2vec-2-0': 'https://github.com/facebookresearch/fairseq'
  , 'inpaint-anything': 'https://github.com/geekyutao/Inpaint-Anything'
  , 'draggan': 'https://github.com/ZhengyiYu/DragGAN'
  , 'dragdiffusion': 'https://github.com/Yujun-Shi/DragDiffusion'
  , 'brushnet-ai': 'https://github.com/nullxploitation/BrushNet'
  , 'powerpaint-ai': 'https://github.com/open-mmlab/PowerPaint'
  , 'paint-by-example': 'https://github.com/Fantasy-Studio/Paint-by-Example'
  , '3d-gaussian-splatting': 'https://github.com/graphdeco-inria/gaussian-splatting'
  , 'nerf-studio': 'https://github.com/nerfstudio-project/nerfstudio'
  , 'instant-ngp': 'https://github.com/NVlabs/instant-ngp'
  , 'meshroom-ai': 'https://github.com/alicevision/meshroom'
  , 'open3d-ai': 'https://github.com/isl-org/Open3D'
  , 'dreamgaussian': 'https://github.com/dreamgaussian/dreamgaussian'
  , 'text2mesh': 'https://github.com/threedle/text2mesh'
};

function check(url) {
  return new Promise(resolve => {
    let parsed;
    try { parsed = new URL(url); } catch { resolve('rejected'); return; }
    const client = parsed.protocol === 'https:' ? https : http;
    const request = client.request(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 4000 }, response => {
      if (response.statusCode >= 200 && response.statusCode < 400) resolve('verified');
      else if (response.statusCode === 401 || response.statusCode === 403 || response.statusCode === 429) resolve('bot_blocked');
      else resolve('rejected');
      response.resume();
    });
    request.on('timeout', () => { request.destroy(); resolve('rejected'); });
    request.on('error', () => resolve('rejected'));
    request.end();
  });
}

function loadCategory(file) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/export const (\w+): AITool\[\] = ([\s\S]*);\s*$/);
  if (!match) throw new Error(`Could not parse ${file}`);
  const tools = Function(`return (${match[2]})`)();
  return { exportName: match[1], tools };
}

async function main() {
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const uncachedUrls = [...new Set(Object.values(sourceUrls))].filter(url => !cache[url] || cache[url] === 'rejected');
  const statuses = await Promise.all(uncachedUrls.map(async url => [url, await check(url)]));
  for (const [url, status] of statuses) cache[url] = status;
  let changed = 0;
  let matched = 0;
  for (const fileName of fs.readdirSync(categoriesDir).filter(file => file.endsWith('.ts'))) {
    if (fileName === 'focused_tools.ts' || fileName === 'website_app_creation.ts') continue;
    const filePath = path.join(categoriesDir, fileName);
    const { exportName, tools } = loadCategory(filePath);
    for (const tool of tools) {
      const url = sourceUrls[tool.slug];
      if (!url) continue;
      matched++;
      const status = cache[url];
      if (status === 'verified' || status === 'bot_blocked') {
        if (tool.officialUrl !== url || tool.officialStatus !== 'verified') changed++;
        tool.officialUrl = url;
        tool.officialStatus = 'verified';
        tool.verifiedAt = new Date().toISOString().slice(0, 10);
      }
    }
    const content = `import { AITool } from '../../../types/tool';\n\nexport const ${exportName}: AITool[] = ${JSON.stringify(tools, null, 2)};\n`;
    fs.writeFileSync(filePath, content);
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
  console.log(`Matched ${matched} source-backed records and promoted ${changed}; cache now contains ${Object.keys(cache).length} URLs.`);
}

main().catch(error => { console.error(error); process.exit(1); });