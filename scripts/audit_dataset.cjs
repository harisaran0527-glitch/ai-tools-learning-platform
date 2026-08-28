const fs = require('fs');
const path = require('path');

// Load generated toolsData.ts
const toolsDataPath = path.join(__dirname, '../src/data/catalog/toolsData.ts');
const questionPoolPath = path.join(__dirname, '../src/data/questions/questionPool.ts');

console.log("=== STARTING FULL DATASET AUDIT ===");

if (!fs.existsSync(toolsDataPath)) {
  console.error("toolsData.ts not found!");
  process.exit(1);
}

// Read raw file content
const toolsFileContent = fs.readFileSync(toolsDataPath, 'utf8');
const questionsFileContent = fs.readFileSync(questionPoolPath, 'utf8');

// Parse ALL_TOOLS
const toolsMatch = toolsFileContent.match(/export const ALL_TOOLS: AITool\[\] = (\[[\s\S]*\]);/);
if (!toolsMatch) {
  console.error("Failed to parse ALL_TOOLS from toolsData.ts!");
  process.exit(1);
}

const allTools = JSON.parse(toolsMatch[1]);
console.log(`Total records found in toolsData.ts: ${allTools.length}`);

// Audit Metrics
const names = new Set();
const slugs = new Set();
const urls = new Set();

const duplicateNames = [];
const duplicateSlugs = [];
const duplicateUrls = [];

const fakeSuffixPattern = /(Pro Max|Studio|Workspace|Cloud|API|Enterprise|Desktop|Mobile|Connect|Flow|Hub|Engine|Suite|Lab|Assistant|Copilot|Agent|Go|Lite|Plus|Core|Infinity|X)$/i;

const fakeNameTools = [];
const invalidUrls = [];
const missingContent = [];

allTools.forEach(tool => {
  // Check duplicate names
  if (names.has(tool.name.toLowerCase())) {
    duplicateNames.push(tool.name);
  } else {
    names.add(tool.name.toLowerCase());
  }

  // Check duplicate slugs
  if (slugs.has(tool.slug.toLowerCase())) {
    duplicateSlugs.push(tool.slug);
  } else {
    slugs.add(tool.slug.toLowerCase());
  }

  // Check duplicate URLs
  if (urls.has(tool.officialUrl.toLowerCase())) {
    duplicateUrls.push(tool.officialUrl);
  } else {
    urls.add(tool.officialUrl.toLowerCase());
  }

  // Check fake-looking suffix additions
  if (fakeSuffixPattern.test(tool.name)) {
    fakeNameTools.push(tool.name);
  }

  // Check URLs
  if (!tool.officialUrl || !tool.officialUrl.startsWith('http')) {
    invalidUrls.push({ name: tool.name, url: tool.officialUrl });
  }

  // Check missing content
  if (!tool.shortDescription || !tool.fullDescription || !tool.superpower || !tool.whyLearn || !tool.steps || !tool.practicalExercise) {
    missingContent.push(tool.name);
  }
});

console.log("\n--- AUDIT RESULTS ---");
console.log(`Unique Tool Names: ${names.size}`);
console.log(`Unique Slugs: ${slugs.size}`);
console.log(`Duplicate Names: ${duplicateNames.length}`);
console.log(`Duplicate Slugs: ${duplicateSlugs.length}`);
console.log(`Duplicate URLs: ${duplicateUrls.length}`);
console.log(`Fake Suffix Artificially Appended Tools: ${fakeNameTools.length}`);
console.log(`Invalid / Missing URLs: ${invalidUrls.length}`);
console.log(`Missing Learning Content Records: ${missingContent.length}`);

// Sample fake tools
if (fakeNameTools.length > 0) {
  console.log("\nSample Artificially Generated Suffix Tools:");
  console.log(fakeNameTools.slice(0, 15));
}
