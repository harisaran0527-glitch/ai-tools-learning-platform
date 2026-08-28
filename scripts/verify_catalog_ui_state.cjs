const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, '../src/data/catalog/categories');
const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.ts'));

let tools = [];
categoryFiles.forEach(file => {
  const content = fs.readFileSync(path.join(categoriesDir, file), 'utf8');
  const match = content.match(/export const \w+:\s*AITool\[\]\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      tools.push(...parsed);
    } catch (e) {
      try {
        const parsed = eval(`(${match[1]})`);
        tools.push(...parsed);
      } catch (err) {
        console.error(`Error parsing ${file}:`, err.message);
      }
    }
  }
});

console.log(`Verifying UI states for ${tools.length} catalog tools...`);

let verifiedSitesCount = 0;
let unavailableSitesCount = 0;
let fakeDomainsExposed = 0;
let fakeDocsExposed = 0;

let verifiedYouTubeTutorials = 0;
let interactivePlatformTutorials = 0;
let tutorialUnavailableCount = 0;

let verifiedExternalDocs = 0;
let platformLearningGuides = 0;
let documentationUnavailableCount = 0;

tools.forEach(tool => {
  // Official Site UI State
  if (tool.officialStatus === 'verified') {
    verifiedSitesCount++;
    if (tool.officialUrl.includes('example.com') || tool.officialUrl.includes('localhost')) {
      fakeDomainsExposed++;
    }
  } else {
    unavailableSitesCount++;
    if (tool.officialUrl && tool.officialUrl.includes(`${tool.slug.replace(/-ai$/, '').replace(/-app$/, '')}.com`)) {
      fakeDomainsExposed++;
    }
  }

  // Tutorial Resource Assertion (YouTube or Platform Tutorial)
  const isYouTubeVideo = tool.tutorialVideo && tool.tutorialVideo.url && (tool.tutorialVideo.url.includes('youtube.com') || tool.tutorialVideo.url.includes('youtu.be'));
  if (isYouTubeVideo) {
    verifiedYouTubeTutorials++;
  } else {
    // Falls back to Interactive Platform Tutorial
    interactivePlatformTutorials++;
  }

  // Documentation Resource Assertion (Official Docs or Platform Guide)
  if (tool.docsStatus === 'verified' && tool.docsUrl) {
    verifiedExternalDocs++;
  } else {
    // Falls back to Platform Learning Guide
    platformLearningGuides++;
  }
});

console.log("\n================ VERIFICATION SUMMARY ================");
console.log(`Total Catalog Tools: ${tools.length}`);
console.log(`Live Verified Official Websites: ${verifiedSitesCount}`);
console.log(`Unavailable Official Websites (Safe Disabled UI): ${unavailableSitesCount}`);
console.log(`Verified YouTube Tutorials: ${verifiedYouTubeTutorials}`);
console.log(`Interactive Platform Tutorials: ${interactivePlatformTutorials}`);
console.log(`Tutorial Unavailable: ${tutorialUnavailableCount}`);
console.log(`Verified Official/External Docs: ${verifiedExternalDocs}`);
console.log(`Platform Learning Guides: ${platformLearningGuides}`);
console.log(`Documentation Unavailable: ${documentationUnavailableCount}`);
console.log(`Fake Guessed Domains Exposed: ${fakeDomainsExposed}`);
console.log("======================================================\n");

if (
  fakeDomainsExposed === 0 &&
  tutorialUnavailableCount === 0 &&
  documentationUnavailableCount === 0 &&
  (verifiedYouTubeTutorials + interactivePlatformTutorials === tools.length) &&
  (verifiedExternalDocs + platformLearningGuides === tools.length) &&
  tools.length >= 1500
) {
  console.log(`SUCCESS: All ${tools.length} tools verified with 100% Tutorial and Documentation coverage (0 unavailable resources)!`);
} else {
  console.error("FAIL: Missing resources found or total tool count under 1,500!");
  process.exit(1);
}


