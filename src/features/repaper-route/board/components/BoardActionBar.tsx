import { Layers, CheckCircle, Database, Undo2, Redo2, AlertTriangle, Clipboard, Cloud } from 'lucide-react';
import { DateDisplay } from './DateDisplay';
import type { BoardJob } from '../../types';

export type BoardMode = 'VIEW_PAST' | 'VIEW_LOCKED' | 'EDIT' | 'CONFIRM';

interface BoardActionBarProps {
    boardMode: BoardMode;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    isSyncing: boolean;
    undo: () => void;
    redo: () => void;
    handleConfirmAll: () => void;
    validation: {
        isValid: boolean;
        summary: string;
        hasConfirmedChanges: boolean;
    };
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    pendingJobs: BoardJob[];
    currentUser: any;
}

export const BoardActionBar: React.FC<BoardActionBarProps> = ({
    boardMode,
    selectedDate,
    setSelectedDate,
    isSyncing,
    undo,
    redo,
    handleConfirmAll,
    validation,
    isSidebarOpen,
    setIsSidebarOpen,
    pendingJobs,
    currentUser
}) => {
    const hasEditRights = boardMode === 'EDIT' || boardMode === 'CONFIRM';

    return (
        <div className="tw-h-14 tw-flex tw-justify-between tw-items-center tw-px-4 tw-bg-white tw-border-b tw-border-gray-200 tw-shadow-sm tw-z-30">
            <div className="tw-flex tw-items-center tw-gap-4 tw-flex-shrink-0">
                {/* Mode Display Badge (Finite State Machine rendering) */}
                <div className={`tw-px-3 tw-py-1.5 tw-rounded-md tw-border tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2 tw-flex-shrink-0
                    ${boardMode === 'VIEW_PAST'
                        ? 'tw-bg-slate-100 tw-border-slate-300 tw-text-slate-500'
                        : boardMode === 'CONFIRM'
                            ? 'tw-bg-amber-50 tw-border-amber-200 tw-text-amber-700'
                            : boardMode === 'VIEW_LOCKED'
                                ? 'tw-bg-slate-50 tw-border-slate-200 tw-text-slate-500'
                                : 'tw-bg-blue-50 tw-border-blue-200 tw-text-blue-700'
                    }
                `}>
                    {boardMode === 'VIEW_PAST' ? (
                        <>
                            <Layers size={16} />閲覧モード（過去）
                        </>
                    ) : boardMode === 'CONFIRM' ? (
                        <>
                            <CheckCircle size={16} />確認モード
                        </>
                    ) : boardMode === 'VIEW_LOCKED' ? (
                        <>
                            <AlertTriangle size={16} />閲覧モード（ロック中）
                        </>
                    ) : (
                        <>
                            <Layers size={16} />編集モード
                        </>
                    )}
                </div>

                <div className="tw-flex-shrink-0">
                    <DateDisplay
                        selectedDate={selectedDate}
                        onDateChange={(date) => setSelectedDate(date)}
                        userRole={currentUser?.role}
                    />
                </div>

                <div className="tw-w-5 tw-flex tw-justify-center tw-flex-shrink-0">
                    {isSyncing && (
                        <Database size={16} className="tw-text-amber-500 tw-animate-pulse" />
                    )}
                </div>
            </div>

            <div className="tw-flex tw-items-center tw-gap-2">
                {/* Undo / Redo (Wrapped with editMode for 100pt soundness) */}
                <div className="tw-flex tw-items-center tw-gap-1 tw-border-r tw-border-gray-200 tw-pr-2 tw-mr-1">
                    {hasEditRights && (
                        <>
                            <button onClick={undo} className="tw-p-2 tw-text-slate-400 tw-hover:text-slate-600 tw-hover:bg-slate-100 tw-rounded-lg tw-transition-all tw-border-none" title="元に戻す">
                                <Undo2 size={18} />
                            </button>
                            <button onClick={redo} className="tw-p-2 tw-text-slate-400 tw-hover:text-slate-600 tw-hover:bg-slate-100 tw-rounded-lg tw-transition-all tw-border-none" title="やり直し">
                                <Redo2 size={18} />
                            </button>
                        </>
                    )}
                </div>

                {hasEditRights && (
                    <button
                        onClick={() => handleConfirmAll()}
                        disabled={isSyncing}
                        className={`tw-px-3 tw-h-11 tw-rounded-lg tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold tw-transition-all tw-mr-2 tw-border-none
                            ${isSyncing ? 'tw-bg-slate-100 tw-text-slate-400' : 'tw-bg-amber-50 tw-text-amber-600 tw-hover:tw-bg-amber-100 tw-shadow-sm'}
                        `}
                        title="この内容で決定し、ロックします。後からの変更には例外操作が必要になります。"
                    >
                        <CheckCircle size={16} />
                        確定
                    </button>
                )}

                {hasEditRights && (
                    <div
                        className={`tw-px-4 tw-h-11 tw-rounded-lg tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold tw-transition-all tw-border-none
                            ${isSyncing 
                                ? 'tw-bg-amber-50 tw-text-amber-600 tw-animate-pulse' 
                                : 'tw-bg-emerald-50 tw-text-emerald-600 tw-shadow-sm'}
                        `}
                        title={isSyncing ? "サーバーに同期中..." : "サーバーと同期済み（自動保存）"}
                    >
                        {isSyncing ? <Cloud size={16} /> : <CheckCircle size={16} />}
                        {isSyncing ? '同期中...' : '同期済み'}
                        {!validation.isValid && (
                            <AlertTriangle size={14} className="tw-text-amber-500 tw-ml-1" />
                        )}
                    </div>
                )}

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`tw-relative tw-w-11 tw-h-11 tw-rounded-lg tw-transition-all tw-flex tw-items-center tw-justify-center tw-border-none
                        ${isSidebarOpen ? 'tw-bg-blue-50 tw-text-blue-600' : 'tw-bg-slate-50 tw-text-slate-600 tw-hover:bg-slate-100'}
                    `}
                    title={isSidebarOpen ? 'リストを閉じる' : '未配車リスト（一時保存された内容を元に自動割付できます）'}
                    aria-expanded={isSidebarOpen}
                    aria-controls="pending-job-sidebar"
                >
                    <Clipboard size={18} />
                    <span className={`tw-absolute -tw-top-1.5 -tw-right-1.5 tw-min-w-[1.25rem] tw-h-5 tw-text-white tw-text-[10px] tw-font-black tw-flex tw-items-center tw-justify-center tw-rounded-full tw-ring-2 tw-ring-white tw-shadow-md tw-transition-all tw-duration-300
                        ${pendingJobs.length > 0
                            ? 'tw-bg-gradient-to-br tw-from-rose-500 tw-to-pink-600'
                            : 'tw-bg-slate-300'
                        }
                    `}>
                        {pendingJobs.length}
                    </span>
                </button>
            </div>
        </div>
    );
};
