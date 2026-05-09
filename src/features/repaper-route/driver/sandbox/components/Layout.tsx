
import React from 'react';
import type { User } from '../types';
import { DriverStatus } from '../types';
import { Toast } from './Widgets';
import { useHelp, HelpTarget } from './Help';
import { useAgentId } from './AgentContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  title: string;
  onEmergencyClick: () => void;
  onMenuClick: () => void; // New Prop
  currentView: string;
  onNavigate: (view: string) => void;
  showNav?: boolean;
  onVehicleClick?: () => void;
  // Toast Props
  toastMessage?: string | null;
  toastType?: 'success' | 'error' | 'info';
  onToastClose?: () => void;
}

const getStatusLabel = (status: DriverStatus) => {
  switch (status) {
    case DriverStatus.IDLE: return '待機中';
    case DriverStatus.DRIVING: return '移動中';
    case DriverStatus.LOADING: return '作業中';
    case DriverStatus.OFFLINE: return '休憩/オフライン';
    default: return status;
  }
};

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  title, 
  onEmergencyClick,
  onMenuClick, 
  currentView, 
  onNavigate,
  showNav = true,
  onVehicleClick,
  toastMessage = null,
  toastType = 'success',
  onToastClose = () => {}
}) => {
  const { isHelpMode, toggleHelpMode } = useHelp();

  return (
    <div className="tw-flex tw-flex-col tw-h-full tw-bg-slate-50 tw-relative">
      {/* Agent Heartbeat - Hidden from users, visible to AI agent */}
      <div 
        id="agent-heartbeat" 
        className="tw-sr-only" 
        data-state={user.currentStatus} 
        aria-hidden="true"
      >
        [{user.currentStatus === DriverStatus.IDLE ? 'Ready' : 'Stable'}]
      </div>

      {/* Global Toast */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={onToastClose} 
        agentId="layout:toast"
      />

      {/* Header with Safe Area Top - Height increased for touch targets */}
      <header className="tw-flex-none tw-bg-primary tw-text-white tw-shadow-md tw-z-20 tw-pt-safe">
        <div className="tw-flex tw-justify-between tw-items-center tw-px-3 tw-h-[60px]">
          
          {/* Left: Menu Button & Title Group */}
          <div className="tw-flex tw-items-center tw-space-x-3">
             <button 
               onClick={onMenuClick}
               className="tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-rounded-full hover:tw-bg-white/10 active:tw-bg-white/20 tw-transition-colors"
               data-agent-id={useAgentId("header:menu-button")}
             >
               <i className="fa-solid fa-bars tw-text-xl"></i>
             </button>
             
             <div className="tw-flex tw-flex-col tw-justify-center">
               <h1 className="tw-text-lg tw-font-bold tw-leading-tight">{title}</h1>
               <HelpTarget helpId="vehicle-selector">
                 <button 
                   onClick={onVehicleClick}
                   className="tw-flex tw-items-center tw-space-x-1.5 tw-text-xs tw-text-slate-300 tw-opacity-90 hover:tw-opacity-100 active:tw-opacity-70 tw-transition-opacity tw-text-left"
                 >
                   <span>{user.name} | {user.vehicleName}</span>
                   {onVehicleClick && <i className="fa-solid fa-caret-down tw-text-[10px]"></i>}
                 </button>
               </HelpTarget>
             </div>
          </div>

          {/* Right: Actions */}
          <div className="tw-flex tw-items-center tw-space-x-1">
            
            {/* Help Toggle Button */}
             <button 
               onClick={toggleHelpMode}
               className={`tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-lg tw-transition-all tw-border active:tw-scale-95 ${isHelpMode ? 'tw-bg-white tw-text-primary tw-border-white tw-ring-2 tw-ring-white/50' : 'tw-bg-blue-800 tw-text-blue-200 tw-border-blue-700'}`}
             >
               ?
             </button>
            
            <HelpTarget helpId="status-badge-header">
               <span className="tw-text-[10px] tw-font-mono tw-bg-blue-800 tw-px-2 tw-py-1 tw-rounded tw-opacity-80 tw-block tw-min-w-[3rem] tw-text-center tw-ml-1">
                 {getStatusLabel(user.currentStatus)}
               </span>
            </HelpTarget>
            
            <HelpTarget helpId="trouble-button">
               <button 
                 onClick={onEmergencyClick}
                 className="tw-ml-2 tw-bg-orange-600 hover:tw-bg-orange-700 tw-text-white tw-px-3 tw-h-10 tw-rounded-lg tw-font-bold tw-text-sm tw-shadow-lg tw-shadow-orange-900/20 active:tw-scale-95 tw-transition-all tw-flex tw-items-center tw-justify-center tw-border-b-2 tw-border-orange-800 tw-min-w-[80px]"
                 data-agent-id={useAgentId("header:emergency-button")}
               >
                 <i className="fa-solid fa-triangle-exclamation tw-mr-1.5"></i> トラブル
               </button>
            </HelpTarget>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tw-flex-1 tw-overflow-y-auto tw-overflow-x-hidden tw-relative tw-no-scrollbar tw-pb-24 tw-overscroll-contain">
        {children}
      </main>

      {/* Bottom Navigation with Safe Area Bottom */}
      {showNav && (
        <nav className="tw-flex-none tw-bg-white tw-border-t tw-border-slate-200 tw-shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] tw-z-20 tw-pb-safe">
          <div className="tw-flex tw-justify-around tw-items-center tw-h-[60px]">
            <HelpTarget helpId="nav-route" wrapperClassName="tw-w-full tw-h-full tw-flex-1">
              <NavButton 
                icon="fa-solid fa-list-check" 
                label="ルート" 
                active={currentView === 'route' || currentView === 'stop'} 
                onClick={() => onNavigate('route')} 
                agentId="nav:route"
              />
            </HelpTarget>
            <HelpTarget helpId="nav-fuel" wrapperClassName="tw-w-full tw-h-full tw-flex-1">
              <NavButton 
                icon="fa-solid fa-gas-pump" 
                label="給油" 
                active={currentView === 'fuel'} 
                onClick={() => onNavigate('fuel')} 
                agentId="nav:fuel"
              />
            </HelpTarget>
            <HelpTarget helpId="nav-report" wrapperClassName="tw-w-full tw-h-full tw-flex-1">
              <NavButton 
                icon="fa-solid fa-chart-line" 
                label="実績" 
                active={currentView === 'report'} 
                onClick={() => onNavigate('report')} 
                agentId="nav:report"
              />
            </HelpTarget>
            <HelpTarget helpId="nav-end" wrapperClassName="tw-w-full tw-h-full tw-flex-1">
              <NavButton 
                icon="fa-solid fa-right-from-bracket" 
                label="終了" 
                active={currentView === 'end'} 
                onClick={() => onNavigate('end')} 
                agentId="nav:end"
              />
            </HelpTarget>
          </div>
        </nav>
      )}
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick, agentId }: { icon: string, label: string, active: boolean, onClick: () => void, agentId: string }) => (
  <button 
    onClick={onClick}
    className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-full tw-space-y-1 active:tw-bg-slate-50 tw-transition-colors tw-touch-manipulation ${active ? 'tw-text-primary' : 'tw-text-slate-400'}`}
    data-agent-id={useAgentId(agentId)}
  >
    <i className={`${icon} tw-text-xl tw-mb-0.5 ${active ? 'tw-scale-110' : ''} tw-transition-transform`}></i>
    <span className="tw-text-[10px] tw-font-bold">{label}</span>
  </button>
);
