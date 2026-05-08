import { useState, useEffect } from 'react';
import { 
    Search, 
    User, 
    Database, 
    ChevronRight, 
    AlertCircle,
    ArrowRight,
    Clock,
    Filter,
    FileJson
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client';

const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(new Date(dateStr));
};

const getDayName = (dateStr: string) => {
    return new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(new Date(dateStr));
};

interface EventLog {
    id: string;
    actor_id: string;
    decision_code: string;
    reason_code?: string;
    reason_note: string | null;
    target_table: string;
    target_id: string;
    payload?: any;
    snapshot_before?: any;
    snapshot_after?: any;
    created_at: string;
    is_admin_forced: boolean;
    // Joined data
    actor?: any;
}

export const AuditLogView = () => {
    const [logs, setLogs] = useState<EventLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            // リスト表示に必要なカラムのみに絞り込み (Projection)
            const { data, error } = await supabase
                .from('event_logs')
                .select('id, actor_id, decision_code, reason_note, target_table, target_id, created_at, is_admin_forced, actor:staffs(name)')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('Fetch Logs Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogDetail = async (logId: string) => {
        try {
            setDetailLoading(true);
            // 詳細表示に必要な全カラム（JSONを含む）を取得 (Lazy Fetch)
            const { data, error } = await supabase
                .from('event_logs')
                .select('*, actor:staffs(name)')
                .eq('id', logId)
                .single();

            if (error) throw error;
            
            // 既存のリスト内のログ情報を最新の詳細情報で更新
            setLogs(prev => prev.map(l => l.id === logId ? { ...l, ...data } : l));
            setSelectedLog(data);
        } catch (err) {
            console.error('Fetch Log Detail Error:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleLogSelect = (log: EventLog) => {
        if (!log.snapshot_after) {
            fetchLogDetail(log.id);
        } else {
            setSelectedLog(log);
        }
    };

    const filteredLogs = logs.filter(log => {
        const searchStr = searchQuery.toLowerCase();
        return (
            log.target_table.toLowerCase().includes(searchStr) ||
            log.decision_code.toLowerCase().includes(searchStr) ||
            log.reason_note?.toLowerCase().includes(searchStr) ||
            log.actor?.name.toLowerCase().includes(searchStr)
        );
    });

    return (
        <div className="tw-h-full tw-flex tw-flex-col tw-bg-slate-50 tw-dark:bg-slate-950">
            {/* Header */}
            <header className="tw-p-6 tw-bg-white tw-dark:bg-slate-900 tw-border-b tw-border-slate-200 tw-dark:border-slate-800">
                <div className="tw-flex tw-flex-col tw-md:flex-row tw-md:items-center tw-justify-between tw-gap-4">
                    <div>
                        <h2 className="tw-text-2xl tw-font-black tw-text-slate-800 tw-dark:text-white tw-flex tw-items-center tw-gap-2">
                            <Clock className="tw-text-blue-600" />
                            SDR監査ログ
                        </h2>
                        <p className="tw-text-slate-500 tw-text-sm tw-mt-1">
                            システムの全変更履歴と業務判断（Decision）を物理的に管理します。
                        </p>
                    </div>

                    <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-relative">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="対象、操作、理由、担当者で検索..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="tw-pl-10 tw-pr-4 tw-py-2 tw-bg-slate-100 tw-dark:bg-slate-800 tw-border-none tw-rounded-xl tw-text-sm tw-focus:ring-2 tw-focus:ring-blue-500 tw-w-80"
                            />
                        </div>
                        <button 
                            onClick={fetchLogs}
                            className="tw-p-2 tw-bg-slate-100 tw-dark:bg-slate-800 tw-border tw-border-slate-200 tw-dark:border-slate-700 tw-rounded-xl tw-text-slate-600 tw-hover:bg-slate-200 tw-transition-all"
                            title="リフレッシュ"
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="tw-flex-1 tw-flex tw-min-h-0">
                {/* List Pane */}
                <div className={`tw-flex-1 tw-overflow-auto tw-scrollbar-thin ${selectedLog ? 'tw-hidden tw-lg:block' : 'tw-block'}`}>
                    {loading ? (
                        <div className="tw-h-64 tw-flex tw-items-center tw-justify-center">
                            <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-blue-600"></div>
                        </div>
                    ) : (
                        <table className="tw-w-full tw-text-left tw-border-separate tw-border-spacing-0">
                            <thead className="tw-sticky tw-top-0 tw-z-10">
                                <tr className="tw-bg-slate-50 tw-dark:bg-slate-800 tw-text-slate-500 tw-text-[10px] tw-font-black tw-uppercase tw-tracking-widest">
                                    <th className="tw-px-6 tw-py-4 tw-border-b tw-border-slate-200 tw-dark:border-slate-800">発生日時</th>
                                    <th className="tw-px-6 tw-py-4 tw-border-b tw-border-slate-200 tw-dark:border-slate-800">担当者</th>
                                    <th className="tw-px-6 tw-py-4 tw-border-b tw-border-slate-200 tw-dark:border-slate-800">対象</th>
                                    <th className="tw-px-6 tw-py-4 tw-border-b tw-border-slate-200 tw-dark:border-slate-800">操作コード</th>
                                    <th className="tw-px-6 tw-py-4 tw-border-b tw-border-slate-200 tw-dark:border-slate-800">理由 / 備考</th>
                                </tr>
                            </thead>
                            <tbody className="tw-divide-y tw-divide-slate-100 tw-dark:divide-slate-800">
                                {filteredLogs.map((log) => (
                                    <tr 
                                        key={log.id}
                                        onClick={() => handleLogSelect(log)}
                                        className={`tw-cursor-pointer tw-transition-colors ${selectedLog?.id === log.id ? 'tw-bg-blue-50 tw-dark:bg-blue-900/20' : 'tw-hover:bg-slate-50 tw-dark:hover:bg-slate-800/50'}`}
                                    >
                                        <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                                            <div className="tw-flex tw-flex-col">
                                                <span className="tw-text-xs tw-font-bold tw-text-slate-700 tw-dark:text-slate-200">
                                                    {formatDate(log.created_at)}
                                                </span>
                                                <span className="tw-text-[10px] tw-text-slate-400 tw-font-mono">
                                                    {getDayName(log.created_at)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="tw-px-6 tw-py-4">
                                            <div className="tw-flex tw-items-center tw-gap-2">
                                                <div className="tw-w-6 tw-h-6 tw-rounded-lg tw-bg-slate-200 tw-dark:bg-slate-800 tw-flex tw-items-center tw-justify-center tw-text-[10px] tw-font-black tw-text-slate-500">
                                                    <User size={12} />
                                                </div>
                                                <span className="tw-text-xs tw-font-bold tw-text-slate-600 tw-dark:text-slate-300">
                                                    {log.actor?.name || '不明'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="tw-px-6 tw-py-4">
                                            <span className="tw-px-2 tw-py-1 tw-bg-slate-100 tw-dark:bg-slate-800 tw-text-slate-600 tw-dark:text-slate-400 tw-rounded-lg tw-text-[10px] tw-font-black tw-uppercase">
                                                {log.target_table}
                                            </span>
                                        </td>
                                        <td className="tw-px-6 tw-py-4">
                                            <div className="tw-flex tw-items-center tw-gap-2">
                                                <span className={`tw-text-xs tw-font-black ${log.is_admin_forced ? 'tw-text-rose-600' : 'tw-text-blue-600'}`}>
                                                    {log.decision_code}
                                                </span>
                                                {log.is_admin_forced && (
                                                    <AlertCircle size={14} className="tw-text-rose-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="tw-px-6 tw-py-4 tw-max-w-xs tw-truncate">
                                            <span className="tw-text-xs tw-text-slate-500 tw-dark:text-slate-400">
                                                {log.reason_note || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Detail Pane */}
                {selectedLog && (
                    <div className="tw-w-full tw-lg:w-[450px] tw-bg-white tw-dark:bg-slate-900 tw-border-l tw-border-slate-200 tw-dark:border-slate-800 tw-flex tw-flex-col tw-shadow-2xl">
                        <div className="tw-p-4 tw-border-b tw-border-slate-100 tw-dark:border-slate-800 tw-flex tw-items-center tw-justify-between">
                            <h3 className="tw-font-black tw-text-slate-800 tw-dark:text-white tw-flex tw-items-center tw-gap-2">
                                <FileJson size={18} className="tw-text-blue-500" />
                                変更詳細
                            </h3>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="tw-p-1 tw-hover:bg-slate-100 tw-dark:hover:bg-slate-800 tw-rounded-lg tw-transition-colors"
                            >
                                <ChevronRight />
                            </button>
                        </div>
                        
                        <div className="tw-flex-1 tw-overflow-auto tw-p-6 tw-space-y-6">
                            {detailLoading ? (
                                <div className="tw-h-64 tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4">
                                    <div className="tw-animate-spin tw-rounded-full tw-h-10 tw-w-10 tw-border-b-2 tw-border-blue-600"></div>
                                    <p className="tw-text-slate-500 tw-text-sm tw-font-bold tw-animate-pulse">証跡データを復元中...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary Card */}
                            <div className="tw-bg-slate-50 tw-dark:bg-slate-800/50 tw-rounded-2xl tw-p-4 tw-border tw-border-slate-100 tw-dark:border-slate-800">
                                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                                    <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-blue-600 tw-flex tw-items-center tw-justify-center tw-text-white shadow-lg shadow-blue-500/20">
                                        <Database size={20} />
                                    </div>
                                    <div>
                                        <p className="tw-text-[10px] tw-font-black tw-text-slate-400 tw-uppercase tw-tracking-widest">Decision Record</p>
                                        <p className="tw-text-sm tw-font-black tw-text-slate-800 tw-dark:text-white">{selectedLog.decision_code}</p>
                                    </div>
                                </div>

                                <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                                    <div className="tw-space-y-1">
                                        <p className="tw-text-[10px] tw-text-slate-400 tw-font-bold">テーブル</p>
                                        <p className="tw-text-xs tw-font-bold tw-text-slate-700 tw-dark:text-slate-200">{selectedLog.target_table}</p>
                                    </div>
                                    <div className="tw-space-y-1">
                                        <p className="tw-text-[10px] tw-text-slate-400 tw-font-bold">レコードID</p>
                                        <p className="tw-text-[10px] tw-font-mono tw-text-slate-500 tw-truncate">{selectedLog.target_id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reason Note */}
                            <div className="tw-space-y-2">
                                <h4 className="tw-text-[11px] tw-font-black tw-text-slate-400 tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-1">
                                    <AlertCircle size={12} />
                                    業務上の判断理由
                                </h4>
                                <div className="tw-p-4 tw-bg-amber-50 tw-dark:bg-amber-900/10 tw-border tw-border-amber-100 tw-dark:border-amber-900/30 tw-rounded-xl">
                                    <p className="tw-text-sm tw-text-amber-900 tw-dark:text-amber-200 tw-leading-relaxed">
                                        {selectedLog.reason_note || '理由は記録されていません'}
                                    </p>
                                </div>
                            </div>

                            {/* Diff View (Simplified) */}
                            <div className="tw-space-y-3">
                                <h4 className="tw-text-[11px] tw-font-black tw-text-slate-400 tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-1">
                                    <ArrowRight size={12} />
                                    データ差分
                                </h4>
                                
                                <div className="tw-space-y-2">
                                    {selectedLog.snapshot_after && Object.keys(selectedLog.snapshot_after).map(key => {
                                        const before = selectedLog.snapshot_before?.[key];
                                        const after = selectedLog.snapshot_after[key];
                                        
                                        if (JSON.stringify(before) === JSON.stringify(after)) return null;

                                        return (
                                            <div key={key} className="tw-p-3 tw-bg-slate-50 tw-dark:bg-slate-800/30 tw-rounded-xl tw-border tw-border-slate-100 tw-dark:border-slate-800">
                                                <p className="tw-text-[10px] tw-font-black tw-text-slate-400 tw-mb-1">{key}</p>
                                                <div className="tw-flex tw-items-center tw-gap-2">
                                                    <span className="tw-text-xs tw-line-through tw-text-slate-400">{String(before ?? 'null')}</span>
                                                    <ArrowRight size={12} className="tw-text-slate-300" />
                                                    <span className="tw-text-xs tw-font-bold tw-text-blue-600 dark:tw-text-blue-400">{String(after ?? 'null')}</span>
                                                </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
