import { useMemo } from 'react';
import type { BoardJob, BoardDriver, BoardSplit } from '../../types';
import { Lock, AlertTriangle, Ban } from 'lucide-react';
import { timeToMinutes } from '../logic/timeUtils';
import { generateJobColorMap } from '../../core/config/theme';
import { BOARD_CONSTANTS } from '../logic/constants';

const { SLOT_HEIGHT_PX, Z_INDEX } = BOARD_CONSTANTS;

interface JobLayerProps {
    jobs: BoardJob[];
    ghostJobs?: BoardJob[]; // Phase 4: Ghost/Preview jobs
    splits: BoardSplit[];
    drivers: BoardDriver[];
    draggingJobId: string | null;
    draggingSplitId: string | null;
    selectedJobId: string | null;
    resizingState: any | null;
    dropPreview: any | null;
    dropSplitPreview: any | null;
    onJobMouseDown: (e: React.MouseEvent, job: BoardJob) => void;
    onSplitMouseDown: (e: React.MouseEvent, split: BoardSplit) => void;
    onResizeStart: (e: React.MouseEvent, job: BoardJob, direction: 'top' | 'bottom') => void;
    onJobClick: (id: string, e: React.MouseEvent) => void;
    onAuditClick: (id: string) => void;
}

export const JobLayer: React.FC<JobLayerProps> = ({
    jobs,
    ghostJobs = [],
    drivers,
    draggingJobId,
    selectedJobId,
    dropPreview,
    onJobMouseDown,
    onResizeStart,
    onJobClick,
    onAuditClick
}) => {
    const jobColorMap = useMemo(() => {
        const driverOrder = drivers.map(d => d.id);
        return generateJobColorMap(jobs, driverOrder, timeToMinutes);
    }, [jobs, drivers]);

    // 内部白線（Hour Lines）の描画用
    const renderHourLines = (duration: number) => {
        if (duration <= 60) return null;
        const lines = [];
        const hourBlocks = Math.floor(duration / 60);
        for (let i = 1; i <= hourBlocks; i++) {
            lines.push(
                <div
                    key={i}
                    className="tw-absolute tw-w-full tw-border-t tw-border-white/40 tw-z-0"
                    style={{ top: `${(i * 60 / 15) * SLOT_HEIGHT_PX}px` }}
                />
            );
        }
        return lines;
    };

    return (
        <div className="tw-absolute tw-inset-0 tw-flex tw-pointer-events-none">
            <div style={{ width: '64px', minWidth: '64px', flexShrink: 0 }} className="tw-flex-shrink-0" />

            <div className="tw-flex">
                {drivers.map(driver => (
                    <div
                        key={driver.id}
                        style={{ width: '180px', minWidth: '180px', flexShrink: 0 }}
                        className="tw-relative tw-h-full"
                    >
                        {/* 100 Point Spec: Drop Target Shadow (Destination VIS) */}
                        {dropPreview && dropPreview.driverId === driver.id && (
                            <div
                                className={`tw-absolute tw-w-[94%] tw-left-[3%] tw-rounded-md tw-border-2 tw-border-dashed pointer-events-none tw-z-10 tw-transition-all tw-duration-150
                                    ${dropPreview.isPending ? 'tw-opacity-30 tw-bg-gray-400 tw-border-gray-400' :
                                        (dropPreview.isOverlapError || dropPreview.isVehicleError) ? 'tw-bg-red-500/10 tw-border-red-400' : 
                                        dropPreview.isWarning ? 'tw-bg-orange-500/10 tw-border-orange-400' : 'tw-bg-emerald-500/10 tw-border-emerald-400'
                                    }
`}
                                style={{
                                    top: `${((timeToMinutes(dropPreview.startTime) - 360) / 15) * SLOT_HEIGHT_PX}px`,
                                    height: `${(dropPreview.duration / 15) * SLOT_HEIGHT_PX}px`,
                                }}
                            >
                                <div className={`tw-text-[10px] tw-font-black tw-px-1.5 tw-py-0.5 tw-rounded-sm tw-m-1 tw-inline-block
                                    ${dropPreview.isPending ? 'tw-bg-gray-200 tw-text-gray-500' :
                                        (dropPreview.isOverlapError || dropPreview.isVehicleError) ? 'tw-bg-red-100 tw-text-red-800' : 
                                        dropPreview.isWarning ? 'tw-bg-orange-100 tw-text-orange-800' : 'tw-bg-emerald-100 tw-text-emerald-800'
                                    }
`}>
                                    {dropPreview.startTime} {dropPreview.isPending ? '...' : (dropPreview.isOverlapError || dropPreview.isVehicleError) ? '×' : dropPreview.isWarning ? '⚠' : '➡'}
                                </div>
                            </div>
                        )}
                        {/* 100 Point Spec: Ghost/Preview Jobs (Phase 4) */}
                        {ghostJobs.filter(gj => gj.driverId === driver.id).map(gj => {
                            const startMin = timeToMinutes(gj.startTime || '06:00');
                            const topPx = ((startMin - 360) / 15) * SLOT_HEIGHT_PX;
                            const heightPx = (gj.duration / 15) * SLOT_HEIGHT_PX;
                            return (
                                <div
                                    key={`ghost-${gj.id}`}
                                    className="tw-absolute tw-w-[94%] tw-left-[3%] tw-rounded-md tw-border tw-border-dashed tw-border-gray-400 tw-bg-gray-100/30 tw-text-gray-400 tw-text-[10px] tw-font-bold tw-leading-tight tw-shadow-none tw-overflow-hidden tw-pointer-events-none tw-z-0 tw-flex tw-flex-col tw-justify-center tw-p-1"
                                    style={{
                                        top: `${topPx}px`,
                                        height: `${heightPx}px`,
                                    }}
                                >
                                    <div className="tw-truncate tw-opacity-50">{gj.title}</div>
                                    <div className="tw-text-[8px] tw-opacity-40">{gj.startTime} ({gj.duration}m)</div>
                                </div>
                            );
                        })}

                        {jobs.filter(job => job.driverId === driver.id).map(job => {
                            const isDragging = draggingJobId === job.id;
                            const jobTime = job.startTime || job.timeConstraint || '06:00';
                            const startMin = timeToMinutes(jobTime);
                            const topPx = ((startMin - 360) / 15) * SLOT_HEIGHT_PX;
                            const heightPx = (job.duration / 15) * SLOT_HEIGHT_PX;
                            

                            const isSelected = selectedJobId === job.id;
                            const colorTheme = jobColorMap[job.id] || { bg: 'tw-bg-gray-100', border: 'tw-border-gray-300', text: 'tw-text-gray-700' };

                            // ガードレール状態の判別
                            const isLocked = (job as any).isLocked;
                            const isConfirmed = job.status === 'confirmed';
                            const hasWarning = (job as any).hasWarning;
                            const hasError = (job as any).hasError;

                            let borderClass = colorTheme.border;
                            let zIndex: number = isLocked ? Z_INDEX.LOCK : Z_INDEX.DEFAULT;

                            if (isSelected) {
                                borderClass = 'tw-border-blue-500 tw-ring-2 tw-ring-blue-500';
                                zIndex = Z_INDEX.SELECTED;
                            } else if (isConfirmed && !isDragging) {
                                borderClass = 'tw-border-amber-400 tw-border-2 tw-border-dashed tw-shadow-[0_0_8px_rgba(251,191,36,0.3)]';
                            } else if (hasWarning) {
                                borderClass = 'tw-border-rose-500 tw-border-2 tw-shadow-[0_0_10px_rgba(244,63,94,0.4)] tw-animate-pulse-subtle';
                            } else if (hasError) {
                                borderClass = 'tw-border-red-600 tw-border-2 tw-ring-1 tw-ring-red-400';
                            } else if (isLocked) {
                                borderClass = 'tw-border-gray-400';
                            }

                            // 確定済み案件は通常色を保持しつつ視覚的アフォーダンス（黄色破線）を持たせる
                            const bgClass = isLocked ? 'tw-bg-gray-200 tw-text-gray-500 tw-italic' :
                                hasError ? 'tw-bg-red-50 tw-text-red-900' : colorTheme.bg;

                            return (
                                <div
                                    key={job.id}
                                    data-job-id={job.id}
                                    className={`tw-absolute tw-w-[94%] tw-left-[3%] tw-rounded-md tw-border tw-text-xs tw-font-bold tw-leading-tight tw-shadow-sm tw-overflow-hidden tw-pointer-events-auto tw-transition-[filter,transform] tw-duration-75 tw-flex tw-flex-col tw-justify-center
                                        ${bgClass} 
                                        ${borderClass} ${hasError ? '' : colorTheme.text}
                                        ${isDragging ? 'tw-opacity-40 tw-shadow-none tw-ring-0' : 'tw-hover:brightness-95'}
`}
                                    style={{
                                        top: `${topPx}px`,
                                        height: `${heightPx}px`,
                                        zIndex: zIndex,
                                    }}
                                    title={(job as any).warningMessage}
                                    onClick={(e) => {
                                        if (isLocked) { e.stopPropagation(); return; }
                                        onJobClick(job.id, e);
                                    }}
                                    onContextMenu={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onAuditClick(job.id);
                                    }}
                                    onDoubleClick={(e) => e.preventDefault()}
                                >
                                    {/* 内部白線 */}
                                    {renderHourLines(job.duration)}

                                    {/* Resize Handles — Z-60: 確実に掴めるよう最前面寄り + stopPropagation */}
                                    {!isLocked && (
                                        <div
                                            className="tw-absolute tw-top-0 tw-left-0 tw-right-0 tw-h-[9px] tw-cursor-ns-resize tw-hover:bg-black/10 tw-transition-colors tw-rounded-t"
                                            style={{ zIndex: Z_INDEX.RESIZE_HANDLE }}
                                            onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, job, 'top'); }}
                                        />
                                    )}

                                    {/* 100 Point Prototype Drag Handle — Z-20 */}
                                    {!isLocked && (
                                        <div
                                            className="tw-absolute tw-left-0 tw-top-0 tw-bottom-0 tw-w-6 tw-flex tw-flex-col tw-justify-center tw-items-center tw-cursor-grab tw-active:cursor-grabbing tw-hover:bg-black/5 tw-rounded-l"
                                            style={{ zIndex: Z_INDEX.DRAG_PREVIEW }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                onJobMouseDown(e, job);
                                            }}
                                        >
                                            <div className="tw-flex tw-gap-[1px]">
                                                <div className="tw-w-[2px] tw-h-3 tw-bg-black/20 tw-rounded-full" />
                                                <div className="tw-w-[2px] tw-h-3 tw-bg-black/20 tw-rounded-full" />
                                            </div>
                                        </div>
                                    )}

                                    {/* コンテンツ保護領域 (テキスト等のイベント遮断) — Z-20 */}
                                    <div className="tw-p-1 tw-pl-6 tw-flex tw-flex-col tw-relative tw-pointer-events-none" style={{ zIndex: Z_INDEX.DEFAULT }}>
                                        <div className="tw-flex tw-justify-between tw-font-bold tw-truncate tw-gap-1">
                                            <span className="tw-truncate">{job.title}</span>
                                            <div className="tw-flex tw-shrink-0 tw-gap-0.5">
                                                {isLocked && <Lock size={10} className="tw-text-gray-400" />}
                                                {isConfirmed && !isLocked && (
                                                    <span title="確定済み（変更は例外として記録）" className="tw-flex tw-items-center">
                                                        <AlertTriangle size={10} className="tw-text-amber-500" />
                                                    </span>
                                                )}
                                                {hasWarning && (
                                                    <span title={(job as any).warningMessage}>
                                                        <AlertTriangle size={10} className="tw-text-rose-600" />
                                                    </span>
                                                )}
                                                {hasError && (
                                                    <span title="時間重複エラー">
                                                        <Ban size={10} className="tw-text-red-600" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {job.duration > 15 && (
                                            <div className="tw-flex tw-items-center tw-gap-1 tw-opacity-75 tw-font-normal tw-text-[10px]">
                                                <span>{job.startTime || job.timeConstraint} - ({job.duration}分)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Resize Handle — Z-60 */}
                                    {!isLocked && (
                                        <div
                                            className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-[9px] tw-cursor-ns-resize tw-hover:bg-black/10 tw-transition-colors tw-rounded-b"
                                            style={{ zIndex: Z_INDEX.RESIZE_HANDLE }}
                                            onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, job, 'bottom'); }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Drag Preview はユーザー要望により削除 */}
        </div>
    );
};
