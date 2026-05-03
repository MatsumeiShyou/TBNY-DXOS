
import React, { useState } from 'react';
import type { Stop, CargoItem } from '../types';
import { StopStatus } from '../types';
import { Button, Card, Modal } from '../components/Widgets';
import { HelpTarget } from '../components/Help';
import { NumericKeypad, safeCalculate } from '../components/NumericKeypad';

interface Props {
  stop: Stop;
  onUpdateStop: (stopId: string, updates: Partial<Stop>) => void;
  onBack: () => void;
}

export const StopDetailPage: React.FC<Props> = ({ stop, onUpdateStop, onBack }) => {
  const [items, setItems] = useState<CargoItem[]>(stop.items);
  const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState<number>(10);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<string>('');

  const handleArrive = () => {
    onUpdateStop(stop.id, { 
      status: StopStatus.IN_PROGRESS, 
      arrivalTime: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) 
    });
  };

  const handleDepart = () => {
    onUpdateStop(stop.id, { 
      status: StopStatus.COMPLETED, 
      items: items,
      departureTime: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) 
    });
    onBack();
  };
  
  const handleSaveCorrection = () => {
    onUpdateStop(stop.id, {
      items: items
    });
    setIsEditing(false);
  };

  const toggleItemCollected = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isCollected: !i.isCollected } : i));
  };

  const updateItemWeight = (id: string, weight: number) => {
    const validWeight = Math.max(0, Math.round(weight));
    setItems(items.map(i => i.id === id ? { ...i, actualWeight: validWeight } : i));
    if (activeInputId === id) {
      setDraftValue(validWeight.toString());
    }
  };

  const resetWeight = (id: string) => {
     updateItemWeight(id, 0);
  };

  const addNewItem = () => {
    if (newItemName && newItemWeight) {
      const newItem: CargoItem = {
        id: `custom-${Date.now()}`,
        name: newItemName,
        defaultWeight: Number(newItemWeight),
        actualWeight: Number(newItemWeight),
        isCollected: true
      };
      setItems([...items, newItem]);
      setAddItemModalOpen(false);
      setNewItemName('');
      setNewItemWeight('');
    }
  };

  const openNavi = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`, '_blank');
  };
  
  const startEditing = (id: string, currentValue: number) => {
    setActiveInputId(id);
    setDraftValue(currentValue.toString());
  };

  const handleKeypadInput = (char: string) => {
    if (!activeInputId) return;
    const isOp = ['+', '-', '×', '÷'].includes(char);
    const lastChar = draftValue.slice(-1);
    const lastIsOp = ['+', '-', '×', '÷'].includes(lastChar);

    if (isOp && lastIsOp) {
      setDraftValue(prev => prev.slice(0, -1) + char);
      return;
    }
    
    if (draftValue === '0' && !isOp) {
        setDraftValue(char);
        return;
    }
    setDraftValue(prev => prev + char);
  };

  const handleKeypadDelete = () => {
    if (!activeInputId) return;
    if (draftValue.length <= 1) {
      setDraftValue('0');
    } else {
      setDraftValue(prev => prev.slice(0, -1));
    }
  };

  const handleKeypadClear = () => {
    if (!activeInputId) return;
    setDraftValue('0');
  };

  const handleKeypadCalculate = () => {
    if (!activeInputId) return;
    const result = safeCalculate(draftValue);
    updateItemWeight(activeInputId, result);
  };
  
  const handleKeypadClose = () => {
    if (activeInputId) {
      handleKeypadCalculate();
    }
    setActiveInputId(null);
  };

  // RENDER: PENDING State (Travel)
  if (stop.status === StopStatus.PENDING) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <button onClick={onBack} className="text-slate-500 font-bold mb-4 flex items-center py-3 -ml-2 px-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation min-h-[44px]">
              <i className="fa-solid fa-chevron-left mr-2"></i> リストに戻る
            </button>
            <h2 className="text-2xl font-bold leading-tight">{stop.customerName}</h2>
            <div className="flex items-start text-slate-600">
              <i className="fa-solid fa-location-dot mt-1 mr-2 text-primary"></i>
              <p className="text-lg">{stop.address}</p>
            </div>
            {stop.notes && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start text-yellow-800 text-sm">
                <i className="fa-solid fa-circle-info mt-0.5 mr-2 shrink-0"></i>
                <p className="font-medium">{stop.notes}</p>
              </div>
            )}
            {stop.constraints?.entryInstruction && (
               <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start text-red-800 text-sm">
                 <i className="fa-solid fa-triangle-exclamation mt-0.5 mr-2 shrink-0"></i>
                 <p className="font-medium"><span className="font-bold">重要指示:</span> {stop.constraints.entryInstruction}</p>
               </div>
            )}
          </div>

          <Card className="bg-blue-50 border-blue-200">
             <h3 className="font-bold text-primary mb-2">回収予定品目</h3>
             <ul className="list-disc list-inside text-slate-700 space-y-1">
               {stop.items.map(i => (
                 <li key={i.id}>{i.name} ({i.defaultWeight}kg)</li>
               ))}
             </ul>
          </Card>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 space-y-3 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <HelpTarget helpId="btn-navi">
            <Button variant="outline" onClick={openNavi}>
              <i className="fa-solid fa-location-arrow mr-2"></i> ナビを起動
            </Button>
          </HelpTarget>
          <HelpTarget helpId="btn-arrive">
            <Button onClick={handleArrive}>
              <i className="fa-solid fa-check mr-2"></i> 現地に到着
            </Button>
          </HelpTarget>
        </div>
      </div>
    );
  }

  // RENDER: IN_PROGRESS State (Work) OR EDITING Mode
  if (stop.status === StopStatus.IN_PROGRESS || isEditing) {
    const totalWeight = items.reduce((sum, item) => sum + (item.actualWeight || item.defaultWeight || 0), 0);

    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="flex-1 p-4 overflow-y-auto pb-80">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold">
               {isEditing ? <span className="text-orange-600"><i className="fa-solid fa-pen mr-2"></i>修正モード</span> : '回収作業中'}
             </h2>
             <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono font-bold">
               到着: {stop.arrivalTime}
             </span>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <Card key={item.id} className={`${item.isCollected ? 'border-primary ring-1 ring-blue-100 shadow-md' : ''} transition-all`}>
                <label className="flex items-center space-x-3 mb-1 cursor-pointer p-1">
                  <div className={`w-8 h-8 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${item.isCollected ? 'bg-primary border-primary' : 'border-slate-300 bg-white'}`}>
                     {item.isCollected && <i className="fa-solid fa-check text-white"></i>}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={item.isCollected}
                    onChange={() => toggleItemCollected(item.id)}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <span className={`font-bold text-lg block leading-tight ${item.isCollected ? 'text-primary' : 'text-slate-700'}`}>
                      {item.name}
                    </span>
                    {!item.isCollected && <span className="text-xs text-slate-400">タップして回収済みにする</span>}
                  </div>
                </label>
                
                {item.isCollected && (
                  <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in">
                    <div className="flex justify-between items-end mb-2">
                       <label className="text-xs font-bold text-slate-500">数量 (kg)</label>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <button 
                        onClick={() => updateItemWeight(item.id, Math.max(0, (item.actualWeight || item.defaultWeight) - step))}
                        className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 font-bold text-2xl text-slate-600 active:bg-slate-200 touch-manipulation flex items-center justify-center shadow-sm shrink-0"
                      >−</button>
                      
                      <div className="flex-1 relative">
                        <HelpTarget helpId="input-calculator">
                          <input 
                            type="text" 
                            readOnly
                            value={activeInputId === item.id ? draftValue : (item.actualWeight ?? item.defaultWeight)}
                            onClick={() => startEditing(item.id, item.actualWeight ?? item.defaultWeight)}
                            className={`w-full text-center font-mono text-3xl font-bold p-0 h-14 border rounded-lg shadow-inner focus:outline-none transition-all caret-transparent ${
                              activeInputId === item.id 
                              ? 'bg-white border-primary ring-2 ring-primary text-primary' 
                              : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </HelpTarget>
                        {activeInputId === item.id && (
                           <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-pulse text-primary pointer-events-none">
                             <i className="fa-solid fa-calculator text-xs"></i>
                           </div>
                        )}
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold pointer-events-none">kg</div>
                      </div>
                      
                      <button 
                        onClick={() => updateItemWeight(item.id, (item.actualWeight || item.defaultWeight) + step)}
                        className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 font-bold text-2xl text-slate-600 active:bg-slate-200 touch-manipulation flex items-center justify-center shadow-sm shrink-0"
                      >+</button>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center mb-1 px-1">
                        <span className="text-[10px] text-slate-400 font-bold">増減単位</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 100].map((val) => (
                          <button 
                            key={val}
                            onClick={() => setStep(val)} 
                            className={`rounded-lg py-2 text-sm font-bold touch-manipulation transition-colors border shadow-sm ${
                              step === val 
                                ? 'bg-primary text-white border-primary ring-1 ring-offset-1 ring-primary' 
                                : 'bg-white text-slate-600 border-slate-200 active:bg-slate-100'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                        <button 
                          onClick={() => resetWeight(item.id)} 
                          className="bg-white border border-red-100 text-red-500 rounded-lg py-2 text-xs font-bold active:bg-red-50 touch-manipulation shadow-sm"
                        >
                          <i className="fa-solid fa-trash mr-1"></i>リセット
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            <HelpTarget helpId="btn-add-item">
              <Button variant="secondary" onClick={() => setAddItemModalOpen(true)} className="py-3 text-sm border-dashed border-2 w-full">
                <i className="fa-solid fa-plus mr-2"></i> リストにない品目を追加
              </Button>
            </HelpTarget>
            
            <div className="pt-4 pb-2">
               <Button variant="secondary" onClick={onBack} className="text-sm">
                  <i className="fa-solid fa-pause mr-2"></i> 作業を中断して戻る
               </Button>
            </div>
          </div>
        </div>

        <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30 transition-transform ${activeInputId ? 'translate-y-full' : ''}`}>
          <div className="flex justify-between items-center mb-3 text-slate-600 font-bold px-1">
            <span>総重量（概算）:</span>
            <span className="text-2xl text-primary font-mono">{totalWeight} <span className="text-sm">kg</span></span>
          </div>
          {isEditing ? (
            <Button onClick={handleSaveCorrection} className="bg-orange-600 shadow-orange-900/20 hover:bg-orange-700">
              <i className="fa-solid fa-save mr-2"></i> 修正内容を保存
            </Button>
          ) : (
            <Button onClick={handleDepart}>
              <i className="fa-solid fa-flag-checkered mr-2"></i> 作業完了・出発
            </Button>
          )}
        </div>

        <NumericKeypad 
          isVisible={activeInputId !== null}
          onInput={handleKeypadInput}
          onDelete={handleKeypadDelete}
          onClear={handleKeypadClear}
          onCalculate={handleKeypadCalculate}
          onClose={handleKeypadClose}
        />

        <Modal title="品目追加" isOpen={isAddItemModalOpen} onClose={() => setAddItemModalOpen(false)}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">品目名</label>
              <input 
                type="text" 
                className="w-full p-4 border border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                placeholder="例: 粗大ごみ"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">重量 (kg)</label>
              <input 
                type="text" 
                inputMode="decimal"
                pattern="\d*"
                className="w-full p-4 border border-slate-300 rounded-xl text-lg font-mono focus:ring-2 focus:ring-primary focus:outline-none" 
                placeholder="0"
                value={newItemWeight}
                onChange={(e) => setNewItemWeight(e.target.value)}
              />
            </div>
            <Button onClick={addNewItem} className="mt-4">追加する</Button>
          </div>
        </Modal>
      </div>
    );
  }

  // COMPLETED State (View Only)
  return (
    <div className="p-4 text-center space-y-6 pt-20 flex flex-col items-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
        <i className="fa-solid fa-check text-5xl"></i>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">作業完了</h2>
        <p className="text-slate-500">お疲れ様でした。<br/>次の目的地へ向かってください。</p>
      </div>
      <div className="w-full max-w-xs mt-8 space-y-3">
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
           <i className="fa-solid fa-pen-to-square mr-2"></i>内容を修正する
        </Button>
        <Button onClick={onBack}>リストに戻る</Button>
      </div>
    </div>
  );
};
