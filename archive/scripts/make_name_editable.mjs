import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerScheduleGridModal.tsx', 'utf8');

const target = `{customer.name}`;
const replacement = `<input 
                          type="text" 
                          className="w-full border border-transparent hover:border-gray-300 focus:border-emerald-500 rounded px-1 py-1 text-sm font-bold text-gray-800 outline-none bg-transparent"
                          value={customer.name}
                          onChange={e => setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, name: e.target.value} : c))}
                        />`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/CustomerScheduleGridModal.tsx', code, 'utf8');
