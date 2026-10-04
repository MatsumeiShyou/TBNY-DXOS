import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/components/CustomerManagementModal.tsx',
  'src/components/CustomerScheduleGridModal.tsx',
  'src/components/ItemManagementModal.tsx',
  'src/components/SpotRegistrationModal.tsx',
  'src/components/WorkerManagementModal.tsx'
];

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // import { toHalfWidthKatakana } from '../utils/textUtils'; を追加する
  if (!code.includes('toHalfWidthKatakana')) {
    // import文の最後の行を探して挿入する
    const importRegex = /import\s+.*?;/g;
    let match;
    let lastImportIndex = 0;
    while ((match = importRegex.exec(code)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    code = code.substring(0, lastImportIndex) + "\nimport { toHalfWidthKatakana } from '../utils/textUtils';" + code.substring(lastImportIndex);
    changed = true;
  }
  
  fs.writeFileSync(file, code, 'utf8');
});
