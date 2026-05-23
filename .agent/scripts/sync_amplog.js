import fs from 'fs';
import crypto from 'crypto';

const mdPath = 'AMPLOG.md';
const jsonlPath = 'AMPLOG.jsonl';

const mdContent = fs.readFileSync(mdPath, 'utf8');
const jsonlContent = fs.existsSync(jsonlPath) ? fs.readFileSync(jsonlPath, 'utf8') : '';

const existingSummaries = new Set(
    jsonlContent.split('\n')
        .filter(line => line.trim())
        .map(line => {
            try {
                const parsed = JSON.parse(line);
                if (parsed.type === 'EMERGENCY_RECOVERY' || parsed.detail?.type === 'EMERGENCY_RECOVERY') {
                    console.warn(`[sync_amplog] Known recovery/emergency entry detected, handling safely: ${parsed.summary || 'No Summary'}`);
                    return parsed.summary || 'Emergency Recovery Default Summary';
                }
                if (!parsed.summary) {
                    console.warn('[sync_amplog] Warning: Detected line without summary property. Defaulting to empty.');
                    return 'Default Unknown Summary';
                }
                return parsed.summary;
            } catch {
                console.warn('[sync_amplog] Warning: Failed to parse line in AMPLOG.jsonl, skipping corrupt entry.');
                return null;
            }
        })
        .filter(Boolean)
);

const lines = mdContent.split('\n');
const recordsToAdd = [];

for (const line of lines) {
    if (!line.startsWith('|') || line.includes('AMP ID') || line.includes('--------')) continue;
    
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 6) {
        const id = parts[1];
        const date = parts[2];
        const content = parts[3];
        const status = parts[4];
        const note = parts[5];
        
        // 既存のJSONLにあるかチェック（完全一致または類似）
        const isExists = Array.from(existingSummaries).some(s => s.includes(content) || content.includes(s));
        
        if (!isExists) {
            const uuid = crypto.randomUUID();
            const record = {
                timestamp: `${date}T00:00:00.000Z`,
                id: uuid,
                summary: `${content} (${status})`,
                detail: {
                    title: content,
                    scope: "governance",
                    impact: "medium",
                    design_ref: note,
                    status: status,
                    evidence_locked: true
                }
            };
            recordsToAdd.push(record);
        }
    }
}

if (recordsToAdd.length > 0) {
    const jsonlLines = recordsToAdd.map(r => JSON.stringify(r)).join('\n');
    fs.appendFileSync(jsonlPath, '\n' + jsonlLines);
    console.log(`Added ${recordsToAdd.length} records to AMPLOG.jsonl`);
} else {
    console.log('No new records to add.');
}
