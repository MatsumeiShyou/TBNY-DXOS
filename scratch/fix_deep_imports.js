import fs from 'fs';
import path from 'path';

const destDir = 'c:/Users/shiyo/開発中APP/TBNY DXOS/src/features/repaper-route';

function fixDeepImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            fixDeepImports(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;

            // Fix broken absolute/relative imports from the original project structure
            // In RePaper Route, it was at depth 6. In DXOS, it's at depth 5.
            // But components are even deeper.
            
            // Fix types imports
            content = content.replace(/from '.*\/types'/g, "from '../types'");
            // Wait, this is too simple.
            
            // Use the correct types file in the module
            const depth = filePath.split(path.sep).length - destDir.split(path.sep).length - 1;
            const up = '../'.repeat(depth) + 'types';
            content = content.replace(/from '.*\/types'/g, `from '${up}'`);
            
            // Fix supabase client
            const supUp = '../'.repeat(depth + 2) + 'shared/lib/supabase/client';
            content = content.replace(/from '.*\/lib\/supabase\/client'/g, `from '${supUp}'`);

            if (content !== original) {
                console.log(`Fixing deep imports in: ${file}`);
                fs.writeFileSync(filePath, content);
            }
        }
    }
}

fixDeepImports(destDir);
