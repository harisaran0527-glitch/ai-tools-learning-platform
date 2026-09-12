const fs = require('fs');
const path = require('path');

const cachePath = path.join(__dirname, '../src/data/catalog/url_verification_cache.json');

// Read the merged content or take ours/theirs combined
let content = fs.readFileSync(cachePath, 'utf8');

// Parse out JSON entries from conflict markers if present
const lines = content.split('\n');
const mergedObj = {};

lines.forEach(line => {
  if (line.startsWith('<<<<<<<') || line.startsWith('=======') || line.startsWith('>>>>>>>')) return;
  const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
  if (match) {
    mergedObj[match[1]] = match[2];
  }
});

fs.writeFileSync(cachePath, JSON.stringify(mergedObj, null, 2), 'utf8');
console.log(`Cleaned merged cache file (${Object.keys(mergedObj).length} entries).`);
