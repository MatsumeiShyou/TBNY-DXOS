import fs from 'fs';
let f1 = 'src/components/CustomerManagementModal.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

const target1 = `    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'defaultDuration' ? (parseInt(value, 10) || 0) : value)
    }));`;

const replace1 = `    const target = e.target as HTMLInputElement;
    const { name, type, checked } = target;
    let { value } = target;
    
    // フリガナは半角カナに強制変換
    if (name === 'kana') {
      value = toHalfWidthKatakana(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'defaultDuration' ? (parseInt(value, 10) || 0) : value)
    }));`;

c1 = c1.replace(target1, replace1);
fs.writeFileSync(f1, c1, 'utf8');
