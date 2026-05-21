import React, { useState, useMemo } from 'react';
import type { WeighingRecord, WeighingItem, Item, Location } from '../../types';
import { Edit, Trash2, Scale, Package, AlertTriangle, LayoutGrid, List, Plus } from 'lucide-react';
import { deleteWeighingItem } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';
import AlertDialog from '../ui/AlertDialog';

interface RecordDetailRowProps {
  record: WeighingRecord;
  onDeleteRequest: (record: WeighingRecord) => void;
  onEditRequest: (record: WeighingRecord) => void;
  onRecordUpdate: (recordId: string) => void;
  onOpenItemForm: (mode: 'add' | 'edit', item?: WeighingItem) => void;
  allItems: Item[];
  allLocations: Location[];
}

const RecordDetailRow: React.FC<RecordDetailRowProps> = ({ record, onDeleteRequest, onEditRequest, onRecordUpdate, onOpenItemForm, allItems: _allItems, allLocations: _allLocations }) => {
  const [viewMode, setViewMode] = useState<'location' | 'time'>('location');
  const [deletingItem, setDeletingItem] = useState<WeighingItem | null>(null);
  
  const { showToast } = useToast();

  const itemsTotal = record.items.reduce((sum, item) => sum + item.weight, 0);
  const errorWeight = record.netWeight - itemsTotal;
  const isGrossInvalid = record.grossWeight % 10 !== 0;
  const isTareInvalid = record.tareWeight % 10 !== 0;

  const getWeighingDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const calculationBreakdown = useMemo(() => {
    // This calculation is for display purposes and might need adjustment if item order changes
    const sortedItems = [...record.items].sort((a, b) => a.id.localeCompare(b.id)); // sort for consistent calculation
    return sortedItems.reduce((acc, item, index) => {
        const startWeight = index === 0 ? record.grossWeight : acc[index - 1].endWeight;
        const endWeight = startWeight - item.weight;
        acc.push({ ...item, startWeight, endWeight });
        return acc;
    }, [] as (WeighingItem & { startWeight: number; endWeight: number })[]);
  }, [record.items, record.grossWeight]);

  const groupedItems = useMemo(() => calculationBreakdown.reduce((acc, item) => {
    const location = item.locationName;
    if (!acc[location]) acc[location] = [];
    acc[location].push(item);
    return acc;
  }, {} as Record<string, typeof calculationBreakdown>), [calculationBreakdown]);

  const handleDeleteItem = async () => {
      if (!deletingItem) return;
      try {
        await deleteWeighingItem(record.recordId, deletingItem.id);
        showToast(`品目「${deletingItem.itemName}」を削除しました。`);
        onRecordUpdate(record.recordId);
        setDeletingItem(null);
      } catch (error) {
        console.error("Failed to delete item:", error);
        showToast("品目の削除に失敗しました。", "error");
      }
  };

  const viewModeToggle = (
    <div className="tw-flex tw-items-center tw-gap-1 tw-p-1 tw-bg-background-tertiary tw-rounded-md">
       <button
        onClick={() => setViewMode('location')}
        className={`tw-px-2 tw-py-1 tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-rounded-md tw-transition-colors ${viewMode === 'location' ? 'tw-bg-background-primary tw-shadow-sm tw-text-text-primary tw-font-semibold' : 'tw-text-text-secondary hover:tw-bg-background-primary/50'}`}
      >
        <LayoutGrid className="tw-w-3.5 tw-h-3.5" />
        回収先別
      </button>
      <button
        onClick={() => setViewMode('time')}
        className={`tw-px-2 tw-py-1 tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-rounded-md tw-transition-colors ${viewMode === 'time' ? 'tw-bg-background-primary tw-shadow-sm tw-text-text-primary tw-font-semibold' : 'tw-text-text-secondary hover:tw-bg-background-primary/50'}`}
      >
        <List className="tw-w-3.5 tw-h-3.5" />
        時系列
      </button>
    </div>
  );
  
  const renderCalculationRow = (item: (typeof calculationBreakdown)[0]) => {
      const isItemWeightInvalid = item.weight % 10 !== 0;
      return (
      <div key={item.id} className="tw-group tw-bg-background-tertiary tw-p-2.5 tw-rounded-md tw-flex tw-justify-between tw-items-center tw-text-sm tw-border-b tw-border-background-primary">
          <div className="tw-flex-1 tw-truncate tw-font-medium tw-pr-4">
              <span className="tw-text-text-secondary tw-mr-2">#{record.items.findIndex(i => i.id === item.id) + 1}</span>
              {item.itemName} ({item.method})
              {viewMode === 'time' && <span className="tw-text-xs tw-text-text-secondary tw-ml-2">({item.locationName})</span>}
          </div>
          <div className="tw-flex tw-items-center tw-gap-4">
              <div className="tw-font-sans tw-text-base tw-font-bold tw-flex tw-items-baseline tw-justify-end tw-gap-x-3 tw-flex-wrap">
                <div className="tw-text-text-secondary">{item.startWeight.toLocaleString()}kg</div>
                <div className="tw-text-text-secondary">-</div>
                <div className="tw-text-text-secondary">{item.endWeight.toLocaleString()}kg</div>
                <div className="tw-text-text-secondary">=</div>
                <div className={`${isItemWeightInvalid ? 'tw-text-error' : 'tw-text-text-primary'}`}>{item.weight.toLocaleString()}kg</div>
              </div>
              <div className="tw-flex tw-items-center tw-gap-1 tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity">
                  <button onClick={() => onOpenItemForm('edit', item)} className="tw-p-1.5 tw-rounded-md tw-text-text-secondary hover:tw-bg-background-primary hover:tw-text-interactive-default" aria-label="品目を編集"><Edit className="tw-w-4 tw-h-4"/></button>
                  <button onClick={() => setDeletingItem(item)} className="tw-p-1.5 tw-rounded-md tw-text-text-secondary hover:tw-bg-background-primary hover:tw-text-error" aria-label="品目を削除"><Trash2 className="tw-w-4 tw-h-4"/></button>
              </div>
          </div>
      </div>
      );
  };

  return (
    <>
      <div className="tw-p-6 tw-bg-background-primary tw-text-text-primary" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6">
          
          <div className="lg:tw-col-span-1 tw-space-y-6">
            <div className="tw-flex tw-items-start tw-gap-3">
              <Scale className="tw-w-6 tw-h-6 tw-text-text-secondary tw-flex-shrink-0 tw-mt-1" />
              <div>
                <p className="tw-text-sm tw-text-text-secondary">計量情報 {getWeighingDate(record.weighedAt)}</p>
                <p className={`tw-font-semibold ${isGrossInvalid ? 'tw-text-error' : ''}`}>総重量: {record.grossWeight.toLocaleString()} kg</p>
                <p className={`tw-text-sm tw-text-text-secondary ${isTareInvalid ? 'tw-text-error' : ''}`}>空車重量: {record.tareWeight.toLocaleString()} kg</p>
              </div>
            </div>
            
            <div className="tw-space-y-2">
                <p className="tw-text-sm tw-text-text-secondary">差引重量(総重量-空車)</p>
                <p className="tw-text-2xl tw-font-bold tw-text-yellow-400 dark:tw-text-yellow-300">{record.netWeight.toLocaleString()} kg</p>
            </div>
            <div className="tw-space-y-2">
                <p className="tw-text-sm tw-text-text-secondary">品目合計重量</p>
                <p className="tw-text-2xl tw-font-bold">{itemsTotal.toLocaleString()} kg</p>
            </div>

            {errorWeight !== 0 && (
              <div className="tw-flex tw-items-center tw-gap-3 tw-text-warning tw-bg-yellow-900/40 tw-p-3 tw-rounded-lg">
                  <AlertTriangle className="tw-w-8 tw-h-8 tw-flex-shrink-0"/>
                  <div>
                      <p className="tw-font-bold">誤差があります</p>
                      <p className="tw-text-lg tw-font-bold">{errorWeight > 0 ? '+' : ''}{errorWeight.toLocaleString()} kg</p>
                  </div>
              </div>
            )}
          </div>

          <div className="lg:tw-col-span-2 tw-space-y-4">
            <div className="tw-bg-background-secondary tw-border tw-border-border-default tw-rounded-lg tw-p-4 tw-h-full">
              <header className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                  <h3 className="tw-flex tw-items-center tw-font-bold tw-text-text-primary">
                    <Package className="tw-w-5 tw-h-5 tw-mr-3 tw-text-text-secondary" />
                    品目詳細 - 計算過程
                  </h3>
                  <div className="tw-flex tw-items-center tw-gap-2">
                     {viewModeToggle}
                     <Button size="sm" variant="outline" icon={<Plus className="tw-w-4 tw-h-4"/>} onClick={() => onOpenItemForm('add')}>品目を追加</Button>
                  </div>
              </header>
              <div className="tw-space-y-4">
                {record.items.length === 0 ? (
                  <div className="tw-text-center tw-py-8 tw-text-text-secondary">
                    <p>品目が登録されていません。</p>
                    <p className="tw-text-sm">「品目を追加」から登録してください。</p>
                  </div>
                ) : viewMode === 'location' ? (
                  Object.entries(groupedItems).map(([locationName, items]) => (
                      <div key={locationName}>
                        <p className="tw-text-sm tw-font-semibold tw-text-text-secondary tw-mb-2">{locationName}</p>
                        <div className="tw-space-y-1">
                          {items.map(renderCalculationRow)}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="tw-space-y-1">
                      {calculationBreakdown.map(renderCalculationRow)}
                  </div>
                )}
              </div>
            </div>
            <div className="tw-flex tw-justify-end tw-items-center tw-gap-6">
              <button className="tw-flex tw-items-center tw-gap-1.5 tw-text-sm tw-text-text-secondary hover:tw-text-error tw-transition-colors" onClick={() => onDeleteRequest(record)}>
                  <Trash2 className="tw-w-4 tw-h-4" /> この記録を削除
              </button>
              <button className="tw-flex tw-items-center tw-gap-1.5 tw-text-sm tw-text-text-secondary hover:tw-text-interactive-default tw-transition-colors" onClick={() => onEditRequest(record)}>
                  <Edit className="tw-w-4 tw-h-4" /> 記録情報を編集
              </button>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
      
      {deletingItem && (
        <AlertDialog
            isOpen={!!deletingItem}
            onClose={() => setDeletingItem(null)}
            onConfirm={handleDeleteItem}
            title="品目の削除"
            description={`品目「${deletingItem.itemName}」を本当に削除しますか？この操作は元に戻せません。`}
            confirmText="削除"
        />
      )}
    </>
  );
};

export default RecordDetailRow;
