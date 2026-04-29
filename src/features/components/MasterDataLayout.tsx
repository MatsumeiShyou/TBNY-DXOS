import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, Info } from 'lucide-react';
import { supabase } from '../../shared/lib/supabase/client';
import { Modal } from './Modal';
import { useMasterCRUD } from '../hooks/useMasterCRUD';
import { useNotification } from '../hooks/useNotification';
import type { MasterSchema, MasterColumn } from '../config/masterSchema';
import '../../shared/styles/master-data.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataItem = Record<string, any>;

interface MasterDataLayoutProps {
    schema: MasterSchema;
    customRenderers?: Record<string, (item: DataItem) => React.ReactNode>;
}

export const MasterDataLayout = ({ schema, customRenderers = {} }: MasterDataLayoutProps) => {
    const [extraData, setExtraData] = useState<Record<string, DataItem[]>>({});

    // T-02 FIX: useNotification をコンポーネントトップレベルで呼び出す
    // (旧コードでは onSave イベントハンドラ内部で呼び出しており Rules of Hooks 違反)
    const { showNotification } = useNotification();

    const {
        data: items,
        isLoading,
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        selectedItem,
        reason,
        setReason,
        isSubmitting,
        handleOpenAdd: baseOpenAdd,
        handleOpenEdit: baseOpenEdit,
        handleOpenDelete,
        handleSave,
        handleArchive
    } = useMasterCRUD({
        viewName: schema.viewName,
        rpcTableName: schema.rpcTableName,
        searchFields: schema.searchFields,
        initialSort: schema.initialSort
    });

    const [formData, setFormData] = useState<DataItem>({});

    useEffect(() => {
        const fetchExtraData = async () => {
            const selectFields = schema.fields.filter(f => f.type === 'select' && f.optionsSource);
            for (const field of selectFields) {
                try {
                    const { data } = await supabase.from(field.optionsSource!).select('*').order('name');
                    if (data) {
                        setExtraData(prev => ({ ...prev, [field.optionsSource!]: data }));
                    }
                } catch (e) { console.error(e); }
            }
        };
        fetchExtraData();
    }, [schema.fields]);

    const handleOpenAdd = () => {
        const initialForm: DataItem = {};
        schema.fields.forEach(f => {
            if (typeof f.defaultValue === 'function') {
                initialForm[f.name] = f.defaultValue(items);
            } else {
                initialForm[f.name] = f.defaultValue || '';
            }
        });
        setFormData(initialForm);
        baseOpenAdd();
    };

    const handleOpenEdit = (item: DataItem) => {
        const editForm: DataItem = {};
        schema.fields.forEach(f => {
            editForm[f.name] = item[f.name] || '';
        });
        setFormData(editForm);
        baseOpenEdit(item);
    };

    const onSave = async (e: FormEvent) => {
        e.preventDefault();

        const missingRequired = schema.fields.filter(f => f.required && !formData[f.name]);
        if (missingRequired.length > 0) {
            showNotification(`「${missingRequired[0].label}」は入力必須項目です。`, "warning");
            return;
        }

        const coreDataFactory = (fd: DataItem) => {
            const data: DataItem = { ...fd, is_active: true };
            schema.fields.filter(f => f.type === 'number').forEach(f => {
                data[f.name] = fd[f.name] ? parseFloat(fd[f.name]) : null;
            });
            return data;
        };

        await handleSave(formData, coreDataFactory, null);
    };

    const renderValue = (item: DataItem, col: MasterColumn): React.ReactNode => {
        if (customRenderers[col.key]) return customRenderers[col.key](item);

        if (col.type === 'badge') {
            const val = item[col.key];
            if (!val) return '-';
            return <span className="master-badge">{String(val)}</span>;
        }

        const val = col.key.split('.').reduce<unknown>((obj, key) => {
            if (obj && typeof obj === 'object') return (obj as DataItem)[key];
            return undefined;
        }, item);
        return val != null ? String(val) : '-';
    };

    return (
        <div className="master-layout">
            <header className="master-header">
                <div>
                    <h1 className="master-header__title">
                        {schema.title}
                        <span className="master-header__version">UNIFIED-MODEL v3.0</span>
                    </h1>
                    <p className="master-header__description">{schema.description}</p>
                </div>
                <button onClick={handleOpenAdd} className="master-header__add-btn" type="button">
                    <Plus size={20} />
                    新規追加
                </button>
            </header>

            <div className="master-table-container">
                <div className="master-search">
                    <Search size={18} className="master-search__icon" />
                    <input
                        type="text"
                        placeholder="検索ワードを入力..."
                        className="master-search__input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="master-loading">
                        <Loader2 className="master-loading__spinner" size={32} />
                        <span>データを読み込み中...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="master-empty">
                        該当するデータが見つかりません
                    </div>
                ) : (
                    <table className="master-table">
                        <thead className="master-table__head">
                            <tr>
                                {schema.columns.map(col => (
                                    <th key={col.key} className="master-table__th">{col.label}</th>
                                ))}
                                <th className="master-table__th master-table__th--action">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="master-table__body">
                            {items.map((item: DataItem) => (
                                <tr key={item.id} className="master-table__row">
                                    {schema.columns.map(col => (
                                        <td key={col.key} className="master-table__td">
                                            {renderValue(item, col)}
                                        </td>
                                    ))}
                                    <td className="master-table__td master-table__td--action">
                                        <div className="master-actions">
                                            <button onClick={() => handleOpenEdit(item)} className="master-actions__btn master-actions__btn--edit" type="button"><Edit2 size={16} /></button>
                                            <button onClick={() => handleOpenDelete(item)} className="master-actions__btn master-actions__btn--delete" type="button"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? "マスタ更新設定" : "新規マスタ登録"}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="modal-btn modal-btn--cancel" type="button">キャンセル</button>
                        <button onClick={onSave} disabled={isSubmitting || !reason} className="modal-btn modal-btn--submit" type="button">
                            {isSubmitting && <Loader2 size={18} className="master-loading__spinner" />}
                            送信
                        </button>
                    </>
                }
            >
                <div className="master-form">
                    <div className="master-form__grid">
                        {schema.fields.map(field => (
                            <div key={field.name} className={`master-form__field ${field.className || ''}`}>
                                <label className="master-form__label">
                                    {field.label} {field.required && <span className="master-form__required" />}
                                </label>
                                {field.type === 'select' ? (
                                    <select
                                        className="master-form__select"
                                        value={formData[field.name] ?? ''}
                                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                    >
                                        <option value="">{field.placeholder || '--- 選択 ---'}</option>
                                        {field.options
                                            ? field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)
                                            : extraData[field.optionsSource!]?.map((opt: DataItem) => <option key={opt.id} value={opt.id}>{opt.name}</option>)
                                        }
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder || ''}
                                        className="master-form__input"
                                        value={formData[field.name] ?? ''}
                                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="master-form__audit">
                        <label className="master-form__audit-label">
                            <Info size={14} /> Audit Reason (SDR義務)
                        </label>
                        <textarea
                            className="master-form__audit-textarea"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder={schema.audit_hint || "この変更が行われる背景・理由を入力してください"}
                        />
                    </div>
                </div>
            </Modal>

            {/* 削除確認モーダル */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="アーカイブ確認"
                footer={
                    <>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="modal-btn modal-btn--cancel" type="button">キャンセル</button>
                        <button onClick={() => handleArchive()} disabled={isSubmitting || !reason} className="modal-btn modal-btn--danger" type="button">
                            {isSubmitting && <Loader2 size={18} className="master-loading__spinner" />}
                            アーカイブ
                        </button>
                    </>
                }
            >
                <div className="master-form__audit">
                    <label className="master-form__audit-label">
                        <Info size={14} /> アーカイブ理由 (SDR義務)
                    </label>
                    <textarea
                        className="master-form__audit-textarea"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="アーカイブする理由を入力してください"
                    />
                </div>
            </Modal>
        </div>
    );
};
