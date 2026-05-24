#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const sessionDir = join(process.cwd(), '.agent', 'session');
if (!existsSync(sessionDir)) {
    mkdirSync(sessionDir, { recursive: true });
}

const flagFile = join(sessionDir, '.seal_requested');
writeFileSync(flagFile, new Date().toISOString(), 'utf-8');

console.log('\n======================================================');
console.log(' ⚠️ HUMAN ACTION REQUIRED');
console.log(' ======================================================');
console.log(' 作業が完了しました。履歴を確定させるために、');
console.log(' チャット欄に承認パスワード（ y ）を入力してください。');
console.log(' その後、AIが npm run done を実行して最終確定します。');
console.log('======================================================\n');
