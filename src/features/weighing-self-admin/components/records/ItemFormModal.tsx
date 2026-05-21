import React, { useState, useEffect, useMemo } from 'react';
import type { WeighingRecord, WeighingItem, Item, Location } from '../../types';
import Button from '../ui/Button';
import { X, Minus, Plus, AlertTriangle } from 'lucide-react';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mode: 'add' | 'edit', itemData: Partial<WeighingItem>) => Promise<void>;
  mode: 'add' | 'edit';
  record: WeighingRecord;
  itemToEdit?: WeighingItem;
  allItems: Item[];
  allLocations: Location[];
}

type CalculationItem = WeighingItem & {
  startWeight: number;
  endWeight: number;
};

const ItemFormModal: React.FC<ItemFormModalProps> = ({ isOpen, onClose, onSave, mode, record, itemToEdit, allItems, allLocations }) => {
  const [formData, setFormData] = useState({
    locationId: '',
    itemId: '',
    weight: 0,
    method: '台貫' as '台貫' | '目見当'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && itemToEdit) {
        setFormData({
          locationId: itemToEdit.locationId,
          itemId: itemToEdit.itemId,
          weight: itemToEdit.weight,
          method: itemToEdit.method,
        });
      } else {
        // Reset for 'add' mode
        setFormData({
          locationId: allLocations[0]?.id || '',
          itemId: allItems[0]?.id || '',
          weight: 0,
          method: '台貫'
        });
      }
      setErrors({}); // Clear errors when modal opens
    }
  }, [isOpen, mode, itemToEdit, allItems, allLocations]);

  const validate = (data: typeof formData) => {
    const newErrors: Record<string, string> = {};
    if (!data.locationId) newErrors.locationId = '回収先を選択してください。';
    if (!data.itemId) newErrors.itemId = '品目を選択してください。';
    if (data.weight % 10 !== 0) newErrors.weight = '品目重量は10kg単位で入力してください。';
    return newErrors;
  }

  const sortedOriginalItems = useMemo(() => 
    [...record.items].sort((a, b) => a.id.localeCompare(b.id)), 
  [record.items]);

  const editItemIndex = useMemo(() => 
    itemToEdit ? sortedOriginalItems.findIndex(i => i.id === itemToEdit.id) : -1,
  [sortedOriginalItems, itemToEdit]);

  const { originalCalculation, adjustedCalculation } = useMemo(() => {
    if (mode !== 'edit') return { originalCalculation: [], adjustedCalculation: [] };

    const calculate = (items: WeighingItem[]): CalculationItem[] => {
      return items.reduce((acc, item, index) => {
        const startWeight = index === 0 ? record.grossWeight : acc[index - 1].endWeight;
        const endWeight = startWeight - item.weight;
        acc.push({ ...item, startWeight, endWeight });
        return acc;
      }, [] as CalculationItem[]);
    };

    const originalCalc = calculate(sortedOriginalItems);

    const tempAdjustedItems = sortedOriginalItems.map(item => 
      item.id === itemToEdit?.id ? { ...item, weight: formData.weight } : item
    );
    const adjustedCalc = calculate(tempAdjustedItems);
    
    return { originalCalculation: originalCalc, adjustedCalculation: adjustedCalc };
  }, [mode, record.grossWeight, sortedOriginalItems, itemToEdit, formData.weight]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';
    const newFormData = {
        ...formData,
        [name]: isNumber ? Number(value) : value
    };
    setFormData(newFormData);
    setErrors(validate(newFormData));
  };
  
  const handleAdjustWeight = (amount: number) => {
    const newWeight = Math.max(0, formData.weight + amount);
    const newFormData = { ...formData, weight: newWeight };
    setFormData(newFormData);
    setErrors(validate(newFormData));
  };
  
  const handleSubmit = async () => {
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    setIsSaving(true);
    try {
        const location = allLocations.find(l => l.id === formData.locationId);
        const itemInfo = allItems.find(i => i.id === formData.itemId);

        const saveData = {
            ...formData,
            locationName: location?.name || '',
            itemName: itemInfo?.name || '',
        };
        await onSave(mode, saveData);
    } catch {
        // Error toast is shown by parent, just stop loading
    } finally {
        setIsSaving(false);
    }
  };

  if (!isOpen) return null;
  
  const title = mode === 'add' ? '品目の追加' : `品目重量の調整 (${itemToEdit?.itemName})`;
  const description = mode === 'add' ? '新しい品目を記録に追加します。' : '品目の重量を調整し、後続への影響を確認します。';
  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black/60 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tw-bg-background-primary tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[90vh] tw-flex tw-flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <header className="tw-p-5 tw-border-b tw-border-border-default tw-flex tw-justify-between tw-items-center">
          <div>
             <h2 className="tw-text-xl tw-font-bold">{title}</h2>
             <p className="tw-text-sm tw-text-text-secondary tw-mt-1">{description}</p>
          </div>
          <button onClick={onClose} className="tw-p-2 tw-rounded-full hover:tw-bg-background-tertiary tw-transition-colors">
            <X className="tw-w-5 tw-h-5 tw-text-text-secondary" />
          </button>
        </header>

        <main className="tw-flex-1 tw-overflow-y-auto tw-p-6 tw-space-y-6">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div>
                  <label htmlFor="locationId" className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">回収先</label>
                  <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} disabled={mode === 'edit'}
                      className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default disabled:tw-bg-background-tertiary">
                      {allLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
              </div>
              <div>
                  <label htmlFor="itemId" className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">品目</label>
                  <select id="itemId" name="itemId" value={formData.itemId} onChange={handleChange} disabled={mode === 'edit'}
                      className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default disabled:tw-bg-background-tertiary">
                      {allItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
              </div>
          </div>
          
          <div className="tw-bg-background-secondary tw-p-4 tw-rounded-lg tw-border tw-border-border-default">
            {mode === 'edit' && adjustedCalculation.length > 0 && (
                <div className="tw-grid tw-grid-cols-3 tw-items-center tw-text-center tw-gap-4">
                    <div>
                        <p className="tw-text-sm tw-text-text-secondary">計量前</p>
                        <p className="tw-text-2xl tw-font-bold">{originalCalculation[editItemIndex].startWeight.toLocaleString()}<span className="tw-text-sm tw-text-text-secondary tw-ml-1">kg</span></p>
                    </div>
                    <div className="tw-font-bold tw-text-3xl tw-text-text-secondary">-</div>
                    <div>
                        <p className="tw-text-sm tw-text-text-secondary">計量後</p>
                        <p className="tw-text-2xl tw-font-bold">{adjustedCalculation[editItemIndex].endWeight.toLocaleString()}<span className="tw-text-sm tw-text-text-secondary tw-ml-1">kg</span></p>
                    </div>
                </div>
            )}
            <div className={`tw-mt-4 ${mode === 'edit' && 'tw-pt-4 tw-border-t tw-border-border-default'} tw-flex tw-flex-col tw-items-center`}>
                <label className="tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-2">品目重量</label>
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAdjustWeight(-10)} className="tw-w-10 tw-h-10 tw-p-0"><Minus className="tw-w-5 tw-h-5"/></Button>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} step={10}
                        className={`tw-w-40 tw-h-12 tw-text-2xl tw-font-bold tw-text-center tw-bg-background-primary tw-border tw-rounded-md focus:tw-outline-none tw-transition-colors ${errors.weight ? 'tw-border-error' : 'tw-border-border-default focus:tw-border-interactive-default'}`} />
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAdjustWeight(10)} className="tw-w-10 tw-h-10 tw-p-0"><Plus className="tw-w-5 tw-h-5"/></Button>
                </div>
                {errors.weight && <p className="tw-text-sm tw-text-error tw-mt-2">{errors.weight}</p>}
            </div>
          </div>
          
          {mode === 'edit' && (
            <div>
              <h3 className="tw-font-semibold tw-mb-2">影響プレビュー</h3>
              <div className="tw-border tw-border-border-default tw-rounded-lg tw-bg-background-secondary tw-p-4 tw-space-y-2 tw-max-h-48 tw-overflow-y-auto">
                  {adjustedCalculation.slice(editItemIndex + 1).length > 0 ? (
                      adjustedCalculation.slice(editItemIndex + 1).map((item, i) => {
                           const originalItem = originalCalculation[editItemIndex + 1 + i];
                           const startWeightChanged = item.startWeight !== originalItem.startWeight;
                           return (
                               <div key={item.id} className={`tw-text-sm tw-p-2 tw-rounded-md tw-bg-background-primary tw-border tw-transition-colors ${startWeightChanged ? 'tw-border-green-500/30' : 'tw-border-transparent'}`}>
                                   <p className="tw-font-medium tw-text-text-primary">{item.itemName}</p>
                                   <div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mt-1 tw-text-xs tw-text-text-secondary">
                                       <div className={`tw-p-1 tw-rounded ${startWeightChanged ? 'tw-bg-green-500/10' : ''}`}>
                                           <p>計量前:
                                               <span className={`tw-font-mono tw-ml-1 ${startWeightChanged ? 'tw-text-green-600 dark:tw-text-green-400 tw-font-bold' : ''}`}>{item.startWeight.toLocaleString()} kg</span>
                                               {startWeightChanged && <span className="tw-font-mono tw-text-gray-400 tw-line-through tw-ml-1">{originalItem.startWeight.toLocaleString()}</span>}
                                           </p>
                                       </div>
                                       <div className={`tw-p-1 tw-rounded ${startWeightChanged ? 'tw-bg-green-500/10' : ''}`}>
                                           <p>計量後:
                                               <span className={`tw-font-mono tw-ml-1 ${startWeightChanged ? 'tw-text-green-600 dark:tw-text-green-400 tw-font-bold' : ''}`}>{item.endWeight.toLocaleString()} kg</span>
                                               {startWeightChanged && <span className="tw-font-mono tw-text-gray-400 tw-line-through tw-ml-1">{originalItem.endWeight.toLocaleString()}</span>}
                                           </p>
                                       </div>
                                   </div>
                               </div>
                           )
                      })
                  ) : (
                      <p className="tw-text-center tw-text-sm tw-text-text-secondary tw-py-4">この品目より後の計量記録はありません。</p>
                  )}
              </div>
            </div>
          )}
            
          <div className="tw-flex tw-items-center tw-gap-3 tw-text-warning tw-bg-yellow-900/40 tw-p-3 tw-rounded-lg">
              <AlertTriangle className="tw-w-8 tw-h-8 tw-flex-shrink-0"/>
              <div>
                  <p className="tw-font-bold">調整後の差引重量と品目合計の誤差</p>
                  <p className="tw-text-lg tw-font-bold">
                    {(() => {
                        const items = mode === 'edit' ? adjustedCalculation : [...sortedOriginalItems, { weight: formData.weight }];
                        const newTotal = items.reduce((sum, item) => sum + item.weight, 0);
                        const newError = record.netWeight - newTotal;
                        return `${newError > 0 ? '+' : ''}${newError.toLocaleString()} kg`
                    })()}
                  </p>
              </div>
          </div>
        </main>

        <footer className="tw-p-4 tw-bg-background-tertiary tw-rounded-b-xl tw-flex tw-justify-end tw-gap-3 tw-border-t tw-border-border-default">
          <Button type="button" variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button type="button" onClick={handleSubmit} loading={isSaving} disabled={hasValidationErrors}>この内容で保存</Button>
        </footer>

        <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.2s ease-out; }
          .animate-slide-up { animation: slide-up 0.2s ease-out; }
        `}</style>
      </div>
    </div>
  );
};

export default ItemFormModal;
