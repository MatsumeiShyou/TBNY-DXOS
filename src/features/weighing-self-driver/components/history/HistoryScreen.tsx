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
        <div key={index} className="p-2 bg-white dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-600">
          <div className="flex justify-between font-semibold">
            <span>{masterItems.find(i => i.id === item.itemId)?.name || '不明な品目'}</span>
            <span>{item.weight.toLocaleString()} kg</span>
          </div>
          {showLocation && <div className="text-sm text-slate-600 dark:text-slate-300">{getLocationName(item.locationId, record)}</div>}
        </div>
    );

    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-30 flex flex-col animate-fade-in">
        <header className="bg-white dark:bg-slate-800 shadow-md flex-shrink-0 z-10 border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-3 flex items-center">
            <Button onClick={isEditing ? () => { setIsEditing(false); setEditError(''); } : handleCloseModal} variant="secondary" size="sm" className="!p-2" aria-label="戻る">
              <ArrowLeft size={20} />
            </Button>
            <h2 className="text-lg font-bold ml-4">{isEditing ? '計量記録の編集' : '計量詳細'}</h2>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-48">
          <div className="max-w-4xl mx-auto">
            {!isEditing ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded"><span>総重量:</span><span className="font-bold">{selectedRecord.grossWeight.toLocaleString()} kg</span></div>
                  <div className="flex justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded"><span>空車重量:</span><span className="font-bold">{selectedRecord.tareWeight.toLocaleString()} kg</span></div>
                  <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/50 rounded text-blue-800 dark:text-blue-300"><span className="font-bold">差引重量:</span><span className="font-bold">{selectedRecord.netWeight.toLocaleString()} kg</span></div>
                </div>
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-lg">品目内訳</h4>{selectedRecord.items.length > 0 && <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />}</div>
                    <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
                        {selectedRecord.items.length === 0 ? <p className="text-slate-500 dark:text-slate-300 text-center py-4">品目はありません。</p> : viewMode === 'list' ? selectedRecord.items.map((item, index) => renderViewItemRow(item, index, true, selectedRecord)) : Array.from(groupedItems.entries()).map(([locId, group]) => <div key={locId} className="bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-3 space-y-2"><div className="flex justify-between items-baseline pb-2 border-b border-slate-200 dark:border-slate-600"><h5 className="font-bold text-slate-700 dark:text-slate-300">{getLocationName(locId, selectedRecord)}</h5><p className="text-sm font-semibold text-slate-600 dark:text-slate-300">小計: {group.subTotal.toLocaleString()} kg</p></div>{group.items.map((item, index) => renderViewItemRow(item, index, false, selectedRecord))}</div>)}
                    </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">総重量 (固定)</label><p className="text-xl font-bold">{editableRecord.grossWeight.toLocaleString()} kg</p></div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">空車重量 (固定)</label><p className="text-xl font-bold">{editableRecord.tareWeight.toLocaleString()} kg</p></div>
                </div>
                
                <h4 className="font-bold pt-2 text-lg">品目内訳</h4>
                <div className="space-y-3 p-3 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/50">
                   {editableRecord.items.map((item, index) => (
                        <div key={index} className="p-3 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <div><p className="font-semibold">{masterItems.find(i => i.id === item.itemId)?.name}</p><p className="text-sm text-slate-500 dark:text-slate-300">{getLocationName(item.locationId, editableRecord)}</p></div>
                                <Button variant="danger" size="sm" onClick={() => handleItemDelete(index)} className="px-2 !py-2.5 flex-shrink-0" aria-label="品目を削除"><Trash2 size={16}/></Button>
                            </div>
                            <NumberInput id={`edit-item-weight-${index}`} label="" value={String(item.weight)} onChange={e => handleItemWeightChange(index, parseInt(e.target.value, 10) || 0)} unit="kg" step={10} min={0}/>
                        </div>
                   ))}
                </div>
                
                <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-md space-y-3 bg-slate-50 dark:bg-slate-800/50">
                    <h5 className="font-semibold">品目を追加</h5>
                     <Select id="new-item-location" label="" value={newItem.locationId} onChange={e => setNewItem({...newItem, locationId: e.target.value})} disabled={isMasterLoading}>
                        <option value="">回収先を選択</option>
                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                     </Select>
                     <Select id="new-item-item" label="" value={newItem.itemId} onChange={e => setNewItem({...newItem, itemId: e.target.value})} disabled={isMasterLoading || !newItem.locationId}>
                        <option value="">品目を選択</option>
                        {masterItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                     </Select>
                     <div className="flex items-end gap-2">
                        <NumberInput id="new-item-weight" label="" placeholder="重量" value={newItem.weight} onChange={e => setNewItem({...newItem, weight: e.target.value})} unit="kg" className="flex-1" step={10} min={0}/>
                        <Button onClick={handleAddNewItem} disabled={!newItem.locationId || !newItem.itemId || !newItem.weight}><Plus size={16}/></Button>
                     </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
          <div className="container mx-auto max-w-4xl">
            {isEditing ? (
              <>
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-slate-600 dark:text-slate-300">品目合計: <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{totalItemsWeight.toLocaleString()} kg</span></span>
                  <span className="text-slate-600 dark:text-slate-300">目標差引重量: <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{netWeight.toLocaleString()} kg</span></span>
                </div>
                <div className={`p-2 rounded-md text-center font-bold text-sm mb-3 ${isVerified ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                    <div className="flex items-center justify-center leading-tight">
                        {isVerified ? (
                            <><CheckCircle className="mr-2"/><span>重量の誤差はありません</span></>
                        ) : (
                            <>
                                <XCircle className="mr-2"/>
                                <span>
                                    重量に <span className="text-xl font-black">{weightDifference.toLocaleString()}</span> kg の誤差があります
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {editError && <p className="text-red-500 text-sm text-center mb-2">{editError}</p>}
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => { setIsEditing(false); setEditableRecord(JSON.parse(JSON.stringify(selectedRecord))); setEditError(''); }}>キャンセル</Button>
                  <Button onClick={handleSave} disabled={!isVerified || isSubmitting}>{isSubmitting ? '保存中...' : '変更を保存'}</Button>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                {isEditable ? <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />編集する</Button> : <div className="flex items-center text-sm text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-2 rounded-md"><Info size={16} className="mr-2" />編集期間は終了しました</div>}
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
    <main className="container mx-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 flex items-center"><ClipboardList className="mr-3" />計量履歴</h2>
            <HelpTooltip title="履歴画面について">
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>ここでは過去の計量記録を確認できます。各記録をタップすると詳細が表示されます。</p>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">記録の編集について</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    計量記録は、記録後<strong>24時間以内</strong>であれば編集が可能です。24時間を過ぎると、データの整合性を保つためロックされます。
                  </p>
                </div>
                <p className="text-sm">右上の「更新」ボタンを押すと、サーバーから最新の履歴を取得します。</p>
              </div>
            </HelpTooltip>
          </div>
          <Button onClick={handleRefresh} disabled={isLoading} variant="secondary" size="sm"><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />更新</Button>
        </div>
        
        {isLoading && <HistorySkeleton />}
        {!isLoading && error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p className="font-bold">エラー</p><p>{error}</p></div>}
        {!isLoading && !error && history.length === 0 && <Card className="text-center"><p className="text-slate-500 dark:text-slate-300">計量履歴はありません。</p></Card>}
        
        {!isLoading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map(record => (
              <div key={record.recordId} onClick={() => handleOpenModal(record)} className="cursor-pointer">
                  <Card className="hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 border-slate-200 dark:border-slate-700 transition-all duration-200">
                      <div className="flex items-center">
                          <div className="flex-1">
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                  <div>
                                      <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{new Date(record.weighedAt).toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                      <p className="text-sm text-slate-500 dark:text-slate-300">記録ID: {record.recordId.substring(0, 8)}...</p>
                                  </div>
                                  <div className="mt-4 sm:mt-0 text-right">
                                      <p className="text-slate-600 dark:text-slate-300 text-sm">差引重量</p>
                                      <p className="font-bold text-2xl text-blue-600 dark:text-blue-400">{record.netWeight.toLocaleString()} kg</p>
                                  </div>
                              </div>
                          </div>
                          <ChevronRight className="text-slate-400 dark:text-slate-400 ml-4 flex-shrink-0" />
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
