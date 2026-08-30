const fs = require('fs');
const code = fs.readFileSync('src/components/CustomerManagementModal.tsx', 'utf8');

// タグの深さを簡易的にカウントして異常を見つける
let depth = 0;
const lines = code.split('\\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openTags = (line.match(/<[a-zA-Z]+/g) || []).length;
  const closeTags = (line.match(/<\/[a-zA-Z]+/g) || []).length;
  const selfClose = (line.match(/<[a-zA-Z]+[^>]*\/>/g) || []).length;
  
  // 厳密なパーサーではないが目安になる
  if (i > 290) {
    // console.log(\Line \: \ (+\)\);
  }
}
