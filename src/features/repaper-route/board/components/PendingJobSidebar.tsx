import { useMemo } from 'react';
import type { BoardJob } from '../../types';
import { Database, Clock, AlertTriangle, X } from 'lucide-react';
import { getPendingJobColor } from '../../core/config/theme';

interface PendingJobSidebarProps {
    pendingJobs: BoardJob[];
    pendingFilter: string;
    setPendingFilter: (filter: string) => void;
    selectedCell: { driverId: string, time: string } | null;
    onAddJob: (job: BoardJob) => void;
    onClose: () => void;
}

export const PendingJobSidebar: React.FC<PendingJobSidebarProps> = ({
    pendingJobs,
    pendingFilter,
    setPendingFilter,
    selectedCell,
    onAddJob,
    onClose
}) => {

    const filteredPendingJobs = pendingJobs.filter(job => {
        if (pendingFilter === '全て') return true;
        if (pendingFilter === 'スポット') return job.isSpot === true;
        if (pendingFilter === '時間指定') return job.timeConstraint != null;
        if (pendingFilter === '特殊案件') return job.taskType === 'special';
        return false;
    });

    const sortedPendingJobs = useMemo(() => {
        return [...filteredPendingJobs].sort((a, b) => {
            // 1. Bucket (AM -> PM -> etc)
            if (a.bucket !== b.bucket) {
                if (a.bucket === 'AM') return -1;
                if (b.bucket === 'AM') return 1;
                if (a.bucket === 'PM') return -1;
                if (b.bucket === 'PM') return 1;
            }

            // 2. Title (A-Z)
            const titleCompare = a.title.localeCompare(b.title, 'ja');
            if (titleCompare !== 0) return titleCompare;

            // 3. ID (fallback for complete stability)
            return a.id.localeCompare(b.id);
        });
    }, [filteredPendingJobs]);

    return (
        <div id="pending-job-sidebar" className="tw-w-80 tw-h-full tw-bg-gray-50 tw-border-l tw-border-gray-200 tw-shadow-xl tw-flex tw-flex-col tw-z-50">
            {/* Header */}
            <div className="tw-p-4 tw-bg-white tw-border-b tw-border-gray-200">
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                    <h2 className="tw-font-bold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                        <Database size={18} />
                        未割当案件 ({filteredPendingJobs.length})
                    </h2>
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <button 
                            onClick={onClose} 
                            className="tw-w-11 tw-h-11 tw-flex tw-items-center tw-justify-center tw-hover:bg-gray-100 tw-rounded-full tw-transition-colors tw-text-slate-400"
                            aria-label="閉じる"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="tw-flex tw-gap-1 tw-bg-gray-100 tw-p-1 tw-rounded-lg">
                    {['全て', 'スポット', '時間指定', '特殊案件'].map(f => (
                        <button
                            key={f}
                            onClick={() => setPendingFilter(f)}
                            className={`tw-flex-1 tw-h-11 tw-text-xs tw-font-bold tw-rounded-md tw-transition-all ${pendingFilter === f ? 'tw-bg-white tw-text-blue-600 tw-shadow-sm' : 'tw-text-gray-500 tw-hover:text-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="tw-flex-1 tw-overflow-y-auto tw-p-4 tw-space-y-3">
                {sortedPendingJobs.map(job => {
                    const colorTheme = getPendingJobColor(job.bucket);
                    const isSelected = !!selectedCell;

                    return (
                        <div
                            key={job.id}
                            className={`tw-group tw-relative tw-bg-white tw-border ${colorTheme.border} tw-rounded-lg tw-p-3 tw-shadow-sm tw-hover:shadow-md tw-transition-all tw-cursor-pointer tw-select-none tw-active:scale-[0.98]
                                ${isSelected ? 'tw-hover:ring-2 tw-hover:ring-blue-400 tw-hover:ring-offset-1' : ''}
                            `}
                            onClick={() => isSelected && onAddJob(job)}
                        >
                            {/* Left Color Strip */}
                            <div className={`tw-absolute tw-top-0 tw-bottom-0 tw-left-0 tw-w-1.5 tw-rounded-l-lg ${colorTheme.bg?.replace('50', '400') || 'tw-bg-gray-400'}`} />
                            <div className="tw-pl-3">
                                <div className="tw-flex tw-justify-between tw-items-start tw-mb-1">
                                    <h3 className="tw-font-bold tw-text-gray-800 tw-text-sm">{job.title}</h3>
                                    <span className={`tw-text-[10px] tw-px-1.5 tw-py-0.5 tw-rounded tw-font-bold ${job.bucket === 'AM' ? 'tw-bg-orange-100 tw-text-orange-700' : job.bucket === 'PM' ? 'tw-bg-indigo-100 tw-text-indigo-700' : 'tw-bg-gray-100 tw-text-gray-600'}`}>
                                        {job.bucket}
                                    </span>
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-3 tw-text-xs tw-text-gray-500">
                                    <div className="tw-flex tw-items-center tw-gap-1">
                                        <Clock size={12} />
                                        <span>{job.duration}分</span>
                                    </div>
                                    {job.area && <span className="tw-bg-gray-100 tw-px-1 tw-rounded tw-text-[10px]">{job.area}</span>}
                                    {job.requiredVehicle && <span className="tw-text-red-600 tw-font-bold tw-text-[10px] tw-flex tw-items-center tw-gap-0.5"><AlertTriangle size={10} /> {job.requiredVehicle}</span>}
                                </div>
                                {job.note && (
                                    <div className="tw-mt-2 tw-text-[11px] tw-text-gray-600 tw-bg-gray-50 tw-p-1.5 tw-rounded tw-border tw-border-gray-100 tw-line-clamp-2">
                                        {job.note}
                                    </div>
                                )}
                            </div>

                            {isSelected && (
                                <div className="tw-absolute tw-inset-0 tw-bg-blue-500/10 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-opacity-0 tw-group-hover:opacity-100 tw-transition-opacity tw-backdrop-blur-[1px]">
                                    <span className="tw-bg-blue-600 tw-text-white tw-text-xs tw-font-bold tw-px-3 tw-py-1.5 tw-rounded-full tw-shadow-lg tw-pointer-events-none tw-transform tw-scale-110">
                                        配置する
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {filteredPendingJobs.length === 0 && (
                    <div className="tw-text-center tw-py-10 tw-text-gray-400 tw-text-sm">
                        該当する案件はありません
                    </div>
                )}
            </div>

            {/* 配車割り当てモード情報 (日本人向け最適化) */}
            {selectedCell && (
                <div className="tw-p-3 tw-bg-blue-600 tw-text-white tw-border-t tw-border-blue-700">
                    <p className="tw-text-[10px] tw-font-black tw-uppercase tw-tracking-widest tw-mb-0.5 tw-opacity-80">配車実行モード</p>
                    <p className="tw-text-xs tw-font-bold tw-leading-relaxed">{selectedCell.time} への配車案件を選択してください</p>
                </div>
            )}
        </div>
    );
};
