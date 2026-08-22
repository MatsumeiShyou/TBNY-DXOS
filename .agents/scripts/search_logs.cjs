const fs = require('fs');
const path = require('path');

const brainPath = 'C:\\Users\\shiyo\\.gemini\\antigravity\\brain';
const keyword = 'テンプレート';

function searchDirectory(dir) {
  let results = [];
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(searchDirectory(fullPath));
      } else if (stat.isFile() && fullPath.endsWith('.jsonl')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes(keyword) && line.includes('"type":"USER_INPUT"')) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.content && parsed.content.includes(keyword)) {
                  results.push({
                    file: fullPath,
                    line: index + 1,
                    content: parsed.content.substring(0, 300).replace(/\n/g, ' ')
                  });
                }
              } catch(e) {}
            }
          });
        } catch (e) {}
      }
    }
  } catch (e) {
    console.error(`Error reading ${dir}:`, e);
  }
  return results;
}

const hits = searchDirectory(brainPath);
if (hits.length > 0) {
  // 重複を排除しつつ、見やすい形式で保存
  const output = hits.map(h => `${h.file}:${h.line}\n  ${h.content}\n`).join('---\n');
  fs.writeFileSync('template_search_results.txt', output, 'utf8');
  console.log(`Found ${hits.length} occurrences. Saved to template_search_results.txt`);
} else {
  console.log('No occurrences found in logs.');
}
