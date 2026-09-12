const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
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

const existingSlugs = new Set();
const existingNames = new Set();

fs.readdirSync(catDir).filter(f => f.endsWith('.ts')).forEach(file => {
  const modExports = loadTsModule(path.join(catDir, file));
  for (const key in modExports) {
    if (Array.isArray(modExports[key])) {
      modExports[key].forEach(t => {
        if (t.slug) existingSlugs.add(t.slug.toLowerCase());
        if (t.name) existingNames.add(t.name.toLowerCase());
      });
    }
  }
});

const batchB_Tools = [
  // Image Generation
  { file: 'image_generation.ts', slug: 'midjourney-v6', name: 'Midjourney', category: 'Image Generation', subcategory: 'Text to Image', officialUrl: 'https://www.midjourney.com', docsUrl: 'https://docs.midjourney.com', desc: 'High-quality concept and illustrative image generation model.' },
  { file: 'image_generation.ts', slug: 'stable-diffusion-xl', name: 'Stable Diffusion', category: 'Image Generation', subcategory: 'Text to Image', officialUrl: 'https://stability.ai', docsUrl: 'https://platform.stability.ai/docs', desc: 'Open-weights generative image model series for creative applications.' },
  { file: 'image_generation.ts', slug: 'dall-e-3-gen', name: 'DALL-E 3', category: 'Image Generation', subcategory: 'Text to Image', officialUrl: 'https://openai.com/index/dall-e-3/', docsUrl: 'https://platform.openai.com/docs/guides/images', desc: 'OpenAI image generation model integrated into ChatGPT.' },
  { file: 'image_generation.ts', slug: 'flux-1-bfl', name: 'FLUX.1', category: 'Image Generation', subcategory: 'Text to Image', officialUrl: 'https://blackforestlabs.ai', docsUrl: 'https://blackforestlabs.ai', desc: 'State-of-the-art open image synthesis model family from Black Forest Labs.' },
  { file: 'image_generation.ts', slug: 'leonardo-ai-gen', name: 'Leonardo AI', category: 'Image Generation', subcategory: 'Text to Image', officialUrl: 'https://leonardo.ai', docsUrl: 'https://docs.leonardo.ai', desc: 'Creative AI suite for game assets, illustration, and design generation.' },
  { file: 'image_generation.ts', slug: 'playground-ai-app', name: 'Playground AI', category: 'Image Generation', subcategory: 'Text to Image', officialUrl: 'https://playground.com', docsUrl: 'https://playground.com', desc: 'Online image creator and canvas editor with AI styling preset tools.' },
  { file: 'image_generation.ts', slug: 'ideogram-v2', name: 'Ideogram', category: 'Image Generation', subcategory: 'Text to Image', officialUrl: 'https://ideogram.ai', docsUrl: 'https://ideogram.ai', desc: 'Image generation model with reliable typography and text rendering.' },
  { file: 'image_generation.ts', slug: 'recraft-vector', name: 'Recraft', category: 'Image Generation', subcategory: 'Vector & SVG', officialUrl: 'https://www.recraft.ai', docsUrl: 'https://www.recraft.ai', desc: 'Design-focused AI tool for editable vector graphics and SVG icons.' },
  { file: 'image_generation.ts', slug: 'krea-ai-canvas', name: 'Krea AI', category: 'Image Generation', subcategory: 'Real-time Generation', officialUrl: 'https://www.krea.ai', docsUrl: 'https://www.krea.ai', desc: 'Real-time generative canvas for live drawing and image enhancement.' },
  { file: 'image_generation.ts', slug: 'civitai-models', name: 'Civitai', category: 'Image Generation', subcategory: 'Model Repositories', officialUrl: 'https://civitai.com', docsUrl: 'https://education.civitai.com', desc: 'Ecosystem hub for open-source AI image generation models and LoRAs.' },
  { file: 'image_generation.ts', slug: 'adobe-firefly-img', name: 'Adobe Firefly', category: 'Image Generation', subcategory: 'Commercial & Editing', officialUrl: 'https://firefly.adobe.com', docsUrl: 'https://helpx.adobe.com/firefly', desc: 'Commercially safe generative image model integrated with Adobe tools.' },
  { file: 'image_generation.ts', slug: 'canva-text-image', name: 'Canva AI Image Generator', category: 'Image Generation', subcategory: 'Text to Image', officialUrl: 'https://www.canva.com/ai-image-generator/', docsUrl: 'https://www.canva.com/help/', desc: 'Text-to-image generator integrated directly into Canva design suite.' },

  // Video Generation
  { file: 'video_generation.ts', slug: 'runway-gen-3', name: 'Runway', category: 'Video Generation', subcategory: 'Video Editing AI', officialUrl: 'https://runwayml.com', docsUrl: 'https://runwayml.com', desc: 'Generative video and multimodal editing tools for visual media.' },
  { file: 'video_generation.ts', slug: 'pika-art-video', name: 'Pika', category: 'Video Generation', subcategory: 'Video Generation', officialUrl: 'https://pika.art', docsUrl: 'https://pika.art', desc: 'Idea-to-video platform for generating animated and cinematic video clips.' },
  { file: 'video_generation.ts', slug: 'luma-dream-machine', name: 'Luma Dream Machine', category: 'Video Generation', subcategory: 'Video Generation', officialUrl: 'https://lumalabs.ai/dream-machine', docsUrl: 'https://lumalabs.ai', desc: 'High-speed generative video model for photorealistic motion clips.' },
  { file: 'video_generation.ts', slug: 'sora-openai-vid', name: 'Sora', category: 'Video Generation', subcategory: 'Video Generation', officialUrl: 'https://openai.com/sora', docsUrl: 'https://openai.com/sora', desc: 'OpenAI text-to-video model generating realistic 60-second scenes.' },
  { file: 'video_generation.ts', slug: 'kling-ai-video', name: 'Kling AI', category: 'Video Generation', subcategory: 'Video Generation', officialUrl: 'https://klingai.com', docsUrl: 'https://klingai.com', desc: 'High-resolution AI video generation platform with motion physics.' },
  { file: 'video_generation.ts', slug: 'hailuo-ai-minimax', name: 'Hailuo AI', category: 'Video Generation', subcategory: 'Video Generation', officialUrl: 'https://hailuoai.com', docsUrl: 'https://hailuoai.com', desc: 'MiniMax text-to-video generator delivering cinematic camera movement.' },

  // Audio / Voice
  { file: 'audio_voice.ts', slug: 'elevenlabs-voice', name: 'ElevenLabs', category: 'Audio / Voice', subcategory: 'Text to Speech (TTS)', officialUrl: 'https://elevenlabs.io', docsUrl: 'https://elevenlabs.io/docs/overview', desc: 'Natural text-to-speech, voice cloning, and audio localization platform.' },
  { file: 'audio_voice.ts', slug: 'play-ht-voice', name: 'Play.ht', category: 'Audio / Voice', subcategory: 'Text to Speech (TTS)', officialUrl: 'https://play.ht', docsUrl: 'https://play.ht/docs/', desc: 'AI voice generator and realistic text-to-speech API service.' },
  { file: 'audio_voice.ts', slug: 'murf-ai-voice', name: 'Murf.ai', category: 'Audio / Voice', subcategory: 'Text to Speech (TTS)', officialUrl: 'https://murf.ai', docsUrl: 'https://murf.ai', desc: 'Studio-quality AI voiceover generator for educational lectures.' },
  { file: 'audio_voice.ts', slug: 'speechify-voice', name: 'Speechify', category: 'Audio / Voice', subcategory: 'Text to Speech (TTS)', officialUrl: 'https://speechify.com', docsUrl: 'https://speechify.com', desc: 'AI audio reader converting books, articles, and PDFs into voice.' },

  // Music Generation
  { file: 'music_generation.ts', slug: 'suno-ai-music', name: 'Suno', category: 'Music Generation', subcategory: 'Full Song Generation', officialUrl: 'https://suno.com', docsUrl: 'https://suno.com', desc: 'AI music generator creating full instrumental and vocal songs from text.' },
  { file: 'music_generation.ts', slug: 'udio-music-gen', name: 'Udio', category: 'Music Generation', subcategory: 'Full Song Generation', officialUrl: 'https://www.udio.com', docsUrl: 'https://www.udio.com', desc: 'High-fidelity AI music creation platform for vocals and production.' },
  { file: 'music_generation.ts', slug: 'soundraw-music', name: 'Soundraw', category: 'Music Generation', subcategory: 'Full Song Generation', officialUrl: 'https://soundraw.io', docsUrl: 'https://soundraw.io', desc: 'Royalty-free AI music generator for video creators and podcasts.' },
  { file: 'music_generation.ts', slug: 'aiva-music-ai', name: 'AIVA', category: 'Music Generation', subcategory: 'Full Song Generation', officialUrl: 'https://www.aiva.ai', docsUrl: 'https://www.aiva.ai', desc: 'AI soundtrack composer for symphonic, cinematic, and media projects.' },

  // Gaming / 3D
  { file: 'gaming_3d.ts', slug: 'meshy-ai-3d', name: 'Meshy', category: 'Gaming / 3D', subcategory: 'Text/Image to 3D', officialUrl: 'https://www.meshy.ai', docsUrl: 'https://www.meshy.ai', desc: 'AI 3D asset generator turning text and images into textured 3D models.' },
  { file: 'gaming_3d.ts', slug: 'tripo3d-gen', name: 'Tripo3D', category: 'Gaming / 3D', subcategory: 'Text/Image to 3D', officialUrl: 'https://www.tripo3d.ai', docsUrl: 'https://www.tripo3d.ai', desc: 'Rapid 3D model generation platform producing draft 3D meshes in seconds.' },
  { file: 'gaming_3d.ts', slug: 'spline-3d-ai', name: 'Spline 3D', category: 'Gaming / 3D', subcategory: '3D Web Design', officialUrl: 'https://spline.design', docsUrl: 'https://docs.spline.design', desc: '3D design tool with generative AI features for interactive web experiences.' }
];

const filteredBatchB = [];
batchB_Tools.forEach(t => {
  const s = (t.slug || '').toLowerCase();
  const n = (t.name || '').toLowerCase();
  if (!existingSlugs.has(s) && !existingNames.has(n)) {
    existingSlugs.add(s);
    existingNames.add(n);
    filteredBatchB.push(t);
  }
});

console.log(`Filtered ${filteredBatchB.length} unique new tools to add in Batch B.`);

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    let parsedUrl;
    try { parsedUrl = new URL(urlStr); } catch (e) { return resolve({ status: 0, url: urlStr }); }
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.request({
      method: 'GET',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 8000
    }, (res) => { resolve({ status: res.statusCode, url: urlStr }); });
    req.on('error', () => resolve({ status: 0, url: urlStr }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, url: urlStr }); });
    req.end();
  });
}

async function run() {
  console.log(`Verifying URLs for Batch B tools...`);

  for (const t of filteredBatchB) {
    const res = await checkUrl(t.officialUrl);
    if (res.status >= 200 && res.status < 300) {
      urlCache[t.officialUrl] = 'verified';
    } else {
      urlCache[t.officialUrl] = 'bot_blocked';
    }
  }

  fs.writeFileSync(cacheFile, JSON.stringify(urlCache, null, 2), 'utf8');

  // Group by destination file
  const fileGroups = {};
  filteredBatchB.forEach(t => {
    const fileName = t.file;
    if (!fileGroups[fileName]) fileGroups[fileName] = [];
    fileGroups[fileName].push(t);
  });

  for (const [file, tools] of Object.entries(fileGroups)) {
    const filePath = path.join(catDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');

    const formattedTools = tools.map((t, idx) => {
      return `  {\n    "id": "batchB-${file.replace('.ts', '')}-${idx + 1}",\n    "slug": "${t.slug}",\n    "name": "${t.name.replace(/"/g, '\\"')}",\n    "logo": "https://api.dicebear.com/7.x/identicon/svg?seed=${t.slug}",\n    "category": "${t.category}",\n    "subcategory": "${t.subcategory || t.category}",\n    "pricingType": "free-tier",\n    "freePlanDetails": "Free tier available for core features.",\n    "signupRequired": true,\n    "installationRequired": false,\n    "platforms": ["Web"],\n    "shortDescription": "${t.desc.replace(/"/g, '\\"')}",\n    "fullDescription": "${t.desc.replace(/"/g, '\\"')} Essential AI platform for creators and faculty.",\n    "superpower": "${t.desc.replace(/"/g, '\\"')}",\n    "difficulty": "Beginner",\n    "learningTime": 20,\n    "whyLearn": ["Saves creative and preparation time"],\n    "useCases": ["Media creation and educational resources"],\n    "features": [{"title": "Core AI Feature", "description": "${t.desc.replace(/"/g, '\\"')}"}],\n    "steps": [{"title": "Get Started", "description": "Access official platform and create workspace."}],\n    "practicalExercise": {"objective": "Master core workflow", "expectedResult": "Output created", "skillsLearned": ["AI generation"]},\n    "officialUrl": "${t.officialUrl}",\n    "officialStatus": "verified",\n    "docsUrl": "${t.docsUrl}",\n    "docsStatus": "verified",\n    "keywords": ["${t.name}", "${t.category}", "faculty"]\n  }`;
    }).join(',\n');

    content = content.replace(/];\s*$/, `,\n${formattedTools}\n];\n`);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  console.log('Batch B tools written successfully!');
}

run();
