// scripts/recover_legacy_catalog.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const COMMIT = '7008d1a';
const CATEGORY_DIR = 'src/data/catalog/categories';
const OUTPUT_FILE = path.resolve('temp/legacy_tools_raw.json');

function getCategoryFiles(): string[] {
  const ls = execSync(`git ls-tree -r --name-only ${COMMIT} ${CATEGORY_DIR}`, { encoding: 'utf-8' });
  return ls.split('\n').filter(Boolean);
}

function extractToolsFromFile(filePath: string): any[] {
  const content = execSync(`git show ${COMMIT}:${filePath}`, { encoding: 'utf-8' });
  // The files export a constant array, e.g., export const audioVoiceTools: AITool[] = [ ... ];
  const arrayMatch = content.match(/=\s*\[(.|\s)*?\];/s);
  if (!arrayMatch) return [];
  const jsonArrayStr = arrayMatch[0].replace(/^=\s*/, '').replace(/;\s*$/, '');
  // Replace single quotes with double quotes and remove trailing commas if any for JSON parsing.
  const fixed = jsonArrayStr
    .replace(/\'([^\']*)\'/g, '"$1"')
    .replace(/,\s*]/, ']');
  try {
    return JSON.parse(fixed);
  } catch (e) {
    console.error('Failed to parse tools from', filePath, e);
    return [];
  }
}

function main() {
  const files = getCategoryFiles();
  const allTools: any[] = [];
  for (const file of files) {
    const tools = extractToolsFromFile(file);
    allTools.push(...tools);
  }
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allTools, null, 2), 'utf-8');
  console.log(`Recovered ${allTools.length} tools to ${OUTPUT_FILE}`);
}

main();
