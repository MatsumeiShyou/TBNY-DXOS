import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerManagementModal.tsx', 'utf8');

// 1. ルート要素の置換
code = code.replace(
  /<>\s*<div className="fixed inset-0 bg-black\/40 z-40 animate-in fade-in duration-300" onClick=\{onClose\}><\/div>\s*<div className="@container fixed top-0 right-0 h-screen w-full max-w-5xl bg-white shadow-2xl z-50 flex flex-col @4xl:flex-row overflow-hidden animate-in slide-in-from-right duration-300 border-l border-gray-200">/,
  '<div className="flex flex-row w-full h-screen bg-white overflow-hidden">'
);

// 末尾のフラグメント閉じタグを div に変更
const lastIndex = code.lastIndexOf('</>');
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + '</div>' + code.substring(lastIndex + 3);
}

// 2. 左カラム幅の変更
code = code.replace(
  'className="w-full @4xl:w-[280px] shrink-0 border-b @4xl:border-b-0 @4xl:border-r border-gray-200 bg-gray-50 flex flex-col h-[40vh] @4xl:h-full"',
  'className="w-[320px] shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full shadow-[2px_0_8px_-3px_rgba(0,0,0,0.1)] z-10"'
);

// 3. 戻るボタンの追加
code = code.replace(
  /<div className="px-4 py-3\.5 border-b border-gray-200 bg-gray-100">\s*<h2 className="font-bold text-gray-800 flex items-center gap-2"><Building size=\{16\} className="text-emerald-600" \/> 顧客マスタ<\/h2>\s*<\/div>/,
  `<div className="px-4 py-3.5 border-b border-gray-200 bg-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><Building size={16} className="text-emerald-600" /> 顧客マスタ</h2>
              <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-900 text-[11px] font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-gray-300 shadow-sm transition-colors">
                ← 戻る
              </button>
            </div>`
);

// 4. フォーム内コンテンツの中央寄せ・幅最適化
code = code.replace(
  'className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3"',
  'className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 bg-gray-50/50"'
);

code = code.replace(
  'className="flex-1 flex flex-col h-[60vh] @4xl:h-full bg-white relative"',
  'className="flex-1 flex flex-col h-full bg-white relative"'
);

code = code.replace(
  '<div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">',
  '<div className="flex-1 overflow-y-auto bg-gray-50/30">\n                <div className="max-w-4xl mx-auto w-full p-4 md:p-8">'
);

// フッター前に </div> を追加（正規表現で正確に Footer Actions コメントを狙う）
code = code.replace(
  /\{\/\*\s*Footer Actions\s*\*\/\}/,
  '</div>\n              {/* Footer Actions */}'
);

// フッターを max-w-4xl で包む
code = code.replace(
  '<div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">',
  '<div className="p-4 border-t border-gray-200 bg-gray-50">\n                <div className="max-w-4xl mx-auto w-full flex justify-between items-center">'
);

// form 閉じタグの手前でフッターの div を閉じる
// 以下の正規表現は、</form> の前にある </div> にマッチさせる
code = code.replace(
  /<\/div>\s*<\/form>/,
  '</div>\n              </div>\n            </form>'
);

fs.writeFileSync('src/components/CustomerManagementModal.tsx', code, 'utf8');
console.log('CustomerManagementModal.tsx updated');
