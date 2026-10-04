import { storageService } from '../services/storageService';

export type EntityKind = 'daily_jobs' | 'daily_configs';
export type OpType = 'upsert' | 'delete';

export interface SyncOp {
  type: OpType;
  entity: EntityKind;
  id: string; // dbId, front_id, または dateStr など一意のキー
  payload?: any;
}

class SyncQueue {
  private queue = new Map<string, SyncOp>();
  private isFlushing = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private debounceMs = 1500;
  private maxRetries = 3;

  enqueue(type: OpType, entity: EntityKind, id: string, payload?: any) {
    const key = `${entity}:${id}`;
    // 同一キーは後勝ち（上書き）
    this.queue.set(key, { type, entity, id, payload });
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.flush(), this.debounceMs);
  }

  async flush(retryCount = 0) {
    if (this.isFlushing || this.queue.size === 0) return;
    this.isFlushing = true;

    // レースコンディション対策: 現在のキューを退避して空にする
    const currentBatch = Array.from(this.queue.values());
    this.queue.clear();

    try {
      await storageService.processSyncBatch(currentBatch);
      this.isFlushing = false;
      
      // 処理中に新たに積まれたものがあれば再フラッシュ
      if (this.queue.size > 0) {
        this.scheduleFlush();
      }
    } catch (error: any) {
      console.error(`Sync flush error (retry ${retryCount}):`, error);
      
      const isPermanentError = 
        (error && error.status >= 400 && error.status < 500) || 
        (error && typeof error.code === 'string' && error.code.startsWith('22'));

      if (isPermanentError) {
        console.error('【Dead Letter】 恒久エラーを検知しました。バッチを破棄します:', currentBatch);
        this.isFlushing = false;
        if (this.queue.size > 0) this.scheduleFlush();
        return;
      }
      
      // 失敗時はバッチをキューに戻す（その間に新しい変更があれば上書きしない）
      for (const op of currentBatch) {
        const key = `${op.entity}:${op.id}`;
        if (!this.queue.has(key)) {
          this.queue.set(key, op);
        }
      }

      this.isFlushing = false;

      if (retryCount < this.maxRetries) {
        // 指数バックオフによるリトライ
        const backoff = this.debounceMs * Math.pow(2, retryCount);
        this.timeoutId = setTimeout(() => this.flush(retryCount + 1), backoff);
      } else {
        console.error('Max retries reached. Sync failed.');
        // TODO: UIへの未保存警告イベントの発火
      }
    }
  }

  forceFlush() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    return this.flush();
  }

  hasPending() {
    return this.queue.size > 0;
  }
}

export const syncQueue = new SyncQueue();

// 離脱時の安全対策
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      syncQueue.forceFlush();
    }
  });

  window.addEventListener('beforeunload', (e) => {
    if (syncQueue.hasPending()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}
