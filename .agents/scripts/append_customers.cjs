const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../../仕入日報問合せ-UTF-8.csv');
const CONSTANTS_PATH = path.join(__dirname, '../../src/data/constants.js');

console.log('Reading constants.js...');
const constantsCode = fs.readFileSync(CONSTANTS_PATH, 'utf8');

// 既存の顧客名を抽出 (正規表現で "name": "..." を探す)
const existingNames = new Set();
const nameRegex = /"name":\s*"([^"]+)"/g;
let match;
while ((match = nameRegex.exec(constantsCode)) !== null) {
  existingNames.add(match[1]);
}
console.log(`Found ${existingNames.size} existing customer names in constants.js`);

console.log('Reading CSV...');
const csvString = fs.readFileSync(CSV_PATH, 'utf8');

const lines = csvString.split('\n').filter(l => l.trim().length > 0);
const records = lines.map(line => line.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));

const header = records[0];
const idxCode = header.findIndex(h => h.includes('仕入先コード'));
const idxName = header.findIndex(h => h.includes('仕入先名'));
const idxItem = header.findIndex(h => h.includes('商品コード'));
const idxVehicle = header.findIndex(h => h.includes('車番'));
const idxCarrier = header.findIndex(h => h.includes('運送店名'));
const idxPayCode = header.findIndex(h => h.includes('支払先コード'));
const idxPayName = header.findIndex(h => h.includes('支払先名'));

const CODE_COL = idxCode >= 0 ? idxCode : 4;
const NAME_COL = idxName >= 0 ? idxName : 5;
const ITEM_COL = idxItem >= 0 ? idxItem : 8;
const VEHICLE_COL = idxVehicle >= 0 ? idxVehicle : 3;
const CARRIER_COL = idxCarrier >= 0 ? idxCarrier : 11;
const PAYCODE_COL = idxPayCode >= 0 ? idxPayCode : 6;
const PAYNAME_COL = idxPayName >= 0 ? idxPayName : 7;

const VALID_VEHICLES = ['2267', '5122', '2025', '2618', '6902'];

const csvCustomers = {};
for (let i = 1; i < records.length; i++) {
  const row = records[i];
  
  if (row.includes('持込')) {
    continue;
  }
  
  const carrier = row[CARRIER_COL] || '';
  const vehicle = row[VEHICLE_COL] || '';
  
  if (carrier.trim().length > 0) {
    continue;
  }
  
  const isOwnVehicle = VALID_VEHICLES.some(v => vehicle.includes(v));
  if (!isOwnVehicle) {
    continue;
  }

  const code = row[CODE_COL];
  const name = row[NAME_COL];
  const item = row[ITEM_COL];
  const payCode = row[PAYCODE_COL] || '';
  const payName = row[PAYNAME_COL] || '';

  if (!code || !name) continue;

  // 今回の要件：仕入先名で重複排除
  if (existingNames.has(name)) continue;

  // 重複排除された新規顧客のみ登録
  if (!csvCustomers[name]) {
    csvCustomers[name] = {
      id: `c_${code}`,
      supplierCode: code,
      supplierName: name,
      payeeCode: payCode,
      payeeName: payName,
      name: name,
      kana: '',
      area: '',
      address: '',
      jobType: 'regular',
      scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      holidayCollection: false,
      defaultDuration: 30,
      requiredVehicle: '',
      items: [],
      note: '[CSV新規補充] ',
      isInvalid: false
    };
  }
  if (item && !csvCustomers[name].items.includes(item)) {
    csvCustomers[name].items.push(item);
  }
}

const newCustomers = Object.values(csvCustomers);
console.log(`Extracted ${newCustomers.length} NEW unique customers from CSV (after deduplication by name).`);

if (newCustomers.length > 0) {
  // constants.js に書き込む
  const targetStr = 'export const INITIAL_DRIVERS';
  const targetIndex = constantsCode.indexOf(targetStr);
  
  if (targetIndex !== -1) {
    // targetIndex から手前に戻って最初の ]; を見つける
    const precedingCode = constantsCode.slice(0, targetIndex);
    const insertIndex = precedingCode.lastIndexOf('];');
    
    if (insertIndex !== -1) {
      let newCustomersJson = '';
      newCustomers.forEach(customer => {
        newCustomersJson += ',\n  ' + JSON.stringify(customer, null, 2).replace(/\n/g, '\n  ');
      });
      
      const newCode = constantsCode.slice(0, insertIndex) + newCustomersJson + '\n' + constantsCode.slice(insertIndex);
      fs.writeFileSync(CONSTANTS_PATH, newCode, 'utf8');
      console.log('constants.js successfully updated.');
    } else {
      console.error('Could not find "];" before INITIAL_DRIVERS.');
    }
  } else {
    console.error('Could not find export const INITIAL_DRIVERS in constants.js.');
  }
} else {
  console.log('No new customers to append.');
}
