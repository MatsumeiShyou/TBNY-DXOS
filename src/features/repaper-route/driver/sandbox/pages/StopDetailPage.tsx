
import React, { useState } from 'react';
import { Stop, CargoItem, StopStatus } from '../types';
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
      <div className="tw-flex tw-flex-col tw-h-full">
        <div className="tw-flex-1 tw-p-4 tw-space-y-6 tw-overflow-y-auto">
          <div className="tw-space-y-2">
            <button onClick={onBack} className="tw-text-slate-500 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-py-3 -tw-ml-2 tw-px-2 hover:tw-bg-slate-100 tw-rounded-lg tw-transition-colors tw-touch-manipulation tw-min-h-[44px]">
              <i className="fa-solid fa-chevron-left tw-mr-2"></i> リストに戻る
            </button>
            <h2 className="tw-text-2xl tw-font-bold tw-leading-tight">{stop.customerName}</h2>
            <div className="tw-flex tw-items-start tw-text-slate-600">
              <i className="fa-solid fa-location-dot tw-mt-1 tw-mr-2 tw-text-primary"></i>
              <p className="tw-text-lg">{stop.address}</p>
            </div>
            {stop.notes && (
              <div className="tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-p-4 tw-rounded-lg tw-flex tw-items-start tw-text-yellow-800 tw-text-sm">
                <i className="fa-solid fa-circle-info tw-mt-0.5 tw-mr-2 tw-shrink-0"></i>
                <p className="tw-font-medium">{stop.notes}</p>
              </div>
            )}
            {stop.constraints?.entryInstruction && (
               <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-p-4 tw-rounded-lg tw-flex tw-items-start tw-text-red-800 tw-text-sm">
                 <i className="fa-solid fa-triangle-exclamation tw-mt-0.5 tw-mr-2 tw-shrink-0"></i>
                 <p className="tw-font-medium"><span className="tw-font-bold">重要指示:</span> {stop.constraints.entryInstruction}</p>
               </div>
            )}
          </div>

          <Card className="tw-bg-blue-50 tw-border-blue-200">
             <h3 className="tw-font-bold tw-text-primary tw-mb-2">回収予定品目</h3>
             <ul className="tw-list-disc tw-list-inside tw-text-slate-700 tw-space-y-1">
               {stop.items.map(i => (
                 <li key={i.id}>{i.name} ({i.defaultWeight}kg)</li>
               ))}
             </ul>
          </Card>
        </div>

        <div className="tw-p-4 tw-bg-white tw-border-t tw-border-slate-200 tw-space-y-3 tw-pb-safe tw-shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <HelpTarget helpId="btn-navi">
            <Button variant="outline" onClick={openNavi}>
              <i className="fa-solid fa-location-arrow tw-mr-2"></i> ナビを起動
            </Button>
          </HelpTarget>
          <HelpTarget helpId="btn-arrive">
            <Button onClick={handleArrive}>
              <i className="fa-solid fa-check tw-mr-2"></i> 現地に到着
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
      <div className="tw-flex tw-flex-col tw-h-full tw-bg-slate-50">
        <div className="tw-flex-1 tw-p-4 tw-overflow-y-auto tw-pb-80">
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
             <h2 className="tw-text-lg tw-font-bold">
               {isEditing ? <span className="tw-text-orange-600"><i className="fa-solid fa-pen tw-mr-2"></i>修正モード</span> : '回収作業中'}
             </h2>
             <span className="tw-text-sm tw-bg-blue-100 tw-text-blue-800 tw-px-3 tw-py-1 tw-rounded-full tw-font-mono tw-font-bold">
               到着: {stop.arrivalTime}
             </span>
          </div>

          <div className="tw-space-y-4">
            {items.map(item => (
              <Card key={item.id} className={`${item.isCollected ? 'tw-border-primary tw-ring-1 tw-ring-blue-100 tw-shadow-md' : ''} tw-transition-all`}>
                <label className="tw-flex tw-items-center tw-space-x-3 tw-mb-1 tw-cursor-pointer tw-p-1">
                  <div className={`tw-w-8 tw-h-8 tw-shrink-0 tw-rounded tw-border-2 tw-flex tw-items-center tw-justify-center tw-transition-colors ${item.isCollected ? 'tw-bg-primary tw-border-primary' : 'tw-border-slate-300 tw-bg-white'}`}>
                     {item.isCollected && <i className="fa-solid fa-check tw-text-white"></i>}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={item.isCollected}
                    onChange={() => toggleItemCollected(item.id)}
                    className="tw-hidden"
                  />
                  <div className="tw-flex-1">
                    <span className={`tw-font-bold tw-text-lg tw-block tw-leading-tight ${item.isCollected ? 'tw-text-primary' : 'tw-text-slate-700'}`}>
                      {item.name}
                    </span>
                    {!item.isCollected && <span className="tw-text-xs tw-text-slate-400">タップして回収済みにする</span>}
                  </div>
                </label>
                
                {item.isCollected && (
                  <div className="tw-mt-3 tw-pt-3 tw-border-t tw-border-slate-100 tw-animate-fade-in">
                    <div className="tw-flex tw-justify-between tw-items-end tw-mb-2">
                       <label className="tw-text-xs tw-font-bold tw-text-slate-500">数量 (kg)</label>
                    </div>
                    
                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3">
                      <button 
                        onClick={() => updateItemWeight(item.id, Math.max(0, (item.actualWeight || item.defaultWeight) - step))}
                        className="tw-w-14 tw-h-14 tw-rounded-xl tw-bg-slate-100 tw-border tw-border-slate-200 tw-font-bold tw-text-2xl tw-text-slate-600 active:tw-bg-slate-200 tw-touch-manipulation tw-flex tw-items-center tw-justify-center tw-shadow-sm tw-shrink-0"
                      >−</button>
                      
                      <div className="tw-flex-1 tw-relative">
                        <HelpTarget helpId="input-calculator">
                          <input 
                            type="text" 
                            readOnly
                            value={activeInputId === item.id ? draftValue : (item.actualWeight ?? item.defaultWeight)}
                            onClick={() => startEditing(item.id, item.actualWeight ?? item.defaultWeight)}
                            className={`tw-w-full tw-text-center tw-font-mono tw-text-3xl tw-font-bold tw-p-0 tw-h-14 tw-border tw-rounded-lg tw-shadow-inner focus:tw-outline-none tw-transition-all tw-caret-transparent ${
                              activeInputId === item.id 
                              ? 'tw-bg-white tw-border-primary tw-ring-2 tw-ring-primary tw-text-primary' 
                              : 'tw-bg-slate-50 tw-border-slate-300 tw-text-slate-900'
                            }`}
                          />
                        </HelpTarget>
                        {activeInputId === item.id && (
                           <div className="tw-absolute tw-right-2 tw-top-1/2 -tw-translate-y-1/2 tw-animate-pulse tw-text-primary tw-pointer-events-none">
                             <i className="fa-solid fa-calculator tw-text-xs"></i>
                           </div>
                        )}
                        <div className="tw-absolute tw-left-2 tw-top-1/2 -tw-translate-y-1/2 tw-text-slate-400 tw-text-[10px] tw-font-bold tw-pointer-events-none">kg</div>
                      </div>
                      
                      <button 
                        onClick={() => updateItemWeight(item.id, (item.actualWeight || item.defaultWeight) + step)}
                        className="tw-w-14 tw-h-14 tw-rounded-xl tw-bg-slate-100 tw-border tw-border-slate-200 tw-font-bold tw-text-2xl tw-text-slate-600 active:tw-bg-slate-200 tw-touch-manipulation tw-flex tw-items-center tw-justify-center tw-shadow-sm tw-shrink-0"
                      >+</button>
                    </div>

                    <div className="tw-bg-slate-50 tw-p-2 tw-rounded-lg tw-border tw-border-slate-100">
                      <div className="tw-flex tw-justify-between tw-items-center tw-mb-1 tw-px-1">
                        <span className="tw-text-[10px] tw-text-slate-400 tw-font-bold">増減単位</span>
                      </div>
                      <div className="tw-grid tw-grid-cols-3 tw-gap-2">
                        {[10, 100].map((val) => (
                          <button 
                            key={val}
                            onClick={() => setStep(val)} 
                            className={`tw-rounded-lg tw-py-2 tw-text-sm tw-font-bold tw-touch-manipulation tw-transition-colors tw-border tw-shadow-sm ${
                              step === val 
                                ? 'tw-bg-primary tw-text-white tw-border-primary tw-ring-1 tw-ring-offset-1 tw-ring-primary' 
                                : 'tw-bg-white tw-text-slate-600 tw-border-slate-200 active:tw-bg-slate-100'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                        <button 
                          onClick={() => resetWeight(item.id)} 
                          className="tw-bg-white tw-border tw-border-red-100 tw-text-red-500 tw-rounded-lg tw-py-2 tw-text-xs tw-font-bold active:tw-bg-red-50 tw-touch-manipulation tw-shadow-sm"
                        >
                          <i className="fa-solid fa-trash tw-mr-1"></i>リセット
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            <HelpTarget helpId="btn-add-item">
              <Button variant="secondary" onClick={() => setAddItemModalOpen(true)} className="tw-py-3 tw-text-sm tw-border-dashed tw-border-2 tw-w-full">
                <i className="fa-solid fa-plus tw-mr-2"></i> リストにない品目を追加
              </Button>
            </HelpTarget>
            
            <div className="tw-pt-4 tw-pb-2">
               <Button variant="secondary" onClick={onBack} className="tw-text-sm">
                  <i className="fa-solid fa-pause tw-mr-2"></i> 作業を中断して戻る
               </Button>
            </div>
          </div>
        </div>

        <div className={`tw-fixed tw-bottom-0 tw-left-0 tw-w-full tw-bg-white tw-border-t tw-border-slate-200 tw-p-4 tw-pb-safe tw-shadow-[0_-4px_10px_rgba(0,0,0,0.05)] tw-z-30 tw-transition-transform ${activeInputId ? 'tw-translate-y-full' : ''}`}>
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-3 tw-text-slate-600 tw-font-bold tw-px-1">
            <span>総重量（概算）:</span>
            <span className="tw-text-2xl tw-text-primary tw-font-mono">{totalWeight} <span className="tw-text-sm">kg</span></span>
          </div>
          {isEditing ? (
            <Button onClick={handleSaveCorrection} className="tw-bg-orange-600 tw-shadow-orange-900/20 hover:tw-bg-orange-700">
              <i className="fa-solid fa-save tw-mr-2"></i> 修正内容を保存
            </Button>
          ) : (
            <Button onClick={handleDepart}>
              <i className="fa-solid fa-flag-checkered tw-mr-2"></i> 作業完了・出発
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
          <div className="tw-space-y-6">
            <div>
              <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700 tw-mb-2">品目名</label>
              <input 
                type="text" 
                className="tw-w-full tw-p-4 tw-border tw-border-slate-300 tw-rounded-xl tw-text-lg focus:tw-ring-2 focus:tw-ring-primary focus:tw-outline-none" 
                placeholder="例: 粗大ごみ"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div>
              <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700 tw-mb-2">重量 (kg)</label>
              <input 
                type="text" 
                inputMode="decimal"
                pattern="\d*"
                className="tw-w-full tw-p-4 tw-border tw-border-slate-300 tw-rounded-xl tw-text-lg tw-font-mono focus:tw-ring-2 focus:tw-ring-primary focus:tw-outline-none" 
                placeholder="0"
                value={newItemWeight}
                onChange={(e) => setNewItemWeight(e.target.value)}
              />
            </div>
            <Button onClick={addNewItem} className="tw-mt-4">追加する</Button>
          </div>
        </Modal>
      </div>
    );
  }

  // COMPLETED State (View Only)
  return (
    <div className="tw-p-4 tw-text-center tw-space-y-6 tw-pt-20 tw-flex tw-flex-col tw-items-center">
      <div className="tw-w-24 tw-h-24 tw-bg-green-100 tw-text-green-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-2 tw-animate-bounce">
        <i className="fa-solid fa-check tw-text-5xl"></i>
      </div>
      <div className="tw-space-y-2">
        <h2 className="tw-text-2xl tw-font-bold tw-text-slate-800">作業完了</h2>
        <p className="tw-text-slate-500">お疲れ様でした。<br/>次の目的地へ向かってください。</p>
      </div>
      <div className="tw-w-full tw-max-w-xs tw-mt-8 tw-space-y-3">
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
           <i className="fa-solid fa-pen-to-square tw-mr-2"></i>内容を修正する
        </Button>
        <Button onClick={onBack}>リストに戻る</Button>
      </div>
    </div>
  );
};
