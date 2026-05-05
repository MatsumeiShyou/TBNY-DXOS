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
    <div className="p-4 space-y-6 pb-24">
      {/* Wizard Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
           <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <span className="font-bold text-slate-500">{titleText}</span>
        <div className="w-6"></div>
      </div>

      <HelpTarget helpId="step-indicator">
        <div className="flex items-center justify-center mb-6 px-2">
          {[1, 2].map(i => {
             return (
              <div key={i} className={`flex items-center ${i < 2 ? 'flex-1' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= i ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                   {i}
                 </div>
                 {i < 2 && <div className={`h-1 flex-1 mx-2 rounded ${step > i ? 'bg-primary' : 'bg-slate-200'}`}></div>}
              </div>
             );
          })}
        </div>
      </HelpTarget>
      
      <div className="text-center mb-6">
         <h2 className="text-xl font-bold text-slate-800">
           {step === 1 && '総重量の報告'}
           {step === 2 && '重量の割り振り'}
         </h2>
         <p className="text-xs text-slate-500">
           {step === 1 && 'トラックスケールで計測した値を入力'}
           {step === 2 && (mode === 'INTERMEDIATE' ? '荷下ろしした分の重量を配分します' : '正味重量を各案件に配分します')}
         </p>
      </div>

      {/* STEP 1: Gross Weight Input */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
           <HelpTarget helpId="input-gross-weight">
             <div className={`bg-white p-6 rounded-xl shadow-lg border-2 text-center transition-colors relative ${!isValidGross && displayGross > 0 ? 'border-red-200 bg-red-50' : 'border-primary'}`}>
                <label className="block text-slate-500 font-bold mb-2">総重量 (Kg)</label>
                <input 
                  type="text" 
                  readOnly
                  value={grossWeightStr}
                  onClick={() => setIsKeypadOpen(true)}
                  className={`w-full text-center text-4xl font-mono font-bold focus:outline-none bg-transparent caret-transparent ${isKeypadOpen ? 'text-primary' : 'text-slate-800'}`}
                  placeholder="0"
                />
                <div className="w-full h-0.5 bg-slate-200 mt-2"></div>
                {isKeypadOpen && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-pulse text-primary pointer-events-none">
                    <i className="fa-solid fa-calculator text-xl"></i>
                  </div>
                )}
             </div>
           </HelpTarget>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                 <div className="text-xs text-slate-500 font-bold mb-1">空車重量</div>
                 <div className="text-xl font-bold text-slate-700">{tare.toLocaleString()} <span className="text-xs">kg</span></div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl text-center text-white">
                 <div className="text-xs text-slate-400 font-bold mb-1">正味重量 (Net)</div>
                 <div className={`text-xl font-bold ${net > 0 ? 'text-green-400' : 'text-slate-500'}`}>{net.toLocaleString()} <span className="text-xs">kg</span></div>
              </div>
           </div>
           
           <div className="space-y-2">
             <p className="text-xs text-center text-slate-400">
               ※ 正味重量 = 総重量 - 空車重量
             </p>
             {!isValidGross && displayGross > 0 && (
                <p className="text-sm text-center red-500 font-bold bg-red-50 p-2 rounded animate-pulse">
                  <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                  空車重量（{tare}kg）より大きい値を入力してください
                </p>
             )}
             {!hasItems && (
               <div className="text-sm text-center text-red-500 font-bold bg-red-50 p-2 rounded">
                 <i className="fa-solid fa-circle-exclamation mr-1"></i>
                 {mode === 'INTERMEDIATE' ? '荷下ろし対象の荷物がありません' : '回収した荷物がありません'}
               </div>
             )}
           </div>
        </div>
      )}

      {/* STEP 2: Weight Distribution */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
           <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                 <div className="text-xs text-slate-500 font-bold">正味重量ターゲット</div>
                 <div className="text-2xl font-bold text-slate-800">{net.toLocaleString()} <span className="text-sm">kg</span></div>
              </div>
              <div className="text-right">
                 <div className="text-xs text-slate-500 font-bold">残り調整</div>
                 <div className={`text-xl font-bold ${diff === 0 ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
                    {diff > 0 ? '+' : ''}{diff} kg
                 </div>
              </div>
           </div>
           
           <div className="space-y-2">
             {collectedItems.map((item, idx) => {
               const stop = stops.find(s => s.id === item.stopId);
               const key = `${item.stopId}_${item.id}`;
               const val = adjustedWeights[key] || 0;
               return (
                 <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div className="flex-1 overflow-hidden mr-2">
                       <div className="text-[10px] text-slate-400 truncate">{stop?.customerName}</div>
                       <div className="font-bold text-slate-700 truncate">{item.name}</div>
                       <div className="text-xs text-slate-400">概算: {item.actualWeight}kg</div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                       <button onClick={() => adjustItemWeight(key, -10)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold active:bg-slate-200 flex items-center justify-center">-</button>
                       <div className="w-16 text-center font-mono font-bold text-lg">{val}</div>
                       <button onClick={() => adjustItemWeight(key, 10)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold active:bg-slate-200 flex items-center justify-center">+</button>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {/* Navigation Buttons */}
       <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 flex space-x-3 transition-transform ${isKeypadOpen ? 'translate-y-full' : ''}`}>
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(prev => prev - 1 as any)} className="flex-1" agentId="wizard:back-button">
              戻る
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(prev => prev + 1 as any)} disabled={!canProceedToStep2} className="flex-2 w-full" agentId="wizard:next-button">
              次へ
            </Button>
          ) : (
            <Button 
              onClick={handleFinishClick} 
              disabled={diff !== 0 || collectedItems.length === 0} 
              className="flex-2 w-full"
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
        <div className="space-y-6">
           <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex items-start text-yellow-900">
              <i className="fa-solid fa-circle-info mt-1 mr-3 text-lg shrink-0"></i>
              <div>
                 <p className="font-bold mb-1">
                    {mode === 'INTERMEDIATE' ? '中間荷下ろしを完了しますか？' : '業務日報を提出しますか？'}
                 </p>
                 <p className="text-sm">
                    {mode === 'INTERMEDIATE' 
                       ? '対象の荷物は「荷下ろし済み」となり、休憩ステータスに移行します。' 
                       : '一度提出すると修正できません。入力内容に間違いがないか確認してください。'}
                 </p>
              </div>
           </div>
           <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)} agentId="confirm-modal:cancel-button">キャンセル</Button>
              <Button onClick={executeFinish} agentId="confirm-modal:execute-button">確定する</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};
