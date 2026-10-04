const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerManagementModal.tsx', 'utf8');

// 末尾の </div> の数を2つ減らす
const lines = code.split('\\n');
while(lines[lines.length - 1].trim() === '') {
  lines.pop();
}

// 最後のほうの } ); の前にある </div> を消す
let foundDivs = 0;
for(let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('</div>')) {
    lines.splice(i, 1);
    foundDivs++;
    if (foundDivs === 2) break;
  }
}

fs.writeFileSync('src/components/CustomerManagementModal.tsx', lines.join('\\n'), 'utf8');
