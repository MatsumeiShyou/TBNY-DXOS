/**
 * Audit Logger v2 — 変更証跡の物理台帳（JSONL）への記録
 * 
 * DB への書き込みと並行して、サーバーローカル（またはエージェント管理下）の
 * 物理ファイルに変更履歴を追記し、監査可能性を最大化する。
 */

import { openDB } from 'idb';

export interface AuditLogEntry {
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE';
  tableName: string;
  recordId: string | number;
  payload?: unknown;
  staffId?: string;
  reason?: string;
}

const DB_NAME = 'dxos-audit-db';
const STORE_NAME = 'audit_logs';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

/**
 * 変更ログを記録する
 */
export const logAuditTrail = async (entry: AuditLogEntry): Promise<void> => {
  const logLine = JSON.stringify(entry);
  
  // 開発環境では console にも出力し、エージェントが捕捉できるようにする
  console.log(`[AUDIT_LOG] ${logLine}`);

  try {
    const db = await getDB();
    await db.add(STORE_NAME, { ...entry, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to save audit log to IndexedDB:', error);
  }
};

/**
 * 監査ログをエクスポートする
 */
export const exportAuditLogs = async (): Promise<AuditLogEntry[]> => {
  try {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    return [];
  }
};

/**
 * JSONL 形式でダウンロードトリガーを発火する
 */
export const downloadAuditLogsAsJsonl = async () => {
    const logs = await exportAuditLogs();
    if (logs.length === 0) return;

    const jsonl = logs.map(log => JSON.stringify(log)).join('\n');
    const blob = new Blob([jsonl], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
