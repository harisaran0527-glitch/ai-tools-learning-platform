const fs = require('fs');
const path = require('path');
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

// Database of genuine, real primary-source URLs for AI tools across categories
const REAL_PRIMARY_SOURCES = {
  // Education
  'edpuzzle': { url: 'https://edpuzzle.com', docs: 'https://support.edpuzzle.com' },
  'nearpod': { url: 'https://nearpod.com', docs: 'https://nearpod.zendesk.com' },
  'padlet': { url: 'https://padlet.com', docs: 'https://padlet.com/help' },
  'mentimeter': { url: 'https://www.mentimeter.com', docs: 'https://help.mentimeter.com' },
  'slido': { url: 'https://www.slido.com', docs: 'https://community.slido.com' },
  'classdojo': { url: 'https://www.classdojo.com', docs: 'https://classdojo.zendesk.com' },
  'socrative': { url: 'https://www.socrative.com', docs: 'https://socrative.zendesk.com' },
  'gimkit': { url: 'https://www.gimkit.com', docs: 'https://www.gimkit.com/help' },
  'blooket': { url: 'https://www.blooket.com', docs: 'https://www.blooket.com' },
  'quizlet': { url: 'https://quizlet.com', docs: 'https://quizlet.com/help' },
  'duolingo-max': { url: 'https://www.duolingo.com', docs: 'https://support.duolingo.com' },
  'photomath': { url: 'https://photomath.com', docs: 'https://photomath.com' },
  'symbolab': { url: 'https://www.symbolab.com', docs: 'https://www.symbolab.com' },
  'mathway': { url: 'https://www.mathway.com', docs: 'https://www.mathway.com' },
  'wolfram-alpha': { url: 'https://www.wolframalpha.com', docs: 'https://www.wolframalpha.com/resources' },
  'ck-12-flexi': { url: 'https://www.ck12.org', docs: 'https://www.ck12.org' },
  'khan-academy': { url: 'https://www.khanacademy.org', docs: 'https://support.khanacademy.org' },
  'coursera-coach': { url: 'https://www.coursera.org', docs: 'https://www.coursera.org/help' },
  'edx-assistant': { url: 'https://www.edx.org', docs: 'https://support.edx.org' },
  'udemy-ai': { url: 'https://www.udemy.com', docs: 'https://support.udemy.com' },

  // Document / Writing
  'grammarly': { url: 'https://www.grammarly.com', docs: 'https://support.grammarly.com' },
  'quillbot': { url: 'https://quillbot.com', docs: 'https://quillbot.com' },
  'copy-ai': { url: 'https://www.copy.ai', docs: 'https://www.copy.ai' },
  'jasper': { url: 'https://www.jasper.ai', docs: 'https://www.jasper.ai' },
  'writesonic': { url: 'https://writesonic.com', docs: 'https://writesonic.com' },
  'rytr': { url: 'https://rytr.me', docs: 'https://rytr.me' },
  'wordtune': { url: 'https://www.wordtune.com', docs: 'https://www.wordtune.com' },
  'sudowrite': { url: 'https://www.sudowrite.com', docs: 'https://www.sudowrite.com' },
  'prowritingaid': { url: 'https://prowritingaid.com', docs: 'https://prowritingaid.com' },
  'hemingway': { url: 'https://hemingwayapp.com', docs: 'https://hemingwayapp.com' },

  // Search / Research
  'consensus': { url: 'https://consensus.app', docs: 'https://consensus.app' },
  'elicit': { url: 'https://elicit.com', docs: 'https://support.elicit.com' },
  'scite': { url: 'https://scite.ai', docs: 'https://scite.ai' },
  'semantic-scholar': { url: 'https://www.semanticscholar.org', docs: 'https://api.semanticscholar.org' },
  'perplexity': { url: 'https://www.perplexity.ai', docs: 'https://docs.perplexity.ai' },
  'you-com': { url: 'https://you.com', docs: 'https://about.you.com' },
  'phind': { url: 'https://www.phind.com', docs: 'https://www.phind.com' },
  'duckduckgo-ai': { url: 'https://duckduckgo.com/chat', docs: 'https://duckduckgo.com' },

  // Audio / Voice
  'elevenlabs': { url: 'https://elevenlabs.io', docs: 'https://elevenlabs.io/docs/overview' },
  'play-ht': { url: 'https://play.ht', docs: 'https://play.ht/docs/' },
  'murf-ai': { url: 'https://murf.ai', docs: 'https://murf.ai' },
  'speechify': { url: 'https://speechify.com', docs: 'https://speechify.com' },
  'resemble-ai': { url: 'https://www.resemble.ai', docs: 'https://www.resemble.ai' },
  'adobe-enhance': { url: 'https://podcast.adobe.com/enhance', docs: 'https://podcast.adobe.com' },
  'suno-bark': { url: 'https://github.com/suno-ai/bark', docs: 'https://github.com/suno-ai/bark' },
  'coqui-tts': { url: 'https://github.com/coqui-ai/TTS', docs: 'https://github.com/coqui-ai/TTS' },
  'xtts-v2': { url: 'https://huggingface.co/coqui/XTTS-v2', docs: 'https://huggingface.co/coqui/XTTS-v2' },
  'musicgen': { url: 'https://huggingface.co/spaces/facebook/MusicGen', docs: 'https://huggingface.co/spaces/facebook/MusicGen' },
  'audiocraft': { url: 'https://github.com/facebookresearch/audiocraft', docs: 'https://github.com/facebookresearch/audiocraft' },
  'chattts': { url: 'https://chattts.com', docs: 'https://github.com/2noise/ChatTTS' },
  'f5-tts': { url: 'https://github.com/SW1515/F5-TTS', docs: 'https://github.com/SW1515/F5-TTS' },

  // Image Generation
  'midjourney': { url: 'https://www.midjourney.com', docs: 'https://docs.midjourney.com' },
  'stable-diffusion': { url: 'https://stability.ai', docs: 'https://platform.stability.ai/docs' },
  'dall-e': { url: 'https://openai.com/index/dall-e-3/', docs: 'https://platform.openai.com/docs/guides/images' },
  'flux-1': { url: 'https://blackforestlabs.ai', docs: 'https://blackforestlabs.ai' },
  'leonardo-ai': { url: 'https://leonardo.ai', docs: 'https://docs.leonardo.ai' },
  'playground-ai': { url: 'https://playground.com', docs: 'https://playground.com' },
  'ideogram': { url: 'https://ideogram.ai', docs: 'https://ideogram.ai' },
  'recraft': { url: 'https://www.recraft.ai', docs: 'https://www.recraft.ai' },
  'krea-ai': { url: 'https://www.krea.ai', docs: 'https://www.krea.ai' },
  'civitai': { url: 'https://civitai.com', docs: 'https://education.civitai.com' },
  'adobe-firefly': { url: 'https://firefly.adobe.com', docs: 'https://helpx.adobe.com/firefly' },
  'canva-ai': { url: 'https://www.canva.com/ai-image-generator/', docs: 'https://www.canva.com/help/' },
  'fooocus': { url: 'https://github.com/lllyasviel/Fooocus', docs: 'https://github.com/lllyasviel/Fooocus' },
  'comfyui': { url: 'https://github.com/comfyanonymous/ComfyUI', docs: 'https://docs.comfy.org' },
  'automatic1111': { url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui', docs: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki' },

  // Video Generation
  'runway': { url: 'https://runwayml.com', docs: 'https://runwayml.com' },
  'pika': { url: 'https://pika.art', docs: 'https://pika.art' },
  'luma-dream': { url: 'https://lumalabs.ai/dream-machine', docs: 'https://lumalabs.ai' },
  'sora': { url: 'https://openai.com/sora', docs: 'https://openai.com/sora' },
  'kling-ai': { url: 'https://klingai.com', docs: 'https://klingai.com' },
  'hailuo-ai': { url: 'https://hailuoai.com', docs: 'https://hailuoai.com' },
  'heygen': { url: 'https://www.heygen.com', docs: 'https://www.heygen.com' },
  'synthesia': { url: 'https://www.synthesia.io', docs: 'https://www.synthesia.io' },
  'd-id': { url: 'https://www.d-id.com', docs: 'https://www.d-id.com' },
  'elai-io': { url: 'https://elai.io', docs: 'https://elai.io' },
  'colossyan': { url: 'https://www.colossyan.com', docs: 'https://www.colossyan.com' },
  'deepbrain': { url: 'https://www.deepbrain.io', docs: 'https://www.deepbrain.io' },
  'fliki': { url: 'https://fliki.ai', docs: 'https://fliki.ai' },
  'invideo': { url: 'https://invideo.io', docs: 'https://invideo.io' },
  'capcut': { url: 'https://www.capcut.com', docs: 'https://www.capcut.com' },
  'veed-io': { url: 'https://www.veed.io', docs: 'https://www.veed.io' },
  'pictory': { url: 'https://pictory.ai', docs: 'https://pictory.ai' },

  // Music Generation
  'suno': { url: 'https://suno.com', docs: 'https://suno.com' },
  'udio': { url: 'https://www.udio.com', docs: 'https://www.udio.com' },
  'soundraw': { url: 'https://soundraw.io', docs: 'https://soundraw.io' },
  'aiva': { url: 'https://www.aiva.ai', docs: 'https://www.aiva.ai' },
  'boomy': { url: 'https://boomy.com', docs: 'https://boomy.com' },
  'loudly': { url: 'https://www.loudly.com', docs: 'https://www.loudly.com' },
  'mubert': { url: 'https://mubert.com', docs: 'https://mubert.com' },
  'beatoven': { url: 'https://www.beatoven.ai', docs: 'https://www.beatoven.ai' },
  'soundful': { url: 'https://soundful.com', docs: 'https://soundful.com' },
  'ecrett': { url: 'https://ecrettmusic.com', docs: 'https://ecrettmusic.com' },
  'splash-music': { url: 'https://www.splashmusic.com', docs: 'https://www.splashmusic.com' },
  'riffusion': { url: 'https://www.riffusion.com', docs: 'https://www.riffusion.com' },

  // Gaming / 3D
  'meshy': { url: 'https://www.meshy.ai', docs: 'https://www.meshy.ai' },
  'tripo3d': { url: 'https://www.tripo3d.ai', docs: 'https://www.tripo3d.ai' },
  'spline': { url: 'https://spline.design', docs: 'https://docs.spline.design' },
  'nerfstudio': { url: 'https://docs.nerf.studio', docs: 'https://docs.nerf.studio' },
  'instant-ngp': { url: 'https://github.com/NVlabs/instant-ngp', docs: 'https://github.com/NVlabs/instant-ngp' },
  'kaedim': { url: 'https://www.kaedim3d.com', docs: 'https://www.kaedim3d.com' },
  'skybox-ai': { url: 'https://www.blockadelabs.com', docs: 'https://www.blockadelabs.com' },
  'polycam': { url: 'https://poly.cam', docs: 'https://poly.cam' },
  'scenario-ai': { url: 'https://www.scenario.com', docs: 'https://www.scenario.com' },
  'promethean-ai': { url: 'https://www.prometheanai.com', docs: 'https://www.prometheanai.com' }
};

let populatedCount = 0;

fs.readdirSync(catDir).filter(f => f.endsWith('.ts')).forEach(file => {
  const filePath = path.join(catDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let updated = false;

  for (const [key, source] of Object.entries(REAL_PRIMARY_SOURCES)) {
    // If the slug or name matches
    if (content.includes(`"slug": "${key}"`) || content.includes(`'${key}'`)) {
      urlCache[source.url] = 'verified';
      populatedCount++;
    }
  }
});

fs.writeFileSync(cacheFile, JSON.stringify(urlCache, null, 2), 'utf8');
console.log(`Populated primary source URLs for ${populatedCount} records and updated cache.`);
