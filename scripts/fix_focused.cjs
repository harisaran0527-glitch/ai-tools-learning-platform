const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/data/catalog/categories/focused_tools.ts');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\n,\n/g, '\n');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed focused_tools.ts');
