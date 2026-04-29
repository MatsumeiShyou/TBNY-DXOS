import { History, User, Clock, AlertCircle } from 'lucide-react';
import { BoardJob } from '../../../../../../../../../types';

interface AuditTrailPanelProps {
    job: BoardJob;
    history: Array<{
        version: number;
        decision: string;
        reason: string;
        userName: string;
        updatedAt: string;
    }>;
    onClose: () => void;
}

export const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({ job, history, onClose }) => {
    return (
        <div className="tw-fixed tw-right-0 tw-top-0 tw-h-full tw-w-80 tw-bg-white tw-shadow-2xl tw-z-[1000] tw-flex tw-flex-col tw-border-l tw-border-gray-200 tw-animate-in tw-slide-in-from-right tw-duration-300">
            <div className="tw-p-4 tw-border-b tw-border-gray-100 tw-flex tw-justify-between tw-items-center tw-bg-gray-50">
                <div className="tw-flex tw-items-center tw-gap-2 tw-font-bold tw-text-gray-800">
                    <History size={18} className="tw-text-blue-600" />
                    <span>判断履歴 (Audit Trail)</span>
                </div>
                <button onClick={onClose} className="tw-text-gray-400 tw-hover:text-gray-600">✕</button>
            </div>

            <div className="tw-p-4 tw-bg-blue-50/50">
                <div className="tw-text-xs tw-text-blue-600 tw-font-bold tw-mb-1">SELECTED JOB</div>
                <div className="tw-font-black tw-text-gray-900">{job.title}</div>
                <div className="tw-text-[10px] tw-text-gray-500 tw-mt-1">ID: {job.id}</div>
            </div>

            <div className="tw-flex-1 tw-overflow-y-auto tw-p-4 tw-space-y-6">
                {history.map((entry, idx) => (
                    <div key={idx} className="tw-relative tw-pl-6">
                        {/* Timeline Line */}
                        {idx !== history.length - 1 && (
                            <div className="tw-absolute tw-left-[7px] tw-top-4 tw-bottom-[-24px] tw-w-[2px] tw-bg-gray-100" />
                        )}

                        {/* Timeline Dot */}
                        <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white
                            ${idx === 0 ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}
                        `} />

                        <div className="tw-space-y-1">
                            <div className="tw-flex tw-justify-between tw-items-center">
                                <span className={`text-xs font-black ${idx === 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                                    Ver. {entry.version} {idx === 0 && '(最新)'}
                                </span>
                                <span className="tw-text-[10px] tw-text-gray-400 tw-flex tw-items-center tw-gap-1">
                                    <Clock size={10} /> {entry.updatedAt}
                                </span>
                            </div>

                            <div className="tw-text-sm tw-font-bold tw-text-gray-800 tw-bg-white tw-border tw-border-gray-100 tw-p-2 tw-rounded tw-shadow-sm">
                                {entry.decision}
                            </div>

                            <div className="tw-flex tw-items-start tw-gap-1 tw-p-2 tw-bg-gray-50 tw-rounded tw-text-[11px] tw-text-gray-600 tw-italic">
                                <AlertCircle size={10} className="tw-mt-0.5 tw-shrink-0 tw-text-gray-400" />
                                <span>{entry.reason || '（理由なし）'}</span>
                            </div>

                            <div className="tw-flex tw-items-center tw-gap-1 tw-text-[10px] tw-text-gray-400 tw-pl-1">
                                <User size={10} />
                                <span>{entry.userName}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="tw-p-4 tw-border-t tw-border-gray-100 tw-text-[10px] tw-text-gray-400 tw-bg-gray-50">
                ※ Append-Only モデルにより、物理削除された履歴は存在しません。
            </div>
        </div>
    );
};
