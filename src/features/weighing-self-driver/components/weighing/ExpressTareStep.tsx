
import React, { useState } from 'react';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import { useMasterData } from '../../contexts/MasterDataContext';
import { useSettings } from '../../contexts/SettingsContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import WeighingModal from '../ui/WeighingModal';
import HelpTooltip from '../ui/HelpTooltip';
import { GaugeCircle, ArrowLeft, Info } from 'lucide-react';

const ExpressTareStep: React.FC = () => {
  const {
    grossWeight,
    setTareWeight,
    addItem,
    nextStep,
    prevStep,
    goToStep,
  } = useWeighingSession();
  const { locations, items: masterItems } = useMasterData();
  const { isPulseEffectEnabled } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  if (grossWeight === null) {
    goToStep(1);
    return null;
  }
  
  // This mode is only for single location and single item
  const singleLocation = locations[0];
  const singleItem = masterItems[0];


  const handleConfirmWeight = (finalTareWeight: number) => {
    if (finalTareWeight >= grossWeight) {
      setError('空車重量は、総重量より小さくする必要があります。');
      return;
    }
    setError('');
    
    const itemWeight = grossWeight - finalTareWeight;
    
    if (itemWeight <= 0) {
      setError('品目重量が0以下になります。重量を確認してください。');
      return;
    }

    // Add the single item automatically
    addItem({ 
        locationId: singleLocation.id, 
        itemId: singleItem.id, 
        weight: itemWeight 
    });
    
    setTareWeight(finalTareWeight);
    nextStep();
  };

  return (
    <>
      <Card>
        <div className="tw-flex tw-justify-between tw-items-start tw-mb-6">
          <div>
            <h2 className="tw-text-xl tw-font-bold tw-mb-1">ステップ 2/3</h2>
            <p className="tw-text-2xl tw-font-bold tw-text-slate-700 dark:text-slate-300">荷降ろしと空車計量</p>
          </div>
          <HelpTooltip title="高速計量モード">
            <div className="tw-space-y-4 tw-text-slate-600 dark:text-slate-300 tw-leading-relaxed">
              <p>回収先と品目が1種類ずつのため、高速計量モードが有効になっています。</p>
              <div className="tw-mt-2 tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600">
                  <p className="tw-text-sm tw-text-slate-700 dark:text-slate-200">
                      <strong>記録される内容:</strong><br/>
                      回収先: {singleLocation?.name || '...'} <br/>
                      品目: {singleItem?.name || '...'}
                  </p>
              </div>
              <p className="tw-mt-2">すべての荷物を降ろし、空になった車両の重量を計量してください。</p>
            </div>
          </HelpTooltip>
        </div>

        <div className="tw-space-y-6">
          <div className="tw-bg-slate-100 dark:bg-slate-700 tw-p-4 tw-rounded-lg">
            <p className="tw-text-slate-600 dark:text-slate-300">総重量（計量済み）</p>
            <p className="tw-text-3xl tw-font-bold tw-text-slate-800 dark:text-slate-200">{grossWeight.toLocaleString()} <span className="tw-text-xl">kg</span></p>
          </div>

          <div className="tw-bg-blue-50 dark:bg-blue-900/50 tw-border-l-4 tw-border-blue-400 tw-text-blue-800 dark:text-blue-300 tw-p-4 tw-rounded-r-lg tw-flex tw-items-center">
            <Info className="tw-h-6 tw-w-6 tw-mr-3 tw-flex-shrink-0"/>
            <div>
              <p className="tw-font-bold">「{singleLocation?.name}」の「{singleItem?.name}」をすべて降ろしてください。</p>
            </div>
          </div>
          
          <div className="tw-text-center tw-py-4">
              <Button onClick={() => setIsModalOpen(true)} size="lg" className={isPulseEffectEnabled ? 'tw-highlight-navigation' : ''}>
                  <GaugeCircle className="tw-mr-2 tw-h-6 tw-w-6" />
                  荷降ろし後に台貫で計量開始
              </Button>
          </div>
        </div>
        
        {error && <p className="tw-text-red-500 tw-text-sm tw-mt-4 tw-text-center">{error}</p>}
      
        <div className="tw-flex tw-justify-between tw-items-center tw-mt-8">
          <Button onClick={prevStep} variant="secondary">
            <ArrowLeft className="tw-mr-2 tw-h-4 tw-w-4" />
            戻る
          </Button>
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

export default ExpressTareStep;
