
import React from 'react';
import type { User } from '../types';
import { DriverStatus } from '../types';
import { Toast } from './Widgets';
import { HelpTarget } from './Help';
import { useAgentId } from './AgentContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  title: string;
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

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  title, 
  onMenuClick, 
  currentView, 
  onNavigate,
  showNav = true,
  onVehicleClick,
  toastMessage = null,
  toastType = 'success',
  onToastClose = () => {}
}) => {

  return (
    <div className="tw-flex tw-flex-col tw-h-screen tw-bg-slate-50 tw-relative tw-overflow-hidden">
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

      {/* Header with Safe Area Top */}
      <header className="tw-flex-none tw-bg-primary tw-text-white tw-shadow-md tw-z-20 tw-pt-safe">
        <div className="tw-flex tw-justify-between tw-items-center tw-px-3 tw-h-[64px]">
          
          {/* Left: Menu & Title Group */}
          <div className="tw-flex tw-items-center tw-space-x-2">
             <button 
               onClick={onMenuClick}
               className="tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-hover:tw-bg-white/10 tw-active:tw-bg-white/20 tw-transition-colors tw-rounded-lg"
               data-agent-id={useAgentId("header:menu-button")}
             >
               <i className="fa-solid fa-bars tw-text-xl"></i>
             </button>
             
             <div className="tw-flex tw-flex-col tw-justify-center tw--mt-3.5">
               <h1 className="tw-text-xl tw-font-bold tw-leading-none">{title}</h1>
               <button 
                 onClick={onVehicleClick}
                 className="tw--mt-1 tw-flex tw-items-center tw-space-x-1 tw-text-sm tw-text-slate-300 tw-opacity-90 tw-hover:tw-opacity-100 tw-active:tw-opacity-70 tw-transition-opacity tw-text-left tw-bg-transparent tw-border-none tw-outline-none"
               >
                 <span>{user.name} | {user.vehicleName}</span>
                 {onVehicleClick && <i className="fa-solid fa-caret-down tw-text-[10px] tw-ml-0.5"></i>}
               </button>
             </div>
          </div>

          {/* Right: Empty or Minimal (matching user screenshot) */}
          <div className="tw-flex tw-items-center">
             {/* ユーザー提示の「本来の姿」には右側にボタンがないため、スペースを空ける */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tw-flex-1 tw-overflow-y-auto tw-overflow-x-hidden tw-relative tw-no-scrollbar tw-pb-24 tw-touch-pan-y tw-overscroll-contain">
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
    className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-full tw-space-y-1 tw-active:tw-bg-slate-50 tw-transition-colors tw-touch-manipulation ${active ? 'tw-text-primary' : 'tw-text-slate-400'}`}
    data-agent-id={useAgentId(agentId)}
  >
    <i className={`${icon} tw-text-xl tw-mb-0.5 ${active ? 'tw-scale-110' : ''} tw-transition-transform`}></i>
    <span className="tw-text-[10px] tw-font-bold">{label}</span>
  </button>
);
