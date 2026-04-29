import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info, LucideIcon } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
    id: number | string;
    type: ToastType;
    message: string;
    action?: React.ReactNode;
}

interface ToastProps extends Omit<ToastItem, 'id'> {
    onClose: () => void;
}

/**
 * Toast Component (TypeScript Version)
 */
export const Toast: React.FC<ToastProps> = ({ type = 'info', message, action, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto close after 3s
        return () => clearTimeout(timer);
    }, [onClose]);

    const config: Record<ToastType, { icon: LucideIcon; bg: string; border: string }> = {
        success: { icon: CheckCircle, bg: 'bg-green-500', border: 'border-green-600' },
        error: { icon: AlertCircle, bg: 'bg-red-500', border: 'border-red-600' },
        info: { icon: Info, bg: 'bg-blue-500', border: 'border-blue-600' }
    };

    const { icon: Icon, bg, border } = config[type] || config.info;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white ${bg} border-b-4 ${border} animate-in slide-in-from-top-4 duration-300 max-w-sm w-full pointer-events-auto`}>
            <Icon size={24} className="tw-flex-shrink-0" />
            <div className="tw-flex-grow tw-flex tw-flex-col">
                <p className="tw-font-bold tw-text-sm">{message}</p>
                {action && <div className="tw-mt-1">{action}</div>}
            </div>
            <button onClick={onClose} className="tw-p-1 tw-hover:bg-white/20 tw-rounded-full tw-transition-colors tw-flex-shrink-0">
                <X size={16} />
            </button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastItem[];
    removeToast: (id: number | string) => void;
}

/**
 * ToastContainer
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="tw-fixed tw-top-4 tw-left-1/2 tw--translate-x-1/2 tw-z-[60] tw-flex tw-flex-col tw-gap-2 tw-w-full tw-max-w-sm tw-px-4 tw-pointer-events-none">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};
