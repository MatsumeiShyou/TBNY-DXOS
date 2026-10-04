const fs = require('fs');
let c = fs.readFileSync('src/components/CustomerManagementModal.tsx', 'utf8');

c = c.replace(
  /const \[searchTerm, setSearchTerm\] = useState\(''\);/,
  "const [searchTerm, setSearchTerm] = useState('');\n  const [showDeleted, setShowDeleted] = useState(false);"
);

c = c.replace(
  /const filteredCustomers = customers\s*\.filter\(c => \{/,
  `const filteredCustomers = customers\n    .filter(c => (showDeleted ? c.isDeleted : !c.isDeleted))\n    .filter(c => {`
);

c = c.replace(
  /<div className="flex gap-2">/,
  `<label className="flex items-center gap-1 text-xs text-gray-600 mr-2 cursor-pointer hover:text-gray-900">\n              <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />\n              削除済を表示\n            </label>\n            <div className="flex gap-2">`
);

c = c.replace(
  /<button\s*onClick=\{\(\) => handleDeleteClick\(c\.id\)\}\s*className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"\s*title="削除"\s*>\s*<Trash2 size=\{16\} \/>\s*<\/button>/g,
  `{c.isDeleted ? (
                      <button 
                        onClick={() => {
                          if (window.confirm('この顧客を復元しますか？')) {
                            onSave({ ...c, isDeleted: false });
                          }
                        }}
                        className="p-1 text-orange-500 hover:text-orange-700 rounded hover:bg-orange-50 font-bold text-xs"
                        title="復元"
                      >
                        復元
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDeleteClick(c.id)} 
                        className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50" 
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}`
);

fs.writeFileSync('src/components/CustomerManagementModal.tsx', c);
console.log('patched CustomerModal');
