

import React, { useState } from 'react';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import { useSettings } from '../../contexts/SettingsContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import WeighingModal from '../ui/WeighingModal';
import HelpTooltip from '../ui/HelpTooltip';
import { ArrowRight, GaugeCircle, Repeat } from 'lucide-react';

const StartStep: React.FC = () => {
  const { grossWeight, setGrossWeight, nextStep, maxSteps } = useWeighingSession();
  const { isPulseEffectEnabled } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmWeight = (weight: number) => {
    setGrossWeight(weight);
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1">ステップ 1/{maxSteps}</h2>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">総重量を計量してください</p>
          </div>
          <HelpTooltip title="総重量とは？">
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>総重量とは、これから荷降ろしをする<strong>すべての品物を積んだ状態</strong>での、車両全体の重量のことです。</p>
              <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  まず最初にこの重量を記録することで、後から品物ごとの重量を正確に計算できます。
                </p>
              </div>
            </div>
          </HelpTooltip>
        </div>
        
        {grossWeight === null ? (
          <div className="text-center py-8">
            <Button 
              onClick={() => setIsModalOpen(true)} 
              size="lg"
              className={isPulseEffectEnabled ? "highlight-navigation" : ""}
            >
              <GaugeCircle className="mr-2 h-6 w-6" />
              台貫で計量開始
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-r-lg">
              <p className="text-slate-600 dark:text-slate-300">計量済み総重量</p>
              <p className="text-4xl font-bold text-slate-800 dark:text-slate-200">{grossWeight.toLocaleString()} <span className="text-2xl">kg</span></p>
            </div>
            <div className="flex justify-between items-center">
              <Button onClick={() => setIsModalOpen(true)} variant="secondary">
                <Repeat className="mr-2 h-4 w-4" />
                再計量する
              </Button>
              <Button 
                onClick={nextStep}
                className={isPulseEffectEnabled ? "highlight-navigation" : ""}
              >
                次へ進む
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      <WeighingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmWeight}
        title="総重量の計量"
        label="計量器に表示された総重量"
        step={10}
      />
    </>
  );
};

export default StartStep;
