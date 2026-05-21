/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import type { WeighingRecord, View, RecordFilters, Driver, Item, Location, WeighingItem } from '../../types';
import { getAllRecords, exportAllRecords, getDriversMaster, deleteRecord, getRecordById, getItemsMaster, getLocationsMaster, updateWeighingRecord, addWeighingItem, updateWeighingItem } from '../../services/api';
import { convertToCsv } from '../../utils/csvExporter';
import Button from '../ui/Button';
import RecordDetailRow from './RecordDetailRow';
import AlertDialog from '../ui/AlertDialog';
import RecordsFilter from './RecordsFilter';
import { MasterFormModal } from '../masters/MasterFormModal';
import type { FormField } from '../masters/MasterFormModal';
import ItemFormModal from './ItemFormModal';
import { useToast } from '../../hooks/useToast';
import { Download, SlidersHorizontal, ChevronLeft, ChevronRight, X, ChevronRight as ChevronRightIcon, Inbox } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';

interface RecordsScreenProps {
    params?: Record<string, string | undefined>;
    setCurrentView: (view: View) => void;
}

const RecordsScreen: React.FC<RecordsScreenProps> = ({ params, setCurrentView }) => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<WeighingRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<WeighingRecord | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  
  const [itemFormContext, setItemFormContext] = useState<{ mode: 'add' | 'edit'; record: WeighingRecord; item?: WeighingItem } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 10;
  
  const [filters, setFilters] = useState<RecordFilters>(params || {});
  const [isFilterVisible, setIsFilterVisible] = useState(Object.keys(params || {}).length > 0);
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  
  const { showToast } = useToast();
  const { withStatusHandling, isLoading } = useAppContext();

  useEffect(() => {
    // These are small, fast fetches, so we don't use the global spinner.
    getDriversMaster().then(setDrivers).catch(err => console.error('Failed to fetch drivers in RecordsScreen:', err));
    getItemsMaster().then(setAllItems).catch(err => console.error('Failed to fetch items in RecordsScreen:', err));
    getLocationsMaster().then(setAllLocations).catch(err => console.error('Failed to fetch locations in RecordsScreen:', err));
  }, []);

  const fetchRecords = useCallback(async () => {
    withStatusHandling(async () => {
      const { records: fetchedRecords, total } = await getAllRecords(currentPage, recordsPerPage, filters);
      setRecords(fetchedRecords);
      setTotalRecords(total);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  useEffect(() => {
    const newFilters = params || {};
    setFilters(newFilters);
    setCurrentPage(1);
    if (Object.keys(newFilters).length > 0) {
      setIsFilterVisible(true);
    }
  }, [params]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  const handlePageChange = (newPage: number) => {
    if(newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }
  
  const handleRowClick = (record: WeighingRecord) => {
    setSelectedRecordId(prevId => prevId === record.recordId ? null : record.recordId);
  };

  const handleApplyFilters = (newFilters: RecordFilters) => {
    const activeFilters = Object.fromEntries(
        Object.entries(newFilters).filter(([, v]) => v != null && v !== '')
    );
    setCurrentPage(1);
    setFilters(activeFilters);
  };
  
  const clearFilters = () => {
    setCurrentView({ name: 'records' }); 
  }

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
        const recordsToExport = await exportAllRecords(filters);
        
        if (recordsToExport.length === 0) {
            showToast('エクスポート対象のデータがありません。', 'info');
            return;
        }

        const csvString = convertToCsv(recordsToExport);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');
        link.setAttribute('href', url);
        link.setAttribute('download', `keiryo-records-${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('CSVファイルをエクスポートしました。');

    } catch (error) {
        console.error("CSVエクスポートに失敗しました:", error);
        showToast("CSVエクスポート中にエラーが発生しました。", "error");
    } finally {
        setIsExporting(false);
    }
  };

  const handleEditRequest = (record: WeighingRecord) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleDeleteRequest = (record: WeighingRecord) => {
    setRecordToDelete(record);
  };
  
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteRecord(recordToDelete.recordId);
      showToast(`記録ID: ${recordToDelete.recordId} を削除しました。`);
      setRecordToDelete(null);
      setSelectedRecordId(null);
      // 最後の1件を削除した場合、ページを前に戻す
      if (records.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchRecords();
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
      showToast("記録の削除に失敗しました。", "error");
    }
  };

  const handleRecordUpdate = async (recordId: string) => {
    try {
        const updatedRecord = await getRecordById(recordId);
        setRecords(prevRecords => 
            prevRecords.map(r => r.recordId === recordId ? updatedRecord : r)
        );
        if (itemFormContext?.record.recordId === recordId) {
            setItemFormContext(prev => prev ? { ...prev, record: updatedRecord } : null);
        }
    } catch (error) {
        console.error("Failed to update record view:", error);
        showToast("記録の表示更新に失敗しました。", "error");
        fetchRecords(); // Fallback to full refresh
    }
  };

  const handleSaveRecord = async (formData: any) => {
    if (!editingRecord) return;
    try {
      await updateWeighingRecord(editingRecord.recordId, {
        grossWeight: Number(formData.grossWeight),
        tareWeight: Number(formData.tareWeight),
      });
      showToast('記録情報を更新しました。');
      setIsRecordModalOpen(false);
      setEditingRecord(null);
      handleRecordUpdate(editingRecord.recordId);
    } catch (error) {
      if ((error as Error).message !== 'Validation failed') {
        console.error("Failed to save record:", error);
        showToast("記録の更新に失敗しました。", "error");
      }
      throw error;
    }
  };
  
  const handleOpenItemForm = (mode: 'add' | 'edit', record: WeighingRecord, item?: WeighingItem) => {
    setItemFormContext({ mode, record, item });
  };

  const handleSaveItem = async (mode: 'add' | 'edit', itemData: Partial<WeighingItem>) => {
    if (!itemFormContext) return;
    const { record, item } = itemFormContext;

    try {
      if (mode === 'add') {
        await addWeighingItem(record.recordId, itemData as Omit<WeighingItem, 'id'>);
        showToast('品目を追加しました。');
      } else if (mode === 'edit' && item) {
        await updateWeighingItem(record.recordId, item.id, itemData);
        showToast('品目を更新しました。');
      }
      handleRecordUpdate(record.recordId);
      setItemFormContext(null); // Close modal on success
    } catch (error) {
      if ((error as Error).message !== 'Validation failed') {
        console.error('Failed to save item:', error);
        showToast('品目の保存に失敗しました。', 'error');
      }
      throw error; // Re-throw to keep modal open for correction
    }
  };

  const recordFormFields: FormField[] = [
    { name: 'grossWeight', label: '総重量 (kg)', type: 'number', required: true, step: 10 },
    { name: 'tareWeight', label: '空車重量 (kg)', type: 'number', required: true, step: 10 },
  ];

  const recordFormValidator = (data: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    const gross = Number(data.grossWeight);
    const tare = Number(data.tareWeight);

    if (data.grossWeight && gross % 10 !== 0) {
      errors.grossWeight = '総重量は10kg単位で入力してください。';
    }
    if (data.tareWeight && tare % 10 !== 0) {
      errors.tareWeight = '空車重量は10kg単位で入力してください。';
    }
    if (data.grossWeight !== '' && data.tareWeight !== '' && gross <= tare) {
      errors.grossWeight = '総重量は空車重量より大きい必要があります。';
      errors.tareWeight = '空車重量は総重量より小さい必要があります。';
    }
    return errors;
  };

  const renderActiveFilters = () => {
    const filterEntries = Object.entries(filters).filter(([, value]) => value);
    if (filterEntries.length === 0) return null;

    const filterLabels: Record<string, string> = {
        dateFrom: '開始日',
        dateTo: '終了日',
        keyword: 'キーワード',
        status: 'ステータス',
        companyName: '協力会社',
        driverId: 'ドライバー',
    };

    return (
        <div className="tw-mt-2 tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
            <span className="tw-text-sm tw-font-semibold tw-mr-2">適用中のフィルタ:</span>
            {filterEntries.map(([key, value]) => {
                let displayValue = String(value);
                if (key === 'driverId' && value) {
                    const driver = drivers.find(d => d.id === value);
                    displayValue = driver ? driver.name : String(value);
                }
                return (
                    <div key={key} className="tw-bg-interactive-default/10 tw-text-interactive-default tw-text-xs tw-font-medium tw-px-2 tw-py-1 tw-rounded-full tw-flex tw-items-center tw-gap-1">
                        <span>{filterLabels[key] || key}: {displayValue}</span>
                    </div>
                )
            })}
            <button onClick={clearFilters} className="tw-p-1 tw-rounded-full hover:tw-bg-background-tertiary tw-text-text-secondary" aria-label="フィルタをクリア">
                <X className="tw-w-4 tw-h-4"/>
            </button>
        </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\//g, '/');
  };

  const getStatusBadge = (status: '完了' | '修正済' | '未確認') => {
    const baseClasses = "tw-px-2 tw-py-0.5 tw-text-xs tw-font-semibold tw-rounded-full tw-inline-block";
    switch (status) {
      case '完了':
        return <span className={`${baseClasses} tw-bg-green-100 tw-text-green-800 dark:tw-bg-green-900 dark:tw-text-green-200`}>完了</span>;
      case '修正済':
        return <span className={`${baseClasses} tw-bg-yellow-100 tw-text-yellow-800 dark:tw-bg-yellow-900 dark:tw-text-yellow-200`}>修正済</span>;
      case '未確認':
        return <span className={`${baseClasses} tw-bg-blue-100 tw-text-blue-800 dark:tw-bg-blue-900 dark:tw-text-blue-200`}>未確認</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="tw-space-y-6">
        <div className="tw-flex tw-justify-between tw-items-start">
          <div>
              <h1 className="tw-text-3xl tw-font-bold">計量記録一覧</h1>
              <p className="tw-text-text-secondary tw-mt-1">すべての計量記録を検索・閲覧できます。</p>
              {renderActiveFilters()}
          </div>
          <div className="tw-flex tw-gap-2">
              <Button variant="outline" icon={<SlidersHorizontal className="tw-w-4 tw-h-4" />} onClick={() => setIsFilterVisible(!isFilterVisible)}>
                  {isFilterVisible ? 'フィルタを隠す' : 'フィルタ'}
              </Button>
              <Button icon={<Download className="tw-w-4 tw-h-4" />} onClick={handleExportCsv} loading={isExporting}>CSVエクスポート</Button>
          </div>
        </div>

        {isFilterVisible && (
          <RecordsFilter 
              initialFilters={filters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={clearFilters}
          />
        )}

        <div className="tw-bg-background-secondary tw-border tw-border-border-default tw-rounded-lg tw-overflow-hidden">
          <div className="tw-overflow-x-auto">
            <table className="tw-w-full tw-text-sm">
              <thead className="tw-bg-background-tertiary">
                <tr>
                  <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">記録ID</th>
                  <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">日時</th>
                  <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">ドライバー</th>
                  <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">協力会社</th>
                  <th className="tw-p-3 tw-text-right tw-font-semibold tw-text-text-secondary">総重量</th>
                  <th className="tw-p-3 tw-text-right tw-font-semibold tw-text-text-secondary">空車重量</th>
                  <th className="tw-p-3 tw-text-right tw-font-semibold tw-text-text-secondary">差引重量</th>
                  <th className="tw-p-3 tw-text-right tw-font-semibold tw-text-text-secondary">誤差</th>
                  <th className="tw-p-3 tw-text-center tw-font-semibold tw-text-text-secondary">ステータス</th>
                  <th className="tw-p-3 tw-w-12 tw-text-center tw-font-semibold tw-text-text-secondary"></th>
                </tr>
              </thead>
              <tbody className="tw-relative">
                {records.length > 0 && !isLoading &&
                   records.map((record) => {
                      const itemsTotal = record.items.reduce((sum, item) => sum + item.weight, 0);
                      const errorWeight = record.netWeight - itemsTotal;
                      const isGrossInvalid = record.grossWeight % 10 !== 0;
                      const isTareInvalid = record.tareWeight % 10 !== 0;
                      return (
                      <React.Fragment key={record.recordId}>
                        <tr onClick={() => handleRowClick(record)} className="tw-border-t tw-border-border-default hover:tw-bg-background-tertiary tw-cursor-pointer">
                          <td className="tw-p-3 tw-font-mono tw-text-xs">{record.recordId}</td>
                          <td className="tw-p-3">{formatDateTime(record.weighedAt)}</td>
                          <td className="tw-p-3">{record.driverName}</td>
                          <td className="tw-p-3 tw-text-text-secondary">{record.companyName || '個人'}</td>
                          <td className={`tw-p-3 tw-text-right tw-text-text-secondary ${isGrossInvalid ? 'tw-text-error tw-font-bold' : ''}`}>{record.grossWeight.toLocaleString()} kg</td>
                          <td className={`tw-p-3 tw-text-right tw-text-text-secondary ${isTareInvalid ? 'tw-text-error tw-font-bold' : ''}`}>{record.tareWeight.toLocaleString()} kg</td>
                          <td className="tw-p-3 tw-text-right tw-font-semibold">{record.netWeight.toLocaleString()} kg</td>
                          <td className={`tw-p-3 tw-text-right tw-font-semibold ${errorWeight !== 0 ? 'tw-text-warning' : ''}`}>
                            {errorWeight > 0 ? '+' : ''}{errorWeight.toLocaleString()} kg
                          </td>
                          <td className="tw-p-3 tw-text-center">{getStatusBadge(record.status)}</td>
                          <td className="tw-p-3 tw-text-center tw-text-text-secondary">
                            <ChevronRightIcon className={`tw-w-5 tw-h-5 tw-mx-auto tw-transition-transform ${selectedRecordId === record.recordId ? 'tw-rotate-90' : ''}`} />
                          </td>
                        </tr>
                        {selectedRecordId === record.recordId && (
                           <tr className="tw-border-t tw-border-border-default tw-bg-background-tertiary">
                             <td colSpan={10}>
                               <RecordDetailRow 
                                 record={record} 
                                 onDeleteRequest={handleDeleteRequest} 
                                 onEditRequest={handleEditRequest}
                                 onRecordUpdate={handleRecordUpdate}
                                 onOpenItemForm={(mode, item) => handleOpenItemForm(mode, record, item)}
                                 allItems={allItems}
                                 allLocations={allLocations}
                                />
                             </td>
                           </tr>
                        )}
                      </React.Fragment>
                      );
                   })}
                  {records.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={10} className="tw-text-center tw-p-16 tw-text-text-secondary">
                          <Inbox className="tw-mx-auto tw-w-12 tw-h-12 tw-text-gray-400" />
                          <p className="tw-mt-4 tw-font-semibold">表示する記録がありません</p>
                          <p className="tw-text-sm">フィルタ条件を変更するか、フィルタをクリアしてください。</p>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="tw-flex tw-justify-between tw-items-center tw-text-sm">
          <span className="tw-text-text-secondary">
            全 {totalRecords} 件中 { records.length > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0 } - {Math.min(currentPage * recordsPerPage, totalRecords)} 件を表示
          </span>
          <div className="tw-flex tw-items-center tw-gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading}><ChevronLeft className="tw-w-4 tw-h-4" /> 前へ</Button>
            <span className="tw-font-semibold">{totalPages > 0 ? `${currentPage} / ${totalPages}`: '0 / 0'}</span>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading}>次へ <ChevronRight className="tw-w-4 tw-h-4" /></Button>
          </div>
        </div>
      </div>

      {recordToDelete && (
        <AlertDialog
          isOpen={!!recordToDelete}
          onClose={() => setRecordToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="記録の削除"
          description={`記録ID「${recordToDelete.recordId}」を本当に削除しますか？この操作は元に戻せません。`}
          confirmText="削除"
        />
      )}
      
      {editingRecord && (
        <MasterFormModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          onSave={handleSaveRecord}
          initialData={{ grossWeight: editingRecord.grossWeight, tareWeight: editingRecord.tareWeight }}
          fields={recordFormFields}
          title={`記録情報編集 (ID: ${editingRecord.recordId})`}
          allItems={allItems}
          customValidator={recordFormValidator}
        />
      )}

      {itemFormContext && (
        <ItemFormModal
          isOpen={!!itemFormContext}
          onClose={() => setItemFormContext(null)}
          onSave={handleSaveItem}
          mode={itemFormContext.mode}
          record={itemFormContext.record}
          itemToEdit={itemFormContext.item}
          allItems={allItems}
          allLocations={allLocations}
        />
      )}
    </>
  );
};

export default RecordsScreen;
