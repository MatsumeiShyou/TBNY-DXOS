import fs from 'fs';
const path = 'src/components/CustomerManagementModal.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
  /const handleChange = \\(e: React.ChangeEvent<HTMLInputElement \\| HTMLSelectElement \\| HTMLTextAreaElement>\\) => {/,
  "const handleKanaBlur = (e: React.FocusEvent<HTMLInputElement>) => {\\n    setFormData(prev => ({\\n      ...prev,\\n      kana: toHalfWidthKatakana(e.target.value)\\n    }));\\n  };\\n\\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {"
);

content = content.replace(
  /<input type="text" name="kana" value={formData.kana} onChange={handleChange}/,
  "<input type=\"text\" name=\"kana\" value={formData.kana} onChange={handleChange} onBlur={handleKanaBlur}"
);

fs.writeFileSync(path, content);
