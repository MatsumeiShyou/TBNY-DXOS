const fs = require('fs');

// SpotRegistrationModal
let spot = fs.readFileSync('src/components/SpotRegistrationModal.tsx', 'utf8');
spot = spot.replace(
  /const filteredCustomers = masterCustomers\.filter\(c => \{/,
  "const filteredCustomers = masterCustomers.filter(c => !c.isDeleted).filter(c => {"
);
fs.writeFileSync('src/components/SpotRegistrationModal.tsx', spot);
console.log('Spot patched');

// CustomerScheduleGridModal
let grid = fs.readFileSync('src/components/CustomerScheduleGridModal.tsx', 'utf8');
grid = grid.replace(
  /const filteredCustomers = customers\s*\.filter\(c => \{/,
  "const filteredCustomers = customers\n      .filter(c => !c.isDeleted)\n      .filter(c => {"
);
fs.writeFileSync('src/components/CustomerScheduleGridModal.tsx', grid);
console.log('Grid patched');
