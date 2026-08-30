import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/onDelete=\{handleDeleteCustomer\}\n\s*/g, '');
fs.writeFileSync('src/App.tsx', code, 'utf8');
