import { useInteraction, type DeviceMode } from '../InteractionAdapterPort';


import { Monitor, Tablet, Smartphone, Settings } from 'lucide-react';

export const DeviceSettings: React.FC = () => {
    const { deviceMode, activeMode, setDeviceMode } = useInteraction();

    const options: { id: DeviceMode; label: string; icon: React.ReactNode; desc: string }[] = [
        { id: 'auto', label: '自動判定 (推奨)', icon: <Settings size={20} />, desc: '画面サイズから最適なモードを選択' },
        { id: 'pc', label: 'PCモード', icon: <Monitor size={20} />, desc: 'ダブルクリック有効 / マウス操作優先' },
        { id: 'tablet', label: 'タブレットモード', icon: <Tablet size={20} />, desc: '大きなタッチ対象 / 2タップ操作' },
        { id: 'mobile', label: 'スマホモード', icon: <Smartphone size={20} />, desc: '画面幅最適化 / 2タップ操作' }
    ];

    // 表示用のモード名マッピング
    const modeLabels: Record<string, string> = {
        pc: 'PCモード',
        tablet: 'タブレットモード',
        mobile: 'スマホモード'
    };

    return (
        <div className="tw-p-6 tw-max-w-2xl tw-mx-auto">
            <h2 className="tw-text-xl tw-font-bold tw-text-slate-800 tw-mb-6 tw-flex tw-items-center tw-gap-2">
                <Settings className="tw-text-blue-500" />
                システム設定
            </h2>

            <div className="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-slate-200 tw-p-6">
                <div className="tw-mb-4">
                    <h3 className="tw-font-bold tw-text-slate-800 tw-flex tw-items-center tw-gap-2">
                        デバイス操作モード
                    </h3>
                    <p className="tw-text-xs tw-text-slate-500 tw-mt-1">
                        現在の判定状態: <span className="tw-font-bold tw-text-blue-600 tw-bg-blue-50 tw-px-1.5 tw-py-0.5 tw-rounded">{modeLabels[activeMode] || activeMode}</span>
                    </p>
                </div>

                <div className="tw-grid tw-grid-cols-1 tw-sm:grid-cols-2 tw-gap-3">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setDeviceMode(opt.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 flex-1
                                ${deviceMode === opt.id
                                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }
                            `}
                        >
                            <div className={`p-2 rounded-lg 
                                ${deviceMode === opt.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}
                            `}>
                                {opt.icon}
                            </div>
                            <div>
                                <div className="tw-font-bold tw-text-sm tw-mb-1">{opt.label}</div>
                                <div className={`text-[10px] leading-tight
                                    ${deviceMode === opt.id ? 'text-blue-700/80' : 'text-slate-400'}
                                `}>
                                    {opt.desc}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="tw-mt-6 tw-p-3 tw-bg-amber-50 tw-rounded-lg tw-border tw-border-amber-100 tw-text-amber-800 tw-text-xs tw-flex tw-gap-2">
                    <div className="tw-font-bold tw-whitespace-nowrap">補足:</div>
                    <div>
                        設定はブラウザに保存されます。タッチパネル搭載PC等で動作が不自然な場合は手動で「PCモード」または「タブレットモード」を指定してください。
                    </div>
                </div>
            </div>
        </div>
    );
};
