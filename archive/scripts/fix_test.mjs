import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerScheduleGridModal.test.tsx', 'utf8');
code = code.replace(/expect\(screen\.getByText\('月曜'\)\)\.toBeInTheDocument\(\);/, "expect(screen.getByText('月')).toBeInTheDocument();");
fs.writeFileSync('src/components/CustomerScheduleGridModal.test.tsx', code, 'utf8');
