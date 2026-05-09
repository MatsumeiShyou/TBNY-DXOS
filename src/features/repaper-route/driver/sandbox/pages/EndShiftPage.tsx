import React, { useState, useEffect } from 'react';
import { Button, Modal } from '../components/Widgets';
import type { Stop, Vehicle } from '../types';
import { StopStatus } from '../types';
import { HelpTarget } from '../components/Help';
import { NumericKeypad, safeCalculate } from '../components/NumericKeypad';

interface Props {
  stops: Stop[];
  currentVehicle: Vehicle;
  workStartTime?: Date | null;
  mode: 'FINAL' | 'INTERMEDIATE';
  onComplete: (adjustedWeights?: Record<string, number>) => void;
  onCancel: () => void;
}

export const EndShiftPage: React.FC<Props> = ({ stops, currentVehicle, mode, onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [grossWeightStr, setGrossWeightStr] = useState<string>('');
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [adjustedWeights, setAdjustedWeights] = useState<Record<string, number>>({});
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  
  const collectedStops = stops.filter(s => s.status === StopStatus.COMPLETED);
  const collectedItems = collectedStops.flatMap(s => 
    s.items.filter(i => i.isCollected && !i.isUnloaded).map(i => ({ ...i, stopId: s.id }))
  );
  
  useEffect(() => {
    if (step === 2) {
      const tare = currentVehicle.tareWeight || 0;
      const gross = parseInt(grossWeightStr) || 0;
      const netWeight = Math.max(0, gross - tare);
      const currentTotalRecorded = collectedItems.reduce((sum, item) => sum + (item.actualWeight || item.defaultWeight || 0), 0);
      const newWeights: Record<string, number> = {};
      
      if (currentTotalRecorded > 0) {
        const ratio = netWeight / currentTotalRecorded;
        let allocatedSum = 0;
        collectedItems.forEach((item, index) => {
           const recorded = item.actualWeight || item.defaultWeight || 0;
           let newW = Math.round(recorded * ratio);
           if (index === collectedItems.length - 1) {
             const diff = netWeight - (allocatedSum + newW);
             newW += diff;
           }
           newWeights[`${item.stopId}_${item.id}`] = newW;
           allocatedSum += newW;
        });
      } else {
        collectedItems.forEach(item => {
           newWeights[`${item.stopId}_${item.id}`] = 0;
        });
      }
      setAdjustedWeights(newWeights);
    }
  }, [step]);

  const handleKeypadInput = (char: string) => {
    const isOp = ['+', '-', '×', '÷'].includes(char);
    const lastChar = grossWeightStr.slice(-1);
    const lastIsOp = ['+', '-', '×', '÷'].includes(lastChar);
    if (isOp && lastIsOp) {
      setGrossWeightStr(prev => prev.slice(0, -1) + char);
      return;
    }
    if (grossWeightStr === '0' && !isOp) {
        setGrossWeightStr(char);
        return;
    }
    setGrossWeightStr(prev => prev + char);
  };

  const handleKeypadDelete = () => {
    if (grossWeightStr.length <= 1) {
      setGrossWeightStr('0');
    } else {
      setGrossWeightStr(prev => prev.slice(0, -1));
    }
  };

  const handleKeypadClear = () => {
    setGrossWeightStr('0');
  };

  const handleKeypadCalculate = () => {
    const result = safeCalculate(grossWeightStr);
    setGrossWeightStr(result.toString());
  };

  const handleKeypadClose = () => {
    handleKeypadCalculate();
    setIsKeypadOpen(false);
  };

  const adjustItemWeight = (key: string, delta: number) => {
    setAdjustedWeights(prev => {
      const current = prev[key] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [key]: next };
    });
  };

  const handleFinishClick = () => {
    setConfirmOpen(true);
  };

  const executeFinish = () => {
    setConfirmOpen(false);
    onComplete(adjustedWeights);
  };

  const tare = currentVehicle.tareWeight || 0;
  const displayGross = safeCalculate(grossWeightStr);
  const net = Math.max(0, displayGross - tare);
  const currentDistributedSum = (Object.values(adjustedWeights) as number[]).reduce((a, b) => a + b, 0);
  const diff = net - currentDistributedSum;
  const titleText = mode === 'INTERMEDIATE' ? '中間荷下ろし・休憩' : '業務終了報告';
  const isValidGross = displayGross > tare;
  const hasItems = collectedItems.length > 0;
  const canProceedToStep2 = isValidGross && hasItems && !isKeypadOpen;

  return (
    <div className="tw-p-4 tw-space-y-6 tw-pb-24">
      {/* Wizard Header */}
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-4 tw-px-2">
        <button onClick={onCancel} className="tw-text-slate-400 hover:tw-text-slate-600">
           <i className="fa-solid fa-xmark tw-text-xl"></i>
        </button>
        <span className="tw-font-bold tw-text-slate-500">{titleText}</span>
        <div className="tw-w-6"></div>
      </div>

      <HelpTarget helpId="step-indicator">
        <div className="tw-flex tw-items-center tw-justify-center tw-mb-6 tw-px-2">
          {[1, 2].map(i => {
             return (
              <div key={i} className={`tw-flex tw-items-center ${i < 2 ? 'tw-flex-1' : ''}`}>
                 <div className={`tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm tw-transition-colors ${step >= i ? 'tw-bg-primary tw-text-white' : 'tw-bg-slate-200 tw-text-slate-500'}`}>
                   {i}
                 </div>
                 {i < 2 && <div className={`tw-h-1 tw-flex-1 tw-mx-2 tw-rounded ${step > i ? 'tw-bg-primary' : 'tw-bg-slate-200'}`}></div>}
              </div>
             );
          })}
        </div>
      </HelpTarget>
      
      <div className="tw-text-center tw-mb-6">
         <h2 className="tw-text-xl tw-font-bold tw-text-slate-800">
           {step === 1 && '総重量の報告'}
           {step === 2 && '重量の割り振り'}
         </h2>
         <p className="tw-text-xs tw-text-slate-500">
           {step === 1 && 'トラックスケールで計測した値を入力'}
           {step === 2 && (mode === 'INTERMEDIATE' ? '荷下ろしした分の重量を配分します' : '正味重量を各案件に配分します')}
         </p>
      </div>

      {/* STEP 1: Gross Weight Input */}
      {step === 1 && (
        <div className="tw-space-y-6 tw-animate-fade-in">
           <HelpTarget helpId="input-gross-weight">
             <div className={`tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-lg tw-border-2 tw-text-center tw-transition-colors tw-relative ${!isValidGross && displayGross > 0 ? 'tw-border-red-200 tw-bg-red-50' : 'tw-border-primary'}`}>
                <label className="tw-block tw-text-slate-500 tw-font-bold tw-mb-2">総重量 (Kg)</label>
                <input 
                  type="text" 
                  readOnly
                  value={grossWeightStr}
                  onClick={() => setIsKeypadOpen(true)}
                  className={`tw-w-full tw-text-center tw-text-4xl tw-font-mono tw-font-bold focus:tw-outline-none tw-bg-transparent tw-caret-transparent ${isKeypadOpen ? 'tw-text-primary' : 'tw-text-slate-800'}`}
                  placeholder="0"
                />
                <div className="tw-w-full tw-h-0.5 tw-bg-slate-200 tw-mt-2"></div>
                {isKeypadOpen && (
                  <div className="tw-absolute tw-right-4 tw-top-1/2 tw--translate-y-1/2 tw-animate-pulse tw-text-primary tw-pointer-events-none">
                    <i className="fa-solid fa-calculator tw-text-xl"></i>
                  </div>
                )}
             </div>
           </HelpTarget>

           <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <div className="tw-bg-slate-50 tw-p-4 tw-rounded-xl tw-text-center">
                 <div className="tw-text-xs tw-text-slate-500 tw-font-bold tw-mb-1">空車重量</div>
                 <div className="tw-text-xl tw-font-bold tw-text-slate-700">{tare.toLocaleString()} <span className="tw-text-xs">kg</span></div>
              </div>
              <div className="tw-bg-slate-800 tw-p-4 tw-rounded-xl tw-text-center tw-text-white">
                 <div className="tw-text-xs tw-text-slate-400 tw-font-bold tw-mb-1">正味重量 (Net)</div>
                 <div className={`tw-text-xl tw-font-bold ${net > 0 ? 'tw-text-green-400' : 'tw-text-slate-500'}`}>{net.toLocaleString()} <span className="tw-text-xs">kg</span></div>
              </div>
           </div>
           
           <div className="tw-space-y-2">
             <p className="tw-text-xs tw-text-center tw-text-slate-400">
               ※ 正味重量 = 総重量 - 空車重量
             </p>
             {!isValidGross && displayGross > 0 && (
                <p className="tw-text-sm tw-text-center tw-red-500 tw-font-bold tw-bg-red-50 tw-p-2 tw-rounded tw-animate-pulse">
                  <i className="fa-solid fa-triangle-exclamation tw-mr-1"></i>
                  空車重量（{tare}kg）より大きい値を入力してください
                </p>
             )}
             {!hasItems && (
               <div className="tw-text-sm tw-text-center tw-text-red-500 tw-font-bold tw-bg-red-50 tw-p-2 tw-rounded">
                 <i className="fa-solid fa-circle-exclamation tw-mr-1"></i>
                 {mode === 'INTERMEDIATE' ? '荷下ろし対象の荷物がありません' : '回収した荷物がありません'}
               </div>
             )}
           </div>
        </div>
      )}

      {/* STEP 2: Weight Distribution */}
      {step === 2 && (
        <div className="tw-space-y-4 tw-animate-fade-in">
           <div className="tw-sticky tw-top-0 tw-bg-white/95 tw-backdrop-blur tw-z-10 tw-p-4 tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-sm tw-flex tw-justify-between tw-items-center">
              <div>
                 <div className="tw-text-xs tw-text-slate-500 tw-font-bold">正味重量ターゲット</div>
                 <div className="tw-text-2xl tw-font-bold tw-text-slate-800">{net.toLocaleString()} <span className="tw-text-sm">kg</span></div>
              </div>
              <div className="tw-text-right">
                 <div className="tw-text-xs tw-text-slate-500 tw-font-bold">残り調整</div>
                 <div className={`tw-text-xl tw-font-bold ${diff === 0 ? 'tw-text-green-500' : 'tw-text-red-500 tw-animate-pulse'}`}>
                    {diff > 0 ? '+' : ''}{diff} kg
                 </div>
              </div>
           </div>
           
           <div className="tw-space-y-2">
             {collectedItems.map((item, idx) => {
               const stop = stops.find(s => s.id === item.stopId);
               const key = `${item.stopId}_${item.id}`;
               const val = adjustedWeights[key] || 0;
               return (
                 <div key={idx} className="tw-bg-white tw-p-3 tw-rounded-xl tw-border tw-border-slate-100 tw-shadow-sm tw-flex tw-justify-between tw-items-center">
                    <div className="tw-flex-1 tw-overflow-hidden tw-mr-2">
                       <div className="tw-text-[10px] tw-text-slate-400 tw-truncate">{stop?.customerName}</div>
                       <div className="tw-font-bold tw-text-slate-700 tw-truncate">{item.name}</div>
                       <div className="tw-text-xs tw-text-slate-400">概算: {item.actualWeight}kg</div>
                    </div>
                    <div className="tw-flex tw-items-center tw-space-x-2 tw-shrink-0">
                       <button onClick={() => adjustItemWeight(key, -10)} className="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-slate-100 tw-text-slate-600 tw-font-bold active:tw-bg-slate-200 tw-flex tw-items-center tw-justify-center">-</button>
                       <div className="tw-w-16 tw-text-center tw-font-mono tw-font-bold tw-text-lg">{val}</div>
                       <button onClick={() => adjustItemWeight(key, 10)} className="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-slate-100 tw-text-slate-600 tw-font-bold active:tw-bg-slate-200 tw-flex tw-items-center tw-justify-center">+</button>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {/* Navigation Buttons */}
       <div className={`tw-fixed tw-bottom-0 tw-left-0 tw-w-full tw-bg-white tw-border-t tw-border-slate-200 tw-p-4 tw-pb-safe tw-shadow-[0_-4px_10px_rgba(0,0,0,0.05)] tw-z-20 tw-flex tw-space-x-3 tw-transition-transform ${isKeypadOpen ? 'tw-translate-y-full' : ''}`}>
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(prev => prev - 1 as any)} className="tw-flex-1" agentId="wizard:back-button">
              戻る
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(prev => prev + 1 as any)} disabled={!canProceedToStep2} className="tw-flex-2 tw-w-full" agentId="wizard:next-button">
              次へ
            </Button>
          ) : (
            <Button 
              onClick={handleFinishClick} 
              disabled={diff !== 0 || collectedItems.length === 0} 
              className="tw-flex-2 tw-w-full"
              agentId="wizard:finish-button"
            >
              {mode === 'INTERMEDIATE' ? '荷下ろし完了・休憩' : '確定して業務終了'}
            </Button>
          )}
       </div>

      <NumericKeypad 
         isVisible={isKeypadOpen}
         onInput={handleKeypadInput}
         onDelete={handleKeypadDelete}
         onClear={handleKeypadClear}
         onCalculate={handleKeypadCalculate}
         onClose={handleKeypadClose}
      />

      <Modal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} title="最終確認" agentId="confirm-modal">
        <div className="tw-space-y-6">
           <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-xl tw-border tw-border-yellow-200 tw-flex tw-items-start tw-text-yellow-900">
              <i className="fa-solid fa-circle-info tw-mt-1 tw-mr-3 tw-text-lg tw-shrink-0"></i>
              <div>
                 <p className="tw-font-bold tw-mb-1">
                    {mode === 'INTERMEDIATE' ? '中間荷下ろしを完了しますか？' : '業務日報を提出しますか？'}
                 </p>
                 <p className="tw-text-sm">
                    {mode === 'INTERMEDIATE' 
                       ? '対象の荷物は「荷下ろし済み」となり、休憩ステータスに移行します。' 
                       : '一度提出すると修正できません。入力内容に間違いがないか確認してください。'}
                 </p>
              </div>
           </div>
           <div className="tw-flex tw-space-x-3">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)} agentId="confirm-modal:cancel-button">キャンセル</Button>
              <Button onClick={executeFinish} agentId="confirm-modal:execute-button">確定する</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};
