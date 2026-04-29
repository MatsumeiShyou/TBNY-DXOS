import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface SortConfig {
    column: string;
    ascending: boolean;
}

interface UseMasterCRUDOptions {
    viewName: string;
    rpcTableName: string;
    rpcName?: string;
    searchFields?: string[];
    initialSort?: SortConfig;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataItem = Record<string, any>;

export function useMasterCRUD({
    viewName,
    rpcTableName,
    rpcName = 'rpc_execute_master_update',
    searchFields = [],
    initialSort = { column: 'name', ascending: true }
}: UseMasterCRUDOptions) {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [data, setData] = useState<DataItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            let query = supabase.from(viewName).select('*');

            // T-09 FIX: 空catchを警告ログに置換。is_activeカラムが存在しないビューでの
            // サイレント全件返却を防止し、デバッグ可能にする。
            try {
                query = query.eq('is_active', true);
            } catch (e) {
                console.warn(`[useMasterCRUD] is_active filter skipped for ${viewName}:`, e);
            }

            if (initialSort) query = query.order(initialSort.column, { ascending: initialSort.ascending });

            const { data: result, error } = await query;
            if (error) throw error;
            setData(result || []);
        } catch (e) {
            console.error(`Fetch Error [${viewName}]:`, e);
            showNotification(`データの取得に失敗しました [${viewName}]`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [viewName, initialSort, showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenAdd = () => { setSelectedItem(null); setReason(''); setIsModalOpen(true); };
    const handleOpenEdit = (item: DataItem) => { setSelectedItem(item); setReason(''); setIsModalOpen(true); };
    const handleOpenDelete = (item: DataItem) => { setSelectedItem(item); setReason(''); setIsDeleteModalOpen(true); };

    const handleSave = async (
        formData: DataItem,
        coreDataFactory: (fd: DataItem) => DataItem,
        extDataFactory: ((fd: DataItem) => DataItem) | null,
        decisionTypeOverride: string | null = null
    ) => {
        if (!reason) { showNotification("変更理由を入力してください (SDR必須)", "warning"); return; }
        if (!currentUser) { showNotification("認証エラー: ログインしてください", "error"); return; }
        setIsSubmitting(true);
        try {
            const isEdit = !!selectedItem;
            const coreData = coreDataFactory(formData);
            const extData = extDataFactory ? extDataFactory(formData) : {};

            const { error } = await supabase.rpc(rpcName, {
                p_table_name: rpcTableName,
                p_id: selectedItem?.id || null,
                p_core_data: coreData,
                p_ext_data: extData,
                p_decision_type: decisionTypeOverride || (isEdit ? 'MASTER_UPDATE' : 'MASTER_REGISTRATION'),
                p_reason: reason,
                p_user_id: currentUser.id
            });

            if (error) throw error;
            await fetchData();
            setIsModalOpen(false);
            showNotification(isEdit ? "マスタを更新しました" : "マスタを新規登録しました", "success");
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            showNotification("保存エラー: " + message, "error");
        } finally { setIsSubmitting(false); }
    };

    const handleArchive = async (idField = 'id') => {
        if (!reason) { showNotification("アーカイブ理由を入力してください", "warning"); return; }
        if (!currentUser || !selectedItem) { showNotification("認証エラー", "error"); return; }
        setIsSubmitting(true);
        try {
            const { error } = await supabase.rpc(rpcName, {
                p_table_name: rpcTableName,
                p_id: selectedItem[idField],
                p_core_data: { is_active: false },
                p_ext_data: {},
                p_decision_type: 'MASTER_ARCHIVE',
                p_reason: reason,
                p_user_id: currentUser.id
            });

            if (error) throw error;
            await fetchData();
            setIsDeleteModalOpen(false);
            showNotification("データをアーカイブしました", "success");
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            showNotification("アーカイブエラー: " + message, "error");
        } finally { setIsSubmitting(false); }
    };

    return {
        data: data.filter(item => {
            if (!searchTerm) return true;
            return searchFields.some(field => String(item[field]).toLowerCase().includes(searchTerm.toLowerCase()));
        }),
        isLoading, searchTerm, setSearchTerm, isModalOpen, setIsModalOpen, isDeleteModalOpen, setIsDeleteModalOpen,
        selectedItem, reason, setReason, isSubmitting, handleOpenAdd, handleOpenEdit, handleOpenDelete, handleSave, handleArchive, refresh: fetchData
    };
}
