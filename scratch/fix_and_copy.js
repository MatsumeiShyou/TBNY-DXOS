import fs from 'fs';

const sourcePath = 'C:\\Users\\shiyo\\開発中APP\\RePaper Route\\PWAにおける高品質なアプリケーション構築とユーザビリティチェックリスト総集編Ⅲ.md';
const destPath = 'C:\\Users\\shiyo\\Downloads\\PWAにおける高品質なアプリケーション構築とユーザビリティチェックリスト総集編Ⅲ.md';

try {
    const buffer = fs.readFileSync(sourcePath);
    // If it's UTF-8 misread as SJIS, we just need to make sure it's saved as UTF-8.
    // Adding UTF-8 BOM (\ufeff) often helps Windows apps recognize it.
    const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
    const outBuffer = Buffer.concat([bom, buffer]);
    
    fs.writeFileSync(destPath, outBuffer);
    console.log('Successfully fixed and saved to Downloads with UTF-8 BOM.');
} catch (e) {
    console.error('Error:', e.message);
}
