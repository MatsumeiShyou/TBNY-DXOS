
import React from 'react';
import { User, Stop } from '../types';
import { Button, Card, StatusBadge } from '../components/Widgets';

interface MenuPageProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  
  // Swap / Request Data
  incomingRequest: { stopName: string, colleagueName: string } | null;
  outgoingRequests: Stop[];
  
  // Handlers
  onApproveIncoming: () => void;
  onRejectIncoming: () => void;
  onCancelOutgoing: (stopId: string) => void;
  
  // Navigation Handlers
  onVehicleChange: () => void;
  onCourseChange: () => void;
  
  // Debug
  onDemoTrigger: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  isOpen, onClose, user,
  incomingRequest, outgoingRequests,
  onApproveIncoming, onRejectIncoming, onCancelOutgoing,
  onVehicleChange, onCourseChange, onDemoTrigger
}) => {
  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-justify-start tw-bg-black/50 tw-backdrop-blur-sm tw-animate-fade-in">
      <div className="tw-w-[85%] tw-max-w-sm tw-bg-slate-50 tw-h-full tw-shadow-2xl tw-flex tw-flex-col tw-animate-slide-right tw-overflow-hidden tw-relative">
        
        {/* Header */}
        <div className="tw-bg-primary tw-text-white tw-p-6 tw-pt-safe tw-pb-6 tw-shrink-0 tw-relative">
           <button 
             onClick={onClose}
             className="tw-absolute tw-top-safe tw-right-4 tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-bg-white/20 tw-rounded-full active:tw-bg-white/30"
           >
             <i className="fa-solid fa-xmark"></i>
           </button>
           
           <div className="tw-flex tw-items-center tw-space-x-3 tw-mt-4">
              <div className="tw-w-14 tw-h-14 tw-bg-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-primary tw-text-xl tw-font-bold tw-shadow-lg">
                {user.name.slice(0,1)}
              </div>
              <div>
                <h2 className="tw-text-xl tw-font-bold">{user.name}</h2>
                <div className="tw-text-xs tw-opacity-80 tw-font-mono">{user.vehicleName}</div>
              </div>
           </div>
        </div>

        {/* Content Scroll */}
        <div className="tw-flex-1 tw-overflow-y-auto tw-p-4 tw-space-y-6">
           
           {/* Section: Notifications (Inbox) */}
           {incomingRequest && (
             <div className="tw-animate-pulse">
               <h3 className="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wider tw-mb-2">
                 <i className="fa-solid fa-bell tw-mr-2 tw-text-primary"></i>受信トレイ
               </h3>
               <Card className="tw-bg-blue-50 tw-border-blue-200 tw-border-l-4 tw-border-l-primary">
                  <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                    <span className="tw-bg-primary tw-text-white text-[10px] tw-px-2 tw-py-0.5 tw-rounded-full tw-font-bold">交換依頼</span>
                    <span className="tw-text-xs tw-text-slate-400">たった今</span>
                  </div>
                  <p className="tw-font-bold tw-text-slate-800 tw-mb-1">
                    {incomingRequest.colleagueName}さんから依頼
                  </p>
                  <p className="tw-text-sm tw-text-slate-600 tw-mb-3">
                    案件: {incomingRequest.stopName}
                  </p>
                  <div className="tw-flex tw-space-x-2">
                    <button 
                      onClick={onRejectIncoming}
                      className="tw-flex-1 tw-py-2 tw-bg-white tw-border tw-border-slate-300 tw-rounded tw-text-xs tw-font-bold tw-text-slate-600"
                    >
                      却下
                    </button>
                    <button 
                      onClick={onApproveIncoming}
                      className="tw-flex-1 tw-py-2 tw-bg-primary tw-text-white tw-rounded tw-text-xs tw-font-bold tw-shadow-sm"
                    >
                      承認
                    </button>
                  </div>
               </Card>
             </div>
           )}

           {/* Section: Outbox */}
           {outgoingRequests.length > 0 && (
             <div>
               <h3 className="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wider tw-mb-2">
                 <i className="fa-solid fa-paper-plane tw-mr-2 tw-text-slate-400"></i>送信済み (依頼中)
               </h3>
               <div className="tw-space-y-2">
                 {outgoingRequests.map(stop => (
                   <div key={stop.id} className="tw-bg-white tw-p-3 tw-rounded-lg tw-border tw-border-dashed tw-border-slate-300 tw-flex tw-justify-between tw-items-center">
                      <div className="tw-flex-1 tw-min-w-0 tw-mr-2">
                         <div className="tw-text-[10px] tw-text-slate-400">相手からの応答待ち...</div>
                         <div className="tw-font-bold tw-text-sm tw-truncate tw-text-slate-700">{stop.customerName}</div>
                      </div>
                      <button 
                        onClick={() => onCancelOutgoing(stop.id)}
                        className="tw-text-xs tw-text-red-500 tw-bg-red-50 tw-px-3 tw-py-1.5 tw-rounded tw-font-bold tw-whitespace-nowrap"
                      >
                        取り消し
                      </button>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Section: Operations */}
           <div>
              <h3 className="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wider tw-mb-2">
                業務メニュー
              </h3>
              <div className="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-sm tw-overflow-hidden">
                 <button 
                   onClick={onVehicleChange}
                   className="tw-w-full tw-flex tw-items-center tw-p-4 tw-border-b tw-border-slate-100 active:tw-bg-slate-50 tw-transition-colors tw-text-left"
                 >
                    <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-mr-3 tw-text-slate-500">
                      <i className="fa-solid fa-truck"></i>
                    </div>
                    <div className="tw-flex-1">
                       <div className="tw-font-bold tw-text-slate-700">車両乗り換え</div>
                       <div className="tw-text-xs tw-text-slate-400">現在: {user.vehicleName}</div>
                    </div>
                    <i className="fa-solid fa-chevron-right tw-text-slate-300"></i>
                 </button>
                 
                 <button 
                   onClick={onCourseChange}
                   className="tw-w-full tw-flex tw-items-center tw-p-4 active:tw-bg-slate-50 tw-transition-colors tw-text-left"
                 >
                    <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-mr-3 tw-text-slate-500">
                      <i className="fa-solid fa-route"></i>
                    </div>
                    <div className="tw-flex-1">
                       <div className="tw-font-bold tw-text-slate-700">担当コース変更</div>
                       <div className="tw-text-xs tw-text-slate-400">他コースへの変更・交換</div>
                    </div>
                    <i className="fa-solid fa-chevron-right tw-text-slate-300"></i>
                 </button>
              </div>
           </div>
           
           {/* Section: Tools / Demo */}
           <div>
              <h3 className="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wider tw-mb-2">
                ツール・その他
              </h3>
              <div className="tw-space-y-3">
                <button 
                  onClick={onDemoTrigger}
                  className="tw-w-full tw-bg-blue-50 tw-border tw-border-dashed tw-border-blue-300 tw-text-blue-600 tw-p-3 tw-rounded-xl tw-text-xs tw-font-bold hover:tw-bg-blue-100 tw-flex tw-items-center tw-justify-center active:tw-bg-blue-200 tw-transition-colors"
                >
                  <i className="fa-solid fa-flask tw-mr-2"></i> (デモ) 他ドライバーからの依頼を受信
                </button>
                
                <div className="tw-text-center tw-pt-4">
                  <p className="tw-text-[10px] tw-text-slate-300">RePaper Driver App v1.2.0 (MVP)</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
