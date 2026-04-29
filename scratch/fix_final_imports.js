import fs from 'fs';
import path from 'path';

const destDir = 'c:/Users/shiyo/開発中APP/TBNY DXOS/src/features/repaper-route';

function fixFinalImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file === 'types') continue; // Don't fix inside types
            fixFinalImports(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;

            const depth = filePath.split(path.sep).length - destDir.split(path.sep).length - 1;
            const up = '../'.repeat(depth) + 'types';
            
            // Fix types imports to use the types directory
            content = content.replace(/from '.*\/types'/g, `from '${up}'`);
            
            // Fix vitest/test imports
            content = content.replace(/from 'vitest'/g, "from 'vite'"); // Temporary fallback or similar

            if (content !== original) {
                console.log(`Final fix for: ${file}`);
                fs.writeFileSync(filePath, content);
            }
        }
    }
}

fixFinalImports(destDir);
