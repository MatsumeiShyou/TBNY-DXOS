
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black/50 dark:bg-black/70 tw-z-40 tw-flex tw-items-center tw-justify-center tw-p-4" onClick={onClose}>
      <div className="tw-bg-white dark:bg-slate-800 tw-rounded-lg tw-shadow-xl tw-w-full tw-max-w-md tw-flex tw-flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="tw-flex tw-justify-between tw-items-center tw-p-4 tw-border-b tw-border-slate-200 dark:border-slate-700 tw-flex-shrink-0">
          <h3 className="tw-text-lg tw-font-bold tw-text-slate-800 dark:text-slate-200">{title}</h3>
          <button onClick={onClose} className="tw-text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <div className="tw-p-6 tw-overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
