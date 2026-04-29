import fs from 'fs';
import path from 'path';

const destDir = 'c:/Users/shiyo/開発中APP/TBNY DXOS/src/features/repaper-route';

function fixErrors(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            fixErrors(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;

            // 1. Remove unused React imports (React 17+ / Vite)
            content = content.replace(/import React, \{/g, "import {");
            content = content.replace(/import React from 'react';?\n/g, "");

            // 2. Fix Context imports
            const depth = filePath.split(path.sep).length - destDir.split(path.sep).length - 1;
            const up = '../'.repeat(depth);
            
            content = content.replace(/from '.*\/InteractionContext'/g, `from '${up}InteractionAdapterPort'`);
            content = content.replace(/from '.*\/NotificationContext'/g, `from '${up}NotificationAdapterPort'`);
            content = content.replace(/from '.*\/MasterDataContext'/g, `from '${up}MasterDataAdapterPort'`);

            // 3. Type-only imports (Basic regex)
            // This is hard to do perfectly, but let's try common ones from types.ts
            if (content.includes('import {') && content.includes("from '../../types'")) {
                 content = content.replace(/import \{/g, "import type {");
            }
            if (content.includes('import {') && content.includes("from '../types'")) {
                 content = content.replace(/import \{/g, "import type {");
            }
            if (content.includes('import {') && content.includes("from './types'")) {
                 content = content.replace(/import \{/g, "import type {");
            }

            if (content !== original) {
                console.log(`Fixing types/imports in: ${file}`);
                fs.writeFileSync(filePath, content);
            }
        }
    }
}

fixErrors(destDir);
