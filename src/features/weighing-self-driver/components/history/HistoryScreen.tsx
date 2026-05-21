/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from '../../contexts/HistoryContext';
import { useMasterData } from '../../contexts/MasterDataContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import NumberInput from '../ui/NumberInput';
import Select from '../ui/Select';
import ViewSwitcher, { type ListViewMode } from '../ui/ViewSwitcher';
import HelpTooltip from '../ui/HelpTooltip';
import HistorySkeleton from './HistorySkeleton';
import { RefreshCw, ClipboardList, Info, Edit, Trash2, Plus, CheckCircle, XCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import type { WeighingRecordPayload, WeighingItem } from '../../types';

interface HistoryScreenProps {
  onDetailViewChange?: (isDetailOpen: boolean) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onDetailViewChange }) => {
  const { history, isLoading, error, fetchHistory, updateRecord } = useHistory();
  const [selectedRecord, setSelectedRecord] = useState<WeighingRecordPayload | null>(null);
  const [editableRecord, setEditableRecord] = useState<WeighingRecordPayload | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState<{locationId: string; itemId: string; weight: string}>({locationId: '', itemId: '', weight: ''});
  const [editError, setEditError] = useState('');
  const [viewMode, setViewMode] = useState<ListViewMode>('list');

  const { locations, items: masterItems, isLoading: isMasterLoading } = useMasterData();

  const groupedItems = useMemo(() => {
    const itemsToGroup = isEditing ? editableRecord?.items : selectedRecord?.items;
    
    if (!itemsToGroup) {
      return new Map<string, { items: WeighingItem[]; subTotal: number }>();
    }

    const groups = new Map<string, { items: WeighingItem[]; subTotal: number }>();
    itemsToGroup.forEach((item) => {
      if (!groups.has(item.locationId)) {
        groups.set(item.locationId, { items: [], subTotal: 0 });
      }
      const group = groups.get(item.locationId)!;
      group.items.push(item);
      group.subTotal += item.weight;
    });
    return groups;
  }, [selectedRecord, editableRecord, isEditing]);


  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchHistory();
  };

  const handleOpenModal = (record: WeighingRecordPayload) => {
    setSelectedRecord(record);
    setEditableRecord(JSON.parse(JSON.stringify(record))); // Deep copy
    setIsEditing(false);
    setViewMode('list');
    onDetailViewChange?.(true);
  }

  const handleCloseModal = () => {
    setSelectedRecord(null);
    setEditableRecord(null);
    setIsEditing(false);
    setEditError('');
    onDetailViewChange?.(false);
  }

  const handleSave = async () => {
    if (!editableRecord) return;

    // Final validation before submitting
    const totalItemsWeight = editableRecord.items.reduce((sum, item) => sum + item.weight, 0);
    const netWeight = editableRecord.grossWeight - editableRecord.tareWeight;
    if (netWeight - totalItemsWeight !== 0) {
      setEditError('重量に誤差があります。品目重量を調整してください。');
      return;
    }
    
    setIsSubmitting(true);
    setEditError('');
    
    try {
      // The netWeight should be recalculated based on the final, verified weights.
      const updatedRecord = {
          ...editableRecord,
          netWeight: editableRecord.grossWeight - editableRecord.tareWeight
      };
      await updateRecord(updatedRecord);
      handleCloseModal();
    } catch (e) {
      // Error toast is handled in context
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleItemWeightChange = (index: number, newWeight: number) => {
    if (!editableRecord) return;
    const updatedItems = [...editableRecord.items];
    if (updatedItems[index]) {
        updatedItems[index].weight = Math.max(0, newWeight); // Ensure weight is not negative
        setEditableRecord({
            ...editableRecord,
            items: updatedItems,
        });
    }
  };
  
  const handleItemDelete = (index: number) => {
    if (!editableRecord) return;
    const updatedItems = editableRecord.items.filter((_, i) => i !== index);
    setEditableRecord({ ...editableRecord, items: updatedItems });
  };

  const handleAddNewItem = () => {
      if(!editableRecord || !newItem.locationId || !newItem.itemId || !newItem.weight) return;
      const weightNum = parseInt(newItem.weight, 10);
      if(isNaN(weightNum) || weightNum <= 0) {
        setEditError('有効な品目重量を入力してください。');
        return;
      }
      if(weightNum % 10 !== 0) {
        setEditError('追加する品目の重量も10kg単位で入力してください。');
        return;
      }

      const itemToAdd: WeighingItem = {
          locationId: newItem.locationId,
          itemId: newItem.itemId,
          weight: weightNum
      };
      const updatedItems = [...editableRecord.items, itemToAdd];

      setEditableRecord({ ...editableRecord, items: updatedItems });
      setNewItem({locationId: '', itemId: '', weight: ''}); // Reset form
      setEditError('');
  }

  // Full Screen View/Edit Component
  if (selectedRecord && editableRecord) {
    const getLocationName = (locationId: string, record: WeighingRecordPayload) => {
      if (locationId === 'own-company') return `${record.companyName || record.driverName} (自社)`;
      if (locationId === 'customer-self') return record.driverName;
      return locations.find(l => l.id === locationId)?.name || '不明な回収先';
    };

    const isEditable = new Date().getTime() - new Date(selectedRecord.weighedAt).getTime() < 24 * 60 * 60 * 1000;
    
    const totalItemsWeight = editableRecord.items.reduce((sum, item) => sum + item.weight, 0);
    const netWeight = editableRecord.grossWeight - editableRecord.tareWeight;
    const weightDifference = netWeight - totalItemsWeight;
    const isVerified = weightDifference === 0;

    const renderViewItemRow = (item: WeighingItem, index: number, showLocation: boolean, record: WeighingRecordPayload) => (
        <div key={index} className="tw-p-2 tw-bg-white dark:bg-slate-700/50 tw-rounded tw-border tw-border-slate-200 dark:border-slate-600">
          <div className="tw-flex tw-justify-between tw-font-semibold">
            <span>{masterItems.find(i => i.id === item.itemId)?.name || '不明な品目'}</span>
            <span>{item.weight.toLocaleString()} kg</span>
          </div>
          {showLocation && <div className="tw-text-sm tw-text-slate-600 dark:text-slate-300">{getLocationName(item.locationId, record)}</div>}
        </div>
    );

    return (
      <div className="tw-fixed tw-inset-0 tw-bg-slate-50 dark:bg-slate-900 tw-z-30 tw-flex tw-flex-col tw-animate-fade-in">
        <header className="tw-bg-white dark:bg-slate-800 tw-shadow-md tw-flex-shrink-0 tw-z-10 tw-border-b tw-border-slate-200 dark:border-slate-700">
          <div className="tw-container tw-mx-auto tw-px-4 tw-py-3 tw-flex tw-items-center">
            <Button onClick={isEditing ? () => { setIsEditing(false); setEditError(''); } : handleCloseModal} variant="secondary" size="sm" className="tw-!p-2" aria-label="戻る">
              <ArrowLeft size={20} />
            </Button>
            <h2 className="tw-text-lg tw-font-bold tw-ml-4">{isEditing ? '計量記録の編集' : '計量詳細'}</h2>
          </div>
        </header>
        
        <main className="tw-flex-1 tw-overflow-y-auto tw-p-4 md:p-6 tw-pb-48">
          <div className="tw-max-w-4xl tw-mx-auto">
            {!isEditing ? (
              <>
                <div className="tw-space-y-3">
                  <div className="tw-flex tw-justify-between tw-p-2 tw-bg-slate-100 dark:bg-slate-700 tw-rounded"><span>総重量:</span><span className="tw-font-bold">{selectedRecord.grossWeight.toLocaleString()} kg</span></div>
                  <div className="tw-flex tw-justify-between tw-p-2 tw-bg-slate-100 dark:bg-slate-700 tw-rounded"><span>空車重量:</span><span className="tw-font-bold">{selectedRecord.tareWeight.toLocaleString()} kg</span></div>
                  <div className="tw-flex tw-justify-between tw-p-2 tw-bg-blue-50 dark:bg-blue-900/50 tw-rounded tw-text-blue-800 dark:text-blue-300"><span className="tw-font-bold">差引重量:</span><span className="tw-font-bold">{selectedRecord.netWeight.toLocaleString()} kg</span></div>
                </div>
                <div className="tw-mt-6">
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-2"><h4 className="tw-font-bold tw-text-lg">品目内訳</h4>{selectedRecord.items.length > 0 && <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />}</div>
                    <div className="tw-space-y-3 tw-border-t tw-border-slate-200 dark:border-slate-700 tw-pt-3">
                        {selectedRecord.items.length === 0 ? <p className="tw-text-slate-500 dark:text-slate-300 tw-text-center tw-py-4">品目はありません。</p> : viewMode === 'list' ? selectedRecord.items.map((item, index) => renderViewItemRow(item, index, true, selectedRecord)) : Array.from(groupedItems.entries()).map(([locId, group]) => <div key={locId} className="tw-bg-slate-100 dark:bg-slate-700/50 tw-border tw-border-slate-200 dark:border-slate-600 tw-rounded-lg tw-p-3 tw-space-y-2"><div className="tw-flex tw-justify-between tw-items-baseline tw-pb-2 tw-border-b tw-border-slate-200 dark:border-slate-600"><h5 className="tw-font-bold tw-text-slate-700 dark:text-slate-300">{getLocationName(locId, selectedRecord)}</h5><p className="tw-text-sm tw-font-semibold tw-text-slate-600 dark:text-slate-300">小計: {group.subTotal.toLocaleString()} kg</p></div>{group.items.map((item, index) => renderViewItemRow(item, index, false, selectedRecord))}</div>)}
                    </div>
                </div>
              </>
            ) : (
              <div className="tw-space-y-4">
                <div className="tw-grid tw-grid-cols-1 sm:grid-cols-2 tw-gap-4">
                    <div className="tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-md"><label className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 dark:text-slate-300 tw-mb-1">総重量 (固定)</label><p className="tw-text-xl tw-font-bold">{editableRecord.grossWeight.toLocaleString()} kg</p></div>
                    <div className="tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-md"><label className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 dark:text-slate-300 tw-mb-1">空車重量 (固定)</label><p className="tw-text-xl tw-font-bold">{editableRecord.tareWeight.toLocaleString()} kg</p></div>
                </div>
                
                <h4 className="tw-font-bold tw-pt-2 tw-text-lg">品目内訳</h4>
                <div className="tw-space-y-3 tw-p-3 tw-border tw-border-slate-200 dark:border-slate-700 tw-rounded-md tw-bg-slate-50 dark:bg-slate-800/50">
                   {editableRecord.items.map((item, index) => (
                        <div key={index} className="tw-p-3 tw-border tw-border-slate-200 dark:border-slate-600 tw-rounded-md tw-bg-white dark:bg-slate-700">
                            <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                                <div><p className="tw-font-semibold">{masterItems.find(i => i.id === item.itemId)?.name}</p><p className="tw-text-sm tw-text-slate-500 dark:text-slate-300">{getLocationName(item.locationId, editableRecord)}</p></div>
                                <Button variant="danger" size="sm" onClick={() => handleItemDelete(index)} className="tw-px-2 tw-!py-2.5 tw-flex-shrink-0" aria-label="品目を削除"><Trash2 size={16}/></Button>
                            </div>
                            <NumberInput id={`edit-item-weight-${index}`} label="" value={String(item.weight)} onChange={e => handleItemWeightChange(index, parseInt(e.target.value, 10) || 0)} unit="kg" step={10} min={0}/>
                        </div>
                   ))}
                </div>
                
                <div className="tw-p-3 tw-border tw-border-slate-200 dark:border-slate-700 tw-rounded-md tw-space-y-3 tw-bg-slate-50 dark:bg-slate-800/50">
                    <h5 className="tw-font-semibold">品目を追加</h5>
                     <Select id="new-item-location" label="" value={newItem.locationId} onChange={e => setNewItem({...newItem, locationId: e.target.value})} disabled={isMasterLoading}>
                        <option value="">回収先を選択</option>
                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                     </Select>
                     <Select id="new-item-item" label="" value={newItem.itemId} onChange={e => setNewItem({...newItem, itemId: e.target.value})} disabled={isMasterLoading || !newItem.locationId}>
                        <option value="">品目を選択</option>
                        {masterItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                     </Select>
                     <div className="tw-flex tw-items-end tw-gap-2">
                        <NumberInput id="new-item-weight" label="" placeholder="重量" value={newItem.weight} onChange={e => setNewItem({...newItem, weight: e.target.value})} unit="kg" className="tw-flex-1" step={10} min={0}/>
                        <Button onClick={handleAddNewItem} disabled={!newItem.locationId || !newItem.itemId || !newItem.weight}><Plus size={16}/></Button>
                     </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <footer className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white dark:bg-slate-800 tw-border-t tw-border-slate-200 dark:border-slate-700 tw-p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] tw-z-40">
          <div className="tw-container tw-mx-auto tw-max-w-4xl">
            {isEditing ? (
              <>
                <div className="tw-flex tw-justify-between tw-items-center tw-text-sm tw-mb-3">
                  <span className="tw-text-slate-600 dark:text-slate-300">品目合計: <span className="tw-font-bold tw-text-lg tw-text-slate-800 dark:text-slate-200">{totalItemsWeight.toLocaleString()} kg</span></span>
                  <span className="tw-text-slate-600 dark:text-slate-300">目標差引重量: <span className="tw-font-bold tw-text-lg tw-text-slate-800 dark:text-slate-200">{netWeight.toLocaleString()} kg</span></span>
                </div>
                <div className={`tw-p-2 tw-rounded-md tw-text-center tw-font-bold tw-text-sm tw-mb-3 ${isVerified ? 'tw-bg-green-100 dark:bg-green-900/50 tw-text-green-800 dark:text-green-300' : 'tw-bg-red-100 dark:bg-red-900/50 tw-text-red-800 dark:text-red-300'}`}>
                    <div className="tw-flex tw-items-center tw-justify-center tw-leading-tight">
                        {isVerified ? (
                            <><CheckCircle className="tw-mr-2"/><span>重量の誤差はありません</span></>
                        ) : (
                            <>
                                <XCircle className="tw-mr-2"/>
                                <span>
                                    重量に <span className="tw-text-xl tw-font-black">{weightDifference.toLocaleString()}</span> kg の誤差があります
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {editError && <p className="tw-text-red-500 tw-text-sm tw-text-center tw-mb-2">{editError}</p>}
                <div className="tw-flex tw-justify-end tw-space-x-2">
                  <Button variant="secondary" onClick={() => { setIsEditing(false); setEditableRecord(JSON.parse(JSON.stringify(selectedRecord))); setEditError(''); }}>キャンセル</Button>
                  <Button onClick={handleSave} disabled={!isVerified || isSubmitting}>{isSubmitting ? '保存中...' : '変更を保存'}</Button>
                </div>
              </>
            ) : (
              <div className="tw-flex tw-justify-between tw-items-center">
                {isEditable ? <Button onClick={() => setIsEditing(true)}><Edit className="tw-mr-2 tw-h-4 tw-w-4" />編集する</Button> : <div className="tw-flex tw-items-center tw-text-sm tw-text-slate-500 dark:text-slate-300 tw-bg-slate-100 dark:bg-slate-700 tw-p-2 tw-rounded-md"><Info size={16} className="tw-mr-2" />編集期間は終了しました</div>}
                <Button variant="secondary" onClick={handleCloseModal}>閉じる</Button>
              </div>
            )}
          </div>
        </footer>
      </div>
    );
  }

  // History List View
  return (
    <main className="tw-container tw-mx-auto tw-p-4 md:p-6">
      <div className="tw-max-w-4xl tw-mx-auto">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <div className="tw-flex tw-items-center tw-space-x-2">
            <h2 className="tw-text-2xl tw-font-bold tw-text-slate-700 dark:text-slate-300 tw-flex tw-items-center"><ClipboardList className="tw-mr-3" />計量履歴</h2>
            <HelpTooltip title="履歴画面について">
              <div className="tw-space-y-4 tw-text-slate-600 dark:text-slate-300 tw-leading-relaxed">
                <p>ここでは過去の計量記録を確認できます。各記録をタップすると詳細が表示されます。</p>
                <div className="tw-bg-slate-100 dark:bg-slate-700 tw-p-3 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600">
                  <h4 className="tw-font-semibold tw-text-blue-600 dark:text-blue-400 tw-mb-2">記録の編集について</h4>
                  <p className="tw-text-sm tw-text-slate-700 dark:text-slate-200">
                    計量記録は、記録後<strong>24時間以内</strong>であれば編集が可能です。24時間を過ぎると、データの整合性を保つためロックされます。
                  </p>
                </div>
                <p className="tw-text-sm">右上の「更新」ボタンを押すと、サーバーから最新の履歴を取得します。</p>
              </div>
            </HelpTooltip>
          </div>
          <Button onClick={handleRefresh} disabled={isLoading} variant="secondary" size="sm"><RefreshCw className={`tw-mr-2 tw-h-4 tw-w-4 ${isLoading ? 'tw-animate-spin' : ''}`} />更新</Button>
        </div>
        
        {isLoading && <HistorySkeleton />}
        {!isLoading && error && <div className="tw-bg-red-100 tw-border-l-4 tw-border-red-500 tw-text-red-700 tw-p-4" role="alert"><p className="tw-font-bold">エラー</p><p>{error}</p></div>}
        {!isLoading && !error && history.length === 0 && <Card className="tw-text-center"><p className="tw-text-slate-500 dark:text-slate-300">計量履歴はありません。</p></Card>}
        
        {!isLoading && !error && history.length > 0 && (
          <div className="tw-space-y-4">
            {history.map(record => (
              <div key={record.recordId} onClick={() => handleOpenModal(record)} className="tw-cursor-pointer">
                  <Card className="hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 tw-border-slate-200 dark:border-slate-700 tw-transition-all tw-duration-200">
                      <div className="tw-flex tw-items-center">
                          <div className="tw-flex-1">
                              <div className="tw-flex tw-flex-col sm:flex-row tw-justify-between sm:items-center">
                                  <div>
                                      <p className="tw-font-bold tw-text-lg tw-text-slate-800 dark:text-slate-200">{new Date(record.weighedAt).toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                      <p className="tw-text-sm tw-text-slate-500 dark:text-slate-300">記録ID: {record.recordId.substring(0, 8)}...</p>
                                  </div>
                                  <div className="tw-mt-4 sm:mt-0 tw-text-right">
                                      <p className="tw-text-slate-600 dark:text-slate-300 tw-text-sm">差引重量</p>
                                      <p className="tw-font-bold tw-text-2xl tw-text-blue-600 dark:text-blue-400">{record.netWeight.toLocaleString()} kg</p>
                                  </div>
                              </div>
                          </div>
                          <ChevronRight className="tw-text-slate-400 dark:text-slate-400 tw-ml-4 tw-flex-shrink-0" />
                      </div>
                  </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HistoryScreen;
