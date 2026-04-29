import React, { useState } from 'react';
import { ExceptionReasonMaster } from '../../../types';

interface ExceptionChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (
        reasonMasterId: string | undefined,
        reasonFreeText: string,
        promoteRequested: boolean
    ) => void;
    reasons: ExceptionReasonMaster[];
}

export const ExceptionChangeModal: React.FC<ExceptionChangeModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    reasons
}) => {
    const [selectedReasonId, setSelectedReasonId] = useState<string>('');
    const [freeText, setFreeText] = useState('');
    const [promoteRequested, setPromoteRequested] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Must select 'others' if freeText is main reason, or select something.
        const isOther = selectedReasonId === '' && freeText.trim() !== '';
        const hasSelection = selectedReasonId !== '';

        if (!hasSelection && !isOther) {
            alert('変更理由を選択、または「その他」の場合は理由を入力してください。');
            return;
        }

        onConfirm(
            selectedReasonId || undefined,
            freeText,
            promoteRequested
        );

        // Reset state for next time
        setSelectedReasonId('');
        setFreeText('');
        setPromoteRequested(false);
    };

    return (
        <div className="tw-fixed tw-inset-0 tw-z-[100] tw-flex tw-items-center tw-justify-center tw-bg-black/30 tw-backdrop-blur-sm">
            <div className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-md tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200">
                <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-100 tw-bg-amber-50">
                    <h3 className="tw-text-lg tw-font-bold tw-text-amber-900 tw-flex tw-items-center tw-gap-2">
                        <span className="tw-text-xl">⚠️</span>
                        確定済み案件の例外変更
                    </h3>
                    <p className="tw-text-sm tw-text-amber-700 tw-mt-1">
                        この案件は既に確定されています。変更理由は例外ログとして追記記録されます。
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="tw-p-6 tw-space-y-5">

                    {/* Reason Selection */}
                    <div className="tw-space-y-3">
                        <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
                            変更の理由 <span className="tw-text-red-500">*</span>
                        </label>
                        <div className="tw-space-y-2">
                            {reasons.map((reason) => (
                                <label
                                    key={reason.id}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedReasonId === reason.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name="reasonMaster"
                                        value={reason.id}
                                        checked={selectedReasonId === reason.id}
                                        onChange={(e) => setSelectedReasonId(e.target.value)}
                                        className="tw-h-4 tw-w-4 tw-text-amber-600 tw-border-gray-300 tw-focus:ring-amber-500"
                                    />
                                    <span className="tw-ml-3 tw-text-sm tw-text-gray-900 tw-font-medium">
                                        {reason.label}
                                    </span>
                                </label>
                            ))}
                            {/* "Others" option explicitly clear */}
                            <label
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedReasonId === '' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <input
                                    type="radio"
                                    name="reasonMaster"
                                    value=""
                                    checked={selectedReasonId === ''}
                                    onChange={(e) => setSelectedReasonId(e.target.value)}
                                    className="tw-h-4 tw-w-4 tw-text-amber-600 tw-border-gray-300 tw-focus:ring-amber-500"
                                />
                                <span className="tw-ml-3 tw-text-sm tw-text-gray-900 tw-font-medium">
                                    その他（自由記述）
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Free Text Input (always available, but required if 'Others' is selected) */}
                    <div className="tw-space-y-2">
                        <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
                            詳細（自由記述） {selectedReasonId === '' && <span className="tw-text-red-500">*</span>}
                        </label>
                        <textarea
                            className="tw-w-full tw-rounded-lg tw-border-gray-300 tw-shadow-sm tw-focus:border-amber-500 tw-focus:ring-amber-500 tw-sm:text-sm tw-resize-none"
                            rows={3}
                            placeholder="詳細な理由や特記事項を入力してください..."
                            value={freeText}
                            onChange={(e) => setFreeText(e.target.value)}
                        />

                        {/* Promote to Master Request */}
                        {selectedReasonId === '' && freeText.trim().length > 0 && (
                            <div className="tw-flex tw-items-start tw-mt-2 tw-p-2 tw-bg-blue-50 tw-rounded tw-text-sm tw-text-blue-800 tw-border tw-border-blue-100">
                                <div className="tw-flex tw-items-center tw-h-5">
                                    <input
                                        id="promote"
                                        name="promote"
                                        type="checkbox"
                                        checked={promoteRequested}
                                        onChange={(e) => setPromoteRequested(e.target.checked)}
                                        className="tw-h-4 tw-w-4 tw-text-blue-600 tw-focus:ring-blue-500 tw-border-gray-300 tw-rounded"
                                    />
                                </div>
                                <div className="tw-ml-2">
                                    <label htmlFor="promote" className="tw-font-medium tw-cursor-pointer">
                                        この理由を選択肢（マスタ）に追加申請する
                                    </label>
                                    <p className="tw-text-xs tw-text-blue-600 tw-mt-1">
                                        ※管理者が承認すると、次回以降の選択肢に表示されるようになります。
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="tw-flex tw-gap-3 tw-justify-end tw-pt-4 tw-border-t tw-border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg tw-hover:bg-gray-50 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-offset-2 tw-focus:ring-amber-500"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white tw-bg-amber-600 tw-border tw-border-transparent tw-rounded-lg tw-shadow-sm tw-hover:bg-amber-700 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-offset-2 tw-focus:ring-amber-500"
                        >
                            理由を記録して変更
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
