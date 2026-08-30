const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerManagementModal.tsx', 'utf8');
code = code.replace(
  /<\/button>\s*\}\)\}\s*<\/div>\s*<\/div>\s*<div className="flex-1 overflow-y-auto">/,
  </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCreateNew}
                className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-1.5 px-2 rounded-md text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={15} /> 新規顧客
              </button>
              {onOpenGridMode && (
                <button
                  onClick={onOpenGridMode}
                  className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold py-1.5 px-1 rounded-md text-[10px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Grid size={13} /> 一括設定
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
);
fs.writeFileSync('src/components/CustomerManagementModal.tsx', code);
