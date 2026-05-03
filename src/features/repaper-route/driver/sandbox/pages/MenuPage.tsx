
import React from 'react';
import type { User, Stop } from '../types';
import { Card } from '../components/Widgets';

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
    <div className="fixed inset-0 z-50 flex justify-start bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-[85%] max-w-sm bg-slate-50 h-full shadow-2xl flex flex-col animate-slide-right overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-primary text-white p-6 pt-safe pb-6 shrink-0 relative">
           <button 
             onClick={onClose}
             className="absolute top-safe right-4 w-10 h-10 flex items-center justify-center bg-white/20 rounded-full active:bg-white/30"
           >
             <i className="fa-solid fa-xmark"></i>
           </button>
           
           <div className="flex items-center space-x-3 mt-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-primary text-xl font-bold shadow-lg">
                {user.name.slice(0,1)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <div className="text-xs opacity-80 font-mono">{user.vehicleName}</div>
              </div>
           </div>
        </div>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           
           {/* Section: Notifications (Inbox) */}
           {incomingRequest && (
             <div className="animate-pulse">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                 <i className="fa-solid fa-bell mr-2 text-primary"></i>受信トレイ
               </h3>
               <Card className="bg-blue-50 border-blue-200 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">交換依頼</span>
                    <span className="text-xs text-slate-400">たった今</span>
                  </div>
                  <p className="font-bold text-slate-800 mb-1">
                    {incomingRequest.colleagueName}さんから依頼
                  </p>
                  <p className="text-sm text-slate-600 mb-3">
                    案件: {incomingRequest.stopName}
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={onRejectIncoming}
                      className="flex-1 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600"
                    >
                      却下
                    </button>
                    <button 
                      onClick={onApproveIncoming}
                      className="flex-1 py-2 bg-primary text-white rounded text-xs font-bold shadow-sm"
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
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                 <i className="fa-solid fa-paper-plane mr-2 text-slate-400"></i>送信済み (依頼中)
               </h3>
               <div className="space-y-2">
                 {outgoingRequests.map(stop => (
                   <div key={stop.id} className="bg-white p-3 rounded-lg border border-dashed border-slate-300 flex justify-between items-center">
                      <div className="flex-1 min-w-0 mr-2">
                         <div className="text-[10px] text-slate-400">相手からの応答待ち...</div>
                         <div className="font-bold text-sm truncate text-slate-700">{stop.customerName}</div>
                      </div>
                      <button 
                        onClick={() => onCancelOutgoing(stop.id)}
                        className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded font-bold whitespace-nowrap"
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
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                業務メニュー
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <button 
                   onClick={onVehicleChange}
                   className="w-full flex items-center p-4 border-b border-slate-100 active:bg-slate-50 transition-colors text-left"
                 >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                      <i className="fa-solid fa-truck"></i>
                    </div>
                    <div className="flex-1">
                       <div className="font-bold text-slate-700">車両乗り換え</div>
                       <div className="text-xs text-slate-400">現在: {user.vehicleName}</div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-300"></i>
                 </button>
                 
                 <button 
                   onClick={onCourseChange}
                   className="w-full flex items-center p-4 active:bg-slate-50 transition-colors text-left"
                 >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                      <i className="fa-solid fa-route"></i>
                    </div>
                    <div className="flex-1">
                       <div className="font-bold text-slate-700">担当コース変更</div>
                       <div className="text-xs text-slate-400">他コースへの変更・交換</div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-300"></i>
                 </button>
              </div>
           </div>
           
           {/* Section: Tools / Demo */}
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                ツール・その他
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={onDemoTrigger}
                  className="w-full bg-blue-50 border border-dashed border-blue-300 text-blue-600 p-3 rounded-xl text-xs font-bold hover:bg-blue-100 flex items-center justify-center active:bg-blue-200 transition-colors"
                >
                  <i className="fa-solid fa-flask mr-2"></i> (デモ) 他ドライバーからの依頼を受信
                </button>
                
                <div className="text-center pt-4">
                  <p className="text-[10px] text-slate-300">RePaper Driver App v1.2.0 (MVP)</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
