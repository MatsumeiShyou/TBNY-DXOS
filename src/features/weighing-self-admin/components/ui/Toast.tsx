import React from 'react';
import type { ToastMessage } from '../../types';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const icons = {
  success: <CheckCircle className="tw-w-5 tw-h-5" />,
  error: <AlertCircle className="tw-w-5 tw-h-5" />,
  info: <Info className="tw-w-5 tw-h-5" />,
};

const colors = {
  success: 'tw-bg-success tw-text-white',
  error: 'tw-bg-error tw-text-white',
  info: 'tw-bg-interactive-default tw-text-white',
};

const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="tw-fixed tw-bottom-5 tw-right-5 tw-z-[100] tw-w-full tw-max-w-sm tw-space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${colors[toast.type]} tw-flex tw-items-center tw-justify-between tw-gap-4 tw-px-4 tw-py-3 tw-rounded-md tw-shadow-lg tw-animate-slide-in-right`}
        >
          <div className="tw-flex tw-items-center tw-gap-2">
            {icons[toast.type]}
            <p className="tw-text-sm tw-font-medium">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="tw-p-1 tw-rounded-full hover:tw-bg-white/20">
            <X className="tw-w-4 tw-h-4" />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .tw-animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ToastContainer;
