const fs = require('fs');
const path = require('path');

async function main() {
  const constantsPath = path.join(__dirname, '../../src/data/constants.js');
  // ESM なので動的importする
  // Windows環境で file:// を使って絶対パスでimportする
  const fileUrl = 'file:///' + constantsPath.replace(/\\/g, '/');
  const { INITIAL_DRIVERS, INITIAL_VEHICLES, CUSTOMERS, INITIAL_ITEMS } = await import(fileUrl);
  
  const masterData = {
    workers: INITIAL_DRIVERS || [],
    vehicles: INITIAL_VEHICLES || [], // 定数になければ空配列だが、constants.js にあるか？
    customers: CUSTOMERS || [],
    items: INITIAL_ITEMS || []
  };

  // public/data ディレクトリ作成
  const outDir = path.join(__dirname, '../../public/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'master.json');
  fs.writeFileSync(outPath, JSON.stringify(masterData, null, 2), 'utf8');
  console.log(`Extracted master data to ${outPath}`);
  console.log(`- Customers: ${masterData.customers.length}`);
  console.log(`- Workers: ${masterData.workers.length}`);
}

main().catch(console.error);
