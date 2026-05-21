import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 対象ディレクトリ
const targetDir = path.join(__dirname, '..', 'src', 'features', 'weighing-self-driver');

// 置換除外ブラックリスト (型やキー名などとしてJS式で比較される可能性のある単語)
const EXCLUDE_WORDS = new Set([
  'grouped', 'list', 'weighing', 'history', 'settings', 'default', 
  'secondary', 'danger', 'info', 'success', 'warning', 'primary',
  'dark', 'light', 'large', 'medium', 'small', 'custom', 'normal',
  'active', 'inactive', 'open', 'closed', 'pending', 'completed'
]);

// 置換関数: トークン単体に tw- を付与する
function addPrefixToToken(token) {
  if (!token || token.trim() === '') return token;
  
  // 既にプレフィックスがついている場合
  if (token.startsWith('tw-') || token.includes(':tw-')) return token;
  
  // 動的変数やJS式の一部っぽいものは除外
  if (/[${}?':"()[\]]/.test(token)) return token;

  // ブラックリストに含まれる単語はそのまま (型比較用文字列)
  if (EXCLUDE_WORDS.has(token)) return token;

  // 修飾子 (例: hover:, dark:, sm:) の解析
  const colonIndex = token.lastIndexOf(':');
  if (colonIndex !== -1) {
    const modifiers = token.substring(0, colonIndex + 1);
    const body = token.substring(colonIndex + 1);
    
    if (!body || body.startsWith('tw-') || EXCLUDE_WORDS.has(body)) return token;
    return modifiers + 'tw-' + body;
  }

  return 'tw-' + token;
}

// クラス名文字列全体を置換する関数
function processClassNameString(classStr) {
  // もし全体がブラックリストに登録されている単語単体なら置換しない
  if (EXCLUDE_WORDS.has(classStr.trim())) {
    return classStr;
  }
  return classStr
    .split(/(\s+)/)
    .map(part => {
      if (/^\s+$/.test(part)) return part;
      return addPrefixToToken(part);
    })
    .join('');
}

// ファイル単位の置換処理
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // 1. className="..." の置換
  content = content.replace(/className="([^"]*)"/g, (match, classStr) => {
    const processed = processClassNameString(classStr);
    return `className="${processed}"`;
  });

  // 2. className='...' の置換
  content = content.replace(/className='([^']*)'/g, (match, classStr) => {
    const processed = processClassNameString(classStr);
    return `className='${processed}'`;
  });

  // 3. 末尾が Classes で終わる変数定義 (例: commonButtonClasses = "...") の置換
  content = content.replace(/([a-zA-Z0-9_]+Classes\s*=\s*)(["'])([^"'\n]+)(["'])/g, (match, prefix, quote, classStr, quoteEnd) => {
    const processed = processClassNameString(classStr);
    return `${prefix}${quote}${processed}${quoteEnd}`;
  });

  // 4. テンプレートリテラル className={`...`} 内のプレーンテキストおよび三項演算子内の文字列リテラル置換
  content = content.replace(/className=\{\`([^`]*)\`\}/g, (match, templateStr) => {
    let result = '';
    let lastIndex = 0;
    const exprRegex = /\$\{([^}]+)\}/g;
    let exprMatch;

    while ((exprMatch = exprRegex.exec(templateStr)) !== null) {
      const textPart = templateStr.substring(lastIndex, exprMatch.index);
      result += processClassNameString(textPart);

      let expr = exprMatch[0];
      expr = expr.replace(/'([^']*)'/g, (m, str) => `'${processClassNameString(str)}'`);
      expr = expr.replace(/"([^"]*)"/g, (m, str) => `"${processClassNameString(str)}"`);
      result += expr;

      lastIndex = exprRegex.lastIndex;
    }
    const remainingText = templateStr.substring(lastIndex);
    result += processClassNameString(remainingText);

    return `className={\`${result}\`}`;
  });

  // 5. className={expression} の置換
  content = content.replace(/className=\{\s*([^{`]*)\s*\}/g, (match, expression) => {
    let processedExpr = expression;
    processedExpr = processedExpr.replace(/'([^']*)'/g, (m, str) => `'${processClassNameString(str)}'`);
    processedExpr = processedExpr.replace(/"([^"]*)"/g, (m, str) => `"${processClassNameString(str)}"`);
    return `className={${processedExpr}}`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[Processed] ${path.basename(filePath)}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

console.log('Starting improved prefix injection...');
scanDir(targetDir);
console.log('Improved prefix injection finished!');
