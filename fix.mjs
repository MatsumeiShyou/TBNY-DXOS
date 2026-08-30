import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerManagementModal.tsx', 'utf8');
const searchStr = `                </button>\n              ))}\n            </div>\n          </div>\n          <div className="flex-1 overflow-y-auto">`;
const replaceStr = `                </button>\n              ))}\n            </div>\n\n            <div className="flex gap-2 mt-3">\n              <button\n                onClick={handleCreateNew}\n                className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-1.5 px-2 rounded-md text-sm flex items-center justify-center gap-1 transition-colors"\n              >\n                <Plus size={15} /> 新規顧客\n              </button>\n              {onOpenGridMode && (\n                <button\n                  onClick={onOpenGridMode}\n                  className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold py-1.5 px-1 rounded-md text-[10px] flex items-center justify-center gap-1 transition-colors"\n                >\n                  <Grid size={13} /> 一括設定\n                </button>\n              )}\n            </div>\n          </div>\n          <div className="flex-1 overflow-y-auto">`;
if(code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/CustomerManagementModal.tsx', code);
  console.log("Success");
} else {
  console.log("Not found, trying flexible replace");
  const flexibleSearch = /<\/button>\s*\}\)\}\s*<\/div>\s*<\/div>\s*<div className="flex-1 overflow-y-auto">/;
  if(flexibleSearch.test(code)) {
    code = code.replace(flexibleSearch, replaceStr);
    fs.writeFileSync('src/components/CustomerManagementModal.tsx', code);
    console.log("Success with regex");
  } else {
    console.log("Failed to find target");
  }
}
