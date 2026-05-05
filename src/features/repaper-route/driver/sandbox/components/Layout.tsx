
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
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Agent Heartbeat - Hidden from users, visible to AI agent */}
      <div 
        id="agent-heartbeat" 
        className="sr-only" 
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
      <header className="flex-none bg-primary text-white shadow-md z-20 pt-safe">
        <div className="flex justify-between items-center px-3 h-[60px]">
          
          {/* Left: Menu Button & Title Group */}
          <div className="flex items-center space-x-3">
             <button 
               onClick={onMenuClick}
               className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
               data-agent-id={useAgentId("header:menu-button")}
             >
               <i className="fa-solid fa-bars text-xl"></i>
             </button>
             
             <div className="flex flex-col justify-center">
               <h1 className="text-lg font-bold leading-tight">{title}</h1>
               <HelpTarget helpId="vehicle-selector">
                 <button 
                   onClick={onVehicleClick}
                   className="flex items-center space-x-1.5 text-xs text-slate-300 opacity-90 hover:opacity-100 active:opacity-70 transition-opacity text-left"
                 >
                   <span>{user.name} | {user.vehicleName}</span>
                   {onVehicleClick && <i className="fa-solid fa-caret-down text-[10px]"></i>}
                 </button>
               </HelpTarget>
             </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-1">
            
            {/* Help Toggle Button */}
             <button 
               onClick={toggleHelpMode}
               className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all border active:scale-95 ${isHelpMode ? 'bg-white text-primary border-white ring-2 ring-white/50' : 'bg-blue-800 text-blue-200 border-blue-700'}`}
             >
               ?
             </button>
            
            <HelpTarget helpId="status-badge-header">
               <span className="text-[10px] font-mono bg-blue-800 px-2 py-1 rounded opacity-80 block min-w-[3rem] text-center ml-1">
                 {getStatusLabel(user.currentStatus)}
               </span>
            </HelpTarget>
            
            <HelpTarget helpId="trouble-button">
              <button 
                onClick={onEmergencyClick}
                className="ml-2 bg-orange-600 hover:bg-orange-700 text-white px-3 h-10 rounded-lg font-bold text-sm shadow-lg shadow-orange-900/20 active:scale-95 transition-all flex items-center justify-center border-b-2 border-orange-800 min-w-[80px]"
                data-agent-id={useAgentId("header:emergency-button")}
              >
                <i className="fa-solid fa-triangle-exclamation mr-1.5"></i> トラブル
              </button>
            </HelpTarget>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar pb-24 overscroll-contain">
        {children}
      </main>

      {/* Bottom Navigation with Safe Area Bottom */}
      {showNav && (
        <nav className="flex-none bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 pb-safe">
          <div className="flex justify-around items-center h-[60px]">
            <HelpTarget helpId="nav-route" wrapperClassName="w-full h-full flex-1">
              <NavButton 
                icon="fa-solid fa-list-check" 
                label="ルート" 
                active={currentView === 'route' || currentView === 'stop'} 
                onClick={() => onNavigate('route')} 
                agentId="nav:route"
              />
            </HelpTarget>
            <HelpTarget helpId="nav-fuel" wrapperClassName="w-full h-full flex-1">
              <NavButton 
                icon="fa-solid fa-gas-pump" 
                label="給油" 
                active={currentView === 'fuel'} 
                onClick={() => onNavigate('fuel')} 
                agentId="nav:fuel"
              />
            </HelpTarget>
            <HelpTarget helpId="nav-report" wrapperClassName="w-full h-full flex-1">
              <NavButton 
                icon="fa-solid fa-chart-line" 
                label="実績" 
                active={currentView === 'report'} 
                onClick={() => onNavigate('report')} 
                agentId="nav:report"
              />
            </HelpTarget>
            <HelpTarget helpId="nav-end" wrapperClassName="w-full h-full flex-1">
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
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:bg-slate-50 transition-colors touch-manipulation ${active ? 'text-primary' : 'text-slate-400'}`}
    data-agent-id={useAgentId(agentId)}
  >
    <i className={`${icon} text-xl mb-0.5 ${active ? 'scale-110' : ''} transition-transform`}></i>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);
