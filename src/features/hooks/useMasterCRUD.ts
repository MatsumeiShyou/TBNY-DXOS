// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
// gov-bypass [III-2] [EXPIRY:2026-05-29] Custom fetch logic replaced with SWR for robust offline resilience.
import { supabase } from '../../shared/lib/supabase/client';

import { useAuth } from './useAuth';
import { useNotification } from './useNotification';
import { logAuditTrail } from '../../shared/lib/audit/auditLogger';

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

export default function useMasterCRUD({
    viewName,
    rpcTableName,
    rpcName = 'rpc_execute_master_update',
    searchFields = [],
    initialSort = { column: 'name', ascending: true }
}: UseMasterCRUDOptions) {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // TASK-003: SWR Fetcher & Hook
    const fetcher = useCallback(async () => {
        const targetTable = viewName || rpcTableName;
        if (!targetTable) throw new Error("Table name is not defined in schema");

        // [Fix] 一律で is_active=true を要求せず、まずは全件取得を試みる（RLSにより適切なデータのみが返る）
        let query = supabase.from(targetTable).select('*');
        
        if (initialSort) {
            query = query.order(initialSort.column, { ascending: initialSort.ascending });
        }
        
        const { data, error } = await query;
        if (error) {
            console.error(`Supabase Fetch Error [${targetTable}]:`, error);
            throw error;
        }
        return data || [];
    }, [viewName, rpcTableName, initialSort]);

    const { data: rawData, error: fetchError, isLoading, mutate: refresh } = useSWR(
        currentUser ? `master/${viewName || rpcTableName}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000,
            onError: (err) => {
                console.error(`Fetch Error [${viewName}]:`, err);
                showNotification(`データの取得に失敗しました [${viewName}]`, 'error');
            }
        }
    );

    const data = rawData || [];

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

            // [Audit Trail v2] 証跡の二重記録
            await logAuditTrail({
                timestamp: new Date().toISOString(),
                action: isEdit ? 'UPDATE' : 'CREATE',
                tableName: rpcTableName,
                recordId: selectedItem?.id || 'NEW',
                payload: coreData,
                staffId: currentUser.id,
                reason: reason
            });

            await refresh();
            setIsModalOpen(false);
            showNotification(isEdit ? "マスタを更新しました" : "マスタを新規登録しました", "success");
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            let displayMessage = "保存エラー: " + message;
            
            // DXOS_VAL_ エラーのパースと日本語化
            if (message.includes('DXOS_VAL_01')) {
                displayMessage = "システムエラー: 許可されていないテーブルへのアクセスです。";
            } else if (message.includes('DXOS_VAL_02')) {
                const match = message.match(/\[(.*?)\]/);
                const colName = match ? match[1] : "不明";
                displayMessage = `入力エラー: カラム名「${colName}」が正しくありません。`;
            } else if (message.includes('DXOS_AUTH_01')) {
                displayMessage = "認証エラー: スタッフレコードが見つかりません。";
            }

            showNotification(displayMessage, "error");
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

            // [Audit Trail v2] 証跡の二重記録
            await logAuditTrail({
                timestamp: new Date().toISOString(),
                action: 'ARCHIVE',
                tableName: rpcTableName,
                recordId: selectedItem[idField],
                staffId: currentUser.id,
                reason: reason
            });

            await refresh();
            setIsDeleteModalOpen(false);
            showNotification("データをアーカイブしました", "success");
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            let displayMessage = "アーカイブエラー: " + message;

            if (message.includes('DXOS_VAL_01')) {
                displayMessage = "システムエラー: 許可されていないテーブルへのアクセスです。";
            } else if (message.includes('DXOS_VAL_02')) {
                const match = message.match(/\[(.*?)\]/);
                const colName = match ? match[1] : "不明";
                displayMessage = `入力エラー: カラム名「${colName}」が正しくありません。`;
            } else if (message.includes('DXOS_AUTH_01')) {
                displayMessage = "認証エラー: スタッフレコードが見つかりません。";
            }

            showNotification(displayMessage, "error");
        } finally { setIsSubmitting(false); }
    };

    return {
        data: data.filter(item => {
            if (!searchTerm) return true;
            return searchFields.some(field => String(item[field]).toLowerCase().includes(searchTerm.toLowerCase()));
        }),
        isLoading, searchTerm, setSearchTerm, isModalOpen, setIsModalOpen, isDeleteModalOpen, setIsDeleteModalOpen,
        selectedItem, reason, setReason, isSubmitting, handleOpenAdd, handleOpenEdit, handleOpenDelete, handleSave, handleArchive, refresh
    };
}
