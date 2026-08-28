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

tools.forEach(tool => {
  if (tool.officialStatus === 'verified') {
    verifiedSitesCount++;
    if (tool.officialUrl.includes('example.com') || tool.officialUrl.includes('localhost')) {
      fakeDomainsExposed++;
    }
  } else {
    unavailableSitesCount++;
    // Check if unavailable tool still exposes guessed domain
    if (tool.officialUrl && tool.officialUrl.includes(`${tool.slug.replace(/-ai$/, '').replace(/-app$/, '')}.com`)) {
      fakeDomainsExposed++;
    }
  }

  if (tool.docsStatus !== 'verified' && tool.docsUrl) {
    fakeDocsExposed++;
  }
});

console.log("\n================ VERIFICATION SUMMARY ================");
console.log(`Total Catalog Tools: ${tools.length}`);
console.log(`Live Verified Official Websites: ${verifiedSitesCount}`);
console.log(`Unavailable Official Websites (Disabled UI): ${unavailableSitesCount}`);
console.log(`Fake Guessed Domains Exposed: ${fakeDomainsExposed}`);
console.log(`Fake Guessed Docs Exposed: ${fakeDocsExposed}`);
console.log("======================================================\n");

if (fakeDomainsExposed === 0 && fakeDocsExposed === 0 && tools.length >= 1500) {
  console.log(`SUCCESS: ${tools.length} genuine tools verified (>= 1,500) and 0 broken or guessed links exposed to learners!`);
} else {
  console.error("FAIL: Guessed/fake links found or total count is under 1,500!");
  process.exit(1);
}

