/**
 * Audit Logger v2 — 変更証跡の物理台帳（JSONL）への記録
 * 
 * DB への書き込みと並行して、サーバーローカル（またはエージェント管理下）の
 * 物理ファイルに変更履歴を追記し、監査可能性を最大化する。
 */

export interface AuditLogEntry {
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE';
  tableName: string;
  recordId: string | number;
  payload?: any;
  staffId?: string;
  reason?: string;
}

/**
 * 変更ログを記録する（現在は console.log 経由で .agent/logs/audit.jsonl への記録を想定）
 */
export const logAuditTrail = async (entry: AuditLogEntry): Promise<void> => {
  const logLine = JSON.stringify(entry);
  
  // 開発環境では console にも出力し、エージェントが捕捉できるようにする
  console.log(`[AUDIT_LOG] ${logLine}`);

  // TODO: ブラウザ環境から直接ファイル追記はできないため、
  // エージェント側がこの出力を捕捉して .agent/logs/audit.jsonl に記録する仕組みを想定。
  // あるいは Edge Functions 経由での物理ファイル追記を将来的に実装。
};
