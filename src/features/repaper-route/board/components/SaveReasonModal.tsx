import React, { useState } from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import { REASON_TAXONOMY } from '../logic/constants';

interface SaveReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCommit: (reasonCode: string, reasonText: string) => void;
}

export const SaveReasonModal: React.FC<SaveReasonModalProps> = ({ isOpen, onClose, onCommit }) => {
    const [selectedCode, setSelectedCode] = useState<string>('');
    const [reasonText, setReasonText] = useState<string>('');

    if (!isOpen) return null;

    const selectedTaxonomy = REASON_TAXONOMY.find(t => t.code === selectedCode);
    const isTextRequired = selectedTaxonomy?.requiresText || false;
    const isSubmitDisabled = !selectedCode || (isTextRequired && !reasonText.trim());

    const handleSubmit = () => {
        if (isSubmitDisabled) return;
        onCommit(selectedCode, reasonText.trim());
        // 状態リセット
        setSelectedCode('');
        setReasonText('');
    };

    const handleCancel = () => {
        setSelectedCode('');
        setReasonText('');
        onClose();
    };

    return (
        <div className="tw-fixed tw-inset-0 tw-bg-black/50 tw-z-[150] tw-flex tw-items-center tw-justify-center">
            <div className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-w-[500px] tw-flex tw-flex-col tw-overflow-hidden tw-animate-in tw-fade-in tw-zoom-in tw-duration-200">
                {/* Header */}
                <div className="tw-bg-slate-800 tw-text-white tw-px-4 tw-py-3 tw-flex tw-justify-between tw-items-center">
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <Save size={18} className="tw-text-blue-400" />
                        <h2 className="tw-font-bold">変更の保存と理由の記録</h2>
                    </div>
                    <button onClick={handleCancel} className="tw-text-gray-400 tw-hover:text-white tw-transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="tw-p-6 tw-flex tw-flex-col tw-gap-4">
                    <div className="tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded tw-p-3 tw-flex tw-gap-3 tw-text-sm tw-text-amber-800">
                        <AlertTriangle size={16} className="tw-shrink-0 tw-mt-0.5" />
                        <div>
                            <p className="tw-font-bold tw-mb-1">SDRモデル（変更の監査ログ記録）</p>
                            <p>理由なきデータの変更は禁止されています。この変更に至った「システム外の事象」や「判断の根拠」を記録してください。</p>
                        </div>
                    </div>

                    <div className="tw-flex tw-flex-col tw-gap-1.5">
                        <label htmlFor="reasonCode" className="tw-text-sm tw-font-bold tw-text-gray-700 tw-flex tw-justify-between">
                            理由カテゴリ（必須）
                            <span className="tw-text-xs tw-text-red-500 tw-bg-red-50 tw-px-1.5 tw-rounded tw-border tw-border-red-100">必須</span>
                        </label>
                        <select
                            id="reasonCode"
                            value={selectedCode}
                            onChange={(e) => setSelectedCode(e.target.value)}
                            className="tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2 tw-text-sm tw-focus:ring-2 tw-focus:ring-blue-500 tw-focus:border-blue-500 tw-outline-none tw-w-full tw-bg-white tw-cursor-pointer"
                        >
                            <option value="" disabled>--- 理由を選択してください ---</option>
                            {REASON_TAXONOMY.map(tax => (
                                <option key={tax.code} value={tax.code}>
                                    {tax.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="tw-flex tw-flex-col tw-gap-1.5">
                        <label htmlFor="reasonText" className="tw-text-sm tw-font-bold tw-text-gray-700 tw-flex tw-justify-between">
                            詳細テキスト（具体的な状況等）
                            {isTextRequired ? (
                                <span className="tw-text-xs tw-text-red-500 tw-bg-red-50 tw-px-1.5 tw-rounded tw-border tw-border-red-100">入力必須</span>
                            ) : (
                                <span className="tw-text-xs tw-text-gray-500">任意</span>
                            )}
                        </label>
                        <textarea
                            id="reasonText"
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            placeholder={isTextRequired ? "この理由カテゴリでは詳細の入力が必須です" : "補足事項があれば入力してください"}
                            rows={4}
                            className={`border rounded px-3 py-2 text-sm outline-none resize-none w-full
                                ${isTextRequired && !reasonText.trim() ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/30' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50'}
                            `}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="tw-bg-gray-50 tw-px-6 tw-py-4 tw-flex tw-justify-end tw-gap-3 tw-border-t">
                    <button
                        onClick={handleCancel}
                        className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded tw-text-sm tw-font-medium tw-text-gray-700 tw-hover:bg-gray-100 tw-transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className={`px-6 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors
                            ${isSubmitDisabled
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}
                        `}
                    >
                        <Save size={16} />
                        保存（SDR記録）
                    </button>
                </div>
            </div>
        </div>
    );
};
