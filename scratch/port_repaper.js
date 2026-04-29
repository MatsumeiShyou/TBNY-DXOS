import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/shiyo/開発中APP/RePaper Route/apps/repaper-route/src/features';
const destDir = 'c:/Users/shiyo/開発中APP/TBNY DXOS/src/features/repaper-route';

const features = ['board', 'admin', 'logic', 'core', 'settings'];

function processFile(filePath, destPath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Tailwind Prefixing (tw-)
    // className="abc def" -> className="tw-abc tw-def"
    // className={`abc ${def}`} -> complex... but let's try basic one first
    content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, classes) => {
        const twClasses = classes.split(' ').map(c => {
            if (!c || c.startsWith('tw-') || c.startsWith('{') || c.startsWith('$')) return c;
            return `tw-${c}`;
        }).join(' ');
        return `className=${quote}${twClasses}${quote}`;
    });

    // 2. Import normalization
    // RePaper Route uses '@/features/...'
    content = content.replace(/@\/features\//g, '../../repaper-route/');
    // If it's in logic/core it might be different, but let's simplify for now.

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content);
}

function walkDir(currentSrc, currentDest) {
    const files = fs.readdirSync(currentSrc);
    for (const file of files) {
        const srcPath = path.join(currentSrc, file);
        const destPath = path.join(currentDest, file);
        if (fs.statSync(srcPath).isDirectory()) {
            if (file === '__tests__') continue; // Skip tests for initial migration
            walkDir(srcPath, destPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(srcPath, destPath);
        }
    }
}

features.forEach(f => {
    const s = path.join(srcDir, f);
    const d = path.join(destDir, f);
    if (fs.existsSync(s)) {
        console.log(`Porting feature: ${f}...`);
        walkDir(s, d);
    }
});
