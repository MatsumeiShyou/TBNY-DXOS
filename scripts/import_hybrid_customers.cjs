const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const CSV_PATH = path.join(__dirname, '../仕入日報_UTF8.csv');
const EXCEL_PATH = path.join(__dirname, '../kannri2.xlsm');
const OUTPUT_PATH = path.join(__dirname, '../../.gemini/antigravity/brain/f0fc4d11-33d0-4465-ab52-0be669b6b34e/scratch/customers_draft.json');

// --- 1. CSVの読み込みとパース (UTF-8) ---
console.log('Reading CSV...');
const csvString = fs.readFileSync(CSV_PATH, 'utf8');

// 簡易CSVパース (改行で分割し、カンマで分割。引用符を削除)
const lines = csvString.split('\n').filter(l => l.trim().length > 0);
const records = lines.map(line => line.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));

const header = records[0];
// よくある列名のインデックスを探す (実際の列名とずれている場合は出力を見て調整)
const idxCode = header.findIndex(h => h.includes('仕入先コード') || h === '仕入先' || h === '取引先' || h.includes('コード'));
const idxName = header.findIndex(h => h.includes('仕入先名') || h === '仕入先名' || h === '取引先名' || h.includes('名'));
const idxItem = header.findIndex(h => h.includes('品目') || h.includes('商品') || h.includes('品名'));
const idxVehicle = header.findIndex(h => h.includes('車番'));
const idxCarrier = header.findIndex(h => h.includes('運送店名'));
const idxPayCode = header.findIndex(h => h.includes('支払先コード'));
const idxPayName = header.findIndex(h => h.includes('支払先名'));

console.log('CSV Header detected:', { idxCode, idxName, idxItem, idxVehicle, idxCarrier, idxPayCode, idxPayName });
// もし見つからなかったら強制的に 4, 5, 9 番目あたりと推測 (出力を見て微調整)
const CODE_COL = idxCode >= 0 ? idxCode : 4;
const NAME_COL = idxName >= 0 ? idxName : 5;
const ITEM_COL = idxItem >= 0 ? idxItem : 9;
const VEHICLE_COL = idxVehicle >= 0 ? idxVehicle : 3;
const CARRIER_COL = idxCarrier >= 0 ? idxCarrier : 11;
const PAYCODE_COL = idxPayCode >= 0 ? idxPayCode : 6;
const PAYNAME_COL = idxPayName >= 0 ? idxPayName : 7;

const VALID_VEHICLES = ['2267', '5122', '2025', '2618', '6902'];

const csvCustomers = {};
for (let i = 1; i < records.length; i++) {
  const row = records[i];
  
  // 「持込」データは回収案件ではないため除外する
  if (row.includes('持込')) {
    continue;
  }
  
  const carrier = row[CARRIER_COL] || '';
  const vehicle = row[VEHICLE_COL] || '';
  
  // 運送店にデータがあるものは他社委託なので除外
  if (carrier.trim().length > 0) {
    continue;
  }
  
  // 指定された自社車番以外の案件を除外
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

  if (!csvCustomers[code]) {
    csvCustomers[code] = {
      id: `c_${code}`,
      vendorCode: code,
      paymentCode: payCode,
      paymentName: payName,
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
      note: '',
      isInvalid: false
    };
  }
  if (item && !csvCustomers[code].items.includes(item)) {
    csvCustomers[code].items.push(item);
  }
}
console.log(`Extracted ${Object.keys(csvCustomers).length} unique customers from CSV.`);

// --- 2. Excelの読み込みとパース ---
console.log('Reading Excel (曜日別回収表)...');
const wb = xlsx.readFile(EXCEL_PATH);
const weekSheet = wb.Sheets['曜日別回収表'];
const weekData = xlsx.utils.sheet_to_json(weekSheet, { header: 1 });

const excelInfoList = [];
for (let i = 1; i < weekData.length; i++) {
  const row = weekData[i];
  const name = row[2]; // List表示 (顧客名)
  if (!name || typeof name !== 'string') continue;

  const kana = row[1]; // ﾌﾘｶﾞﾅ
  const isSpot = row[3] === true;
  const holidayCollection = row[11] === true;
  const noteText = row[14] || ''; // 備考

  const rules = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
  const dMap = [
    { idx: 4, key: 'mon', label: '月' },
    { idx: 5, key: 'tue', label: '火' },
    { idx: 6, key: 'wed', label: '水' },
    { idx: 7, key: 'thu', label: '木' },
    { idx: 8, key: 'fri', label: '金' },
    { idx: 9, key: 'sat', label: '土' },
    { idx: 10, key: 'sun', label: '日' }
  ];

  dMap.forEach(d => {
    if (row[d.idx] === true) {
      rules[d.key].push('every');
    }
  });

  // 備考欄からのパース（「第1、3水曜日」など）
  if (noteText && typeof noteText === 'string') {
    const regex = /第([12345１２３４５、・,]+)([月火水木金土日])/g;
    let match;
    while ((match = regex.exec(noteText)) !== null) {
      const numsStr = match[1];
      const dayJp = match[2];
      const dayEn = dMap.find(d => d.label === dayJp)?.key;
      if (dayEn) {
        const nums = [];
        if (numsStr.includes('1') || numsStr.includes('１')) nums.push('1');
        if (numsStr.includes('2') || numsStr.includes('２')) nums.push('2');
        if (numsStr.includes('3') || numsStr.includes('３')) nums.push('3');
        if (numsStr.includes('4') || numsStr.includes('４')) nums.push('4');
        if (numsStr.includes('5') || numsStr.includes('５')) nums.push('5');
        if (nums.length > 0) {
          rules[dayEn] = nums; // 'every' を上書き
        }
      }
    }
  }

  excelInfoList.push({
    name: name.trim(),
    kana: kana ? kana.toString().trim() : '',
    jobType: isSpot ? 'spot' : 'regular',
    holidayCollection,
    customSchedule: noteText ? noteText.toString().trim() : '',
    scheduleRules: rules
  });
}
console.log(`Extracted ${excelInfoList.length} rows from Excel.`);

// --- 3. 名寄せ (JOIN) ---
console.log('Merging data...');

// 簡単な文字の正規化 (全角半角、㈱などを無視して比較するため)
function normalizeString(str) {
  return str.replace(/[㈱（）\(\) 株式会社　]/g, '').toLowerCase();
}

const finalCustomers = Object.values(csvCustomers);

for (const cust of finalCustomers) {
  const normTarget = normalizeString(cust.name);
  
  // Excelデータの中から最も似ている（部分一致する）ものを探す
  const matched = excelInfoList.find(ex => {
    const normEx = normalizeString(ex.name);
    return normTarget.includes(normEx) || normEx.includes(normTarget);
  });

  if (matched) {
    cust.kana = matched.kana || cust.kana;
    cust.jobType = matched.jobType;
    cust.holidayCollection = matched.holidayCollection;
    cust.customSchedule = matched.customSchedule;
    cust.scheduleRules = matched.scheduleRules;
    cust.note = `[Excel連携済] ` + cust.note;
  } else {
    cust.note = `[Excel未紐付] ` + cust.note;
  }
}

// --- 4. JSON出力と constants.js の更新 ---
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalCustomers, null, 2));
console.log(`Success! Wrote ${finalCustomers.length} customers to ${OUTPUT_PATH}`);

const constantsPath = path.join(__dirname, '../src/data/constants.js');
let constantsContent = fs.readFileSync(constantsPath, 'utf8');
const newCustomersStr = `export const CUSTOMERS = ${JSON.stringify(finalCustomers, null, 2)};`;
constantsContent = constantsContent.replace(/export const CUSTOMERS = \[[\s\S]*?\];/, newCustomersStr);
fs.writeFileSync(constantsPath, constantsContent);
console.log('Successfully updated src/data/constants.js');
