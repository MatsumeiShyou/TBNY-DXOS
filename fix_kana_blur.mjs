import fs from 'fs';

let path = 'src/components/ItemManagementModal.tsx';
let content = fs.readFileSync(path, 'utf-8');
content = content.replace(
  /onChange={e => setAddForm\\({...addForm, kana: toHalfWidthKatakana\\(e.target.value\\)}\\)}/,
  "onChange={e => setAddForm({...addForm, kana: e.target.value})} onBlur={e => setAddForm({...addForm, kana: toHalfWidthKatakana(e.target.value)})}"
);
content = content.replace(
  /onChange={e => setEditForm\\({...editForm, kana: toHalfWidthKatakana\\(e.target.value\\)}\\)}/,
  "onChange={e => setEditForm({...editForm, kana: e.target.value})} onBlur={e => setEditForm({...editForm, kana: toHalfWidthKatakana(e.target.value)})}"
);
fs.writeFileSync(path, content);

path = 'src/components/WorkerManagementModal.tsx';
content = fs.readFileSync(path, 'utf-8');
content = content.replace(
  /onChange={\\(e\\) => setFormKana\\(toHalfWidthKatakana\\(e.target.value\\)\\)}/,
  "onChange={(e) => setFormKana(e.target.value)} onBlur={(e) => setFormKana(toHalfWidthKatakana(e.target.value))}"
);
fs.writeFileSync(path, content);

