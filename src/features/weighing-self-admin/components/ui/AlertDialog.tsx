import React from 'react';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '実行'
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="tw-fixed tw-inset-0 tw-bg-black/60 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4 tw-animate-fade-in"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <div
        className="tw-bg-background-primary tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-sm tw-flex tw-flex-col tw-animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tw-p-6 tw-text-center">
            <div className="tw-mx-auto tw-flex tw-h-12 tw-w-12 tw-items-center tw-justify-center tw-rounded-full tw-bg-error/10 tw-mb-4">
                <AlertTriangle className="tw-h-6 tw-w-6 tw-text-error" aria-hidden="true" />
            </div>
            <h2 id="alert-dialog-title" className="tw-text-lg tw-font-semibold tw-text-text-primary">
                {title}
            </h2>
            <p id="alert-dialog-description" className="tw-mt-2 tw-text-sm tw-text-text-secondary">
                {description}
            </p>
        </div>
        
        <div className="tw-p-4 tw-bg-background-tertiary tw-rounded-b-xl tw-flex tw-justify-end tw-gap-3">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tw-animate-fade-in { animation: fade-in 0.15s ease-out; }
        .tw-animate-slide-up { animation: slide-up 0.15s ease-out; }
      `}</style>
    </div>
  );
};

export default AlertDialog;
