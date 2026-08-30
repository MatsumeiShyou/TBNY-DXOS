import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<CustomerScheduleGridModal\s+customers=\{masterCustomers\}/,
  `<CustomerScheduleGridModal\n          customers={masterCustomers}\n          masterVehicles={masterVehicles}`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
