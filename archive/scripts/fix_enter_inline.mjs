import fs from 'fs';
const path = 'src/components/CustomerManagementModal.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
  /onBlur={handleKanaBlur} onKeyDown={handleKanaKeyDown}/,
  "onBlur={handleKanaBlur} onKeyDown={e => { if(e.key === 'Enter' && !e.nativeEvent.isComposing){ e.preventDefault(); e.currentTarget.blur(); } }}"
);

fs.writeFileSync(path, content);
