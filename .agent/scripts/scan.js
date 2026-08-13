import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('🔍 SSOT Scan (agent:scan) を開始します...\n');

// 1. package.json の解析
try {
    const pkgPath = path.join(rootDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        console.log('📦 [Package Info]');
        console.log(`- Name: ${pkg.name}`);
        console.log(`- React Version: ${pkg.dependencies?.react || 'Unknown'}`);
        console.log(`- Tailwind Version: ${pkg.devDependencies?.tailwindcss || 'Unknown'}`);
    }
} catch (e) {
    console.error('package.json の読み込みに失敗しました。');
}

// 2. ディレクトリ構造のサマリー
console.log('\n📂 [Structure Summary]');
const srcDir = path.join(rootDir, 'src');
if (fs.existsSync(srcDir)) {
    const componentsDir = path.join(srcDir, 'components');
    const components = fs.existsSync(componentsDir) ? fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx')) : [];
    
    console.log(`- src/App.jsx (Main Application)`);
    console.log(`- src/components/ (${components.length} components)`);
    if (components.length > 0) {
        console.log(`  └─ ${components.slice(0, 5).join(', ')}${components.length > 5 ? ' ...' : ''}`);
    }
}

// 3. ルールのサマリー
console.log('\n📜 [Governance]');
const agentsMdPath = path.join(rootDir, 'AGENTS.md');
if (fs.existsSync(agentsMdPath)) {
    console.log('✅ AGENTS.md (Sanctuary Governance Constitution) は存在します。タスク実行前に必ず遵守してください。');
} else {
    console.log('❌ AGENTS.md が見つかりません。統治ルールが存在しません。');
}

console.log('\n✅ スキャン完了。AI エージェントは上記構造に基づいて推論を行ってください。');
