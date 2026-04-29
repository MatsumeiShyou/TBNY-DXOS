import { useState } from 'react';
import Modal from '../../../components/Modal';
import { BoardJob, BoardDriver } from '../../../../../../../../../types';
import { MapPin, AlertTriangle, Plus } from 'lucide-react';
import { useSharedReasons } from '../hooks/useSharedReasons';
import { supabase } from '../../../../../../../../../../../shared/lib/supabase/client';
import { invalidateMasterCache } from '../hooks/useMasterData';

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: BoardDriver | null;
    time: string | null;
    masterPoints: any[];
    onAdd: (job: BoardJob, reason: string) => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
    isOpen,
    onClose,
    driver,
    time,
    masterPoints,
    onAdd
}) => {
    const [searchGroup, setSearchGroup] = useState('全');
    const [selectedPointId, setSelectedPointId] = useState('');
    const [reason, setReason] = useState('');
    const [reasonMode, setReasonMode] = useState<'list' | 'direct' | 'save'>('list');
    const { savedReasons, recordReasonUsage } = useSharedReasons(isOpen);

    // --- 簡易マスタ登録モード ---
    const [isNewPointMode, setIsNewPointMode] = useState(false);
    const [newPointName, setNewPointName] = useState('');
    const [newPointFurigana, setNewPointFurigana] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);

    const KANA_GROUPS = ['全', 'あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];
    const KANA_MAPPING: Record<string, string> = {
        'あ': 'あいうえお',
        'か': 'かきくけこがぎぐげご',
        'さ': 'さしすせそざじずぜぞ',
        'た': 'たちつてとだぢづでど',
        'な': 'なにぬねの',
        'は': 'はひふへほばびぶべぼぱぴぷぺぽ',
        'ま': 'まみむめも',
        'や': 'やゆよ',
        'ら': 'らりるれろ',
        'わ': 'わをん'
    };

    const filteredPoints = masterPoints
        .filter(p => {
            if (searchGroup === '全') return true;
            if (!p.furigana || p.furigana.length === 0) return false;

            // カタカナ（全角/半角）を正規化してひらがなに変換して判定
            const normalized = p.furigana[0].normalize('NFKC');
            const firstChar = normalized.replace(/[\u30a1-\u30f6]/g, (s: string) => {
                return String.fromCharCode(s.charCodeAt(0) - 0x60);
            });

            const groupChars = KANA_MAPPING[searchGroup];
            return groupChars && groupChars.includes(firstChar);
        })
        .sort((a, b) => (a.furigana || '').localeCompare(b.furigana || '', 'ja'));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = async () => {
        if (!selectedPointId || !reason || isSubmitting) return;

        const point = masterPoints.find(p => p.id === selectedPointId);
        if (!point || !driver || !time) return;

        setIsSubmitting(true);
        try {
            const newJob: BoardJob = {
                id: `manual-${Date.now()}`,
                title: point.display_name || point.name,
                bucket: 'スポット', // Manual injection is basically a spot job
                taskType: 'collection',
                driverId: driver.id,
                timeConstraint: time,
                startTime: time,
                duration: 30, // Default duration
                area: point.display_name || point.name,
                location_id: point.id,
                address: point.address,
                item_category: point.target_item_category?.[0] || '一般廃棄物',
                isSpot: true,
                status: 'planned'
            };

            // 先に案件追加（親への通知）を実行
            onAdd(newJob, reason);

            // 理由の保存・更新（同期完了を待機）
            if (reasonMode === 'save' || reasonMode === 'list') {
                await recordReasonUsage(reason, reasonMode === 'save');
            }

            onClose();
            // Reset state
            setSelectedPointId('');
            setReason('');
            setSearchGroup('全');
            setReasonMode('list');
            setIsNewPointMode(false);
            setNewPointName('');
            setNewPointFurigana('');
            setRegisterError(null);
        } catch (error: any) {
            console.error('Failed to inject job or save reason:', error);
            alert(`データベースの保存に失敗しました。\n詳細: ${error?.message || error?.details || 'Unknown Error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="案件の手動追加">
            <div className="tw-space-y-4 tw-p-4 tw-max-w-md">
                <div className="tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg tw-p-3 tw-flex tw-gap-3">
                    <AlertTriangle className="tw-text-amber-600 tw-shrink-0" size={20} />
                    <div className="tw-text-xs tw-text-amber-800 tw-leading-relaxed">
                        <p className="tw-font-bold tw-mb-1">手動割り込みの記録 (Double Loop)</p>
                        <p>巡回ルート外の案件を手動で追加します。この操作は「イレギュラーな判断」として蓄積され、将来のルート最適化の学習データとなります。</p>
                    </div>
                </div>

                <div className="tw-grid tw-grid-cols-2 tw-gap-3 tw-pb-2 tw-border-b tw-border-slate-100">
                    <div>
                        <label className="tw-block tw-text-[10px] tw-text-slate-400 tw-uppercase tw-font-black tw-mb-1">対象車両</label>
                        <div className="tw-text-sm tw-font-bold tw-text-slate-700">{driver?.driverName} ({driver?.currentVehicle})</div>
                    </div>
                    <div>
                        <label className="tw-block tw-text-[10px] tw-text-slate-400 tw-uppercase tw-font-black tw-mb-1">開始予定</label>
                        <div className="tw-text-sm tw-font-bold tw-text-blue-600">{time}</div>
                    </div>
                </div>

                <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">回収先を読みで選択</label>
                    <div className="tw-grid tw-grid-cols-6 tw-gap-1">
                        {KANA_GROUPS.map(group => (
                            <button
                                key={group}
                                onClick={() => setSearchGroup(group)}
                                className={`h-8 text-xs font-bold rounded border transition-all
                                    ${searchGroup === group
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}
                                `}
                            >
                                {group}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="tw-max-h-56 tw-overflow-y-auto tw-border tw-rounded-lg tw-divide-y tw-divide-slate-50 tw-shadow-inner tw-bg-slate-50/30">
                    {filteredPoints.length > 0 ? filteredPoints.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPointId(p.id)}
                            className={`w-full text-left p-3 text-sm transition-colors flex items-center gap-3
                                ${selectedPointId === p.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-white'}
                            `}
                        >
                            <MapPin size={14} className={selectedPointId === p.id ? 'text-blue-500' : 'text-slate-300'} />
                            <div>
                                <div className="tw-font-bold tw-text-slate-700">{p.display_name}</div>
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-[10px]">
                                    <span className="tw-text-blue-500 tw-font-medium">{p.furigana || '読みなし'}</span>
                                    <span className="tw-text-slate-400 tw-truncate tw-max-w-[150px]">{p.address}</span>
                                </div>
                            </div>
                        </button>
                    )) : (
                        <div className="tw-p-12 tw-text-center tw-text-slate-400 tw-text-xs">該当する回収先が見つかりません</div>
                    )}
                </div>

                {/* 簡易マスタ登録フォーム */}
                {!isNewPointMode ? (
                    <button
                        onClick={() => setIsNewPointMode(true)}
                        className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-py-2 tw-text-xs tw-font-bold tw-text-blue-600 tw-bg-blue-50 tw-hover:bg-blue-100 tw-rounded-lg tw-border tw-border-blue-200 tw-transition-all"
                    >
                        <Plus size={14} />
                        一覧にない場合→新規登録して追加
                    </button>
                ) : (
                    <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-3 tw-space-y-2">
                        <p className="tw-text-[10px] tw-font-bold tw-text-blue-700 tw-uppercase tw-tracking-wider">簡易マスタ登録</p>
                        <div className="tw-grid tw-grid-cols-2 tw-gap-2">
                            <div className="tw-flex tw-flex-col tw-gap-1">
                                <label htmlFor="newPointName" className="tw-text-[10px] tw-font-bold tw-text-blue-700">名称</label>
                                <input
                                    id="newPointName"
                                    type="text"
                                    value={newPointName}
                                    onChange={(e) => setNewPointName(e.target.value)}
                                    placeholder="名称（必須）"
                                    className="tw-border tw-rounded tw-px-2 tw-py-1.5 tw-text-sm tw-focus:ring-2 tw-focus:ring-blue-500 tw-outline-none"
                                />
                            </div>
                            <div className="tw-flex tw-flex-col tw-gap-1">
                                <label htmlFor="newPointFurigana" className="tw-text-[10px] tw-font-bold tw-text-blue-700">フリガナ</label>
                                <input
                                    id="newPointFurigana"
                                    type="text"
                                    value={newPointFurigana}
                                    onChange={(e) => setNewPointFurigana(e.target.value)}
                                    placeholder="フリガナ"
                                    className="tw-border tw-rounded tw-px-2 tw-py-1.5 tw-text-sm tw-focus:ring-2 tw-focus:ring-blue-500 tw-outline-none"
                                />
                            </div>
                        </div>
                        {registerError && (
                            <p className="tw-text-[10px] tw-text-red-600">{registerError}</p>
                        )}
                        <div className="tw-flex tw-gap-2">
                            <button
                                onClick={() => { setIsNewPointMode(false); setRegisterError(null); }}
                                className="tw-flex-1 tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-text-slate-600 tw-bg-white tw-border tw-rounded tw-hover:bg-slate-50"
                            >
                                戻る
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newPointName.trim()) {
                                        setRegisterError('名称は必須です');
                                        return;
                                    }
                                    setIsRegistering(true);
                                    setRegisterError(null);
                                    try {
                                        const newId = `spot-${Date.now()}`;
                                        const { error: rpcErr } = await (supabase as any).rpc('rpc_execute_master_update', {
                                            p_table_name: 'master_collection_points',
                                            p_id: newId,
                                            p_core_data: {
                                                location_id: newId,
                                                name: newPointName.trim(),
                                                display_name: newPointName.trim(),
                                                furigana: newPointFurigana.trim() || null,
                                                is_spot_only: true, // 配車盤からの登録は常にスポットのみ
                                                is_active: true
                                            },
                                            p_ext_data: {},
                                            p_decision_type: 'MASTER_QUICK_REGISTER',
                                            p_reason: '配車盤からの簡易マスタ登録（スポット案件対応）',
                                            p_user_id: (await supabase.auth.getUser()).data.user?.id
                                        });
                                        if (rpcErr) throw rpcErr;
                                        invalidateMasterCache();
                                        // 登録成功→即座に選択状態にする
                                        setSelectedPointId(newId);
                                        setIsNewPointMode(false);
                                        setNewPointName('');
                                        setNewPointFurigana('');
                                    } catch (err: any) {
                                        console.error('[QuickRegister] Failed:', err);
                                        setRegisterError(`登録失敗: ${err?.message || err?.details || 'Unknown'}`);
                                    } finally {
                                        setIsRegistering(false);
                                    }
                                }}
                                disabled={isRegistering || !newPointName.trim()}
                                className={`flex-1 px-3 py-1.5 text-xs font-bold text-white rounded transition-all
                                    ${isRegistering || !newPointName.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                                `}
                            >
                                {isRegistering ? '登録中...' : '登録して選択'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="tw-space-y-2">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                        <label htmlFor="jobReason" className="tw-text-sm tw-font-medium tw-text-gray-700">追加の理由 <span className="tw-text-red-500">*</span></label>
                        <div className="tw-flex tw-bg-slate-100 tw-p-0.5 tw-rounded-lg tw-border tw-border-slate-200">
                            {[
                                { id: 'list', label: 'リスト' },
                                { id: 'direct', label: '入力' },
                                { id: 'save', label: '登録' }
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setReasonMode(mode.id as any)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all
                                        ${reasonMode === mode.id
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {reasonMode === 'list' ? (
                        <select
                            id="jobReason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="tw-w-full tw-border tw-rounded-lg tw-px-3 tw-py-2 tw-text-sm tw-focus:ring-2 tw-focus:ring-blue-500 tw-outline-none tw-bg-white tw-h-11"
                        >
                            <option value="">--- 理由を選択してください ---</option>
                            {savedReasons.map((r, i) => (
                                <option key={i} value={r}>{r}</option>
                            ))}
                        </select>
                    ) : (
                        <textarea
                            id="jobReason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={reasonMode === 'save' ? "この理由をリストに保存して追加します" : "今回の追加理由を入力してください"}
                            className="tw-w-full tw-border tw-rounded-lg tw-p-3 tw-text-sm tw-h-24 tw-focus:ring-2 tw-focus:ring-blue-500 tw-outline-none tw-resize-none"
                            required
                        />
                    )}
                    {reasonMode === 'save' && (
                        <p className="tw-text-[10px] tw-text-blue-500 tw-mt-1 tw-flex tw-items-center tw-gap-1">
                            <span className="tw-inline-block tw-w-1 tw-h-1 tw-bg-blue-500 tw-rounded-full"></span>
                            入力した理由はチーム全体の「リスト」に蓄積されます
                        </p>
                    )}
                </div>

                <div className="tw-flex tw-justify-end tw-gap-2 tw-pt-2">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-600 tw-bg-gray-100 tw-rounded-md tw-hover:bg-gray-200 tw-disabled:opacity-50"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedPointId || !reason || isSubmitting}
                        className={`px-6 py-2 text-sm font-bold text-white rounded-md transition-all
                            ${!selectedPointId || !reason || isSubmitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'}
                        `}
                    >
                        {isSubmitting ? '処理中...' : '案件を追加'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddJobModal;
