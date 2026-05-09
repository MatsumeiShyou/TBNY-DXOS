
import React, { useEffect } from 'react';
import { useAgentId } from './AgentContext';

// Primary Action Button
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  agentId: string; 
}> = ({ 
  className = '', 
  variant = 'primary', 
  children, 
  disabled,
  agentId,
  ...props 
}) => {
  const fullAgentId = useAgentId(agentId);
  const baseStyles = "tw-w-full tw-py-4 tw-px-6 tw-rounded-xl tw-font-bold tw-text-lg tw-transition-all active:tw-scale-[0.98] tw-shadow-sm tw-flex tw-items-center tw-justify-center tw-touch-manipulation tw-min-h-[56px]";
  const variants = {
    primary: "tw-bg-primary tw-text-white hover:tw-bg-blue-800 tw-shadow-blue-900/10",
    secondary: "tw-bg-white tw-text-slate-800 tw-border tw-border-slate-300 hover:tw-bg-slate-50",
    outline: "tw-bg-transparent tw-border-2 tw-border-primary tw-text-primary hover:tw-bg-blue-50",
    danger: "tw-bg-danger tw-text-white hover:tw-bg-red-700 tw-shadow-red-900/10"
  };

  const disabledStyles = disabled ? "tw-opacity-50 tw-cursor-not-allowed tw-pointer-events-none tw-grayscale" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`} 
      disabled={disabled}
      data-agent-id={fullAgentId}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Container
export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
  agentId: string;
}> = ({ children, className = '', onClick, agentId }) => {
  const fullAgentId = useAgentId(agentId);
  return (
    <div 
      onClick={onClick} 
      className={`tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-slate-200 tw-p-4 ${className}`}
      data-agent-id={fullAgentId}
    >
      {children}
    </div>
  );
};

// Status Badge - Increased contrast for outdoor visibility
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = "tw-bg-slate-100 tw-text-slate-600 tw-border-slate-200";
  let text = "未対応";

  switch (status) {
    case 'PENDING':
      color = "tw-bg-blue-50 tw-text-blue-700 tw-border-blue-100";
      text = "予定";
      break;
    case 'IN_PROGRESS':
      color = "tw-bg-orange-50 tw-text-orange-700 tw-border-orange-200 tw-animate-pulse";
      text = "作業中";
      break;
    case 'COMPLETED':
      color = "tw-bg-green-50 tw-text-green-700 tw-border-green-200";
      text = "完了";
      break;
    case 'SKIPPED':
      color = "tw-bg-red-50 tw-text-red-700 tw-border-red-200";
      text = "スキップ";
      break;
  }

  return (
    <span className={`tw-px-2.5 tw-py-1 tw-rounded-md tw-text-xs tw-font-bold ${color} tw-border tw-opacity-90`}>
      {text}
    </span>
  );
};

// Modal Overlay - Improved close button hit area (44px rule)
export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  agentId: string;
}> = ({ isOpen, onClose, title, children, agentId }) => {
  const fullAgentId = useAgentId(agentId);
  if (!isOpen) return null;
  return (
    <div 
      className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-end sm:tw-items-center tw-justify-center tw-bg-black/60 tw-backdrop-blur-sm tw-animate-fade-in sm:tw-p-4"
      data-agent-id={fullAgentId}
    >
      <div className="tw-bg-white tw-w-full sm:tw-max-w-md tw-rounded-t-2xl sm:tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden tw-animate-slide-up tw-flex tw-flex-col tw-max-h-[90vh] tw-pb-safe">
        <div className="tw-bg-primary tw-p-4 tw-flex tw-justify-between tw-items-center tw-text-white tw-shrink-0 tw-relative">
          <h3 className="tw-font-bold tw-text-lg tw-pr-12">{title}</h3>
          <button 
            onClick={onClose} 
            className="tw-absolute tw-right-0 tw-top-0 tw-bottom-0 tw-w-16 tw-flex tw-items-center tw-justify-center hover:tw-bg-white/10 active:tw-bg-white/20 tw-transition-colors"
            aria-label="閉じる"
            data-agent-id={`${fullAgentId}:close`}
          >
            <i className="fa-solid fa-xmark tw-text-2xl"></i>
          </button>
        </div>
        <div className="tw-p-4 tw-overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Toast Notification
export const Toast: React.FC<{ 
  message: string | null; 
  type?: 'success' | 'error' | 'info'; 
  onClose: () => void;
  agentId: string;
}> = ({ message, type = 'success', onClose, agentId }) => {
  const fullAgentId = useAgentId(agentId);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 4000); // Auto close after 4s
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'tw-bg-slate-800 tw-text-white tw-shadow-blue-900/20',
    error: 'tw-bg-red-600 tw-text-white tw-shadow-red-900/20',
    info: 'tw-bg-blue-600 tw-text-white tw-shadow-blue-900/20'
  };

  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  return (
    <div 
      className="tw-fixed tw-top-4 tw-left-4 tw-right-4 tw-z-[60] tw-animate-slide-up"
      data-agent-id={fullAgentId}
    >
      <div className={`${bgColors[type]} tw-px-4 tw-py-3 tw-rounded-xl tw-shadow-xl tw-flex tw-items-center tw-justify-between tw-min-h-[56px]`}>
         <div className="tw-flex tw-items-center tw-space-x-3">
            <i className={`${icons[type]} tw-text-lg`}></i>
            <span className="tw-font-bold tw-text-sm tw-leading-tight">{message}</span>
         </div>
         <button onClick={onClose} className="tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-bg-white/20 tw-rounded-full tw-ml-2 active:tw-bg-white/30">
            <i className="fa-solid fa-xmark tw-text-sm"></i>
         </button>
      </div>
    </div>
  );
};
