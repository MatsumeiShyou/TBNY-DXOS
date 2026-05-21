
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
    success: <CheckCircle className="text-white" />,
    error: <XCircle className="text-white" />,
    info: <Info className="text-white" />,
  };

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`flex items-center p-4 rounded-md shadow-lg ${bgColors[type]} text-white`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 font-medium">{message}</div>
      <button onClick={() => removeToast(id)} className="ml-4 -mr-2 p-1 rounded-md hover:bg-white/20 focus:outline-none">
        <XCircle size={18}/>
      </button>
    </div>
  );
};

export default Toast;
