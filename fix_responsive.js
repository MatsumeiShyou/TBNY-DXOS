const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerManagementModal.tsx', 'utf8');

// 1. 親コンテナのクラス置換
code = code.replace(
  'className=\"@container fixed top-0 right-0 h-screen w-full max-w-5xl bg-white shadow-2xl z-50 flex flex-col @4xl:flex-row overflow-hidden animate-in slide-in-from-right duration-300 border-l border-gray-200\"',
  'className=\"fixed top-0 right-0 h-screen w-full max-w-5xl bg-white shadow-2xl z-50 flex flex-row overflow-hidden animate-in slide-in-from-right duration-300 border-l border-gray-200\"'
);

// 2. 左カラムのクラス置換
code = code.replace(
  'className=\"w-full @4xl:w-[280px] shrink-0 border-b @4xl:border-b-0 @4xl:border-r border-gray-200 bg-gray-50 flex flex-col h-[40vh] @4xl:h-full\"',
  'className=\"w-[280px] shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full\"'
);

// 3. 右カラムのクラス置換
code = code.replace(
  'className=\"flex-1 flex flex-col h-[60vh] @4xl:h-full bg-white relative\"',
  'className=\"flex-1 flex flex-col h-full bg-white relative\"'
);

fs.writeFileSync('src/components/CustomerManagementModal.tsx', code, 'utf8');
