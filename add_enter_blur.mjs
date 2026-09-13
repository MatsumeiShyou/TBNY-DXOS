import fs from 'fs';

const path = 'src/components/CustomerManagementModal.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
  /const handleKanaBlur = \\(e: React.FocusEvent<HTMLInputElement>\\) => {/,
  "const handleKanaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {\\n    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {\\n      e.preventDefault();\\n      e.currentTarget.blur();\\n    }\\n  };\\n\\n  const handleKanaBlur = (e: React.FocusEvent<HTMLInputElement>) => {"
);

content = content.replace(
  /<input type="text" name="kana" value={formData.kana} onChange={handleChange} onBlur={handleKanaBlur}/,
  "<input type=\"text\" name=\"kana\" value={formData.kana} onChange={handleChange} onBlur={handleKanaBlur} onKeyDown={handleKanaKeyDown}"
);

fs.writeFileSync(path, content);
