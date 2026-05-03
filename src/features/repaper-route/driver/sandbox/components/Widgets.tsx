
import React, { useEffect } from 'react';

// Primary Action Button
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }> = ({ 
  className = '', 
  variant = 'primary', 
  children, 
  disabled,
  ...props 
}) => {
  const baseStyles = "w-full py-4 px-6 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-sm flex items-center justify-center touch-manipulation min-h-[56px]";
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-800 shadow-blue-900/10",
    secondary: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-blue-50",
    danger: "bg-danger text-white hover:bg-red-700 shadow-red-900/10"
  };

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed pointer-events-none grayscale" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Container
export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
    {children}
  </div>
);

// Status Badge - Increased contrast for outdoor visibility
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = "bg-slate-100 text-slate-600 border-slate-200";
  let text = "未対応";

  switch (status) {
    case 'PENDING':
      color = "bg-blue-50 text-blue-700 border-blue-100";
      text = "予定";
      break;
    case 'IN_PROGRESS':
      color = "bg-orange-50 text-orange-700 border-orange-200 animate-pulse";
      text = "作業中";
      break;
    case 'COMPLETED':
      color = "bg-green-50 text-green-700 border-green-200";
      text = "完了";
      break;
    case 'SKIPPED':
      color = "bg-red-50 text-red-700 border-red-200";
      text = "スキップ";
      break;
  }

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${color} border opacity-90`}>
      {text}
    </span>
  );
};

// Modal Overlay - Improved close button hit area (44px rule)
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh] pb-safe">
        <div className="bg-primary p-4 flex justify-between items-center text-white shrink-0 relative">
          <h3 className="font-bold text-lg pr-12">{title}</h3>
          <button 
            onClick={onClose} 
            className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="閉じる"
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Toast Notification
export const Toast: React.FC<{ message: string | null; type?: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 4000); // Auto close after 4s
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-slate-800 text-white shadow-blue-900/20',
    error: 'bg-red-600 text-white shadow-red-900/20',
    info: 'bg-blue-600 text-white shadow-blue-900/20'
  };

  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[60] animate-slide-up">
      <div className={`${bgColors[type]} px-4 py-3 rounded-xl shadow-xl flex items-center justify-between min-h-[56px]`}>
         <div className="flex items-center space-x-3">
            <i className={`${icons[type]} text-lg`}></i>
            <span className="font-bold text-sm leading-tight">{message}</span>
         </div>
         <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full ml-2 active:bg-white/30">
            <i className="fa-solid fa-xmark text-sm"></i>
         </button>
      </div>
    </div>
  );
};
