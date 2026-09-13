const fs = require('fs');
const path = 'src/components/VehicleManagementModal.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(/vehicles\.length/g, 'vehicles.filter(v => v.is_active !== false).length');
content = content.replace(/vehicles\.map/g, 'vehicles.filter(v => v.is_active !== false).map');

fs.writeFileSync(path, content);
