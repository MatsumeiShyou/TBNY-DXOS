import fs from 'fs';

// 1. CustomerManagementModal.tsx
let f1 = 'src/components/CustomerManagementModal.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
// handleChangeの中にフリガナ強制を入れる
const target1 = `const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // バリデーションクリア
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }`;
const replace1 = `const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    let { value } = e.target;
    
    // フリガナは強制的に半角カナに変換
    if (name === 'kana') {
      value = toHalfWidthKatakana(value);
    }
    
    // バリデーションクリア
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }`;
c1 = c1.replace(target1, replace1);
fs.writeFileSync(f1, c1, 'utf8');

// 2. CustomerScheduleGridModal.tsx
let f2 = 'src/components/CustomerScheduleGridModal.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(
  /onChange=\{e => setLocalCustomers\(prev => prev\.map\(c => c\.id === customer\.id \? \{\.\.\.c, kana: e\.target\.value\} : c\)\)\}/g,
  `onChange={e => setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, kana: toHalfWidthKatakana(e.target.value)} : c))}`
);
fs.writeFileSync(f2, c2, 'utf8');

// 3. ItemManagementModal.tsx
let f3 = 'src/components/ItemManagementModal.tsx';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(
  /onChange=\{e => setAddForm\(\{\.\.\.addForm, kana: e\.target\.value\}\)\}/g,
  `onChange={e => setAddForm({...addForm, kana: toHalfWidthKatakana(e.target.value)})}`
);
c3 = c3.replace(
  /onChange=\{e => setEditForm\(\{\.\.\.editForm, kana: e\.target\.value\}\)\}/g,
  `onChange={e => setEditForm({...editForm, kana: toHalfWidthKatakana(e.target.value)})}`
);
fs.writeFileSync(f3, c3, 'utf8');

// 4. WorkerManagementModal.tsx
let f4 = 'src/components/WorkerManagementModal.tsx';
let c4 = fs.readFileSync(f4, 'utf8');
c4 = c4.replace(
  /onChange=\{\(e\) => setFormKana\(e\.target\.value\)\}/g,
  `onChange={(e) => setFormKana(toHalfWidthKatakana(e.target.value))}`
);
fs.writeFileSync(f4, c4, 'utf8');

