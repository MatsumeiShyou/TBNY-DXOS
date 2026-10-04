import fs from 'fs';
const path = 'src/components/CustomerManagementModal.tsx';
let content = fs.readFileSync(path, 'utf-8');

// 1. Remove compositionBuffer and related functions
content = content.replace(
  /\\s*\\/\\/ フリガナ自動入力用のIMEバッファと制御\\s*const compositionBuffer = useRef<string>\\(''\\);[\\s\\S]*?compositionBuffer\\.current = '';\\n    }\\n  };/g,
  ""
);

// 2. Remove IGNORE_KANA_LIST if it wasn't caught
content = content.replace(
  /\\s*const IGNORE_KANA_LIST = \\['かぶ'.*?\\];/g,
  ""
);

// 3. Remove onCompositionUpdate and onCompositionEnd from the input tag
content = content.replace(
  /onCompositionUpdate=\\{handleCompositionUpdate\\}/g,
  ""
);
content = content.replace(
  /onCompositionEnd=\\{handleCompositionEnd\\}/g,
  ""
);

fs.writeFileSync(path, content);
