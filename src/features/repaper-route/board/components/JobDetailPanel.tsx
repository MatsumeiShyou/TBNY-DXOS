// @ts-nocheck
import { useState } from 'react';
import { 
    X, Clock, User, Trash2, AlertTriangle, 
    CheckCircle2, History, ArrowRightLeft, ShieldAlert,
    Save, Maximize2, Minimize2, MapPin, Tag, Info, Box, Truck
} from 'lucide-react';
import type { BoardJob, BoardDriver } from '../../types';
import { Staff } from '../../types';

interface JobDetailPanelProps {
    job: BoardJob;
    drivers: BoardDriver[];
    currentUser: Staff | null;
    canEdit: boolean;
    onClose: () => void;
    onUpdate: (jobId: string, updates: Partial<BoardJob>) => void;
    onUnassign: (jobId: string) => void;
    onExceptionRequest: (jobId: string, type: 'MOVE' | 'REASSIGN' | 'SWAP' | 'CANCEL') => void;
}

export const JobDetailPanel: React.FC<JobDetailPanelProps> = ({
    job,
    drivers,
    currentUser,
    canEdit,
    onClose,
    onUpdate,
    onUnassign,
    onExceptionRequest
}) => {
    const isConfirmed = job.status === 'confirmed';
    const isAdmin = currentUser?.role === 'admin';
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Local state for editing (planned only)
    const [editTime, setEditTime] = useState(job.startTime || job.timeConstraint || '');
    const [editNote, setEditNote] = useState(job.note || '');
    const [editDriverId, setEditDriverId] = useState(job.driverId || '');
    const [isConfirmingUnassign, setIsConfirmingUnassign] = useState(false);

    const handleSaveLocal = () => {
        onUpdate(job.id, {
            startTime: editTime,
            note: editNote,
            driverId: editDriverId
        });
    };

    return (
        <div className={`flex flex-col h-full bg-white shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'w-[750px]' : 'w-80'}`}>
            {/* Header */}
            <div className={`p-4 flex justify-between items-center border-b ${isConfirmed ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'}`}>
                <div className="tw-flex tw-items-center tw-gap-3">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="tw-p-1.5 tw-hover:bg-black/5 tw-rounded-md tw-transition-colors tw-text-slate-500 tw-flex tw-items-center tw-gap-2 tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-tighter"
                        title={isExpanded ? "縮小" : "全権表示"}
                    >
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        {!isExpanded && <span>FULL</span>}
                    </button>
                    <div className="tw-w-px tw-h-4 tw-bg-slate-200" />
                    {isAdmin && (
                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-px-2 tw-py-1 tw-bg-purple-100 tw-text-purple-700 tw-rounded-full tw-text-[10px] tw-font-black tw-uppercase tw-tracking-wider tw-border tw-border-purple-200">
                            <ShieldAlert size={12} />
                            ADMIN
                        </div>
                    )}
                    {isConfirmed ? (
                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-px-2 tw-py-1 tw-bg-amber-100 tw-text-amber-700 tw-rounded-full tw-text-[10px] tw-font-black tw-uppercase tw-tracking-wider tw-border tw-border-amber-200">
                            <CheckCircle2 size={12} />
                            確定済み
                        </div>
                    ) : (
                        <div className="tw-flex tw-items-center tw-gap-1.5 tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-700 tw-rounded-full tw-text-[10px] tw-font-black tw-uppercase tw-tracking-wider tw-border tw-border-blue-200">
                            <Clock size={12} />
                            配車計画中
                        </div>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="tw-p-2 tw-hover:bg-black/5 tw-rounded-full tw-transition-colors tw-text-slate-400"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto p-5 transition-colors duration-300 ${isExpanded ? 'bg-slate-50/50' : 'bg-white'}`}>
                <div className={`${isExpanded ? 'grid grid-cols-2 gap-8 items-start' : 'space-y-6'}`}>
                    {/* Left Column / Information Column */}
                    <div className="tw-space-y-6">
                        {/* Title & Core Overview */}
                        <section className="tw-space-y-4">
                            <div>
                                <div className="tw-flex tw-items-start tw-justify-between">
                                    <h2 className="tw-text-2xl tw-font-black tw-text-slate-900 tw-leading-tight tw-flex-1">{job.title}</h2>
                                    <div className="tw-flex tw-flex-col tw-items-end tw-gap-1.5 tw-ml-4">
                                        <span className="tw-text-[9px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-font-mono">Reference ID</span>
                                        <span className="tw-px-2 tw-py-0.5 tw-bg-slate-100 tw-text-slate-500 tw-rounded tw-font-mono tw-text-[10px] tw-border tw-border-slate-200">{job.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                <div className="tw-p-2.5 tw-rounded-xl tw-bg-white tw-border tw-border-slate-200 tw-shadow-sm tw-flex tw-items-center tw-gap-3">
                                    <div className={`p-2 rounded-lg ${job.bucket === 'AM' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="tw-text-[9px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider">Bucket</p>
                                        <p className="tw-text-xs tw-font-black tw-text-slate-700">{job.bucket}便</p>
                                    </div>
                                </div>

                                <div className="tw-p-2.5 tw-rounded-xl tw-bg-white tw-border tw-border-slate-200 tw-shadow-sm tw-flex tw-items-center tw-gap-3">
                                    <div className={`p-2 rounded-lg ${job.isSpot ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <Tag size={16} />
                                    </div>
                                    <div>
                                        <p className="tw-text-[9px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider">Type</p>
                                        <p className="tw-text-xs tw-font-black tw-text-slate-700">{job.isSpot ? 'スポット' : '定期便'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="tw-border-slate-100" />

                        {/* Site & Access Details */}
                        <section className="tw-space-y-3">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                                <MapPin size={14} className="tw-text-slate-400" />
                                <h3 className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">現場・アクセス詳細</h3>
                            </div>
                            <div className="tw-p-4 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-sm tw-space-y-3">
                                <div>
                                    <p className="tw-text-[9px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-1">作業現場住所</p>
                                    <p className="tw-text-sm tw-font-bold tw-text-slate-700 tw-leading-relaxed">{job.address || '住所未登録'}</p>
                                </div>
                                {job.address && (
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-lg tw-text-[10px] tw-font-bold tw-text-blue-600 tw-hover:border-blue-300 tw-hover:bg-blue-50 tw-transition-all tw-shadow-sm"
                                    >
                                        <MapPin size={12} />
                                        Google Maps で位置を確認
                                    </a>
                                )}
                            </div>
                        </section>

                        <hr className="tw-border-slate-100" />

                        {/* Operation & Vehicle Requirements */}
                        <section className="tw-space-y-3">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                                <Truck size={14} className="tw-text-slate-400" />
                                <h3 className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">運行・車両要件</h3>
                            </div>
                            <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                <div className="tw-p-3 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-sm">
                                    <p className="tw-text-[9px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-1">想定作業時間</p>
                                    <p className="tw-text-sm tw-font-black tw-text-slate-700">{job.duration || 0} min</p>
                                </div>
                                <div className="tw-p-3 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-sm">
                                    <p className="tw-text-[9px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-1">指定車両</p>
                                    {job.requiredVehicle ? (
                                        <span className="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-bg-blue-100 tw-text-blue-700 tw-rounded tw-text-[10px] tw-font-bold tw-border tw-border-blue-200">
                                            {job.requiredVehicle}
                                        </span>
                                    ) : (
                                        <p className="tw-text-sm tw-font-bold tw-text-slate-400 tw-italic">指定なし</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <hr className="tw-border-slate-100" />

                        {/* Items & Work Details */}
                        <section className="tw-space-y-3">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                                <Box size={14} className="tw-text-slate-400" />
                                <h3 className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">品目・作業詳細</h3>
                            </div>
                            <div className="tw-p-4 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-sm">
                                <p className="tw-text-[9px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-2">主要回収品目</p>
                                <div className="tw-flex tw-flex-wrap tw-gap-2">
                                    {job.item_category ? (
                                        <span className="tw-px-3 tw-py-1 tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-full tw-text-xs tw-font-bold tw-text-slate-600 tw-shadow-sm">
                                            {job.item_category}
                                        </span>
                                    ) : (
                                        <p className="tw-text-sm tw-font-bold tw-text-slate-400 tw-italic">登録なし</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <hr className="tw-border-slate-100" />

                        {/* History & Timeline */}
                        <section className="tw-space-y-3">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                                <History size={14} className="tw-text-slate-400" />
                                <h3 className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">操作履歴・タイムライン</h3>
                            </div>
                            <div className="tw-relative tw-pl-6 tw-space-y-6 tw-before:absolute tw-before:left-2 tw-before:top-2 tw-before:bottom-2 tw-before:w-px tw-before:bg-slate-200">
                                <div className="tw-relative">
                                    <div className="tw-absolute tw--left-[1.625rem] tw-top-1 tw-w-4 tw-h-4 tw-rounded-full tw-bg-blue-500 tw-border-4 tw-border-white tw-shadow-sm" />
                                    <p className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider">配車計画への追加</p>
                                    <p className="tw-text-xs tw-font-bold tw-text-slate-700">システムにより自動生成</p>
                                </div>
                                {job.driverId && (
                                    <div className="tw-relative">
                                        <div className="tw-absolute tw--left-[1.625rem] tw-top-1 tw-w-4 tw-h-4 tw-rounded-full tw-bg-emerald-500 tw-border-4 tw-border-white tw-shadow-sm" />
                                        <p className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider">ドライバー割当</p>
                                        <p className="tw-text-xs tw-font-bold tw-text-slate-700">{drivers.find(d => d.id === job.driverId)?.driverName || '担当者不明'}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column / Input & Action Column */}
                    <div className="tw-space-y-6">
                        {isExpanded && <div className="tw-h-px tw-bg-slate-100 tw-mb-6 tw-sm:hidden" />}
                        
                        {/* Edit Section (Planned) or Info Section (Confirmed) */}
                        {!isConfirmed ? (
                            <div className="tw-space-y-5">
                                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                                    <Save size={14} className="tw-text-slate-400" />
                                    <h3 className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">配車計画の編集</h3>
                                </div>
                                
                                <div className="tw-bg-white tw-p-5 tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-space-y-5">
                                    {/* Time Edit */}
                                    <div className="tw-space-y-1.5">
                                        <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-wider tw-flex tw-items-center tw-gap-1.5 tw-text-blue-600">
                                            <Clock size={12} /> 訪問予定時刻
                                        </label>
                                        <input
                                            type="time"
                                            value={editTime}
                                            onChange={(e) => setEditTime(e.target.value)}
                                            className="tw-w-full tw-p-3 tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-xl tw-text-sm tw-font-bold tw-focus:ring-2 tw-focus:ring-blue-500 tw-outline-none tw-transition-all"
                                        />
                                    </div>

                                    {/* Driver Select */}
                                    <div className="tw-space-y-1.5">
                                        <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-wider tw-flex tw-items-center tw-gap-1.5 tw-text-blue-600">
                                            <User size={12} /> 担当ドライバー
                                        </label>
                                        <select
                                            value={editDriverId}
                                            onChange={(e) => setEditDriverId(e.target.value)}
                                            className="tw-w-full tw-p-3 tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-xl tw-text-sm tw-font-bold tw-focus:ring-2 tw-focus:ring-blue-500 tw-outline-none tw-transition-all"
                                        >
                                            <option value="">未選択</option>
                                            {drivers.map(d => (
                                                <option key={d.id} value={d.id}>{d.name} ({d.driverName})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Note Edit */}
                                    <div className="tw-space-y-1.5">
                                        <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-wider tw-flex tw-items-center tw-gap-1.5 tw-text-blue-600">
                                            <Info size={12} /> 連絡・備考等
                                        </label>
                                        <textarea
                                            value={editNote}
                                            onChange={(e) => setEditNote(e.target.value)}
                                            placeholder="案件に関する特記事項を入力..."
                                            rows={3}
                                            className="tw-w-full tw-p-3 tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-xl tw-text-sm tw-font-medium tw-focus:ring-2 tw-focus:ring-blue-500 tw-outline-none tw-transition-all tw-resize-none"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="tw-flex tw-gap-2 tw-pt-2">
                                        <button
                                            onClick={handleSaveLocal}
                                            disabled={!canEdit}
                                            className="tw-flex-1 tw-bg-slate-900 tw-text-white tw-p-3 tw-rounded-xl tw-font-black tw-text-xs tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-justify-center tw-gap-2 tw-hover:bg-slate-800 tw-transition-colors tw-shadow-lg tw-shadow-black/10 tw-active:scale-[0.98] tw-disabled:opacity-50 tw-disabled:cursor-not-allowed"
                                        >
                                            <Save size={14} /> 表示内容を保存
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="tw-space-y-6">
                                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                                    <Info size={14} className="tw-text-slate-400" />
                                    <h3 className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">配車確定ステータス</h3>
                                </div>
                                <div className="tw-bg-white tw-p-5 tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-space-y-6">
                                    {/* Info Read-only */}
                                    <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                                        <div className="tw-space-y-1">
                                            <p className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider">訪問予定</p>
                                            <p className="tw-text-sm tw-font-black tw-text-slate-700">{job.startTime}</p>
                                        </div>
                                        <div className="tw-space-y-1">
                                            <p className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider">担当</p>
                                            <p className="tw-text-sm tw-font-black tw-text-slate-700">{drivers.find(d => d.id === job.driverId)?.driverName || '未選択'}</p>
                                        </div>
                                    </div>
                                    
                                    {job.note && (
                                        <div className="tw-p-4 tw-bg-slate-50 tw-rounded-xl tw-border tw-border-slate-100">
                                            <p className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-2">備考</p>
                                            <p className="tw-text-sm tw-text-slate-600 tw-font-medium tw-leading-relaxed">{job.note}</p>
                                        </div>
                                    )}

                                    <div className="tw-p-3 tw-bg-amber-50 tw-rounded-lg tw-border tw-border-amber-100 tw-flex tw-items-start tw-gap-3">
                                        <ShieldAlert className="tw-text-amber-500 tw-shrink-0" size={18} />
                                        <p className="tw-text-[11px] tw-text-amber-800 tw-font-medium tw-leading-normal">
                                            確定済みの案件です。内容の変更や削除には管理者権限による「例外操作」が必要です。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <hr className="tw-border-slate-100" />

                        {/* Actions Row */}
                        <div className="tw-space-y-3">
                            {!isConfirmed && (
                                    <button
                                        onClick={() => onExceptionRequest(job.id, 'MOVE')}
                                        disabled={!canEdit}
                                        className="tw-w-full tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-white tw-border tw-border-slate-200 tw-rounded-xl tw-text-xs tw-font-black tw-text-slate-700 tw-hover:border-slate-400 tw-transition-all tw-group tw-shadow-sm tw-disabled:opacity-50 tw-disabled:cursor-not-allowed"
                                    >
                                        <div className="tw-flex tw-items-center tw-gap-3">
                                            <div className="tw-p-2 tw-bg-slate-100 tw-rounded-lg tw-group-hover:bg-slate-200 tw-transition-colors tw-text-slate-500">
                                                <ArrowRightLeft size={14} />
                                            </div>
                                            <span className="tw-uppercase tw-tracking-widest tw-leading-none tw-text-[10px]">確定を解除して編集（例外申請）</span>
                                        </div>
                                    </button>
                            )}

                            <div className="tw-relative">
                                {isConfirmingUnassign ? (
                                    <div className="tw-animate-in tw-fade-in tw-zoom-in tw-duration-200 tw-p-3 tw-bg-rose-50 tw-border tw-border-rose-100 tw-rounded-xl tw-space-y-3 tw-shadow-md">
                                        <div className="tw-flex tw-items-center tw-gap-2 tw-text-rose-800">
                                            <AlertTriangle size={16} />
                                            <span className="tw-text-xs tw-font-black tw-uppercase tw-tracking-widest">返却しますか？</span>
                                        </div>
                                        <div className="tw-flex tw-gap-2">
                                            <button
                                                onClick={() => onUnassign(job.id)}
                                                className="tw-flex-1 tw-bg-rose-600 tw-text-white tw-py-2 tw-rounded-lg tw-font-black tw-text-[10px] tw-uppercase tw-tracking-widest tw-hover:bg-rose-700"
                                            >
                                                はい、未配車に戻す
                                            </button>
                                            <button
                                                onClick={() => setIsConfirmingUnassign(false)}
                                                className="tw-flex-1 tw-bg-white tw-text-slate-600 tw-py-2 tw-rounded-lg tw-font-black tw-text-[10px] tw-uppercase tw-tracking-widest tw-border tw-border-slate-200 tw-hover:bg-slate-50"
                                            >
                                                キャンセル
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsConfirmingUnassign(true)}
                                        className={`w-full flex items-center justify-between p-3 bg-white border border-rose-100 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all group shadow-sm ${(isConfirmed || !canEdit) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isConfirmed || !canEdit}
                                        title={isConfirmed ? "確定済み案件は戻せません" : (!canEdit ? "編集権限がありません" : "")}
                                    >
                                        <div className="tw-flex tw-items-center tw-gap-3">
                                            <div className="tw-p-2 tw-bg-rose-50 tw-rounded-lg tw-group-hover:bg-rose-100 tw-transition-colors tw-text-rose-400">
                                                <Trash2 size={14} />
                                            </div>
                                            <span className="tw-uppercase tw-tracking-widest tw-leading-none">未配車リストへ戻す</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
