import fs from 'fs';
const path = 'src/components/ItemManagementModal.tsx';
let content = fs.readFileSync(path, 'utf-8');

const keyDownStr = " onKeyDown={e => { if(e.key==='Enter' && !e.nativeEvent.isComposing){ e.preventDefault(); e.currentTarget.blur(); } }}";

content = content.replace(
  /onChange={e => setAddForm\\({...addForm, kana: e.target.value}\\)} onBlur={e => setAddForm\\({...addForm, kana: toHalfWidthKatakana\\(e.target.value\\)}\\)}/,
  "onChange={e => setAddForm({...addForm, kana: e.target.value})} onBlur={e => setAddForm({...addForm, kana: toHalfWidthKatakana(e.target.value)})} onKeyDown={e => { if(e.key==='Enter' && !e.nativeEvent.isComposing){ e.preventDefault(); e.currentTarget.blur(); } }}"
);

content = content.replace(
  /onChange={e => setEditForm\\({...editForm, kana: e.target.value}\\)} onBlur={e => setEditForm\\({...editForm, kana: toHalfWidthKatakana\\(e.target.value\\)}\\)}/,
  "onChange={e => setEditForm({...editForm, kana: e.target.value})} onBlur={e => setEditForm({...editForm, kana: toHalfWidthKatakana(e.target.value)})} onKeyDown={e => { if(e.key==='Enter' && !e.nativeEvent.isComposing){ e.preventDefault(); e.currentTarget.blur(); } }}"
);

fs.writeFileSync(path, content);

const path2 = 'src/components/WorkerManagementModal.tsx';
let content2 = fs.readFileSync(path2, 'utf-8');

content2 = content2.replace(
  /onChange={\\(e\\) => setFormKana\\(e.target.value\\)} onBlur={\\(e\\) => setFormKana\\(toHalfWidthKatakana\\(e.target.value\\)\\)}/,
  "onChange={(e) => setFormKana(e.target.value)} onBlur={(e) => setFormKana(toHalfWidthKatakana(e.target.value))} onKeyDown={e => { if(e.key==='Enter' && !e.nativeEvent.isComposing){ e.preventDefault(); e.currentTarget.blur(); } }}"
);

fs.writeFileSync(path2, content2);
