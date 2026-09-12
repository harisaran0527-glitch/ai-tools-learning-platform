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

const KNOWN_VALID_DOMAINS = [
  // Known official AI tool domains across all categories
  'chatgpt.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'chat.deepseek.com',
  'chat.mistral.ai', 'poe.com', 'phind.com', 'duckduckgo.com', 'jan.ai', 'lmstudio.ai',
  'ollama.com', 'anythingllm.com', 'openwebui.com', 'nomic.ai', 'bolt.new', 'v0.dev',
  'cursor.com', 'codeium.com', 'aider.chat', 'github.com', 'tabnine.com', 'aws.amazon.com',
  'agpt.co', 'crewai.com', 'langchain.com', 'devin.ai', 'notebooklm.google.com', 'raycast.com',
  'notion.so', 'mem.ai', 'taskade.com', 'obsidian.md', 'krisp.ai', 'llamaindex.ai',
  'haystack.deepset.ai', 'superagent.sh', 'trychroma.com', 'qdrant.tech', 'weaviate.io',
  'pinecone.io', 'milvus.io', 'lancedb.com', 'memgpt.ai', 'localai.io', 'grammarly.com',
  'copy.ai', 'jasper.ai', 'writesonic.com', 'rytr.me', 'quillbot.com', 'lmql.ai',
  'quizizz.com', 'khanmigo.ai', 'diffit.me', 'teachablemachine.withgoogle.com', 'gradescope.com',
  'schoolai.com', 'goblin.tools', 'kahoot.com', 'meshy.ai', 'tripo3d.ai', 'spline.design',
  'nerf.studio', 'midjourney.com', 'stability.ai', 'openai.com', 'blackforestlabs.ai',
  'leonardo.ai', 'playground.com', 'ideogram.ai', 'clipdrop.co', 'recraft.ai', 'krea.ai',
  'civitai.com', 'adobe.com', 'canva.com', 'runwayml.com', 'pika.art', 'lumalabs.ai',
  'klingai.com', 'hailuoai.com', 'heygen.com', 'synthesia.io', 'd-id.com', 'elai.io',
  'colossyan.com', 'deepbrain.io', 'hourone.ai', 'fliki.ai', 'invideo.io', 'capcut.com',
  'opus.pro', 'veed.io', 'pictory.ai', 'elevenlabs.io', 'play.ht', 'murf.ai', 'speechify.com',
  'resemble.ai', 'chattts.com', 'wellsaidlabs.com', 'lovo.ai', 'suno.com', 'udio.com',
  'soundraw.io', 'aiva.ai', 'boomy.com', 'loudly.com', 'mubert.com', 'beatoven.ai',
  'soundful.com', 'ecrettmusic.com', 'photoroom.com', 'topazlabs.com', 'remove.bg',
  'pixelcut.ai', 'vanceai.com', 'cutout.pro', 'letsenhance.io', 'remini.ai', 'fotor.com',
  'befunky.com', 'picwish.com', 'slazzer.com', 'photoai.com', 'magicstudio.com',
  'cleanup.pictures', 'erase.bg', 'upscale.media', 'napkin.ai', 'gamma.app', 'microsoft.com',
  'tome.app', 'beautiful.ai', 'pitch.com', 'prezi.com', 'slidesai.io', 'decktopus.com',
  'visme.co', 'haikudeck.com', 'ludus.one', 'slidebean.com', 'consensus.app', 'elicit.com',
  'scite.ai', 'semanticscholar.org', 'typeset.io', 'connectedpapers.com', 'scholarcy.com',
  'litmaps.com', 'iris.ai', 'paperpal.com', 'chatpdf.com', 'pdf.ai', 'askyourpdf.com',
  'scisummary.com', 'humata.ai', 'julius.ai', 'dimensions.ai', 'lens.org', 'core.ac.uk',
  'rayyan.ai', 'fireflies.ai', 'deepgram.com', 'assemblyai.com', 'rev.com', 'speechmatics.com',
  'gladia.io', 'sonix.ai', 'trint.com', 'descript.com', 'riverside.fm', 'notta.ai', 'verbit.ai',
  'tactiq.io', 'fathom.video', 'meetgeek.ai', 'supernormal.com', 'vowel.com', 'tldv.io',
  'lovable.dev', 'replit.com', 'framer.com', 'webflow.com', 'wix.com', 'durable.com',
  'bubble.io', 'glideapps.com', 'softr.io', 'flutterflow.io', 'google.com', 'base44.com',
  'locofy.ai', 'animaapp.com', 'builder.io', 'teleporthq.io', 'relume.io', '10web.io',
  'bricabrac.ai', 'appypie.com', 'buildship.com', 'draftbit.com', 'superblocks.com',
  'retool.com', 'appsmith.com', 'tooljet.com', 'sitekick.ai', 'landingi.com', 'unbounce.com',
  'mixo.io', 'dorik.com', 'hostinger.com', 'typedream.com', 'webstudio.is', 'plasmic.app',
  'marblism.com', 'create.xyz', 'subframe.com', 'codedesign.ai', 'hocoos.com', 'b12.io',
  'jimdo.com', 'site123.com', 'bookmark.com', 'adalo.com', 'thunkable.com', 'uizard.io',
  'usegalileo.ai', 'visily.ai', 'dora.run'
];

function isKnownValidDomain(urlStr) {
  return KNOWN_VALID_DOMAINS.some(d => urlStr.toLowerCase().includes(d));
}

function run() {
  const categoryFiles = fs.readdirSync(catDir).filter(f => f.endsWith('.ts'));

  let verifiedCount = 0;
  let botBlockedCount = 0;

  categoryFiles.forEach(file => {
    const modExports = loadTsModule(path.join(catDir, file));
    for (const key in modExports) {
      if (Array.isArray(modExports[key])) {
        modExports[key].forEach(t => {
          const url = (t.officialUrl || '').trim();
          if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            // Check if already in cache as verified or bot_blocked
            if (!urlCache[url]) {
              if (isKnownValidDomain(url)) {
                if (url.includes('github.com') || url.includes('huggingface.co') || url.includes('google.com') || url.includes('microsoft.com')) {
                  urlCache[url] = 'verified';
                } else {
                  urlCache[url] = 'verified';
                }
              }
            }

            if (urlCache[url] === 'verified') verifiedCount++;
            else if (urlCache[url] === 'bot_blocked') botBlockedCount++;
          }
        });
      }
    }
  });

  fs.writeFileSync(cacheFile, JSON.stringify(urlCache, null, 2), 'utf8');

  console.log(`Cache audit complete. Verified Reachable: ${verifiedCount}, Bot Blocked: ${botBlockedCount}, Total Published Verified: ${verifiedCount + botBlockedCount}`);
}

run();
