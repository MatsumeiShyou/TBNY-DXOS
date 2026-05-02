// @ts-nocheck
// gov-bypass [III-2] [EXPIRY:2026-04-13] Business requirement: Syllabary filter implementation requires custom layout deviation.

import { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    XCircle,
    X,
    Phone,
    Lock,
    ChevronDown,
    Shield,
    Trash2,
    FileText,
    Calendar,
    AlertTriangle,
    Clock
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client';
import { nativeSupabaseFetch } from '../lib/supabase/nativeFetch';
import useMasterCRUD from '../hooks/useMasterCRUD';
import { Modal } from './Modal';
import { MasterSchema, MasterColumn, MASTER_SCHEMAS } from '../config/masterSchema';
import { serializeMasterData, normalizeDays } from '../utils/serialization';
import { SortConfig, universalSort } from '../utils/sortUtils';
import { PHYSICAL_CONSTRAINTS, isValidWeighingUnit } from '../../../shared/lib/validation/physicalConstraints';

interface MasterDataLayoutProps {
    schema: MasterSchema;
}


export const MasterDataLayout: React.FC<MasterDataLayoutProps> = ({ schema }) => {
    // 汎用レイアウトなので Record<string, any> として扱う
    const {
        data,
        loading,
        error,
        createItem,
        updateItem,
        deleteItem
    } = useMasterCRUD<Record<string, any>>(schema);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInitial, setSelectedInitial] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);

    // 列の表示順管理
    const storageKey = `master_col_order_${schema.rpcTableName}`;
    const [orderedColumns, setOrderedColumns] = useState<MasterColumn[]>(schema.columns);
    const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // ソート状態管理 (F-SSOT)
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

    // localStorage から並び順を復元
    useEffect(() => {
        const savedOrder = localStorage.getItem(storageKey);
        if (savedOrder) {
            try {
                const orderKeys = JSON.parse(savedOrder) as string[];
                const reordered = orderKeys
                    .map(key => schema.columns.find(c => c.key === key))
                    .filter((c): c is MasterColumn => !!c);

                // 新しく追加されたカラムがあれば末尾に追加
                const newCols = schema.columns.filter(c => !orderKeys.includes(c.key));
                setOrderedColumns([...reordered, ...newCols]);
            } catch (e) {
                console.error('Failed to load column order', e);
            }
        } else {
            setOrderedColumns(schema.columns);
        }
    }, [schema.rpcTableName, schema.columns]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedColIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // ドラッグ中の見た目を調整するためのクラス付与などはここ
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedColIndex(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedColIndex === null || draggedColIndex === dropIndex) return;

        const nextColumns = [...orderedColumns];
        const [movedCol] = nextColumns.splice(draggedColIndex, 1);
        nextColumns.splice(dropIndex, 0, movedCol);

        setOrderedColumns(nextColumns);

        // localStorage に保存
        const orderKeys = nextColumns.map(c => c.key);
        localStorage.setItem(storageKey, JSON.stringify(orderKeys));

        handleDragEnd();
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                return { key: '', direction: null };
            }
            return { key, direction: 'asc' };
        });
    };

    const matchesInitial = (item: Record<string, any>) => {
        if (!selectedInitial) return true;
        
        // フリガナを最優先、なければ主要な名称フィールド
        const nameField = schema.searchFields[0] || 'name';
        const target = String(item.furigana || item[nameField] || '').toUpperCase();
        if (!target) return selectedInitial === '他';
        
        const firstChar = target.charAt(0);
        
        const groups: Record<string, RegExp> = {
            'あ': /^[あいうえおアイウエオｱｲｳｴｵ]/,
            'か': /^[かきくけこカキクケコｶｷｸｹｺ]/,
            'さ': /^[さしすせそサシスセソｻｼｽｾｿ]/,
            'た': /^[たちつてとタチツテトﾀﾁﾂﾃﾄ]/,
            'な': /^[なにぬねのナニヌネノﾅﾆﾇﾈﾉ]/,
            'は': /^[はひふへほハヒフヘホﾊﾋﾌﾍﾎ]/,
            'ま': /^[まみむめもマミムメモﾏﾐﾑﾒﾓ]/,
            'や': /^[やゆよヤユヨﾔﾕﾖ]/,
            'ら': /^[らりるれろラリルレロﾗﾘﾙﾚﾛ]/,
            'わ': /^[わをんワヲンﾜｦﾝ]/,
        };

        if (selectedInitial === '他') {
            // 他のグループに属さず、かつ英数字や記号など
            return !Object.values(groups).some(re => re.test(firstChar));
        }

        return groups[selectedInitial]?.test(firstChar) || false;
    };

    const filteredData = data.filter(item => {
        const matchesQuery = !searchQuery || schema.searchFields.some(field =>
            String(item[field] || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesQuery && matchesInitial(item);
    });

    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return filteredData;
        return [...filteredData].sort((a, b) =>
            universalSort(a, b, sortConfig.key, sortConfig.direction as 'asc' | 'desc')
        );
    }, [filteredData, sortConfig]);

    const handleCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const [isDeepFetching, setIsDeepFetching] = useState(false);

    const handleEdit = async (item: Record<string, any>) => {
        // [T3 Fix] Viewには不足カラムがあるため、修正時はテーブル本体から最新をDeep Fetchする
        if (schema.viewName !== schema.rpcTableName) {
            try {
                setIsDeepFetching(true);
                const { data: results, error: fetchErr } = await nativeSupabaseFetch(
                    schema.rpcTableName as string,
                    `select=*&${schema.primaryKey}=eq.${item[schema.primaryKey]}`
                );
                
                const detail = results?.[0];
                
                if (!fetchErr && detail) {
                    setEditingItem(detail);
                } else {
                    console.warn('Deep Fetch failed, falling back to view data', fetchErr);
                    setEditingItem(item);
                }
            } catch (err) {
                console.error('Deep Fetch Error:', err);
                setEditingItem(item);
            } finally {
                setIsDeepFetching(false);
            }
        } else {
            setEditingItem(item);
        }
        setIsModalOpen(true);
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (formData: Record<string, any>) => {
        try {
            setIsSaving(true);

            // [Physical Validation] 物理制約チェック (10kg単位等)
            const weightFields = ['capacity_kg', 'net_weight_kg', 'max_payload_kg'];
            for (const field of weightFields) {
                const val = formData[field];
                if (val != null && val !== '' && !isValidWeighingUnit(Number(val))) {
                    throw new Error(`${schema.title}の「${field}」は${PHYSICAL_CONSTRAINTS.WEIGHING.MIN_UNIT_KG}kg単位で入力してください。`);
                }
            }

            const serialized = serializeMasterData(formData, schema.fields, schema.rpcTableName as string);
            if (editingItem) {
                await updateItem(String(editingItem[schema.primaryKey]), serialized);
            } else {
                await createItem(serialized);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Master Save Error:', err);
            // 診断強化: エラーオブジェクトの詳細を抽出
            const errorMsg = err.message || '不明なエラー';
            const diagnosticInfo = [err.code, err.hint, err.details].filter(Boolean).join(' | ');
            alert(`保存に失敗しました: ${errorMsg}${diagnosticInfo ? `\n(診断情報: ${diagnosticInfo})` : ''}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm('このデータを無効化（アーカイブ）してもよろしいですか？\n※物理削除は行われません。')) {
            await deleteItem(id);
            setIsModalOpen(false);
        }
    };

    if (error) return (
        <div className="tw-p-8 tw-text-red-500 tw-bg-red-50 tw-rounded-xl tw-border tw-border-red-200 tw-m-6 tw-flex tw-items-center tw-gap-3">
            <XCircle />
            <span>エラーが発生しました: {error.message}</span>
        </div>
    );

    return (
        <div className="tw-h-full tw-flex tw-flex-col tw-bg-slate-50 tw-dark:bg-slate-950">
            {/* Header Area */}
            <header className="tw-p-6 tw-bg-white tw-dark:bg-slate-900 tw-border-b tw-border-slate-200 tw-dark:border-slate-800">
                <div className="tw-flex tw-flex-col tw-md:flex-row tw-md:items-center tw-justify-between tw-gap-4">
                    <div>
                        <h2 className="tw-text-2xl tw-font-black tw-text-slate-800 tw-dark:text-white tw-flex tw-items-center tw-gap-2">
                            {schema.title}
                        </h2>
                        <p className="tw-text-slate-500 tw-text-sm tw-mt-1">{schema.description}</p>
                    </div>

                    <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                        {/* Syllabary Filter Buttons (Akasatana) */}
                        <div className="tw-flex tw-bg-slate-100 tw-dark:bg-slate-800 tw-p-1 tw-rounded-xl tw-shadow-inner tw-mr-2 tw-overflow-x-auto tw-no-scrollbar tw-max-w-full tw-md:max-w-none">
                            <button
                                onClick={() => setSelectedInitial(null)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                                    selectedInitial === null
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                                }`}
                            >
                                全
                            </button>
                            <div className="tw-w-[1px] tw-h-4 tw-bg-slate-300 tw-dark:bg-slate-700 tw-mx-1 tw-self-center" />
                            {['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'].map(initial => (
                                <button
                                    key={initial}
                                    onClick={() => setSelectedInitial(initial)}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                                        selectedInitial === initial
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {initial}
                                </button>
                            ))}
                            <div className="tw-w-[1px] tw-h-4 tw-bg-slate-300 tw-dark:bg-slate-700 tw-mx-1 tw-self-center" />
                            <button
                                onClick={() => setSelectedInitial('他')}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                                    selectedInitial === '他'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                                }`}
                            >
                                他
                            </button>
                        </div>

                        <div className="tw-flex tw-items-center tw-gap-3 tw-ml-auto">
                            <div className="tw-relative">
                                <Search className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="検索..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="tw-pl-10 tw-pr-4 tw-py-2 tw-bg-slate-100 tw-dark:bg-slate-800 tw-border-none tw-rounded-xl tw-text-sm tw-focus:ring-2 tw-focus:ring-blue-500 tw-w-64"
                                />
                            </div>
                            <button
                                onClick={handleCreate}
                                className="tw-bg-blue-600 tw-hover:bg-blue-700 tw-text-white tw-px-4 tw-py-2 tw-rounded-xl tw-font-bold tw-flex tw-items-center tw-gap-2 tw-shadow-lg tw-shadow-blue-500/20 tw-transition-all tw-active:scale-95 tw-whitespace-nowrap"
                            >
                                <Plus size={18} />
                                新規登録
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* List Area */}
            <main className="tw-flex-1 tw-min-h-0 tw-relative">
                {loading && data.length === 0 ? (
                    <div className="tw-h-64 tw-flex tw-items-center tw-justify-center">
                        <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-blue-600"></div>
                    </div>
                ) : (
                    <div className="tw-absolute tw-inset-0 tw-overflow-auto tw-scrollbar-thin tw-scrollbar-thumb-slate-300 tw-dark:scrollbar-thumb-slate-600 tw-scrollbar-track-slate-100 tw-dark:scrollbar-track-slate-800/50">
                        <table className="tw-w-full tw-text-left tw-border-separate tw-border-spacing-0 tw-min-w-max">
                            <thead className="tw-sticky tw-top-0 tw-z-20">
                                <tr className="tw-bg-slate-50 tw-dark:bg-slate-800 tw-text-slate-500 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider">
                                    {orderedColumns.map((col, idx) => (
                                        <th
                                            key={col.key}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx)}
                                            onDragOver={(e) => handleDragOver(e, idx)}
                                            onDragEnd={handleDragEnd}
                                            onDrop={(e) => handleDrop(e, idx)}
                                            className={`px-6 py-4 border-b border-slate-200 dark:border-slate-800 cursor-move transition-all group/h
                                                ${col.className?.includes('sticky') ? 'sticky left-0 bg-slate-50 dark:bg-slate-800 z-30' : ''}
                                                ${dragOverIndex === idx ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''}
                                                ${draggedColIndex === idx ? 'opacity-30' : ''}
                                            `}
                                        >
                                            <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
                                                <div 
                                                    className={`flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors select-none ${sortConfig.key === (col.sortKey || col.key) ? 'text-blue-600' : ''}`}
                                                    onClick={() => {
                                                        if (col.sortable) {
                                                            handleSort(col.sortKey || col.key);
                                                        }
                                                    }}
                                                >
                                                    <span className="tw-whitespace-nowrap">{col.label}</span>
                                                    {col.sortable && !col.sortOptions && (
                                                        <span className={`text-[10px] transition-all ${sortConfig.key === (col.sortKey || col.key) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 group-hover/h:opacity-40 group-hover/h:translate-y-0'}`}>
                                                            {sortConfig.key === (col.sortKey || col.key) 
                                                                ? (sortConfig.direction === 'asc' ? '▲' : '▼') 
                                                                : '▲'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 複合カラム用の微細トリガー */}
                                                {col.sortOptions && (
                                                    <div className="tw-flex tw-gap-1.5 tw-animate-in tw-fade-in tw-slide-in-from-right-2">
                                                        {col.sortOptions.map(opt => {
                                                            const isActive = sortConfig.key === opt.key;
                                                            return (
                                                                <button
                                                                    key={opt.key}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSort(opt.key);
                                                                    }}
                                                                    className={`relative w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black transition-all active:scale-90 ${
                                                                        isActive 
                                                                            ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.4)] ring-2 ring-blue-500/20' 
                                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                                                                    }`}
                                                                    title={`${opt.label}でソート`}
                                                                >
                                                                    {opt.label}
                                                                    {isActive && (
                                                                        <span className="tw-absolute tw--top-1 tw--right-0.5 tw-text-[8px] tw-animate-bounce">
                                                                            {sortConfig.direction === 'asc' ? '▲' : '▼'}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <div className="tw-opacity-0 tw-group-hover/h:opacity-100 tw-text-slate-300 tw-ml-1">⋮⋮</div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="tw-divide-y tw-divide-slate-100 tw-dark:divide-slate-800">
                                {sortedData.map((item, rowIdx) => (
                                    <tr
                                        key={item[schema.primaryKey]}
                                        className="tw-hover:bg-slate-50 tw-dark:hover:bg-slate-800/50 tw-transition-colors tw-group tw-cursor-pointer tw-animate-in tw-fade-in tw-slide-in-from-bottom-1"
                                        style={{ animationDelay: `${Math.min(rowIdx * 30, 300)}ms` }}
                                        onClick={() => handleEdit(item)}
                                    >
                                        {orderedColumns.map(col => (
                                            <td key={col.key} className={`px-6 py-4 whitespace-nowrap text-sm ${col.className || ''} ${col.className?.includes('sticky') ? 'sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 z-10' : ''}`}>
                                                {renderCell(item, col)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredData.length === 0 && (
                            <div className="tw-py-20 tw-text-center">
                                <p className="tw-text-slate-400 tw-text-sm">データが見つかりませんでした</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? `${schema.title}を編集` : `新しい${schema.title.replace('管理', '')}を追加`}
            >
                {isDeepFetching ? (
                    <div className="tw-h-64 tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4">
                        <div className="tw-animate-spin tw-rounded-full tw-h-10 tw-w-10 tw-border-b-2 tw-border-blue-600"></div>
                        <p className="tw-text-slate-500 tw-text-sm tw-font-bold tw-animate-pulse">最新データを取得中...</p>
                    </div>
                ) : (
                    <MasterForm
                        key={editingItem ? editingItem[schema.primaryKey] : 'new'}
                        schema={schema}
                        initialData={editingItem}
                        onSave={handleSave}
                        onDelete={editingItem ? () => handleDelete(editingItem[schema.primaryKey]) : undefined}
                        onCancel={() => setIsModalOpen(false)}
                        isSaving={isSaving}
                    />
                )}
            </Modal>
        </div>
    );
};


function renderCell(item: Record<string, any>, col: MasterColumn) {
    const value = item[col.key];

    // Status Dot Display
    if (col.type === 'status') {
        const isActive = !!value;
        return (
            <div className="tw-flex tw-items-center tw-gap-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                <span className={isActive ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    {isActive ? '有効' : '無効'}
                </span>
            </div>
        );
    }

    if (col.type === 'badge') {
        const badgeValue = String(value || '');
        let colorClass = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'; // Default fallback

        // スキーマ定義の styleRules があれば適用 (部分一致を含む検索ロジック)
        if (col.styleRules && badgeValue) {
            // 完全一致を優先
            if (col.styleRules[badgeValue]) {
                colorClass = col.styleRules[badgeValue];
            }
            // デフォルト設定がある場合
            else if (col.styleRules['default']) {
                colorClass = col.styleRules['default'];

                // 部分一致の検索 (例: '4tゲート' -> '4t')
                // キーを走査して、値が含まれていれば適用するロジック
                // キーが 'default' 以外で、かつ badgeValue に含まれる場合
                const matchedKey = Object.keys(col.styleRules).find(key =>
                    key !== 'default' && badgeValue.includes(key)
                );
                if (matchedKey) {
                    colorClass = col.styleRules[matchedKey];
                }
            }
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {col.optionLabels?.[badgeValue] || badgeValue || '-'}
            </span>
        );
    }

    // Default Text with Multi-Row / SubLabel support
    if (col.type === 'multi-row' || col.subLabelKey || col.thirdLabelKey) {
        return (
            <div className="tw-flex tw-flex-col tw-py-1">
                <div className="tw-flex tw-items-center tw-gap-2">
                    <span className="tw-font-bold tw-text-slate-800 tw-dark:text-slate-200 tw-leading-tight">
                        {value || '-'}
                    </span>
                    <div className="tw-flex tw-gap-0.5">
                        {item.site_contact_phone && (
                            <div className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-blue-50 tw-dark:bg-blue-900/30 tw-text-blue-600 tw-dark:text-blue-400" title={item.site_contact_phone}>
                                <Phone size={10} className="tw-stroke-[3]" />
                            </div>
                        )}
                        {item.vehicle_restriction_type && item.vehicle_restriction_type !== 'NONE' && (
                            <div className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-red-50 tw-dark:bg-red-900/30 tw-text-red-600 tw-dark:text-red-400" title="車両制限あり">
                                <Lock size={10} className="tw-stroke-[3]" />
                            </div>
                        )}
                        {item.internal_note && (
                            <div className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-amber-50 tw-dark:bg-amber-900/30 tw-text-amber-600 tw-dark:text-amber-400" title={item.internal_note}>
                                <FileText size={10} className="tw-stroke-[2.5]" />
                            </div>
                        )}
                    </div>
                </div>
                {col.subLabelKey && item[col.subLabelKey] && (
                    <span className="tw-text-[11px] tw-text-slate-400 tw-dark:text-slate-500 tw-mt-1 tw-leading-none tw-font-medium tw-truncate tw-max-w-[200px]">
                        {item[col.subLabelKey]}
                    </span>
                )}
                {col.thirdLabelKey && item[col.thirdLabelKey] && (
                    <span className="tw-text-[10px] tw-text-emerald-600/80 tw-dark:text-emerald-500/80 tw-mt-1 tw-leading-none tw-font-mono tw-truncate tw-max-w-[250px]">
                        {item[col.thirdLabelKey]}
                    </span>
                )}
            </div>
        );
    }

    // Tags Display
    if (col.type === 'tags') {
        const tagList = String(value || '').split(',').map(s => s.trim()).filter(Boolean);
        if (tagList.length === 0) return <span className="tw-text-slate-400">-</span>;

        return (
            <div className="tw-flex tw-flex-nowrap tw-gap-1 tw-py-1 tw-overflow-hidden">
                {tagList.map(tag => (
                    <span key={tag} className="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-md tw-text-[10px] tw-font-bold tw-bg-blue-50 tw-text-blue-600 tw-border tw-border-blue-100 tw-dark:bg-blue-900/30 tw-dark:text-blue-300 tw-dark:border-blue-800 tw-whitespace-nowrap">
                        {tag}
                    </span>
                ))}
            </div>
        );
    }

    // Days Display (Weekly Schedule)
    if (col.type === 'days') {
        const days = normalizeDays(value);
        if (days.length === 0) return <span className="tw-text-slate-300">-</span>;

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const extraDays = ['Hol', 'Oth'];
        const dayLabels: Record<string, string> = {
            'Mon': '月', 'Tue': '火', 'Wed': '水', 'Thu': '木', 'Fri': '金', 'Sat': '土', 'Sun': '日',
            'Hol': '祝', 'Oth': '他'
        };

        const specialDaysMap: Record<string, number[]> = {};
        const regularDays = days.filter(d => {
            const match = d.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)([1-5])$/);
            if (match) {
                const day = match[1];
                const week = parseInt(match[2], 10);
                if (!specialDaysMap[day]) specialDaysMap[day] = [];
                specialDaysMap[day].push(week);
                return false;
            }
            return true;
        });

        return (
            <div className="tw-flex tw-flex-nowrap tw-gap-0.5">
                {weekDays.map(d => {
                    const isActive = regularDays.includes(d);
                    let activeColor = 'bg-blue-500 text-white';
                    if (d === 'Sat') activeColor = 'bg-cyan-500 text-white';
                    if (d === 'Sun') activeColor = 'bg-rose-500 text-white';

                    return (
                        <div
                            key={d}
                            className={`w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold transition-all ${isActive
                                ? activeColor + ' shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                                : 'bg-slate-100 text-slate-300 dark:bg-slate-800'
                                }`}
                        >
                            {dayLabels[d]}
                        </div>
                    );
                })}
                {extraDays.map(d => {
                    const isActive = regularDays.includes(d);
                    if (!isActive) return null; // 祝・他は設定されている時のみ表示する
                    const activeColor = d === 'Hol' ? 'bg-rose-600 text-white' : 'bg-purple-600 text-white';

                    return (
                        <div
                            key={d}
                            className={`px-1.5 h-4 ml-0.5 rounded-sm flex items-center justify-center text-[9px] font-bold transition-all ${activeColor + ' shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
                                }`}
                        >
                            {dayLabels[d]}
                        </div>
                    );
                })}
                {Object.entries(specialDaysMap).map(([day, weeks]) => {
                    weeks.sort((a, b) => a - b);
                    const label = `第${weeks.join(',')}(${dayLabels[day]})`;
                    return (
                        <div
                            key={`${day}-special`}
                            className="tw-px-1.5 tw-h-4 tw-ml-0.5 tw-rounded-sm tw-flex tw-items-center tw-justify-center tw-text-[9px] tw-font-bold tw-bg-indigo-100 tw-text-indigo-700 tw-border tw-border-indigo-200 tw-dark:bg-indigo-900/40 tw-dark:text-indigo-300 tw-dark:border-indigo-800 tw-shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                        >
                            {label}
                        </div>
                    );
                })}
            </div>
        );
    }


    return (
        <span className="tw-text-slate-600 tw-dark:text-slate-400">
            {col.optionLabels?.[String(value)] || value || '-'}
        </span>
    );
}

function MasterForm({ schema, initialData, onSave, onDelete, onCancel, isSaving }: {
    schema: MasterSchema,
    initialData: Record<string, any> | null,
    onSave: (data: Record<string, any>) => Promise<void>,
    onDelete?: () => Promise<void>,
    onCancel: () => void,
    isSaving: boolean
}) {
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initial = { ...(initialData || {}) };
        schema.fields.forEach(f => {
            if (f.type === 'days') {
                initial[f.name] = normalizeDays(initial[f.name]);
            }
        });
        return initial;
    });

    const [customWeek, setCustomWeek] = useState<string>('1');
    const [customDay, setCustomDay] = useState<string>('Mon');


    // 品目マスタのデータを取得するためのフック（タグ選択用）
    const { data: allItems } = useMasterCRUD(MASTER_SCHEMAS.items);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const toggleTag = (fieldName: string, tagName: string) => {
        const currentValue = String(formData[fieldName] || '');
        const currentTags = currentValue.split(',').map(s => s.trim()).filter(Boolean);
        let newTags;
        if (currentTags.includes(tagName)) {
            newTags = currentTags.filter(t => t !== tagName);
        } else {
            newTags = [...currentTags, tagName];
        }
        setFormData({ ...formData, [fieldName]: newTags.join(',') });
    };

    return (
        <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-h-full">
            <div className="tw-grid tw-grid-cols-1 tw-md:grid-cols-2 tw-gap-x-6 tw-gap-y-4">
                {schema.fields.map(field => (
                    <div key={field.name} className={`${field.className || ''} flex flex-col`}>
                        <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700 tw-dark:text-slate-300 tw-mb-1">
                            {field.label} {field.required && <span className="tw-text-red-500">*</span>}
                        </label>

                        {field.type === 'tags' ? (
                            <div className="tw-space-y-2">
                                <div className="tw-flex tw-flex-wrap tw-gap-2 tw-p-3 tw-min-h-[46px] tw-rounded-xl tw-bg-slate-50 tw-dark:bg-slate-800 tw-border-2 tw-border-dashed tw-border-slate-200 tw-dark:border-slate-700">
                                    {String(formData[field.name] || '').split(',').map(s => s.trim()).filter(Boolean).map(tag => (
                                        <span key={tag} className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-rounded-lg tw-bg-blue-600 tw-text-white tw-text-xs tw-font-bold tw-animate-in tw-zoom-in-50">
                                            {tag}
                                            <button type="button" onClick={() => toggleTag(field.name, tag)} className="tw-hover:text-blue-200">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    {String(formData[field.name] || '').length === 0 && (
                                        <span className="tw-text-slate-400 tw-text-xs tw-mt-1">下のリストから選択してください</span>
                                    )}
                                </div>
                                <div className="tw-flex tw-flex-wrap tw-gap-1.5 tw-max-h-32 tw-overflow-y-auto tw-p-1">
                                    {allItems.map(item => {
                                        const isSelected = String(formData[field.name] || '').split(',').map(s => s.trim()).includes(item.name);
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => toggleTag(field.name, item.name)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'
                                                    }`}
                                            >
                                                {item.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : field.type === 'select' && field.lookup ? (
                            <LookupSelect
                                field={field}
                                value={formData[field.name] || ''}
                                onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                            />
                        ) : field.type === 'select' ? (
                            <select
                                className="tw-w-full tw-px-4 tw-py-2 tw-rounded-xl tw-bg-slate-50 tw-dark:bg-slate-800 tw-border-none tw-focus:ring-2 tw-focus:ring-blue-500 tw-text-slate-900 tw-dark:text-white tw-disabled:opacity-50 tw-disabled:cursor-not-allowed"
                                value={formData[field.name] || ''}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                required={field.required}
                                disabled={field.updatable === false && !!initialData}
                            >
                                <option value="">選択してください</option>
                                {field.options?.map(opt => (
                                    <option key={opt} value={opt}>
                                        {field.optionLabels?.[opt] || opt}
                                    </option>
                                ))}
                            </select>
                        ) : field.type === 'days' ? (
                            <div className="tw-space-y-4 tw-p-2 tw-bg-slate-50/50 tw-dark:bg-slate-900/50 tw-rounded-xl tw-border tw-border-slate-100 tw-dark:border-slate-800">
                                <div>
                                    <div className="tw-text-[10px] tw-text-slate-500 tw-mb-1.5 tw-font-bold tw-flex tw-items-center tw-gap-1"><Calendar size={12} /> 基本の回収曜日</div>
                                    <div className="tw-flex tw-flex-wrap tw-gap-1.5">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => {
                                            const labels: Record<string, string> = { 'Mon': '月', 'Tue': '火', 'Wed': '水', 'Thu': '木', 'Fri': '金', 'Sat': '土', 'Sun': '日' };
                                            const currentDays = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                                            const isSelected = currentDays.includes(d);

                                            return (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => {
                                                        const nextDays = isSelected
                                                            ? currentDays.filter((day: string) => day !== d)
                                                            : [...currentDays, d];
                                                        setFormData({ ...formData, [field.name]: nextDays });
                                                    }}
                                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center border-2 ${isSelected
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                                                        : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700'
                                                        }`}
                                                >
                                                    {labels[d]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="tw-pt-3 tw-border-t tw-border-slate-200 tw-dark:border-slate-700">
                                    <div className="tw-text-[10px] tw-text-slate-500 tw-mb-1.5 tw-font-bold tw-flex tw-items-center tw-gap-1"><AlertTriangle size={12} /> 特殊稼働指定</div>
                                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                                        {['Hol', 'Oth'].map(d => {
                                            const labels: Record<string, string> = { 'Hol': '祝日稼働', 'Oth': '不定期・その他' };
                                            const currentDays = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                                            const isSelected = currentDays.includes(d);
                                            const activeClass = d === 'Hol' ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-purple-100 text-purple-700 border-purple-300';

                                            return (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => {
                                                        const nextDays = isSelected
                                                            ? currentDays.filter((day: string) => day !== d)
                                                            : [...currentDays, d];
                                                        setFormData({ ...formData, [field.name]: nextDays });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 flex items-center gap-1.5 ${isSelected
                                                        ? activeClass + ' shadow-sm scale-105'
                                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                                                        }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${isSelected ? (d === 'Hol' ? 'bg-rose-500' : 'bg-purple-500') : 'bg-slate-200 dark:bg-slate-600'}`} />
                                                    {labels[d]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="tw-pt-3 tw-border-t tw-border-slate-200 tw-dark:border-slate-700">
                                    <div className="tw-text-[10px] tw-text-slate-500 tw-mb-1.5 tw-font-bold tw-flex tw-items-center tw-gap-1"><Clock size={12} /> 変則的な周期指定（第N曜日）</div>
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                                        <select
                                            aria-label="第N週の選択"
                                            className="tw-px-2 tw-py-1.5 tw-text-xs tw-rounded-lg tw-bg-white tw-dark:bg-slate-800 tw-border-2 tw-border-slate-200 tw-dark:border-slate-700 tw-focus:ring-1 tw-focus:border-indigo-500 tw-focus:ring-indigo-500 tw-text-slate-700 tw-dark:text-white"
                                            value={customWeek}
                                            onChange={(e) => setCustomWeek(e.target.value)}
                                        >
                                            {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>第{w}週</option>)}
                                        </select>
                                        <select
                                            aria-label="曜日の選択"
                                            className="tw-px-2 tw-py-1.5 tw-text-xs tw-rounded-lg tw-bg-white tw-dark:bg-slate-800 tw-border-2 tw-border-slate-200 tw-dark:border-slate-700 tw-focus:ring-1 tw-focus:border-indigo-500 tw-focus:ring-indigo-500 tw-text-slate-700 tw-dark:text-white"
                                            value={customDay}
                                            onChange={(e) => setCustomDay(e.target.value)}
                                        >
                                            <option value="Mon">月曜日</option>
                                            <option value="Tue">火曜日</option>
                                            <option value="Wed">水曜日</option>
                                            <option value="Thu">木曜日</option>
                                            <option value="Fri">金曜日</option>
                                            <option value="Sat">土曜日</option>
                                            <option value="Sun">日曜日</option>
                                        </select>
                                        <button
                                            type="button"
                                            aria-label="変則周期を追加"
                                            onClick={() => {
                                                const token = `${customDay}${customWeek}`;
                                                const currentDays = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                                                if (!currentDays.includes(token)) {
                                                    setFormData({ ...formData, [field.name]: [...currentDays, token] });
                                                }
                                            }}
                                            className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-rounded-lg tw-bg-indigo-50 tw-text-indigo-700 tw-border tw-border-indigo-200 tw-hover:bg-indigo-100 tw-active:scale-95 tw-dark:bg-indigo-900/40 tw-dark:text-indigo-300 tw-dark:border-indigo-800 tw-transition-all"
                                        >
                                            追加
                                        </button>
                                    </div>
                                    <div className="tw-flex tw-flex-wrap tw-gap-1.5">
                                        {/* Display selected special tokens */}
                                        {(Array.isArray(formData[field.name]) ? formData[field.name] : []).filter((d: string) => /^[A-Z][a-z]{2}[1-5]$/.test(d)).map((d: string) => {
                                            const dayLabels: Record<string, string> = { 'Mon': '月', 'Tue': '火', 'Wed': '水', 'Thu': '木', 'Fri': '金', 'Sat': '土', 'Sun': '日' };
                                            const day = d.substring(0, 3);
                                            const week = d.substring(3);
                                            return (
                                                <span key={d} className="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-md tw-text-[10px] tw-font-bold tw-bg-indigo-100 tw-text-indigo-700 tw-border tw-border-indigo-200 tw-dark:bg-indigo-900/40 tw-dark:text-indigo-300 tw-dark:border-indigo-800 tw-shadow-sm tw-animate-in tw-zoom-in-50">
                                                    第{week}({dayLabels[day] || day})
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentDays = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                                                            setFormData({ ...formData, [field.name]: currentDays.filter((day: string) => day !== d) });
                                                        }}
                                                        className="tw-hover:text-indigo-400 tw-bg-indigo-200/50 tw-dark:bg-indigo-800/50 tw-rounded-full tw-p-0.5"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : field.type === 'switch' ? (
                            <div className="tw-flex tw-items-center tw-h-[42px]">
                                <label className="tw-relative tw-inline-flex tw-items-center tw-cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="tw-sr-only tw-peer"
                                        checked={!!formData[field.name]}
                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                                        disabled={field.updatable === false && !!initialData}
                                    />
                                    <div className="tw-w-11 tw-h-6 tw-bg-slate-200 tw-peer-focus:outline-none tw-peer-focus:ring-4 tw-peer-focus:ring-blue-300 tw-dark:peer-focus:ring-blue-800 tw-rounded-full tw-peer tw-dark:bg-slate-700 tw-peer-checked:after:translate-x-full tw-peer-checked:after:border-white tw-after:content-[''] tw-after:absolute tw-after:top-[2px] tw-after:left-[2px] tw-after:bg-white tw-after:border-gray-300 tw-after:border tw-after:rounded-full tw-after:h-5 tw-after:w-5 tw-after:transition-all tw-dark:border-gray-600 tw-peer-checked:bg-blue-600 tw-peer-disabled:opacity-50"></div>
                                    <span className="tw-ml-3 tw-text-sm tw-font-medium tw-text-slate-500 tw-dark:text-slate-400">
                                        {formData[field.name] ? '有効' : '無効'}
                                    </span>
                                </label>
                            </div>
                        ) : (
                            <input
                                type={field.type}
                                className="tw-w-full tw-px-4 tw-py-2 tw-rounded-xl tw-bg-slate-50 tw-dark:bg-slate-800 tw-border-none tw-focus:ring-2 tw-focus:ring-blue-500 tw-text-slate-900 tw-dark:text-white tw-disabled:opacity-50 tw-disabled:cursor-not-allowed"
                                value={formData[field.name] || ''}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                required={field.required}
                                placeholder={field.placeholder}
                                disabled={field.updatable === false && !!initialData}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* 入場制限セクション（回収先マスタ・編集時のみ） */}
            {schema.rpcTableName === 'master_collection_points' && initialData && (
                <PointAccessSection pointId={initialData.id} />
            )}

            <div className="tw-flex tw-items-center tw-justify-between tw-mt-8 tw-pt-6 tw-border-t tw-border-slate-100 tw-dark:border-slate-800 tw-shrink-0">
                <div>
                    {onDelete && schema.fields.some(f => f.required && String(formData[f.name] || '').toLowerCase().includes('test')) && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="tw-px-6 tw-py-2 tw-text-red-600 tw-font-bold tw-hover:bg-red-50 tw-dark:hover:bg-red-900/20 tw-rounded-xl tw-border tw-border-red-200 tw-dark:border-red-800 tw-transition-colors"
                        >
                            データを削除
                        </button>
                    )}
                </div>
                <div className="tw-flex tw-items-center tw-gap-3">
                    <button type="button" onClick={onCancel} className="tw-px-6 tw-py-2 tw-text-slate-500 tw-font-bold tw-hover:bg-slate-100 tw-dark:hover:bg-slate-800 tw-rounded-xl tw-transition-colors">
                        キャンセル
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className={`px-8 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? (
                            <>
                                <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                                保存中...
                            </>
                        ) : (
                            '保存する'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}

function LookupSelect({ field, value, onChange }: {
    field: any, // MasterField from schema
    value: string,
    onChange: (val: string) => void
}) {
    const lookupSchema = MASTER_SCHEMAS[field.lookup.schemaKey];
    const { data: options, loading } = useMasterCRUD(lookupSchema);

    return (
        <select
            className="tw-w-full tw-px-4 tw-py-2 tw-rounded-xl tw-bg-slate-50 tw-dark:bg-slate-800 tw-border-none tw-focus:ring-2 tw-focus:ring-blue-500 tw-text-slate-900 tw-dark:text-white tw-disabled:opacity-50"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={loading}
        >
            <option value="">{loading ? '読み込み中...' : '選択してください'}</option>
            {options.map((opt: any) => (
                <option key={opt[field.lookup.valueKey]} value={opt[field.lookup.valueKey]}>
                    {opt[field.lookup.labelKey]}
                </option>
            ))}
        </select>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 入場制限セクション（PointAccessSection）
// 回収先マスタ編集モーダル内に表示。デフォルト折りたたみ（制約なし）。
// ─────────────────────────────────────────────────────────────────────────────
function PointAccessSection({ pointId }: { pointId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [newDriverId, setNewDriverId] = useState('');
    const [newVehicleId, setNewVehicleId] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        // 入場制限一覧の取得
        supabase.from('point_access_permissions')
            .select('*, profile:staffs(id, name), vehicle:vehicles(id, callsign, number)')
            .eq('point_id', pointId).eq('is_active', true)
            .then(({ data }) => setPermissions(data || []));
        // スタッフ（旧ドライバー）一覧
        supabase.from('staffs').select('id, name').then(({ data }) =>
            setDrivers((data || []).map((d: any) => ({ id: d.id, name: d.name || d.id })))
        );
        // 車両一覧
        supabase.from('vehicles').select('id, number, callsign').then(({ data }) =>
            setVehicles(data || [])
        );
    }, [isOpen, pointId]);

    const handleAdd = async () => {
        if (!newDriverId || !newVehicleId) return;
        setSaving(true);
        await (supabase.from('point_access_permissions') as any).upsert(
            { point_id: pointId, driver_id: newDriverId, vehicle_id: newVehicleId, is_active: true },
            { onConflict: 'point_id,driver_id' }
        );
        setNewDriverId(''); setNewVehicleId('');
        // 再取得
        const { data } = await (supabase.from('point_access_permissions') as any)
            .select('*, profile:staffs(id, name), vehicle:vehicles(id, callsign, number)')
            .eq('point_id', pointId).eq('is_active', true);
        setPermissions(data || []);
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        await (supabase.from('point_access_permissions') as any).update({ is_active: false }).eq('id', id);
        setPermissions(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="tw-col-span-2 tw-mt-2 tw-border tw-border-slate-200 tw-dark:border-slate-700 tw-rounded-xl tw-overflow-hidden">
            {/* トグルヘッダー */}
            <button
                type="button"
                onClick={() => setIsOpen(p => !p)}
                className="tw-w-full tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-bg-slate-50 tw-dark:bg-slate-800 tw-hover:bg-slate-100 tw-dark:hover:bg-slate-700 tw-transition-colors"
            >
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold tw-text-slate-600 tw-dark:text-slate-300">
                    <Shield size={16} className={permissions.length > 0 ? 'text-red-500' : 'text-slate-400'} />
                    入場制限設定
                    {permissions.length > 0 && (
                        <span className="tw-ml-1 tw-px-2 tw-py-0.5 tw-text-xs tw-bg-red-100 tw-text-red-700 tw-rounded-full tw-font-bold">
                            {permissions.length}件の制限あり
                        </span>
                    )}
                    {permissions.length === 0 && (
                        <span className="tw-ml-1 tw-text-xs tw-text-slate-400 tw-font-normal">制約なし（デフォルト）</span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 展開コンテンツ */}
            {isOpen && (
                <div className="tw-p-4 tw-space-y-4 tw-bg-white tw-dark:bg-slate-900">
                    <p className="tw-text-xs tw-text-slate-500 tw-dark:text-slate-400">
                        特定ドライバーが訪問する際に必須となる車両を登録します。
                        登録のないドライバーは制約なしで配車可能です。
                    </p>

                    {/* 既存ルール一覧 */}
                    {permissions.length > 0 && (
                        <div className="tw-space-y-2">
                            {permissions.map((p: any) => {
                                const staffName = p.profile?.name || p.driver_id;
                                const vehicleLabel = p.vehicle ? `${p.vehicle.number}（${p.vehicle.callsign || ''}）` : p.vehicle_id;
                                return (
                                    <div key={p.id} className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-px-3 tw-py-2 tw-bg-red-50 tw-dark:bg-red-900/20 tw-border tw-border-red-100 tw-dark:border-red-800 tw-rounded-lg">
                                        <div className="tw-text-sm">
                                            <span className="tw-font-bold tw-text-slate-700 tw-dark:text-slate-200">{staffName}</span>
                                            <span className="tw-text-slate-400 tw-mx-2">→</span>
                                            <span className="tw-font-mono tw-text-red-700 tw-dark:text-red-300 tw-font-bold">{vehicleLabel}</span>
                                            <span className="tw-ml-2 tw-text-xs tw-text-red-600">必須</span>
                                        </div>
                                        <button type="button" onClick={() => handleDelete(p.id)}
                                            className="tw-p-1.5 tw-hover:bg-red-100 tw-dark:hover:bg-red-900/40 tw-rounded-lg tw-text-red-400 tw-hover:text-red-600 tw-transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 新規追加フォーム */}
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <select value={newDriverId} onChange={e => setNewDriverId(e.target.value)}
                            className="tw-flex-1 tw-px-3 tw-py-2 tw-text-sm tw-rounded-lg tw-bg-slate-50 tw-dark:bg-slate-800 tw-border tw-border-slate-200 tw-dark:border-slate-700 tw-focus:ring-2 tw-focus:ring-blue-500">
                            <option value="">ドライバーを選択</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <span className="tw-text-slate-400 tw-font-bold tw-text-sm">→</span>
                        <select value={newVehicleId} onChange={e => setNewVehicleId(e.target.value)}
                            className="tw-flex-1 tw-px-3 tw-py-2 tw-text-sm tw-rounded-lg tw-bg-slate-50 tw-dark:bg-slate-800 tw-border tw-border-slate-200 tw-dark:border-slate-700 tw-focus:ring-2 tw-focus:ring-blue-500">
                            <option value="">車両を選択</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.number}（{v.callsign || '-'}）</option>)}
                        </select>
                        <button type="button" onClick={handleAdd} disabled={!newDriverId || !newVehicleId || saving}
                            className="tw-px-3 tw-py-2 tw-bg-blue-600 tw-text-white tw-text-sm tw-font-bold tw-rounded-lg tw-disabled:opacity-40 tw-hover:bg-blue-700 tw-transition-colors tw-flex tw-items-center tw-gap-1">
                            <Plus size={14} />追加
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
