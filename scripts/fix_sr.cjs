const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/catalog/categories/search_research.ts');
let lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

lines.splice(12660, 0, '  {');
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Inserted opening brace at line 12661');
