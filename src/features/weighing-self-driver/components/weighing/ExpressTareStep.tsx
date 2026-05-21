
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1">ステップ 2/3</h2>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">荷降ろしと空車計量</p>
          </div>
          <HelpTooltip title="高速計量モード">
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>回収先と品目が1種類ずつのため、高速計量モードが有効になっています。</p>
              <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                      <strong>記録される内容:</strong><br/>
                      回収先: {singleLocation?.name || '...'} <br/>
                      品目: {singleItem?.name || '...'}
                  </p>
              </div>
              <p className="mt-2">すべての荷物を降ろし、空になった車両の重量を計量してください。</p>
            </div>
          </HelpTooltip>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <p className="text-slate-600 dark:text-slate-300">総重量（計量済み）</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{grossWeight.toLocaleString()} <span className="text-xl">kg</span></p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-400 text-blue-800 dark:text-blue-300 p-4 rounded-r-lg flex items-center">
            <Info className="h-6 w-6 mr-3 flex-shrink-0"/>
            <div>
              <p className="font-bold">「{singleLocation?.name}」の「{singleItem?.name}」をすべて降ろしてください。</p>
            </div>
          </div>
          
          <div className="text-center py-4">
              <Button onClick={() => setIsModalOpen(true)} size="lg" className={isPulseEffectEnabled ? 'highlight-navigation' : ''}>
                  <GaugeCircle className="mr-2 h-6 w-6" />
                  荷降ろし後に台貫で計量開始
              </Button>
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      
        <div className="flex justify-between items-center mt-8">
          <Button onClick={prevStep} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
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
