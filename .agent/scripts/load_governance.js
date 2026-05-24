import fs from 'fs';
import path from 'path';

const GOVERNANCE_DIR = path.join(process.cwd(), 'governance');
const MAX_CHARS = 5000;

function loadGovernance(keywords) {
    if (!fs.existsSync(GOVERNANCE_DIR)) {
        console.warn('⚠️ governance directory not found.');
        return;
    }

    // Simplified relevance calculation
    const files = fs.readdirSync(GOVERNANCE_DIR).filter(f => f.endsWith('.json') || f.endsWith('.md'));
    const scoredFiles = files.map(file => {
        const filePath = path.join(GOVERNANCE_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        let score = 0;
        
        keywords.forEach(kw => {
            const regex = new RegExp(kw, 'gi');
            const matches = content.match(regex);
            if (matches) score += matches.length;
        });

        return { file, content, score };
    }).sort((a, b) => b.score - a.score);

    let output = '';
    for (const item of scoredFiles) {
        if (item.score === 0 && keywords.length > 0) continue; // Skip irrelevant files if keywords provided

        const lines = item.content.split('\n');
        for (const line of lines) {
            if (output.length + line.length + 1 > MAX_CHARS) {
                console.log(output);
                console.warn(`\n⚠️ [制限] 読み込み上限(${MAX_CHARS}文字)に達したため、残りの情報は安全に物理遮断されました。`);
                return;
            }
            output += line + '\n';
        }
    }
    console.log(output);
}

const args = process.argv.slice(2);
const keywords = args.length > 0 ? args : [];
loadGovernance(keywords);
