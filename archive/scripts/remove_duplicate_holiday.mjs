import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerScheduleGridModal.tsx', 'utf8');

// thを削除
code = code.replace(
  /<th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-300 w-24">祝日回収<\/th>\s*/g,
  ''
);

// tdを削除
const tdRegex = /<td className="px-2 py-1 border-r border-gray-200 text-center">\s*<input\s*type="checkbox"\s*className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"\s*checked=\{\!\!customer\.holidayCollection\}\s*onChange=\{e => setLocalCustomers\(prev => prev\.map\(c => c\.id === customer\.id \? \{\.\.\.c, holidayCollection: e\.target\.checked\} : c\)\)\}\s*\/>\s*<\/td>\s*/g;
code = code.replace(tdRegex, '');

fs.writeFileSync('src/components/CustomerScheduleGridModal.tsx', code, 'utf8');
