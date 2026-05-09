const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/shiyo/開発中APP/TBNY DXOS/src/features/repaper-route/driver/sandbox';
const tailwindKeywords = [
  'flex', 'grid', 'block', 'inline', 'hidden', 'relative', 'absolute', 'fixed', 'sticky',
  'p-', 'm-', 'bg-', 'text-', 'items-', 'justify-', 'w-', 'h-', 'rounded', 'shadow',
  'space-', 'border-', 'opacity-', 'animate-', 'transition-', 'active:', 'hover:', 'focus:', 'group-hover:'
];

// 正確な判定ロジック: className="..." の中にある単語を抽出し、tw- で始まらない Tailwind キーワードを特定する
function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let violations = [];
  
  // 1. className="..." を抽出 (テンプレートリテラル含む)
  const classNameRegex = /className=["'`]([\s\S]*?)["'`]/g;
  let classMatch;
  
  while ((classMatch = classNameRegex.exec(content)) !== null) {
    const classString = classMatch[1];
    // 文字列内の単語に分割
    const words = classString.split(/[\s${}:"'`()\[\]]/).filter(w => w.length > 0);
    
    words.forEach(word => {
      // tw- で始まらない単語をチェック
      if (!word.startsWith('tw-')) {
        // Tailwind のキーワードが含まれているか判定
        const isTailwind = tailwindKeywords.some(k => {
          if (k.endsWith('-') || k.endsWith(':')) {
             return word.startsWith(k) || word.includes(':' + k);
          }
          return word === k;
        });
        
        if (isTailwind) {
          const line = content.substring(0, classMatch.index).split('\n').length;
          violations.push({ line, word });
        }
      }
    });
  }
  return violations;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

console.log('[AUDIT] Starting Tailwind Prefix Physical Audit (Accurate Mode)...');
let totalViolations = 0;

walkDir(targetDir, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  if (filePath.endsWith('constants.ts')) return; // 定数ファイルは別途、後で。

  const violations = auditFile(filePath);
  
  if (violations.length > 0) {
    console.log(`\n[VIOLATION] ${filePath}`);
    violations.forEach(v => {
      console.log(`  L${v.line}: Found non-prefixed class "${v.word}"`);
      totalViolations++;
    });
  }
});

console.log('\n-------------------------------------------');
if (totalViolations === 0) {
  console.log('[SUCCESS] Physical Integrity Verified: 0 violations found.');
  process.exit(0);
} else {
  console.log(`[FAIL] Integrity Compromised: ${totalViolations} violations found.`);
  process.exit(1);
}
