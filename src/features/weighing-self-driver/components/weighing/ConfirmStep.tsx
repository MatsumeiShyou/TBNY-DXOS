
import React, { useState, useMemo } from 'react';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import { useOfflineQueue } from '../../contexts/OfflineQueueContext';
import { useWeighingAuth } from '../../contexts/WeighingAuthContext';
import { useMasterData } from '../../contexts/MasterDataContext';
import { useSettings } from '../../contexts/SettingsContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import WeighingModal from '../ui/WeighingModal';
import Modal from '../ui/Modal';
import ViewSwitcher, { type ListViewMode } from '../ui/ViewSwitcher';

import HelpTooltip from '../ui/HelpTooltip';
import { CheckCircle, XCircle, Send, ArrowLeft, Repeat, Edit, Trash2, Plus } from 'lucide-react';
import type { WeighingItem } from '../../types';

interface DetailRowProps {
  label: string;
  value: string | number;
  children?: React.ReactNode;
  className?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, children, className }) => (
  <div className={`flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md ${className}`}>
    <span>{label}:</span>
    <div className="flex items-center space-x-2">
      <span className="font-bold">{value} kg</span>
      {children}
    </div>
  </div>
);

const ConfirmStep: React.FC = () => {
  const { 
    grossWeight, setGrossWeight,
    tareWeight, setTareWeight,
    items, removeItem, updateItem,
    prevStep,
    goToStep,
    isExpressMode,
    maxSteps,
    flowType,
    currentStep,
    customerAsLocation,
  } = useWeighingSession();
  const { locations, items: masterItems } = useMasterData();
  const { driverName, companyName } = useWeighingAuth();
  const { submitRecord, isSubmitting } = useOfflineQueue();
  const { isPulseEffectEnabled } = useSettings();

  const [isGrossModalOpen, setIsGrossModalOpen] = useState(false);
  const [isTareModalOpen, setIsTareModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ index: number; item: WeighingItem } | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [tareError, setTareError] = useState('');
  const [viewMode, setViewMode] = useState<ListViewMode>('list');
  
  const isSimpleFlow = flowType === 'simple';

  const totalItemsWeight = useMemo(() => items.reduce((sum, item) => sum + item.weight, 0), [items]);
  const netWeight = useMemo(() => (grossWeight || 0) - (tareWeight || 0), [grossWeight, tareWeight]);
  const weightDifference = useMemo(() => netWeight - totalItemsWeight, [netWeight, totalItemsWeight]);
  const isVerified = isSimpleFlow || weightDifference === 0;
  
  const getLocationName = (locationId: string) => {
    // 顧客が「自社の荷物」として記録した場合 (customer-self)
    if (customerAsLocation && locationId === customerAsLocation.id) {
        return customerAsLocation.name;
    }
    // 協力会社ドライバーが「(自社)」として記録した場合 (own-company)
    if (locationId === 'own-company') {
        return `${companyName || driverName} (自社)`;
    }
    // マスターデータから通常の回収先を検索
    return locations.find(l => l.id === locationId)?.name || '不明な回収先';
  };

  const groupedItems = useMemo(() => {
    const groups = new Map<string, { itemsWithIndex: { item: WeighingItem; originalIndex: number }[]; subTotal: number }>();
    
    items.forEach((item, index) => {
      if (!groups.has(item.locationId)) {
        groups.set(item.locationId, { itemsWithIndex: [], subTotal: 0 });
      }
      const group = groups.get(item.locationId)!;
      group.itemsWithIndex.push({ item, originalIndex: index });
      group.subTotal += item.weight;
    });
  
    return groups;
  }, [items]);

  const handleSubmit = () => {
    if (isVerified && driverName && grossWeight !== null && tareWeight !== null) {
      submitRecord({
        driverName,
        companyName,
        grossWeight,
        tareWeight,
        items,
      });
    }
  };
  
  const handleTareReWeigh = (weight: number) => {
    if (grossWeight && weight >= grossWeight) {
      setTareError('空車重量は総重量より小さくする必要があります。');
      // Do not set weight on error
    } else {
      setTareError('');
      setTareWeight(weight);
    }
  };

  const handleUpdateItemWeight = (newWeight: number) => {
    if (editingItem && tareWeight !== null) {
      // 1. Create a prospective new list of items to calculate the new total.
      const newItems = [...items];
      newItems[editingItem.index] = { ...editingItem.item, weight: newWeight };
      
      // 2. Calculate the new total weight of all items.
      const newTotalItemsWeight = newItems.reduce((sum, item) => sum + item.weight, 0);

      // 3. Recalculate grossWeight based on the new total and constant tareWeight.
      const newGrossWeight = tareWeight + newTotalItemsWeight;

      // 4. Update the state for the item and the gross weight.
      updateItem(editingItem.index, { ...editingItem.item, weight: newWeight });
      setGrossWeight(newGrossWeight);
      
      // 5. Close the modal.
      setEditingItem(null);
    }
  };
  
  const handleConfirmDelete = () => {
    if (deletingIndex !== null && tareWeight !== null) {
        // 1. Create a prospective new list of items after deletion.
        const newItems = items.filter((_, i) => i !== deletingIndex);
        
        // 2. Calculate the new total item weight.
        const newTotalItemsWeight = newItems.reduce((sum, item) => sum + item.weight, 0);

        // 3. Recalculate grossWeight.
        const newGrossWeight = tareWeight + newTotalItemsWeight;

        // 4. Update state.
        removeItem(deletingIndex);
        setGrossWeight(newGrossWeight);

        // 5. Close the modal.
        setDeletingIndex(null);
    }
  };

  const handleAddMoreItems = () => {
    setTareWeight(null);
    // In express mode, there is no item step (2).
    // It should not be possible to get here in express mode without items.
    // So this will only apply to the default flow.
    goToStep(3); 
  };

  const renderItemRow = (item: WeighingItem, originalIndex: number, showLocation: boolean) => {
    const locationName = getLocationName(item.locationId);
    const itemName = masterItems.find(mi => mi.id === item.itemId)?.name || '不明な品目';
    
    return (
      <div key={originalIndex} className="p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md">
        <div className="flex justify-between items-start mb-2">
            <div>
                <p className="font-bold">{itemName}</p>
                {showLocation && <p className="text-sm text-slate-500 dark:text-slate-300">{locationName}</p>}
            </div>
            {!isExpressMode && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                <button onClick={() => setEditingItem({ index: originalIndex, item })} className="p-2 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400" aria-label="重量を編集">
                    <Edit size={18} />
                </button>
                <button onClick={() => setDeletingIndex(originalIndex)} className="p-2 text-red-500 hover:text-red-700" aria-label="品目を削除">
                    <Trash2 size={18} />
                </button>
                </div>
            )}
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-right">
            <span className="text-sm text-slate-600 dark:text-slate-300 mr-2">品目重量:</span>
            <span className="font-bold text-xl">{item.weight.toLocaleString()} kg</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1">ステップ {currentStep}/{maxSteps}</h2>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">最終確認と送信</p>
          </div>
          <HelpTooltip title="最終確認">
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>すべての計量データが表示されています。内容が正しいことを確認してください。</p>
              <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">重量の検証について</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  「差引重量」と「品目合計」が一致している必要があります。一致していない場合、品目重量の編集や追加ができます。
                </p>
              </div>
            </div>
          </HelpTooltip>
        </div>

        <div className="space-y-3">
          <DetailRow label="総重量" value={grossWeight?.toLocaleString() || 'N/A'}>
            <Button onClick={() => setIsGrossModalOpen(true)} variant="secondary" size="sm" className="px-2 !py-2.5" title="総重量を再計量">
              <Repeat size={16} />
            </Button>
          </DetailRow>
          <DetailRow label="空車重量" value={tareWeight?.toLocaleString() || 'N/A'}>
            <Button onClick={() => setIsTareModalOpen(true)} variant="secondary" size="sm" className="px-2 !py-2.5" title="空車重量を再計量">
              <Repeat size={16} />
            </Button>
          </DetailRow>
          <DetailRow label="差引重量" value={netWeight.toLocaleString()} className="bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 !font-bold" />
        </div>

        {!isSimpleFlow && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">品目内訳</h3>
                {items.length > 0 && (
                    <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
                )}
            </div>
             <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                 {viewMode === 'grouped' ? (
                    Array.from(groupedItems.entries()).map(([locId, group]) => {
                        const locationName = getLocationName(locId);
                        return (
                            <div key={locId} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <div className="flex justify-between items-baseline mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300">{locationName}</h4>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        小計: {group.subTotal.toLocaleString()} kg
                                    </p>
                                </div>
                                <div className="space-y-2">
                                {group.itemsWithIndex.map(({ item, originalIndex }) => renderItemRow(item, originalIndex, false))}
                                </div>
                            </div>
                        );
                    })
                 ) : (
                    items.map((item, index) => renderItemRow(item, index, true))
                 )}
                <div className="text-right font-bold text-lg pt-2 pr-2">
                    品目合計: {totalItemsWeight.toLocaleString()} kg
                </div>
            </div>
            
             <div className={`mt-4 p-3 rounded-lg text-center font-bold ${isVerified ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                <div className="flex items-center justify-center leading-tight">
                    {isVerified ? (
                        <><CheckCircle className="mr-2"/><span>重量の誤差はありません</span></>
                    ) : (
                        <>
                            <XCircle className="mr-2"/>
                            <span>
                                重量に <span className="text-2xl font-black">{weightDifference.toLocaleString()}</span> kg の誤差があります
                            </span>
                        </>
                    )}
                </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <Button onClick={prevStep} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div className="flex items-center space-x-2">
            {!isExpressMode && !isSimpleFlow && (
              <Button onClick={handleAddMoreItems} variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                品目を追加
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={!isVerified || isSubmitting} className={isPulseEffectEnabled ? 'highlight-navigation' : ''}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? '送信中...' : '記録を送信'}
            </Button>
          </div>
        </div>
      </Card>

      <WeighingModal
        isOpen={isGrossModalOpen}
        onClose={() => setIsGrossModalOpen(false)}
        onConfirm={setGrossWeight}
        title="総重量の再計量"
        label="計量器に表示された総重量"
        initialValue={grossWeight || undefined}
        step={10}
      />
      <WeighingModal
        isOpen={isTareModalOpen}
        onClose={() => { setIsTareModalOpen(false); setTareError(''); }}
        onConfirm={handleTareReWeigh}
        title="空車重量の再計量"
        label="計量器に表示された空車重量"
        initialValue={tareWeight || undefined}
        step={10}
      />
      
      {tareError && (
        <Modal isOpen={!!tareError} onClose={() => setTareError('')} title="入力エラー">
            <p className="text-red-600">{tareError}</p>
            <div className="text-right mt-4">
                <Button onClick={() => setTareError('')}>閉じる</Button>
            </div>
        </Modal>
      )}

      {editingItem && (
        <WeighingModal
            isOpen={!!editingItem}
            onClose={() => setEditingItem(null)}
            onConfirm={handleUpdateItemWeight}
            title={`${masterItems.find(mi => mi.id === editingItem.item.itemId)?.name} の重量編集`}
            label="新しい品目重量"
            initialValue={editingItem.item.weight}
            step={10}
        />
      )}
      
      {deletingIndex !== null && (
        <Modal
            isOpen={deletingIndex !== null}
            onClose={() => setDeletingIndex(null)}
            title="品目の削除"
        >
            <p className="text-slate-600 dark:text-slate-300 mb-6">
                「{masterItems.find(mi => mi.id === items[deletingIndex].itemId)?.name}」をリストから削除しますか？<br/>
                総重量が自動的に再計算されます。
            </p>
            <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setDeletingIndex(null)}>キャンセル</Button>
                <Button variant="danger" onClick={handleConfirmDelete}>はい、削除します</Button>
            </div>
        </Modal>
      )}

    </>
  );
};

export default ConfirmStep;
