import fs from 'fs';
import path from 'path';

function printUsage() {
  console.log('Usage: node strict_replace.mjs <target_file> <search_string> <replace_string>');
  console.log('Or use environment variables: TARGET_FILE, SEARCH_STR, REPLACE_STR');
}

const targetFile = process.argv[2] || process.env.TARGET_FILE;
const searchStr = process.argv[3] || process.env.SEARCH_STR;
const replaceStr = process.argv[4] || process.env.REPLACE_STR;

if (!targetFile || !searchStr || typeof replaceStr === 'undefined') {
  console.error('[Error] Missing arguments.');
  printUsage();
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), targetFile);

if (!fs.existsSync(resolvedPath)) {
  console.error(`[Error] File not found: ${resolvedPath}`);
  process.exit(1);
}

const originalContent = fs.readFileSync(resolvedPath, 'utf8');

// 文字列として置換を試みる
let newContent = originalContent.replace(searchStr, replaceStr);

if (newContent === originalContent) {
  console.error(`[Error] Replace failed: The search string was not found in the file.`);
  console.error(`Search string was:\n${searchStr}`);
  process.exit(1);
}

fs.writeFileSync(resolvedPath, newContent, 'utf8');
console.log(`[Success] Replaced content in ${targetFile}`);
