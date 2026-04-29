import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/shiyo/開発中APP/RePaper Route/apps/repaper-route/src/components';
const destDir = 'c:/Users/shiyo/開発中APP/TBNY DXOS/src/features/repaper-route/components';

function processFile(filePath, destPath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, classes) => {
        const twClasses = classes.split(' ').map(c => {
            if (!c || c.startsWith('tw-') || c.startsWith('{') || c.startsWith('$')) return c;
            return `tw-${c}`;
        }).join(' ');
        return `className=${quote}${twClasses}${quote}`;
    });
    content = content.replace(/@\/features\//g, '../');
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content);
}

function walkDir(currentSrc, currentDest) {
    const files = fs.readdirSync(currentSrc);
    for (const file of files) {
        const srcPath = path.join(currentSrc, file);
        const destPath = path.join(currentDest, file);
        if (fs.statSync(srcPath).isDirectory()) {
            walkDir(srcPath, destPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(srcPath, destPath);
        }
    }
}

console.log(`Porting general components...`);
walkDir(srcDir, destDir);
