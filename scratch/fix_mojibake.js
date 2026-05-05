import fs from 'fs';
import path from 'path';

const filePath = 'C:\\Users\\shiyo\\開発中APP\\RePaper Route\\PWAにおける高品質なアプリケーション構築とユーザビリティチェックリスト総集編Ⅲ.md';
if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    process.stdout.write(buffer); // Output raw bytes to stdout
} else {
    console.error('File not found');
}
