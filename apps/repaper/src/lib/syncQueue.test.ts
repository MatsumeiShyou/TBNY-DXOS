import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncQueue } from './syncQueue';
import { storageService } from '../services/storageService';

// storageService をモック
vi.mock('../services/storageService', () => ({
  storageService: {
    processSyncBatch: vi.fn()
  }
}));

describe('SyncQueue Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // キューの内部状態をリセットするハック (テスト用)
    (syncQueue as any).queue.clear();
    (syncQueue as any).isFlushing = false;
    if ((syncQueue as any).timeoutId) clearTimeout((syncQueue as any).timeoutId);
  });

  it('一時エラー(500)の場合、リトライのためにキューにデータが残ること', async () => {
    // 500エラーをシミュレート
    const tempError = new Error('Network timeout');
    (tempError as any).status = 500;
    vi.mocked(storageService.processSyncBatch).mockRejectedValueOnce(tempError);

    syncQueue.enqueue('upsert', 'daily_jobs', 'job-1', { name: 'Temp' });
    
    // flushを実行
    expect(await syncQueue.forceFlush()).toBe(false);
    
    // エラーが起きた後、キューにデータが戻っていること
    expect((syncQueue as any).queue.size).toBe(1);
  });

  it('恒久エラー(400系)の場合、キューから破棄(Dead Letter)されること', async () => {
    // 400 Bad Request をシミュレート
    const permError = new Error('Bad Request');
    (permError as any).status = 400;
    vi.mocked(storageService.processSyncBatch).mockRejectedValueOnce(permError);

    syncQueue.enqueue('upsert', 'daily_jobs', 'job-2', { name: 'Perm' });
    
    // 破棄されてキューは空になるが、保存は失敗として報告されること
    expect(await syncQueue.forceFlush()).toBe(false);
    
    // 恒久エラーなので破棄され、キューは空になること
    expect((syncQueue as any).queue.size).toBe(0);
  });

  it('恒久エラー(22P02等)の場合、キューから破棄されること', async () => {
    // PostgreSQL の型エラーをシミュレート
    const pgError = new Error('Invalid input syntax for uuid');
    (pgError as any).code = '22P02';
    vi.mocked(storageService.processSyncBatch).mockRejectedValueOnce(pgError);

    syncQueue.enqueue('upsert', 'daily_jobs', 'job-3', { name: 'PGError' });
    
    await syncQueue.forceFlush();
    
    expect((syncQueue as any).queue.size).toBe(0);
  });

  it('保存に成功した場合、forceFlush が true を返すこと', async () => {
    vi.mocked(storageService.processSyncBatch).mockResolvedValueOnce(undefined);

    syncQueue.enqueue('upsert', 'daily_jobs', 'job-4', { name: 'OK' });

    expect(await syncQueue.forceFlush()).toBe(true);
    expect((syncQueue as any).queue.size).toBe(0);
  });

  it('キューが空の場合、forceFlush が true を返すこと', async () => {
    expect(await syncQueue.forceFlush()).toBe(true);
    expect(storageService.processSyncBatch).not.toHaveBeenCalled();
  });
});
