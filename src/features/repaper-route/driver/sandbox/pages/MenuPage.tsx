import React from 'react';
import type { User } from '../types';

interface MenuPageProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onVehicleChange: () => void;
  onCourseChange: () => void;
  onFuelReport: () => void;
  onLogout: () => void;
}

/**
 * MenuPage (Production Mode)
 * 
 * 業務に必要な機能のみに絞り込んだサイドメニュー。
 */
export const MenuPage: React.FC<MenuPageProps> = ({
  isOpen, 
  onClose, 
  user,
  onVehicleChange, 
  onCourseChange,
  onFuelReport,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-start bg-black/50 backdrop-blur-sm animate-fade-in">
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
                   className="w-full flex items-center p-4 border-b border-slate-100 active:bg-slate-50 transition-colors text-left"
                 >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                      <i className="fa-solid fa-route"></i>
                    </div>
                    <div className="flex-1">
                       <div className="font-bold text-slate-700">担当コース変更</div>
                       <div className="text-xs text-slate-400">他コースへの変更（管理者通知）</div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-300"></i>
                 </button>

                 <button 
                   onClick={onFuelReport}
                   className="w-full flex items-center p-4 active:bg-slate-50 transition-colors text-left"
                 >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                      <i className="fa-solid fa-gas-pump"></i>
                    </div>
                    <div className="flex-1">
                       <div className="font-bold text-slate-700">給油報告</div>
                       <div className="text-xs text-slate-400">レシート撮影・走行距離入力</div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-300"></i>
                 </button>
              </div>
           </div>
           
           {/* Section: Logout */}
           <div>
              <button 
                onClick={onLogout}
                className="w-full bg-white border border-slate-200 text-red-600 p-4 rounded-xl font-bold flex items-center justify-center active:bg-red-50 transition-colors"
              >
                <i className="fa-solid fa-right-from-bracket mr-2"></i> ログアウト
              </button>
           </div>

           <div className="text-center pt-8">
              <p className="text-[10px] text-slate-300 tracking-widest uppercase">RePaper DXOS Driver Module</p>
           </div>
        </div>
      </div>
    </div>
  );
};
