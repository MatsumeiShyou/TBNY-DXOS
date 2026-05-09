import type { User } from '../types';
import { useAgentId } from '../components/AgentContext';

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
    <div className="tw-fixed tw-inset-0 tw-z-[100] tw-flex tw-justify-start tw-bg-black/50 tw-backdrop-blur-sm tw-animate-fade-in">
      <div className="tw-w-[85%] tw-max-w-sm tw-bg-slate-50 tw-h-full tw-shadow-2xl tw-flex tw-flex-col tw-animate-slide-right tw-overflow-hidden tw-relative">
        
        {/* Header */}
        <div className="tw-bg-primary tw-text-white tw-p-6 tw-pt-safe tw-pb-6 tw-shrink-0 tw-relative">
           <button 
             onClick={onClose}
             className="tw-absolute tw-top-safe tw-right-4 tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-bg-white/20 tw-rounded-full active:tw-bg-white/30"
             data-agent-id={useAgentId("close-button")}
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
            
           {/* Section: Operations */}
           <div>
              <h3 className="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wider tw-mb-2">
                業務メニュー
              </h3>
              <div className="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-sm tw-overflow-hidden">
                 <button 
                   onClick={onVehicleChange}
                   className="tw-w-full tw-flex tw-items-center tw-p-4 tw-border-b tw-border-slate-100 active:tw-bg-slate-50 tw-transition-colors tw-text-left"
                   data-agent-id={useAgentId("action:vehicle-change")}
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
                   className="tw-w-full tw-flex tw-items-center tw-p-4 tw-border-b tw-border-slate-100 active:tw-bg-slate-50 tw-transition-colors tw-text-left"
                   data-agent-id={useAgentId("action:course-change")}
                 >
                    <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-mr-3 tw-text-slate-500">
                      <i className="fa-solid fa-route"></i>
                    </div>
                    <div className="tw-flex-1">
                       <div className="tw-font-bold tw-text-slate-700">担当コース変更</div>
                       <div className="tw-text-xs tw-text-slate-400">他コースへの変更（管理者通知）</div>
                    </div>
                    <i className="fa-solid fa-chevron-right tw-text-slate-300"></i>
                 </button>

                 <button 
                   onClick={onFuelReport}
                   className="tw-w-full tw-flex tw-items-center tw-p-4 active:tw-bg-slate-50 tw-transition-colors tw-text-left"
                   data-agent-id={useAgentId("action:fuel-report")}
                 >
                    <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-slate-100 tw-flex tw-items-center tw-justify-center tw-mr-3 tw-text-slate-500">
                      <i className="fa-solid fa-gas-pump"></i>
                    </div>
                    <div className="tw-flex-1">
                       <div className="tw-font-bold tw-text-slate-700">給油報告</div>
                       <div className="tw-text-xs tw-text-slate-400">レシート撮影・走行距離入力</div>
                    </div>
                    <i className="fa-solid fa-chevron-right tw-text-slate-300"></i>
                 </button>
              </div>
           </div>
           
           {/* Section: Logout */}
           <div>
              <button 
                onClick={onLogout}
                className="tw-w-full tw-bg-white tw-border tw-border-slate-200 tw-text-red-600 tw-p-4 tw-rounded-xl tw-font-bold tw-flex tw-items-center tw-justify-center active:tw-bg-red-50 tw-transition-colors"
                data-agent-id={useAgentId("action:logout")}
              >
                <i className="fa-solid fa-right-from-bracket tw-mr-2"></i> ログアウト
              </button>
           </div>

           <div className="tw-text-center tw-pt-8">
              <p className="tw-text-[10px] tw-text-slate-300 tw-tracking-widest tw-uppercase">RePaper DXOS Driver Module</p>
           </div>
        </div>
      </div>
    </div>
  );
};
