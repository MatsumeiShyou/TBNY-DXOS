import fs from 'fs';
import path from 'path';

const destDir = 'c:/Users/shiyo/開発中APP/TBNY DXOS/src/features/repaper-route';

function fixAuthImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            fixAuthImports(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Fix useAuth imports
            // from '../../contexts/AuthProvider' -> to relative AuthAdapterPort
            // We need to calculate relative depth
            const depth = filePath.split(path.sep).length - destDir.split(path.sep).length - 1;
            const relPath = '../'.repeat(depth) + 'AuthAdapterPort';
            
            const newContent = content.replace(/from '.*\/AuthProvider'/g, `from '${relPath}'`);
            
            if (content !== newContent) {
                console.log(`Fixing auth import in: ${file}`);
                fs.writeFileSync(filePath, newContent);
            }
        }
    }
}

fixAuthImports(destDir);
