const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// The corrupted string looks like: '拁EE, vehicle: driver?.currentVehicle || '車両' 
// Let's replace '拁E...E, (or whatever it is) with '未定',
code = code.replace(/'拁E[^,]+, vehicle/g, "'未定', vehicle");

fs.writeFileSync('src/App.jsx', code);
