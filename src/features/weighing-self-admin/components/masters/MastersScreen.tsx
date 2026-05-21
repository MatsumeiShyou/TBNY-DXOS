/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Company, Driver, Customer, Location, Item, MasterData } from '../../types';
import { companyApi, driverApi, customerApi, locationApi, itemApi } from '../../services/api';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import { Plus, Edit, Trash2, Search, Inbox, AlertTriangle } from 'lucide-react';
import AlertDialog from '../ui/AlertDialog';
import { MasterFormModal } from './MasterFormModal';
import type { FormField } from './MasterFormModal';
import { useToast } from '../../hooks/useToast';
import { useAppContext } from '../../hooks/useAppContext';

type MasterTabKey = 'companies' | 'drivers' | 'customers' | 'locations' | 'items';

type AllMasterDataKeys = keyof Company | keyof Driver | keyof Customer | keyof Location | keyof Item;

interface MasterTabConfig {
    label: string;
    api: any;
    columns: { key: AllMasterDataKeys; label: string; render?: (item: any) => React.ReactNode }[];
    formFields: FormField[];
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ja-JP');

const MastersScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MasterTabKey>('companies');
    const [data, setData] = useState<MasterData[] | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [companies, setCompanies] = useState<Company[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MasterData | null>(null);
    
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<MasterData | null>(null);
    
    const { showToast } = useToast();
    const { withStatusHandling } = useAppContext();

    useEffect(() => {
        // These are small, fast fetches, so we don't use the global spinner.
        companyApi.get()
            .then(setCompanies)
            .catch(err => {
                console.error('Failed to fetch companies in MastersScreen:', err);
                setCompanies([]);
            });
        customerApi.get()
            .then(setCustomers)
            .catch(err => {
                console.error('Failed to fetch customers in MastersScreen:', err);
                setCustomers([]);
            });
        itemApi.get()
            .then(setItems)
            .catch(err => {
                console.error('Failed to fetch items in MastersScreen:', err);
                setItems([]);
            });
    }, []);

    const TABS_CONFIG: Record<MasterTabKey, MasterTabConfig> = useMemo(() => ({
        companies: {
            label: '協力会社', api: companyApi,
            columns: [
                { key: 'name', label: '会社名' }, { key: 'contactPerson', label: '担当者' },
                { key: 'phone', label: '電話番号' }, { key: 'createdAt', label: '登録日', render: (item) => formatDate(item.createdAt) },
            ],
            formFields: [
                { name: 'name', label: '会社名', type: 'text', required: true }, { name: 'contactPerson', label: '担当者名', type: 'text' },
                { name: 'phone', label: '電話番号', type: 'tel' }, { name: 'address', label: '住所', type: 'text' },
            ],
        },
        drivers: {
            label: 'ドライバー', api: driverApi,
            columns: [
                { key: 'name', label: '氏名' },
                { 
                    key: 'companyId', 
                    label: '所属', 
                    render: (item: Driver) => {
                        if (item.companyId) {
                            return companies.find(c => c.id === item.companyId)?.name || '不明な会社';
                        }
                        if (item.customerId) {
                            const customer = customers.find(c => c.id === item.customerId);
                            return customer ? `[顧客] ${customer.name}` : '不明な顧客';
                        }
                        return '未所属';
                    }
                },
                { key: 'createdAt', label: '登録日', render: (item) => formatDate(item.createdAt) },
            ],
            formFields: [
                { name: 'name', label: '氏名', type: 'text', required: true },
                {
                    name: 'ownerType',
                    label: '所属タイプ',
                    type: 'radio',
                    options: [
                        { value: 'company', label: '協力会社' },
                        { value: 'customer', label: '顧客' },
                    ],
                    required: true,
                },
                {
                    name: 'companyId',
                    label: '所属会社',
                    type: 'select',
                    required: true,
                    options: companies.map(c => ({ value: c.id, label: c.name })),
                    condition: (formData) => formData.ownerType === 'company',
                },
                {
                    name: 'customerId',
                    label: '所属顧客',
                    type: 'select',
                    required: true,
                    options: customers.map(c => ({ value: c.id, label: c.name })),
                    condition: (formData) => formData.ownerType === 'customer',
                },
            ],
        },
        customers: {
            label: '顧客', api: customerApi,
            columns: [
                { key: 'name', label: '顧客名' }, { key: 'contactPerson', label: '担当者' },
                { key: 'phone', label: '電話番号' }, { key: 'createdAt', label: '登録日', render: (item) => formatDate(item.createdAt) },
            ],
            formFields: [
                { name: 'name', label: '顧客名', type: 'text', required: true }, { name: 'contactPerson', label: '担当者名', type: 'text' },
                { name: 'phone', label: '電話番号', type: 'tel' }, { name: 'address', label: '住所', type: 'text' },
            ],
        },
        locations: {
            label: '回収先', api: locationApi,
            columns: [
                { key: 'name', label: '回収先名' },
                { key: 'allowedItemIds', label: '取扱品目', render: (item: Location) => {
                    const ids = item.allowedItemIds || [];
                    if (ids.length === 0) {
                        return (
                            <span className="tw-font-semibold tw-text-warning tw-flex tw-items-center tw-gap-1">
                                <AlertTriangle className="tw-w-4 tw-h-4" />
                                未設定
                            </span>
                        );
                    }
                    return <span className="tw-font-semibold tw-text-text-primary">{ids.length}品目</span>;
                }},
                { key: 'address', label: '住所' }, { key: 'createdAt', label: '登録日', render: (item) => formatDate(item.createdAt) },
            ],
            formFields: [
                { name: 'name', label: '回収先名', type: 'text', required: true }, { name: 'address', label: '住所', type: 'text' },
                { name: 'customerId', label: '関連顧客', type: 'select', options: [{ value: '', label: 'なし' }, ...customers.map(c => ({ value: c.id, label: c.name }))]},
                { name: 'allowedItemIds', label: '取扱品目', type: 'item-selector' },
            ],
        },
        items: {
            label: '品目', api: itemApi,
            columns: [
                { key: 'name', label: '品目名' }, { key: 'category', label: 'カテゴリ' },
                { key: 'createdAt', label: '登録日', render: (item) => formatDate(item.createdAt) },
            ],
            formFields: [
                { name: 'name', label: '品目名', type: 'text', required: true },
                { name: 'category', label: 'カテゴリ', type: 'text', required: true },
            ],
        },
    }), [companies, customers]);

    const activeConfig = useMemo(() => TABS_CONFIG[activeTab], [activeTab, TABS_CONFIG]);

    const fetchData = useCallback(async () => {
        withStatusHandling(async () => {
            const result = await activeConfig.api.get();
            setData(result);
        }).catch(err => {
            console.error(`Failed to fetch master data for tab ${activeTab}:`, err);
            setData([]);
        });
    }, [activeConfig, withStatusHandling, activeTab]);

    useEffect(() => { 
        setData(null); // Show skeletons when tab changes
        fetchData(); 
    }, [fetchData]);

    const handleTabChange = (key: MasterTabKey) => {
        setActiveTab(key);
        setSearchTerm('');
    };

    const handleOpenModal = (item: MasterData | null = null) => { setEditingItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

    const handleSave = async (formData: any) => {
        try {
            if (editingItem) {
                await activeConfig.api.update(editingItem.id, formData);
            } else {
                await activeConfig.api.add(formData);
            }
            showToast(`${activeConfig.label}を${editingItem ? '更新' : '追加'}しました。`);
            handleCloseModal();
            fetchData();
        } catch (err) {
            console.error("Failed to save master:", err);
            showToast("保存に失敗しました。", 'error');
            throw err;
        }
    };

    const handleOpenAlert = (item: MasterData) => { setDeletingItem(item); setIsAlertOpen(true); };
    const handleCloseAlert = () => { setIsAlertOpen(false); setDeletingItem(null); };

    const handleDeleteConfirm = async () => {
        if (!deletingItem) return;
        try {
            await activeConfig.api.delete(deletingItem.id);
            showToast(`${activeConfig.label}「${(deletingItem as any)?.name || ''}」を削除しました。`);
            fetchData();
        } catch (err) {
            console.error("Failed to delete master:", err);
            showToast("削除に失敗しました。", 'error');
        } finally {
            handleCloseAlert();
        }
    };
    
    const filteredData = useMemo(() => {
      if (!data) return [];
      if (!searchTerm) return data;
      return data.filter(item => 
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [data, searchTerm]);

    const isInitialLoading = data === null;

    return (
        <div className="tw-space-y-6">
            <div className="tw-flex tw-justify-between tw-items-start">
                <div>
                    <h1 className="tw-text-3xl tw-font-bold">マスタ管理</h1>
                    <p className="tw-text-text-secondary tw-mt-1">各種マスターデータを管理します。</p>
                </div>
                <Button icon={<Plus className="tw-w-4 tw-h-4" />} onClick={() => handleOpenModal()}>新規追加</Button>
            </div>
            
            <div className="tw-border-b tw-border-border-default">
                <nav className="-tw-mb-px tw-flex tw-space-x-6">
                    {Object.entries(TABS_CONFIG).map(([key, config]) => (
                        <button key={key} onClick={() => handleTabChange(key as MasterTabKey)}
                            className={`tw-py-3 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm tw-transition-colors tw-duration-200 ${
                                activeTab === key ? 'tw-border-interactive-default tw-text-interactive-default' : 'tw-border-transparent tw-text-text-secondary hover:tw-text-text-primary hover:tw-border-border-default'
                            }`}>
                            {config.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="tw-relative">
              <input type="text" placeholder={`${activeConfig.label}を検索...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="tw-w-full tw-h-10 tw-pl-10 tw-pr-4 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors" />
              <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-5 tw-h-5 tw-text-text-secondary" />
            </div>
            
            <div className="tw-bg-background-secondary tw-border tw-border-border-default tw-rounded-lg tw-overflow-hidden">
                <div className="tw-overflow-x-auto">
                    <table className="tw-w-full tw-text-sm">
                        <thead className="tw-bg-background-tertiary">
                            <tr>
                                {activeConfig.columns.map(col => <th key={String(col.key)} className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">{col.label}</th>)}
                                <th className="tw-p-3 tw-w-28 tw-text-center tw-font-semibold tw-text-text-secondary">アクション</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isInitialLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="tw-border-t tw-border-border-default">
                                        {activeConfig.columns.map(col => <td key={String(col.key)} className="tw-p-3"><Skeleton className="tw-h-4 tw-w-full" /></td>)}
                                        <td className="tw-p-3"><Skeleton className="tw-h-8 tw-w-20 tw-mx-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredData.length === 0 && searchTerm ? (
                                <tr><td colSpan={activeConfig.columns.length + 1} className="tw-text-center tw-p-8 tw-text-text-secondary">
                                    <Search className="tw-mx-auto tw-w-12 tw-h-12 tw-text-gray-400" />
                                    <p className="tw-mt-2 tw-font-semibold">検索結果がありません</p>
                                    <p className="tw-text-sm">「{searchTerm}」に一致する{activeConfig.label}は見つかりませんでした。</p>
                                </td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan={activeConfig.columns.length + 1} className="tw-text-center tw-p-8 tw-text-text-secondary">
                                    <Inbox className="tw-mx-auto tw-w-12 tw-h-12 tw-text-gray-400" />
                                    <p className="tw-mt-2 tw-font-semibold">{activeConfig.label}が登録されていません</p>
                                    <p className="tw-text-sm">「新規追加」ボタンから最初の{activeConfig.label}を登録してください。</p>
                                </td></tr>
                            ) : (
                                filteredData.map(item => (
                                    <tr key={item.id} className="tw-border-t tw-border-border-default">
                                        {activeConfig.columns.map(col => (
                                            <td key={String(col.key)} className="tw-p-3 tw-text-text-secondary">
                                                <span className={col.key === 'name' ? 'tw-font-semibold tw-text-text-primary' : ''}>
                                                    {col.render ? col.render(item) : (item as any)[col.key] || '-'}
                                                </span>
                                            </td>
                                        ))}
                                        <td className="tw-p-3">
                                            <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="tw-p-2 tw-rounded-md hover:tw-bg-background-tertiary tw-text-text-secondary hover:tw-text-text-primary tw-transition-colors" aria-label="編集"><Edit className="tw-w-4 tw-h-4"/></button>
                                                <button onClick={() => handleOpenAlert(item)} className="tw-p-2 tw-rounded-md hover:tw-bg-background-tertiary tw-text-text-secondary hover:tw-text-error tw-transition-colors" aria-label="削除"><Trash2 className="tw-w-4 tw-h-4"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <MasterFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} initialData={editingItem} fields={activeConfig.formFields} title={`${activeConfig.label}の${editingItem ? '編集' : '新規追加'}`} allItems={items} />
            <AlertDialog isOpen={isAlertOpen} onClose={handleCloseAlert} onConfirm={handleDeleteConfirm} title={`${activeConfig.label}の削除`} description={`「${(deletingItem as any)?.name || ''}」を本当に削除しますか？この操作は元に戻せません。`} confirmText="削除" />
        </div>
    );
};

export default MastersScreen;
