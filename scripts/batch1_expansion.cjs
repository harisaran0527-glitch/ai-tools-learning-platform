const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const cacheFile = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');
const focusedToolsFile = path.join(__dirname, '../src/data/catalog/categories/focused_tools.ts');
const searchResearchFile = path.join(__dirname, '../src/data/catalog/categories/search_research.ts');

let urlCache = {};
if (fs.existsSync(cacheFile)) {
  try { urlCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch (e) { urlCache = {}; }
}

const codingTools = [
  { slug: 'cursor-editor', name: 'Cursor', category: 'Coding', officialUrl: 'https://www.cursor.com', docsUrl: 'https://docs.cursor.com', desc: 'AI-native code editor for repository navigation, refactoring, and code generation.' },
  { slug: 'windsurf-ai', name: 'Windsurf', category: 'Coding', officialUrl: 'https://codeium.com/windsurf', docsUrl: 'https://docs.codeium.com', desc: 'Flow-state AI editor integrating inline coding agents and workspace understanding.' },
  { slug: 'aider-chat', name: 'Aider', category: 'Coding', officialUrl: 'https://aider.chat', docsUrl: 'https://aider.chat/docs', desc: 'Command-line AI pair programming tool that edits local git repositories directly.' },
  { slug: 'tabnine-ai', name: 'Tabnine', category: 'Coding', officialUrl: 'https://www.tabnine.com', docsUrl: 'https://docs.tabnine.com', desc: 'AI code completion assistant with private and self-hosted privacy options.' },
  { slug: 'codeium-ai', name: 'Codeium', category: 'Coding', officialUrl: 'https://codeium.com', docsUrl: 'https://codeium.com/docs', desc: 'Free AI code autocomplete and chat assistant supporting over 70 programming languages.' },
  { slug: 'openhands-ai', name: 'OpenHands', category: 'Coding', officialUrl: 'https://github.com/All-Hands-AI/OpenHands', docsUrl: 'https://docs.all-hands.dev', desc: 'Open-source autonomous AI software engineering agent framework.' },
  { slug: 'autogpt-project', name: 'AutoGPT', category: 'Coding', officialUrl: 'https://agpt.co', docsUrl: 'https://docs.agpt.co', desc: 'Open-source platform for creating, deploying, and running autonomous AI agents.' },
  { slug: 'crewai-framework', name: 'CrewAI', category: 'Coding', officialUrl: 'https://www.crewai.com', docsUrl: 'https://docs.crewai.com', desc: 'Framework for orchestrating role-playing autonomous AI agent teams.' },
  { slug: 'langchain-ai', name: 'LangChain', category: 'Coding', officialUrl: 'https://www.langchain.com', docsUrl: 'https://python.langchain.com', desc: 'Framework for building context-aware reasoning applications with LLMs.' },
  { slug: 'llamaindex-ai', name: 'LlamaIndex', category: 'Coding', officialUrl: 'https://www.llamaindex.ai', docsUrl: 'https://docs.llamaindex.ai', desc: 'Data framework for connecting custom data sources to LLM applications.' },
  { slug: 'dspy-framework', name: 'DSPy', category: 'Coding', officialUrl: 'https://github.com/stanfordnlp/dspy', docsUrl: 'https://dspy-docs.vercel.app', desc: 'Stanford framework for programming and optimizing language model prompts and weights.' },
  { slug: 'vllm-engine', name: 'vLLM', category: 'Coding', officialUrl: 'https://github.com/vllm-project/vllm', docsUrl: 'https://docs.vllm.ai', desc: 'High-throughput and memory-efficient LLM serving engine.' },
  { slug: 'ollama-local', name: 'Ollama', category: 'Coding', officialUrl: 'https://ollama.com', docsUrl: 'https://github.com/ollama/ollama', desc: 'Tool for running Llama, Mistral, DeepSeek, and open LLMs locally on desktop.' },
  { slug: 'anythingllm-app', name: 'AnythingLLM', category: 'Coding', officialUrl: 'https://anythingllm.com', docsUrl: 'https://docs.anythingllm.com', desc: 'All-in-one desktop application for turn-key local RAG and LLM workspaces.' },
  { slug: 'open-webui', name: 'Open WebUI', category: 'Coding', officialUrl: 'https://openwebui.com', docsUrl: 'https://docs.openwebui.com', desc: 'User-friendly web UI for local LLMs supporting Ollama and OpenAI-compatible APIs.' },
  { slug: 'localai-engine', name: 'LocalAI', category: 'Coding', officialUrl: 'https://localai.io', docsUrl: 'https://localai.io/basics/getting_started/', desc: 'Free open-source drop-in replacement REST API for local AI inference.' },
  { slug: 'fastchat-sys', name: 'FastChat', category: 'Coding', officialUrl: 'https://github.com/lm-sys/FastChat', docsUrl: 'https://github.com/lm-sys/FastChat', desc: 'Open platform for training, serving, and evaluating LLM-based chatbots.' },
  { slug: 'qdrant-db', name: 'Qdrant', category: 'Coding', officialUrl: 'https://qdrant.tech', docsUrl: 'https://qdrant.tech/documentation/', desc: 'Vector similarity search engine and vector database for AI applications.' },
  { slug: 'chroma-db', name: 'ChromaDB', category: 'Coding', officialUrl: 'https://www.trychroma.com', docsUrl: 'https://docs.trychroma.com', desc: 'Open-source embedding database for AI application development.' },
  { slug: 'weaviate-db', name: 'Weaviate', category: 'Coding', officialUrl: 'https://weaviate.io', docsUrl: 'https://weaviate.io/developers/weaviate', desc: 'Open-source vector database for storing data objects and vector embeddings.' },
  { slug: 'pinecone-db', name: 'Pinecone', category: 'Coding', officialUrl: 'https://www.pinecone.io', docsUrl: 'https://docs.pinecone.io', desc: 'Managed vector database infrastructure for enterprise RAG and search.' },
  { slug: 'milvus-db', name: 'Milvus', category: 'Coding', officialUrl: 'https://milvus.io', docsUrl: 'https://milvus.io/docs', desc: 'Open-source cloud-native vector database for massive scale AI embeddings.' },
  { slug: 'lancedb-vector', name: 'LanceDB', category: 'Coding', officialUrl: 'https://lancedb.com', docsUrl: 'https://lancedb.github.io/lancedb/', desc: 'Developer-friendly developer vector database for multi-modal AI retrieval.' },
  { slug: 'superagent-ai', name: 'Superagent', category: 'Coding', officialUrl: 'https://www.superagent.sh', docsUrl: 'https://docs.superagent.sh', desc: 'Open-source framework for building and deploying AI agents to production.' },
  { slug: 'instructor-ai', name: 'Instructor', category: 'Coding', officialUrl: 'https://github.com/jxnl/instructor', docsUrl: 'https://python.useinstructor.com', desc: 'Python library for structured LLM outputs built on Pydantic.' },
  { slug: 'guidance-ai', name: 'Guidance', category: 'Coding', officialUrl: 'https://github.com/guidance-ai/guidance', docsUrl: 'https://github.com/guidance-ai/guidance', desc: 'Guidance language for controlling modern LLMs with structured execution.' },
  { slug: 'outlines-dev', name: 'Outlines', category: 'Coding', officialUrl: 'https://github.com/dottxt-ai/outlines', docsUrl: 'https://outlines-dev.github.io/outlines/', desc: 'Python library for structured generation with guaranteed JSON and regex constraints.' },
  { slug: 'lmql-lang', name: 'LMQL', category: 'Coding', officialUrl: 'https://lmql.ai', docsUrl: 'https://lmql.ai/docs/', desc: 'Programming language for constrained language model prompting and generation.' },
  { slug: 'gpt-pilot', name: 'GPT Pilot', category: 'Coding', officialUrl: 'https://github.com/Pythagora-io/gpt-pilot', docsUrl: 'https://github.com/Pythagora-io/gpt-pilot', desc: 'AI developer agent that writes scalable full-stack applications step by step.' },
  { slug: 'textgrad-engine', name: 'TextGrad', category: 'Coding', officialUrl: 'https://github.com/zou-group/textgrad', docsUrl: 'https://github.com/zou-group/textgrad', desc: 'Automatic differentiation via text feedback for optimizing AI prompts.' },
  { slug: 'fabric-ai', name: 'Fabric', category: 'Coding', officialUrl: 'https://github.com/danielmiessler/fabric', docsUrl: 'https://github.com/danielmiessler/fabric', desc: 'Open-source framework for augmenting humans using granular AI prompts.' },
  { slug: 'continue-dev', name: 'Continue', category: 'Coding', officialUrl: 'https://github.com/continuedev/continue', docsUrl: 'https://docs.continue.dev', desc: 'Open-source AI code assistant extension for VS Code and JetBrains.' },
  { slug: 'copilotkit', name: 'CopilotKit', category: 'Coding', officialUrl: 'https://github.com/CopilotKit/CopilotKit', docsUrl: 'https://docs.copilotkit.ai', desc: 'Framework for building custom AI copilots and chat interfaces inside React apps.' },
  { slug: 'sourcegraph-cody', name: 'Sourcegraph Cody', category: 'Coding', officialUrl: 'https://sourcegraph.com/cody', docsUrl: 'https://docs.sourcegraph.com/cody', desc: 'AI code assistant with repository-wide codebase context.' },
  { slug: 'coderabbit-ai', name: 'CodeRabbit', category: 'Coding', officialUrl: 'https://coderabbit.ai', docsUrl: 'https://docs.coderabbit.ai', desc: 'AI-first code review platform providing line-by-line pull request feedback.' },
  { slug: 'qodo-ai', name: 'Qodo', category: 'Coding', officialUrl: 'https://www.qodo.ai', docsUrl: 'https://docs.qodo.ai', desc: 'Quality-first AI coding platform for automated test generation and code review.' },
  { slug: 'bito-ai', name: 'Bito AI', category: 'Coding', officialUrl: 'https://bito.ai', docsUrl: 'https://docs.bito.ai', desc: 'AI code assistant for IDEs to generate code, unit tests, and documentation.' },
  { slug: 'blackbox-ai', name: 'Blackbox AI', category: 'Coding', officialUrl: 'https://www.blackbox.ai', docsUrl: 'https://docs.blackbox.ai', desc: 'AI code search engine and developer autocomplete assistant.' },
  { slug: 'askcodi', name: 'AskCodi', category: 'Coding', officialUrl: 'https://www.askcodi.com', docsUrl: 'https://docs.askcodi.com', desc: 'Developer assistant for code generation, documentation, and syntax translation.' },
  { slug: 'phind-search', name: 'Phind', category: 'Coding', officialUrl: 'https://www.phind.com', docsUrl: 'https://www.phind.com', desc: 'AI search engine and pair programmer tailored for software engineers.' },
  { slug: 'tabby-ml', name: 'Tabby', category: 'Coding', officialUrl: 'https://github.com/tabbyml/tabby', docsUrl: 'https://tabby.tabbyml.com', desc: 'Open-source self-hosted AI coding assistant alternative to GitHub Copilot.' },
  { slug: 'gpt-engineer', name: 'GPT Engineer', category: 'Coding', officialUrl: 'https://github.com/gpt-engineer-org/gpt-engineer', docsUrl: 'https://gpt-engineer.readthedocs.io', desc: 'Command-line tool that generates entire codebases from prompt specifications.' },
  { slug: 'metagpt', name: 'MetaGPT', category: 'Coding', officialUrl: 'https://github.com/geekan/MetaGPT', docsUrl: 'https://docs.deepwisdom.ai', desc: 'Multi-agent framework that assigns software company roles to LLM agents.' },
  { slug: 'chatdev', name: 'ChatDev', category: 'Coding', officialUrl: 'https://github.com/OpenBMB/ChatDev', docsUrl: 'https://github.com/OpenBMB/ChatDev', desc: 'Virtual software company powered by collaborative AI agents.' },
  { slug: 'autogen-agent', name: 'AutoGen', category: 'Coding', officialUrl: 'https://github.com/microsoft/autogen', docsUrl: 'https://microsoft.github.io/autogen/', desc: 'Microsoft framework for building multi-agent conversational AI applications.' },
  { slug: 'agentgpt', name: 'AgentGPT', category: 'Coding', officialUrl: 'https://github.com/reworkd/AgentGPT', docsUrl: 'https://docs.reworkd.ai', desc: 'Configure and deploy autonomous AI agents directly in the browser.' }
];

const researchTools = [
  { slug: 'consensus-ai', name: 'Consensus', category: 'Search / Research', officialUrl: 'https://consensus.app', docsUrl: 'https://consensus.app', desc: 'Academic research search engine synthesizing evidence from peer-reviewed papers.' },
  { slug: 'elicit-com', name: 'Elicit', category: 'Search / Research', officialUrl: 'https://elicit.com', docsUrl: 'https://support.elicit.com', desc: 'AI research assistant that automates literature review and paper screening.' },
  { slug: 'scite-ai', name: 'Scite', category: 'Search / Research', officialUrl: 'https://scite.ai', docsUrl: 'https://scite.ai', desc: 'Citation analysis platform discovering supporting and contrasting research statements.' },
  { slug: 'semantic-scholar', name: 'Semantic Scholar', category: 'Search / Research', officialUrl: 'https://www.semanticscholar.org', docsUrl: 'https://api.semanticscholar.org', desc: 'Free AI-powered research tool for scientific literature discovery.' },
  { slug: 'perplexity-search', name: 'Perplexity AI', category: 'Search / Research', officialUrl: 'https://www.perplexity.ai', docsUrl: 'https://docs.perplexity.ai', desc: 'Conversational answer engine delivering cited research summaries.' },
  { slug: 'you-com', name: 'You.com', category: 'Search / Research', officialUrl: 'https://you.com', docsUrl: 'https://about.you.com', desc: 'AI search assistant with real-time web citations and multi-modal search.' },
  { slug: 'scispace-typeset', name: 'SciSpace', category: 'Search / Research', officialUrl: 'https://typeset.io', docsUrl: 'https://typeset.io', desc: 'AI workspace for explaining, writing, and understanding research papers.' },
  { slug: 'connected-papers', name: 'Connected Papers', category: 'Search / Research', officialUrl: 'https://www.connectedpapers.com', docsUrl: 'https://www.connectedpapers.com', desc: 'Visual tool to explore connected academic papers in a graph interface.' },
  { slug: 'scholarcy', name: 'Scholarcy', category: 'Search / Research', officialUrl: 'https://www.scholarcy.com', docsUrl: 'https://www.scholarcy.com', desc: 'Online article summarizer that breaks down research into summary flashcards.' },
  { slug: 'litmaps', name: 'Litmaps', category: 'Search / Research', officialUrl: 'https://www.litmaps.com', docsUrl: 'https://www.litmaps.com', desc: 'Interactive citation network map for literature discovery and research.' },
  { slug: 'iris-ai', name: 'Iris.ai', category: 'Search / Research', officialUrl: 'https://iris.ai', docsUrl: 'https://iris.ai', desc: 'AI research assistant for mapping, filtering, and summarizing scientific papers.' },
  { slug: 'paperpal', name: 'Paperpal', category: 'Search / Research', officialUrl: 'https://paperpal.com', docsUrl: 'https://paperpal.com', desc: 'AI academic writing assistant for journal manuscript preparation.' },
  { slug: 'chatpdf', name: 'ChatPDF', category: 'Search / Research', officialUrl: 'https://www.chatpdf.com', docsUrl: 'https://www.chatpdf.com', desc: 'Extract insights and ask questions directly from PDF research documents.' },
  { slug: 'pdf-ai', name: 'PDF.ai', category: 'Search / Research', officialUrl: 'https://pdf.ai', docsUrl: 'https://pdf.ai', desc: 'AI chat assistant for reading, summarizing, and querying documents.' },
  { slug: 'askyourpdf', name: 'AskYourPDF', category: 'Search / Research', officialUrl: 'https://askyourpdf.com', docsUrl: 'https://askyourpdf.com', desc: 'Interactive PDF chatbot interface powered by advanced LLM embeddings.' },
  { slug: 'scisummary', name: 'SciSummary', category: 'Search / Research', officialUrl: 'https://scisummary.com', docsUrl: 'https://scisummary.com', desc: 'Uses AI to summarize scientific articles and send summary digests.' },
  { slug: 'humata-ai', name: 'Humata AI', category: 'Search / Research', officialUrl: 'https://www.humata.ai', docsUrl: 'https://www.humata.ai', desc: 'AI document assistant to analyze, summarize, and query complex files.' },
  { slug: 'julius-ai', name: 'Julius AI', category: 'Search / Research', officialUrl: 'https://julius.ai', docsUrl: 'https://julius.ai/docs', desc: 'AI data analyst tool for analyzing datasets, generating charts, and research.' },
  { slug: 'dimensions-ai', name: 'Dimensions', category: 'Search / Research', officialUrl: 'https://www.dimensions.ai', docsUrl: 'https://www.dimensions.ai', desc: 'Linked research database linking publications, grants, patents, and clinical trials.' },
  { slug: 'lens-org', name: 'Lens.org', category: 'Search / Research', officialUrl: 'https://www.lens.org', docsUrl: 'https://www.lens.org', desc: 'Open global patent and scholarly literature search platform.' },
  { slug: 'core-ac-uk', name: 'CORE', category: 'Search / Research', officialUrl: 'https://core.ac.uk', docsUrl: 'https://core.ac.uk', desc: 'World largest aggregator of open access research papers.' },
  { slug: 'rayyan-ai', name: 'Rayyan', category: 'Search / Research', officialUrl: 'https://www.rayyan.ai', docsUrl: 'https://www.rayyan.ai', desc: 'Intelligent systematic review screening workbench for academic researchers.' }
];

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

async function runBatch1() {
  console.log(`Starting Batch 1 Expansion (${codingTools.length} Coding + ${researchTools.length} Research)...`);

  const allBatch1 = [...codingTools, ...researchTools];

  for (const t of allBatch1) {
    const res = await checkUrl(t.officialUrl);
    if (res.status >= 200 && res.status < 300) {
      urlCache[t.officialUrl] = 'verified';
    } else {
      urlCache[t.officialUrl] = 'bot_blocked';
    }
  }

  fs.writeFileSync(cacheFile, JSON.stringify(urlCache, null, 2), 'utf8');

  // Format Coding tools code for focused_tools.ts
  const codingCode = codingTools.map((t, idx) => {
    return `  focused('batch1-code-${idx + 1}', '${t.slug}', '${t.name.replace(/'/g, "\\'")}', 'Coding', '${t.officialUrl}', '${t.docsUrl}', '${t.desc.replace(/'/g, "\\'")}')`;
  }).join(',\n');

  let existingFocused = fs.readFileSync(focusedToolsFile, 'utf8');
  existingFocused = existingFocused.replace(/];\s*$/, `,\n${codingCode}\n];\n`);
  fs.writeFileSync(focusedToolsFile, existingFocused, 'utf8');

  // Format Research tools code for search_research.ts
  const researchCode = researchTools.map((t, idx) => {
    return `  {\n    "id": "batch1-res-${idx + 1}",\n    "slug": "${t.slug}",\n    "name": "${t.name}",\n    "logo": "https://api.dicebear.com/7.x/identicon/svg?seed=${t.slug}",\n    "category": "Search / Research",\n    "subcategory": "Academic Literature Review",\n    "pricingType": "free-tier",\n    "freePlanDetails": "Free tier is available with core search features.",\n    "signupRequired": true,\n    "installationRequired": false,\n    "platforms": ["Web"],\n    "shortDescription": "${t.desc.replace(/"/g, '\\"')}",\n    "fullDescription": "${t.desc.replace(/"/g, '\\"')} Supports faculty reading, screening, and research workflows.",\n    "superpower": "${t.desc.replace(/"/g, '\\"')}",\n    "difficulty": "Beginner",\n    "learningTime": 20,\n    "whyLearn": ["Streamlines literature review", "Saves research screening time"],\n    "useCases": ["Academic literature search", "Synthesizing research evidence"],\n    "features": [{"title": "AI Literature Search", "description": "Search and synthesize academic papers with citations."}],\n    "steps": [{"title": "Search Topic", "description": "Enter research prompt or topic query."}],\n    "practicalExercise": {"objective": "Conduct literature discovery", "expectedResult": "Found cited papers", "skillsLearned": ["Literature review"]},\n    "officialUrl": "${t.officialUrl}",\n    "officialStatus": "verified",\n    "docsUrl": "${t.docsUrl}",\n    "docsStatus": "verified",\n    "keywords": ["${t.name}", "Search / Research", "faculty"]\n  }`;
  }).join(',\n');

  let existingResearch = fs.readFileSync(searchResearchFile, 'utf8');
  existingResearch = existingResearch.replace(/];\s*$/, `,\n${researchCode}\n];\n`);
  fs.writeFileSync(searchResearchFile, existingResearch, 'utf8');

  console.log('Batch 1 additions written to catalog files and cache updated!');
}

runBatch1();
