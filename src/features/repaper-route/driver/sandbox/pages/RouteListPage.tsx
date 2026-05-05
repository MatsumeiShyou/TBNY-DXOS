import React, { useState } from 'react';
import type { Stop } from '../types';
import { StopStatus } from '../types';
import { Card, StatusBadge, Button } from '../components/Widgets';
import { useAgentId } from '../components/AgentContext';
import { HelpTarget } from '../components/Help';

interface Props {
  stops: Stop[];
  currentRouteName: string;
  onSelectStop: (stopId: string) => void;
  onStatusReport: (status: string) => void;
  onChangeCourse: () => void;
  onTransferRequest: (stop: Stop) => void;
  onIntermediateUnload: () => void;
  onReorderStops: (newStops: Stop[]) => void;
}

export const RouteListPage: React.FC<Props> = ({ stops, currentRouteName, onSelectStop, onChangeCourse, onTransferRequest, onIntermediateUnload, onReorderStops }) => {
  const [isReordering, setIsReordering] = useState(false);

  // Calculate progress
  const completed = stops.filter(s => s.status === StopStatus.COMPLETED).length;
  const total = stops.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Find index to insert AM/PM divider
  const pmStartIndex = stops.findIndex(s => {
    if (!s.scheduledTime) return false;
    const hour = parseInt(s.scheduledTime.split(':')[0]);
    return !isNaN(hour) && hour >= 12;
  });

  const moveStop = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stops.length - 1) return;

    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    // Swap
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    
    onReorderStops(newStops);
  };

  return (
    <div className="p-4 space-y-4 pb-32">
      
      {/* Course Info Card */}
      <HelpTarget helpId="course-info">
        <div className="flex gap-2">
          <div 
            onClick={onChangeCourse}
            className="flex-1 bg-slate-800 text-white p-4 rounded-xl shadow-lg flex justify-between items-center active:bg-slate-700 transition-colors touch-manipulation cursor-pointer min-h-[72px]"
            data-agent-id={useAgentId("header:course-card")}
          >
            <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">現在の担当コース</div>
                <div className="font-bold text-lg flex items-center">
                  <i className="fa-solid fa-route mr-2 text-slate-300"></i>
                  {currentRouteName}
                </div>
            </div>
            <div className="bg-white/10 p-2 rounded-lg">
              <i className="fa-solid fa-right-left text-sm"></i>
            </div>
          </div>
        </div>
      </HelpTarget>

      {/* Progress & Quick Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center sticky top-0 z-10 bg-opacity-95 backdrop-blur">
        <div>
          <p className="text-xs text-slate-500 font-bold mb-1">進捗状況</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-primary">{completed}</span>
            <span className="text-sm text-slate-400">/ {total} 件 ({progress}%)</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <HelpTarget helpId="btn-reorder">
             <button 
              onClick={() => setIsReordering(!isReordering)}
              className={`h-10 px-4 rounded-lg text-sm font-bold shadow-sm flex items-center transition-colors ${isReordering ? 'bg-primary text-white border-transparent' : 'bg-white border border-slate-200 text-slate-700 active:bg-slate-50'}`}
              data-agent-id={useAgentId("header:reorder-button")}
            >
              <i className={`fa-solid ${isReordering ? 'fa-check' : 'fa-sort'} mr-2`}></i>
              {isReordering ? '完了' : '並び替え'}
            </button>
          </HelpTarget>
        </div>
      </div>

      {isReordering && (
        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 mb-2">
          <i className="fa-solid fa-circle-info mr-2"></i>
          矢印ボタンで訪問順序を変更できます。午後の案件を午前に前倒しする場合などに利用してください。
        </div>
      )}

      {/* Timeline/List */}
      {stops.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <i className="fa-solid fa-list-ul text-4xl mb-3 opacity-20"></i>
          <p>このコースに案件はありません</p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>
          
          {stops.map((stop, index) => {
            const isNext = stop.status === StopStatus.PENDING && (index === 0 || stops[index - 1]?.status === StopStatus.COMPLETED);
            const showDivider = index === pmStartIndex;
            const isRequesting = stop.transferStatus === 'REQUESTING';

            return (
              <React.Fragment key={stop.id}>
                {showDivider && (
                  <div className="relative z-10 flex items-center justify-center my-6">
                     <div className="bg-slate-200 h-px flex-1"></div>
                     <div className="mx-4 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                       <i className="fa-regular fa-clock mr-1"></i> 午後の部 (12:00~)
                     </div>
                     <div className="bg-slate-200 h-px flex-1"></div>
                  </div>
                )}

                <div className="relative z-10 pl-2">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <Card 
                        className={`transition-all relative min-h-[110px] ${isNext ? 'border-l-4 border-l-primary ring-2 ring-blue-100' : 'opacity-90'} ${stop.status === StopStatus.COMPLETED ? 'bg-slate-50 opacity-60' : ''} ${isRequesting ? 'bg-slate-100 border-dashed border-2 border-slate-300' : ''}`}
                        onClick={() => !isReordering && !isRequesting && onSelectStop(stop.id)}
                        agentId={`stop-card:${stop.id}`}
                      >
                        {isRequesting && (
                          <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                             <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 text-slate-500 font-bold text-sm flex items-center animate-pulse">
                               <i className="fa-solid fa-paper-plane mr-2 text-primary"></i> 譲渡申請中...
                             </div>
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-2 pr-10">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-lg font-bold text-slate-700 bg-slate-100 px-2 rounded">{stop.scheduledTime}</span>
                            <StatusBadge status={stop.status} />
                          </div>
                          {stop.isPriority && (
                            <HelpTarget helpId="priority-badge">
                              <span className="text-xs font-bold text-white bg-danger px-2 py-0.5 rounded-full animate-pulse">
                                優先
                              </span>
                            </HelpTarget>
                          )}
                        </div>

                        {stop.status === StopStatus.PENDING && !isReordering && !isRequesting && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTransferRequest(stop);
                            }}
                            className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center rounded-bl-xl text-slate-400 hover:text-slate-700 active:bg-slate-100 active:text-primary transition-colors z-30"
                            data-agent-id={useAgentId(`stop-card:${stop.id}:menu-button`)}
                          >
                            <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                          </button>
                        )}
                        
                        <h3 className="font-bold text-lg text-slate-800 leading-snug mb-1 pr-4 truncate">{stop.customerName}</h3>
                        <p className="text-sm text-slate-500 truncate mb-3"><i className="fa-solid fa-location-dot mr-1"></i> {stop.address}</p>
                        
                        {stop.status === StopStatus.COMPLETED && (
                           <div className="mt-2 text-xs text-slate-400 font-bold flex items-center">
                             {stop.items.every(i => i.isUnloaded) ? (
                                <span className="text-green-600"><i className="fa-solid fa-check-double mr-1"></i>荷下ろし済</span>
                             ) : (
                                <span className="text-orange-400"><i className="fa-solid fa-truck-loading mr-1"></i>積載中</span>
                             )}
                           </div>
                        )}

                        {isNext && stop.status !== StopStatus.COMPLETED && !isReordering && !isRequesting && (
                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <Button 
                                variant="primary" 
                                className="py-2 text-sm h-10 min-h-[44px]"
                                onClick={() => onSelectStop(stop.id)}
                                agentId={`stop-card:${stop.id}:start-button`}
                            >
                                <i className="fa-solid fa-arrow-right mr-2"></i> 詳細・作業開始
                            </Button>
                          </div>
                        )}
                      </Card>
                    </div>

                    {isReordering && (
                      <div className="flex flex-col ml-2 space-y-3 shrink-0">
                        <button 
                          onClick={() => moveStop(index, 'up')}
                          disabled={index === 0}
                          className="w-12 h-12 bg-white border border-slate-200 rounded-full text-slate-600 shadow-sm flex items-center justify-center active:bg-slate-100 disabled:opacity-30 disabled:active:bg-white transition-all touch-manipulation"
                          data-agent-id={useAgentId(`stop-card:${stop.id}:reorder-up`)}
                        >
                          <i className="fa-solid fa-arrow-up text-lg"></i>
                        </button>
                        <button 
                          onClick={() => moveStop(index, 'down')}
                          disabled={index === stops.length - 1}
                          className="w-12 h-12 bg-white border border-slate-200 rounded-full text-slate-600 shadow-sm flex items-center justify-center active:bg-slate-100 disabled:opacity-30 disabled:active:bg-white transition-all touch-manipulation"
                          data-agent-id={useAgentId(`stop-card:${stop.id}:reorder-down`)}
                        >
                          <i className="fa-solid fa-arrow-down text-lg"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {!isReordering && (
        <div className="fixed bottom-28 right-4 z-30">
           <HelpTarget helpId="fab-intermediate">
             <button 
               onClick={onIntermediateUnload}
               className="bg-white text-slate-700 border border-slate-200 shadow-lg rounded-full px-5 py-3 font-bold flex items-center space-x-2 active:scale-95 transition-transform h-14"
               data-agent-id={useAgentId("fab:intermediate-unload")}
             >
               <div className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-dolly"></i>
               </div>
               <div className="text-left leading-none">
                 <span className="block text-[10px] text-slate-400">拠点に到着</span>
                 <span className="text-sm">中間荷下ろし</span>
               </div>
             </button>
           </HelpTarget>
        </div>
      )}
    </div>
  );
};
