
import React, { useState } from 'react';
import { Stop, StopStatus } from '../types';
import { Card, StatusBadge, Button, Modal } from '../components/Widgets';
import { TRAFFIC_STATUS_OPTIONS } from '../constants';
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

export const RouteListPage: React.FC<Props> = ({ stops, currentRouteName, onSelectStop, onStatusReport, onChangeCourse, onTransferRequest, onIntermediateUnload, onReorderStops }) => {
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
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
    <div className="tw-p-4 tw-space-y-4 tw-pb-32">
      
      {/* Course Info Card */}
      <HelpTarget helpId="course-info">
        <div className="tw-flex tw-gap-2">
          <div 
            onClick={onChangeCourse}
            className="tw-flex-1 tw-bg-slate-800 tw-text-white tw-p-4 tw-rounded-xl tw-shadow-lg tw-flex tw-justify-between tw-items-center active:tw-bg-slate-700 tw-transition-colors tw-touch-manipulation tw-cursor-pointer tw-min-h-[72px]"
          >
            <div>
                <div className="tw-text-[10px] tw-text-slate-400 tw-font-bold tw-uppercase tw-tracking-wider tw-mb-0.5">現在の担当コース</div>
                <div className="tw-font-bold tw-text-lg tw-flex tw-items-center">
                  <i className="fa-solid fa-route tw-mr-2 tw-text-slate-300"></i>
                  {currentRouteName}
                </div>
            </div>
            <div className="tw-bg-white/10 tw-p-2 tw-rounded-lg">
              <i className="fa-solid fa-right-left tw-text-sm"></i>
            </div>
          </div>
        </div>
      </HelpTarget>

      {/* Progress & Quick Actions */}
      <div className="tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-sm tw-border tw-border-slate-100 tw-flex tw-justify-between tw-items-center tw-sticky tw-top-0 tw-z-10 tw-bg-opacity-95 tw-backdrop-blur">
        <div>
          <p className="tw-text-xs tw-text-slate-500 tw-font-bold tw-mb-1">進捗状況</p>
          <div className="tw-flex tw-items-baseline tw-space-x-1">
            <span className="tw-text-2xl tw-font-bold tw-text-primary">{completed}</span>
            <span className="tw-text-sm tw-text-slate-400">/ {total} 件 ({progress}%)</span>
          </div>
        </div>
        <div className="tw-flex tw-space-x-2">
          <HelpTarget helpId="btn-reorder">
             <button 
              onClick={() => setIsReordering(!isReordering)}
              className={`tw-h-10 tw-px-4 tw-rounded-lg tw-text-sm tw-font-bold tw-shadow-sm tw-flex tw-items-center tw-transition-colors ${isReordering ? 'tw-bg-primary tw-text-white tw-border-transparent' : 'tw-bg-white tw-border tw-border-slate-200 tw-text-slate-700 active:tw-bg-slate-50'}`}
            >
              <i className={`fa-solid ${isReordering ? 'fa-check' : 'fa-sort'} tw-mr-2`}></i>
              {isReordering ? '完了' : '並び替え'}
            </button>
          </HelpTarget>
          <HelpTarget helpId="btn-status-report">
            <button 
              onClick={() => setStatusModalOpen(true)}
              className="tw-h-10 tw-w-10 tw-bg-white tw-border tw-border-slate-200 tw-text-slate-700 tw-rounded-lg tw-text-sm tw-font-bold tw-shadow-sm active:tw-bg-slate-50 tw-flex tw-items-center tw-justify-center"
            >
              <i className="fa-solid fa-bullhorn tw-text-accent"></i>
            </button>
          </HelpTarget>
        </div>
      </div>

      {isReordering && (
        <div className="tw-bg-blue-50 tw-text-blue-800 tw-text-xs tw-p-3 tw-rounded-lg tw-border tw-border-blue-100 tw-mb-2">
          <i className="fa-solid fa-circle-info tw-mr-2"></i>
          矢印ボタンで訪問順序を変更できます。午後の案件を午前に前倒しする場合などに利用してください。
        </div>
      )}

      {/* Timeline/List */}
      {stops.length === 0 ? (
        <div className="tw-text-center tw-py-10 tw-text-slate-400">
          <i className="fa-solid fa-list-ul tw-text-4xl tw-mb-3 tw-opacity-20"></i>
          <p>このコースに案件はありません</p>
        </div>
      ) : (
        <div className="tw-space-y-4 tw-relative">
          <div className="tw-absolute tw-left-4 tw-top-4 tw-bottom-4 tw-w-0.5 tw-bg-slate-200 tw-z-0"></div>
          
          {stops.map((stop, index) => {
            const isNext = stop.status === StopStatus.PENDING && (index === 0 || stops[index - 1]?.status === StopStatus.COMPLETED);
            const showDivider = index === pmStartIndex;
            const isRequesting = stop.transferStatus === 'REQUESTING';

            return (
              <React.Fragment key={stop.id}>
                {showDivider && (
                  <div className="tw-relative tw-z-10 tw-flex tw-items-center tw-justify-center tw-my-6">
                     <div className="tw-bg-slate-200 tw-h-px tw-flex-1"></div>
                     <div className="tw-mx-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-bg-slate-100 tw-px-3 tw-py-1 tw-rounded-full tw-border tw-border-slate-200">
                       <i className="fa-regular fa-clock tw-mr-1"></i> 午後の部 (12:00~)
                     </div>
                     <div className="tw-bg-slate-200 tw-h-px tw-flex-1"></div>
                  </div>
                )}

                <div className="tw-relative tw-z-10 tw-pl-2">
                  <div className="tw-flex tw-items-center">
                    <div className="tw-flex-1 tw-min-w-0">
                      <Card 
                        className={`tw-transition-all tw-relative tw-min-h-[110px] ${isNext ? 'tw-border-l-4 tw-border-l-primary tw-ring-2 tw-ring-blue-100' : 'tw-opacity-90'} ${stop.status === StopStatus.COMPLETED ? 'tw-bg-slate-50 tw-opacity-60' : ''} ${isRequesting ? 'tw-bg-slate-100 tw-border-dashed tw-border-2 tw-border-slate-300' : ''}`}
                        onClick={() => !isReordering && !isRequesting && onSelectStop(stop.id)}
                      >
                        {isRequesting && (
                          <div className="tw-absolute tw-inset-0 tw-bg-white/60 tw-z-20 tw-flex tw-items-center tw-justify-center tw-rounded-xl tw-backdrop-blur-[1px]">
                             <div className="tw-bg-white tw-px-4 tw-py-2 tw-rounded-full tw-shadow-lg tw-border tw-border-slate-200 tw-text-slate-500 tw-font-bold tw-text-sm tw-flex tw-items-center tw-animate-pulse">
                               <i className="fa-solid fa-paper-plane tw-mr-2 tw-text-primary"></i> 譲渡申請中...
                             </div>
                          </div>
                        )}

                        <div className="tw-flex tw-justify-between tw-items-start tw-mb-2 tw-pr-10">
                          <div className="tw-flex tw-items-center tw-space-x-2">
                            <span className="tw-font-mono tw-text-lg tw-font-bold tw-text-slate-700 tw-bg-slate-100 tw-px-2 tw-rounded">{stop.scheduledTime}</span>
                            <StatusBadge status={stop.status} />
                          </div>
                          {stop.isPriority && (
                            <HelpTarget helpId="priority-badge">
                              <span className="tw-text-xs tw-font-bold tw-text-white tw-bg-danger tw-px-2 tw-py-0.5 tw-rounded-full tw-animate-pulse">
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
                            className="tw-absolute tw-top-0 tw-right-0 tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-rounded-bl-xl tw-text-slate-400 hover:tw-text-slate-700 active:tw-bg-slate-100 active:tw-text-primary tw-transition-colors tw-z-30"
                          >
                            <i className="fa-solid fa-ellipsis-vertical tw-text-xl"></i>
                          </button>
                        )}
                        
                        <h3 className="tw-font-bold tw-text-lg tw-text-slate-800 tw-leading-snug tw-mb-1 tw-pr-4 tw-truncate">{stop.customerName}</h3>
                        <p className="tw-text-sm tw-text-slate-500 tw-truncate tw-mb-3"><i className="fa-solid fa-location-dot tw-mr-1"></i> {stop.address}</p>
                        
                        {stop.status === StopStatus.COMPLETED && (
                           <div className="tw-mt-2 tw-text-xs tw-text-slate-400 tw-font-bold tw-flex tw-items-center">
                             {stop.items.every(i => i.isUnloaded) ? (
                                <span className="tw-text-green-600"><i className="fa-solid fa-check-double tw-mr-1"></i>荷下ろし済</span>
                             ) : (
                                <span className="tw-text-orange-400"><i className="fa-solid fa-truck-loading tw-mr-1"></i>積載中</span>
                             )}
                           </div>
                        )}

                        {isNext && stop.status !== StopStatus.COMPLETED && !isReordering && !isRequesting && (
                          <div className="tw-mt-2" onClick={(e) => e.stopPropagation()}>
                            <Button 
                                variant="primary" 
                                className="tw-py-2 tw-text-sm tw-h-10 tw-min-h-[44px]"
                                onClick={() => onSelectStop(stop.id)}
                            >
                                <i className="fa-solid fa-arrow-right tw-mr-2"></i> 詳細・作業開始
                            </Button>
                          </div>
                        )}
                      </Card>
                    </div>

                    {isReordering && (
                      <div className="tw-flex tw-flex-col tw-ml-2 tw-space-y-3 tw-shrink-0">
                        <button 
                          onClick={() => moveStop(index, 'up')}
                          disabled={index === 0}
                          className="tw-w-12 tw-h-12 tw-bg-white tw-border tw-border-slate-200 tw-rounded-full tw-text-slate-600 tw-shadow-sm tw-flex tw-items-center tw-justify-center active:tw-bg-slate-100 disabled:tw-opacity-30 disabled:active:tw-bg-white tw-transition-all tw-touch-manipulation"
                        >
                          <i className="fa-solid fa-arrow-up tw-text-lg"></i>
                        </button>
                        <button 
                          onClick={() => moveStop(index, 'down')}
                          disabled={index === stops.length - 1}
                          className="tw-w-12 tw-h-12 tw-bg-white tw-border tw-border-slate-200 tw-rounded-full tw-text-slate-600 tw-shadow-sm tw-flex tw-items-center tw-justify-center active:tw-bg-slate-100 disabled:tw-opacity-30 disabled:active:tw-bg-white tw-transition-all tw-touch-manipulation"
                        >
                          <i className="fa-solid fa-arrow-down tw-text-lg"></i>
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
        <div className="tw-fixed tw-bottom-28 tw-right-4 tw-z-30">
           <HelpTarget helpId="fab-intermediate">
             <button 
               onClick={onIntermediateUnload}
               className="tw-bg-white tw-text-slate-700 tw-border tw-border-slate-200 tw-shadow-lg tw-rounded-full tw-px-5 tw-py-3 tw-font-bold tw-flex tw-items-center tw-space-x-2 active:tw-scale-95 tw-transition-transform tw-h-14"
             >
               <div className="tw-bg-orange-100 tw-text-orange-600 tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <i className="fa-solid fa-dolly"></i>
               </div>
               <div className="tw-text-left tw-leading-none">
                 <span className="tw-block tw-text-[10px] tw-text-slate-400">拠点に到着</span>
                 <span className="tw-text-sm">中間荷下ろし</span>
               </div>
             </button>
           </HelpTarget>
        </div>
      )}
    </div>
  );
};
