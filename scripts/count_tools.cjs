const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/data/catalog/categories');
const files = fs.readdirSync(dir);
let total = 0;

files.forEach(f => {
  if (f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.json')) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const matches = content.match(/"id":/g);
    const count = matches ? matches.length : 0;
    console.log(`${f}: ${count} tools`);
    total += count;
  }
});

console.log('--- TOTAL TOOLS IN CATEGORIES ---:', total);
