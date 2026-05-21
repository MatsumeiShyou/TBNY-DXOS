



import React, { useState, useMemo, useEffect } from 'react';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import { useMasterData } from '../../contexts/MasterDataContext';
import { useWeighingAuth } from '../../contexts/WeighingAuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import WeighingModal from '../ui/WeighingModal';
import Select from '../ui/Select';
import HelpTooltip from '../ui/HelpTooltip';
import { ArrowRight, ArrowLeft, GaugeCircle, Repeat } from 'lucide-react';

const LAST_USED_LOCATION_KEY = 'lastUsedLocationId';

const TareStep: React.FC = () => {
  const { 
    grossWeight,
    tareWeight,
    setTareWeight,
    items,
    addItem,
    updateItem,
    removeItem,
    nextStep, 
    prevStep, 
    goToStep,
    maxSteps,
    currentStep,
    customerAsLocation,
  } = useWeighingSession();
  const { locations, items: masterItems, isLoading: isMasterLoading } = useMasterData();
  const { companyName, driverName, userType } = useWeighingAuth();
  const { isPulseEffectEnabled } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [locationId, setLocationId] = useState(() => {
    if (customerAsLocation) return customerAsLocation.id;
    return localStorage.getItem(LAST_USED_LOCATION_KEY) || '';
  });
  const [itemId, setItemId] = useState('');
  const [lastAddedItemIndex, setLastAddedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    if (customerAsLocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationId(customerAsLocation.id);
    }
  }, [customerAsLocation]);

  const isFirstAndOnlyItem = items.length === 0;

  useEffect(() => {
    if (tareWeight !== null && lastAddedItemIndex === null && items.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastAddedItemIndex(items.length - 1);
    }
  }, [tareWeight, items.length, lastAddedItemIndex]);
  
  const totalItemsWeightBeforeLast = useMemo(() => {
    const itemsToSum = (lastAddedItemIndex !== null) 
      ? items.slice(0, lastAddedItemIndex) 
      : items;
    return itemsToSum.reduce((sum, item) => sum + item.weight, 0);
  }, [items, lastAddedItemIndex]);

  const weightBeforeUnload = (grossWeight || 0) - totalItemsWeightBeforeLast;
  
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


  const handleConfirmWeight = (finalTareWeight: number) => {
    if (finalTareWeight >= weightBeforeUnload) {
      setError('空車重量は、荷降ろし前の車両重量より小さくする必要があります。');
      return;
    }
    setError('');

    if (!locationId || !itemId) {
        setError('回収先と品目を選択してください。');
        return;
    }
    const lastItemWeight = weightBeforeUnload - finalTareWeight;

    if (lastItemWeight <= 0) {
        setError('品目重量が0以下になります。重量を確認してください。');
        return;
    }
    
    if (!customerAsLocation) {
      localStorage.setItem(LAST_USED_LOCATION_KEY, locationId);
    }
    const lastItem = { locationId, itemId, weight: lastItemWeight };

    if (lastAddedItemIndex !== null) {
        updateItem(lastAddedItemIndex, lastItem);
    } else {
        addItem(lastItem);
    }
    setTareWeight(finalTareWeight);
  };
  
  const handleNextWithValidation = () => {
    if (tareWeight === null) {
        const message = '品目を計量し、空車重量を確定してください。';
        setError(message);
        return;
    }
    nextStep();
  }

  const handleGoBack = () => {
    if (lastAddedItemIndex !== null) {
      removeItem(lastAddedItemIndex);
    }
    setTareWeight(null);
    setLastAddedItemIndex(null);
    if (!customerAsLocation) {
        setLocationId('');
    }
    setItemId('');
    setError('');

    prevStep();
  };

  if (grossWeight === null) {
      goToStep(1);
      return null;
  }

  const canWeigh = locationId && itemId;
  const stepTitle = isFirstAndOnlyItem ? '品目を記録・空車重量を確定' : '最終品目を計量・空車重量を確定';
  const helpTitle = isFirstAndOnlyItem ? '品目の記録と空車重量の確定' : '最終品目の計量とは？';
  const helpContent = isFirstAndOnlyItem ? (
    <>
      <p>すべての品物をまとめて荷降ろしした場合に使用します。</p>
      <div className="tw-mt-2 tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600">
          <p className="tw-text-sm tw-text-slate-700 dark:text-slate-200">
            荷降ろしした品目の情報（回収先・品目）を選択し、完全に空になった車両の重量（空車重量）を記録してください。<br/><br/>
            <strong>計算方法:</strong><br/>
            （総重量） - （空車重量） = （品目の重量）
          </p>
      </div>
    </>
  ) : (
    <>
      <p>ここでは、トラックに残っている<strong>最後の品物</strong>を荷降ろしし、その後の<strong>完全に空になった車両の重量（空車重量）</strong>を記録します。</p>
      <div className="tw-mt-2 tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600">
          <p className="tw-text-sm tw-text-slate-700 dark:text-slate-200">
              <strong>計算方法:</strong><br/>
              （最終品目を降ろす前の車両重量） - （空車重量） = （最終品目の重量）
          </p>
      </div>
      <p className="tw-mt-2">このステップを完了すると、すべての品目の重量が確定します。</p>
    </>
  );

  const backButtonText = isFirstAndOnlyItem ? '記録方法の選択に戻る' : '品目追加に戻る';


  return (
    <>
      <Card>
        <div className="tw-flex tw-justify-between tw-items-start tw-mb-6">
          <div>
            <h2 className="tw-text-xl tw-font-bold tw-mb-1">ステップ {currentStep}/{maxSteps}</h2>
            <p className="tw-text-2xl tw-font-bold tw-text-slate-700 dark:text-slate-300">{stepTitle}</p>
          </div>
          <HelpTooltip title={helpTitle}>
            <div className="tw-space-y-4 tw-text-slate-600 dark:text-slate-300 tw-leading-relaxed">
              {helpContent}
            </div>
          </HelpTooltip>
        </div>

        <div className="tw-space-y-6">
            <div className="tw-bg-slate-100 dark:bg-slate-700 tw-p-4 tw-rounded-lg">
                <p className="tw-text-slate-600 dark:text-slate-300">荷降ろし前の車両重量（計算値）</p>
                <p className="tw-text-3xl tw-font-bold tw-text-slate-800 dark:text-slate-200">{weightBeforeUnload.toLocaleString()} <span className="tw-text-xl">kg</span></p>
            </div>
            
            <div className={`tw-space-y-4 tw-p-4 tw-border tw-border-slate-200 dark:border-slate-700 tw-rounded-lg tw-bg-slate-50 dark:bg-slate-800/50 ${tareWeight === null && (!locationId || !itemId) && isPulseEffectEnabled ? 'tw-highlight-navigation' : ''}`}>
                <h3 className="tw-font-bold tw-text-lg">{(isFirstAndOnlyItem) ? '品目情報' : '最終品目情報'}</h3>
                <div>
                    <Select
                    id="last-location"
                    label="回収先"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    disabled={isMasterLoading || tareWeight !== null || !!customerAsLocation}
                    >
                    <option value="">選択してください</option>
                    {availableLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </Select>
                </div>
                <div>
                    <Select
                    id="last-item"
                    label="品目"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    disabled={isMasterLoading || !locationId || tareWeight !== null}
                    >
                    <option value="">選択してください</option>
                    {masterItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                </div>
            </div>


            {tareWeight === null ? (
                <div className="tw-text-center tw-py-4">
                    <Button 
                        onClick={() => setIsModalOpen(true)} 
                        size="lg" 
                        disabled={!canWeigh}
                        className={canWeigh && isPulseEffectEnabled ? 'tw-highlight-navigation' : ''}
                    >
                        <GaugeCircle className="tw-mr-2 tw-h-6 tw-w-6" />
                        台貫で計量開始
                    </Button>
                    {!canWeigh && <p className="tw-text-sm tw-text-slate-500 dark:text-slate-300 tw-mt-2">品目情報を選択してください。</p>}
                </div>
            ) : (
                <div className="tw-bg-blue-50 dark:bg-blue-900/50 tw-border-l-4 tw-border-blue-500 dark:border-blue-400 tw-p-4 tw-rounded-r-lg">
                    <p className="tw-text-slate-600 dark:text-slate-300">計量済み空車重量</p>
                    <p className="tw-text-4xl tw-font-bold tw-text-slate-800 dark:text-slate-200">{tareWeight.toLocaleString()} <span className="tw-text-2xl">kg</span></p>
                </div>
            )}
        </div>
        
        {error && <p className="tw-text-red-500 tw-text-sm tw-mt-4 tw-text-center">{error}</p>}
      
        <div className="tw-flex tw-justify-between tw-items-center tw-mt-8">
          <Button onClick={handleGoBack} variant="secondary">
            <ArrowLeft className="tw-mr-2 tw-h-4 tw-w-4" />
            {backButtonText}
          </Button>
          {tareWeight === null ? (
             <Button 
                onClick={handleNextWithValidation}
                disabled={tareWeight === null}
              >
                  確認画面へ
                  <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
              </Button>
          ) : (
            <div className="tw-flex tw-items-center tw-space-x-2">
                 <Button onClick={() => setIsModalOpen(true)} variant="secondary">
                    <Repeat className="tw-mr-2 tw-h-4 tw-w-4" />
                    再計量
                 </Button>
                <Button 
                    onClick={handleNextWithValidation}
                    className={isPulseEffectEnabled ? 'tw-highlight-navigation' : ''}
                >
                    確認画面へ
                    <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
                </Button>
            </div>
          )}
        </div>
      </Card>

      <WeighingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmWeight}
        title="空車重量の計量"
        label="すべての品物を降ろした後の空車重量"
        step={10}
      />
    </>
  );
};

export default TareStep;
