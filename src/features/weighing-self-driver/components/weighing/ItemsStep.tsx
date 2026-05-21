/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useMemo, useEffect } from 'react';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import { useMasterData } from '../../contexts/MasterDataContext';
import { useWeighingAuth } from '../../contexts/WeighingAuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Card from '../ui/Card';
import ScaleDifferenceModal from './ScaleDifferenceModal';
import WeighingModal from '../ui/WeighingModal';
import Modal from '../ui/Modal';
import ViewSwitcher, { type ListViewMode } from '../ui/ViewSwitcher';

import HelpTooltip from '../ui/HelpTooltip';
import { Trash2, Plus, GaugeCircle, Edit, Truck, ArrowLeft } from 'lucide-react';
import type { WeighingItem } from '../../types';

const LAST_USED_LOCATION_KEY = 'lastUsedLocationId';

const ItemsStep: React.FC = () => {
  const { items, grossWeight, addItem, removeItem, updateItem, nextStep, prevStep, maxSteps, customerAsLocation } = useWeighingSession();
  const { locations, items: masterItems, isLoading } = useMasterData();
  const { companyName, driverName, userType } = useWeighingAuth();
  const { isPulseEffectEnabled } = useSettings();

  const [locationId, setLocationId] = useState(() => {
    if (customerAsLocation) return customerAsLocation.id;
    return localStorage.getItem(LAST_USED_LOCATION_KEY) || '';
  });

  useEffect(() => {
    if (customerAsLocation) {
      setLocationId(customerAsLocation.id);
    }
  }, [customerAsLocation]);

  const [itemId, setItemId] = useState('');
  
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isNextActionModalOpen, setIsNextActionModalOpen] = useState(false);
  const [weightBeforeUnload, setWeightBeforeUnload] = useState(0);
  const [editingItem, setEditingItem] = useState<{ index: number; item: WeighingItem } | null>(null);
  const [viewMode, setViewMode] = useState<ListViewMode>('grouped');

  const totalItemsWeight = items.reduce((sum, item) => sum + item.weight, 0);

  const getLocationName = (locationId: string) => {
    const loggedInEntityName = userType === 'company' && companyName ? companyName : driverName;
    if (loggedInEntityName && locationId === 'own-company') {
      return `${loggedInEntityName} (自社)`;
    }
    if (customerAsLocation && locationId === customerAsLocation.id) {
        return customerAsLocation.name;
    }
    return locations.find(l => l.id === locationId)?.name || '不明な回収先';
  };
  
  const availableLocations = useMemo(() => {
    if (customerAsLocation) {
        // "Own Goods" flow: The location is locked to the user's company/name.
        const existing = locations.find(l => l.id === customerAsLocation.id);
        if (existing) return locations;
        return [customerAsLocation, ...locations];
    }
    
    // "Select collection point" flow: Add the user's own entity as an option.
    const allLocations = [...locations];
    const loggedInEntityName = userType === 'company' && companyName ? companyName : driverName;

    if (loggedInEntityName) {
      const ownCompanyOption = { id: 'own-company', name: `${loggedInEntityName} (自社)` };
      // Prevent duplicates.
      if (!allLocations.some(loc => loc.id === 'own-company')) {
        allLocations.unshift(ownCompanyOption);
      }
    }
    return allLocations;
  }, [locations, customerAsLocation, companyName, driverName, userType]);

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

  const handleOpenScaleModal = () => {
    const currentTruckWeight = (grossWeight || 0) - totalItemsWeight;
    setWeightBeforeUnload(currentTruckWeight);
    setIsScaleModalOpen(true);
  };

  const handleItemAdded = () => {
    // フォームの品目選択をリセット
    setItemId('');
    // 次のアクションを問うモーダルを開く
    setIsNextActionModalOpen(true);
  };

  const handleConfirmManualWeight = (weightNum: number) => {
    if (locationId && itemId) {
      const newItem: WeighingItem = { locationId, itemId, weight: weightNum };
      addItem(newItem);
      if (!customerAsLocation) {
        localStorage.setItem(LAST_USED_LOCATION_KEY, locationId);
      }
      setIsManualModalOpen(false);
      handleItemAdded();
    }
  };

  const handleConfirmScaleWeight = (scaledWeight: number) => {
    if (locationId && itemId) {
      addItem({ locationId, itemId, weight: scaledWeight });
      if (!customerAsLocation) {
        localStorage.setItem(LAST_USED_LOCATION_KEY, locationId);
      }
      setIsScaleModalOpen(false);
      handleItemAdded();
    }
  };
  
  const handleUpdateItemWeight = (newWeight: number) => {
    if (editingItem) {
      // 品目情報を更新します。
      // この更新により、Reactの仕組みでコンポーネントが再レンダリングされ、
      // 画面に表示されている合計重量や、各品目横の「残りの車両重量」、
      // そして次に差分計量を行う際の基準重量などが自動的に再計算されます。
      updateItem(editingItem.index, { ...editingItem.item, weight: newWeight });
      setEditingItem(null);
    }
  };

  const handleGoBack = () => {
    // In the new unified flow, "Back" from ItemsStep always returns to SelectionStep.
    // prevStep() correctly handles this by decrementing the step counter.
    prevStep();
  };

  const backButtonText = '記録方法の選択に戻る';
  const canProceed = locationId && itemId;
  
  const renderItemRow = (item: WeighingItem, originalIndex: number, showLocation: boolean) => {
    const totalWeightUpToIndex = items
        .slice(0, originalIndex + 1)
        .reduce((sum, current) => sum + current.weight, 0);
    const remainingVehicleWeight = (grossWeight || 0) - totalWeightUpToIndex;

    return (
      <div key={originalIndex} className="p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md">
          <div className="flex justify-between items-start mb-2">
              <div>
                  <p className="font-bold">{masterItems.find(mi => mi.id === item.itemId)?.name}</p>
                  {showLocation && <p className="text-sm text-slate-500 dark:text-slate-300">{getLocationName(item.locationId)}</p>}
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                      <Truck size={12} className="inline mr-1" />
                      この品目を降ろした後の車両重量: {remainingVehicleWeight.toLocaleString()} kg
                  </p>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                  <button onClick={() => setEditingItem({ index: originalIndex, item })} className="p-2 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400" aria-label="重量を編集">
                      <Edit size={18} />
                  </button>
                  <button onClick={() => removeItem(originalIndex)} className="p-2 text-red-500 hover:text-red-700" aria-label="品目を削除">
                      <Trash2 size={18} />
                  </button>
              </div>
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
            <h2 className="text-xl font-bold mb-1">ステップ 3/{maxSteps}</h2>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">品目を追加してください</p>
          </div>
          <HelpTooltip title="品目の追加方法">
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">品目の重量を記録するには、2つの方法があります。</h4>
              <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <h5 className="font-semibold text-blue-600 dark:text-blue-400">1. 台貫で計量（差分計量）</h5>
                  <p className="text-sm text-slate-700 dark:text-slate-200">最も正確な方法です。品物を荷台から降ろした後に、もう一度車両の重量を計量します。その差分が、降ろした品物の重量として自動で計算・記録されます。</p>
              </div>
              <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <h5 className="font-semibold text-blue-600 dark:text-blue-400">2. 手入力する</h5>
                  <p className="text-sm text-slate-700 dark:text-slate-200">品物の重量が分かっている場合や、概算で記録したい場合に使います。手動で重量を入力して記録します。</p>
              </div>
            </div>
          </HelpTooltip>
        </div>

        <div className={`space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 mb-6`}>
          <div className={!locationId && isPulseEffectEnabled ? 'highlight-navigation p-1 -m-1 rounded-lg' : ''}>
            <Select
              id="location"
              label="回収先"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              disabled={isLoading || !!customerAsLocation}
            >
              <option value="">選択してください</option>
              {availableLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </Select>
          </div>
          <div className={locationId && !itemId && isPulseEffectEnabled ? 'highlight-navigation p-1 -m-1 rounded-lg' : ''}>
            <Select
              id="item"
              label="品目"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              disabled={isLoading || !locationId}
            >
              <option value="">選択してください</option>
              {masterItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
          </div>

          {canProceed && (
            <div className="pt-4 grid grid-cols-2 gap-2">
                <Button onClick={handleOpenScaleModal} variant="primary" fullWidth className={isPulseEffectEnabled ? 'highlight-navigation' : ''}>
                    <GaugeCircle className="mr-2 h-5 w-5" />
                    台貫で計量
                </Button>
                <Button onClick={() => setIsManualModalOpen(true)} variant="secondary" fullWidth className={isPulseEffectEnabled ? 'highlight-navigation' : ''}>
                    <Edit className="mr-2 h-5 w-5" />
                    手入力する
                </Button>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">追加済み品目リスト</h3>
            {items.length > 0 && (
                <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-300 text-center py-4">まだ品目が追加されていません。</p>
          ) : (
            <div className="space-y-4">
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
                合計: {totalItemsWeight.toLocaleString()} kg
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <Button onClick={handleGoBack} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backButtonText}
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={items.length === 0}
            className={items.length > 0 && isPulseEffectEnabled ? 'highlight-navigation' : ''}
          >
            空車計量へ進む
            <Truck className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
      
      <ScaleDifferenceModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        onConfirm={handleConfirmScaleWeight}
        itemName={masterItems.find(mi => mi.id === itemId)?.name || '選択された品目'}
        weightBefore={weightBeforeUnload}
      />
      
      <WeighingModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onConfirm={handleConfirmManualWeight}
        title={`「${masterItems.find(mi => mi.id === itemId)?.name || '品目'}」の重量入力`}
        label="品目重量（手入力）"
        step={10}
      />

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

      <Modal
        isOpen={isNextActionModalOpen}
        onClose={() => setIsNextActionModalOpen(false)}
        title="品目を追加しました"
      >
        <p className="text-slate-600 dark:text-slate-300 mb-6">次の操作を選択してください。</p>
        <div className="flex flex-col space-y-3">
          <Button variant="secondary" onClick={() => setIsNextActionModalOpen(false)} fullWidth className={isPulseEffectEnabled ? 'highlight-navigation' : ''}>
            <Plus className="mr-2 h-5 w-5" />
            続けて追加
          </Button>
          <Button variant="primary" onClick={() => {
            setIsNextActionModalOpen(false);
            nextStep();
          }} fullWidth className={isPulseEffectEnabled ? 'highlight-navigation' : ''}>
            <Truck className="mr-2 h-5 w-5" />
            空車計量へ進む
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ItemsStep;
