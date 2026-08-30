import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerScheduleGridModal.tsx', 'utf8');

code = code.replace(
  /<\/table>\s*\)\}\s*\{activeTab === 'basic'/g,
  `</table>\n              )}\n              {activeTab === 'basic'`
);

fs.writeFileSync('src/components/CustomerScheduleGridModal.tsx', code, 'utf8');
