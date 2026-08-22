import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('🔍 SSOT Scan (agent:scan) を開始します...\n');

let issues = 0;

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

// 2. 必須ドキュメントの存在チェック
console.log('\n📋 [Document Check]');

const requiredDocs = [
    { name: 'AGENTS.md', required: true },
    { name: 'README.md', required: true },
    { name: 'DEBT_AND_FUTURE.md', required: false },
];

for (const doc of requiredDocs) {
    const docPath = path.join(rootDir, doc.name);
    if (fs.existsSync(docPath)) {
        console.log(`✅ ${doc.name} — 存在`);
    } else if (doc.required) {
        console.error(`❌ ${doc.name} — 必須ファイルが見つかりません！`);
        issues++;
    } else {
        console.warn(`⚠️ ${doc.name} — 推奨ファイルが見つかりません`);
        issues++;
    }
}

// 3. governance/ADR/ のチェック
const adrDir = path.join(rootDir, 'governance', 'ADR');
if (fs.existsSync(adrDir)) {
    const adrs = fs.readdirSync(adrDir).filter(f => f.endsWith('.md'));
    if (adrs.length > 0) {
        console.log(`✅ governance/ADR/ — ${adrs.length} 件のADRが存在`);
        for (const adr of adrs) {
            console.log(`   └─ ${adr}`);
        }
    } else {
        console.warn('⚠️ governance/ADR/ — ADRファイルが1件もありません');
        issues++;
    }
} else {
    console.warn('⚠️ governance/ADR/ — ディレクトリが存在しません');
    issues++;
}

// 3.5 Antigravity 拡張基盤 (.agents/) のチェック
console.log('\n🤖 [Antigravity Customization Check]');
const agentsDir = path.join(rootDir, '.agents');
if (fs.existsSync(agentsDir)) {
    // Check hooks.json
    const hooksPath = path.join(agentsDir, 'hooks.json');
    if (fs.existsSync(hooksPath)) {
        try {
            JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
            console.log('✅ .agents/hooks.json — 存在 (Valid JSON)');
        } catch (e) {
            console.error('❌ .agents/hooks.json — 無効なJSONフォーマットです！');
            issues++;
        }
    } else {
        console.warn('⚠️  .agents/hooks.json — 存在しません');
    }

    // Check skills
    const skillsDir = path.join(agentsDir, 'skills');
    if (fs.existsSync(skillsDir)) {
        const skills = fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());
        if (skills.length > 0) {
            console.log(`✅ .agents/skills/ — ${skills.length} 件のSkillが存在`);
            for (const skill of skills) {
                console.log(`   └─ ${skill}`);
            }
        } else {
            console.warn('⚠️  .agents/skills/ — 空です');
        }
    } else {
        console.warn('⚠️  .agents/skills/ — 存在しません');
    }

    // Check agents (Subagents)
    const subagentsDir = path.join(agentsDir, 'agents');
    if (fs.existsSync(subagentsDir)) {
        const agents = fs.readdirSync(subagentsDir).filter(f => f.endsWith('.md'));
        if (agents.length > 0) {
            console.log(`✅ .agents/agents/ — ${agents.length} 件のSubagent定義が存在`);
            for (const agent of agents) {
                console.log(`   └─ ${agent}`);
            }
        } else {
            console.warn('⚠️  .agents/agents/ — 空です');
        }
    } else {
        console.warn('⚠️  .agents/agents/ — 存在しません');
    }
} else {
    console.error('❌ .agents/ ディレクトリが見つかりません。Antigravity基盤が破損しています。');
    issues++;
}

// 4. ディレクトリ構造のサマリー
console.log('\n📂 [Structure Summary]');
const srcDir = path.join(rootDir, 'src');
if (fs.existsSync(srcDir)) {
    const componentsDir = path.join(srcDir, 'components');
    const hooksDir = path.join(srcDir, 'hooks');
    const utilsDir = path.join(srcDir, 'utils');
    const servicesDir = path.join(srcDir, 'services');
    const dataDir = path.join(srcDir, 'data');

    const countFiles = (dir, ext) => {
        if (!fs.existsSync(dir)) return 0;
        return fs.readdirSync(dir).filter(f => f.endsWith(ext)).length;
    };

    console.log(`- src/App.jsx (Main Application)`);
    console.log(`- src/components/ (${countFiles(componentsDir, '.jsx')} components)`);
    
    const components = fs.existsSync(componentsDir) ? fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx')) : [];
    if (components.length > 0) {
        console.log(`  └─ ${components.join(', ')}`);
    }

    console.log(`- src/hooks/ (${countFiles(hooksDir, '.js')} hooks)`);
    console.log(`- src/utils/ (${countFiles(utilsDir, '.js')} utils)`);
    console.log(`- src/services/ (${countFiles(servicesDir, '.js')} services)`);
    console.log(`- src/data/ (${countFiles(dataDir, '.js')} data files)`);
}

// 5. ルールのサマリー
console.log('\n📜 [Governance]');
const agentsMdPath = path.join(rootDir, 'AGENTS.md');
if (fs.existsSync(agentsMdPath)) {
    console.log(`✅ AGENTS.md は存在します（SSOTとして設定されています）。`);
} else {
    console.log('❌ AGENTS.md が見つかりません。統治ルールが存在しません。');
    issues++;
}

// サマリー
console.log('\n' + '='.repeat(50));
if (issues > 0) {
    console.log(`⚠️ スキャン完了: ${issues} 件の問題があります。上記を確認してください。`);
} else {
    console.log('✅ スキャン完了: すべてのチェックに合格しました。');
}
console.log('='.repeat(50) + '\n');
