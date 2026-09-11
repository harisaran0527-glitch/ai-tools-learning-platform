const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const dir = path.join(__dirname, '../src/data/catalog/categories');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const diagnostics = sourceFile.parseDiagnostics;
  if (diagnostics && diagnostics.length > 0) {
    console.error(`❌ Diagnostics error in ${f} (${diagnostics.length} errors):`);
    diagnostics.slice(0, 5).forEach(d => {
      const pos = sourceFile.getLineAndCharacterOfPosition(d.start);
      console.error(`  Line ${pos.line + 1}, Col ${pos.character + 1}: ${d.messageText}`);
    });
  } else {
    console.log(`✓ ${f} has 0 parse errors.`);
  }
});
