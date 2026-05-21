
import React, { useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastProps {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ id, message, type }) => {
  const { removeToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, removeToast]);

  const icons = {
    success: <CheckCircle className="tw-text-white" />,
    error: <XCircle className="tw-text-white" />,
    info: <Info className="tw-text-white" />,
  };

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`tw-flex tw-items-center tw-p-4 tw-rounded-md tw-shadow-lg ${bgColors[type]} tw-text-white`}>
      <div className="tw-flex-shrink-0">{icons[type]}</div>
      <div className="tw-ml-3 tw-font-medium">{message}</div>
      <button onClick={() => removeToast(id)} className="tw-ml-4 tw--mr-2 tw-p-1 tw-rounded-md hover:bg-white/20 focus:outline-none">
        <XCircle size={18}/>
      </button>
    </div>
  );
};

export default Toast;
