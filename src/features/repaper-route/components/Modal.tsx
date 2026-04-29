import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

/**
 * Premium Modal Component (TypeScript Version)
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    const modalRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            
            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            // Auto-focus the first element or the close button
            setTimeout(() => {
                const closeBtn = modalRef.current?.querySelector('button');
                (closeBtn as HTMLElement)?.focus();
            }, 50);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div 
            className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
        >
            {/* Backdrop with Blur */}
            <div
                className="tw-absolute tw-inset-0 tw-bg-black/60 tw-backdrop-blur-sm tw-transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div 
                ref={modalRef}
                className="tw-relative tw-bg-white tw-dark:bg-gray-800 tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[calc(100vh-2rem)] tw-flex tw-flex-col tw-transform tw-transition-all tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-200 tw-focus:outline-none"
                tabIndex={-1}
            >
                {/* Header */}
                <div className="tw-flex tw-items-center tw-justify-between tw-p-6 tw-border-b tw-border-gray-100 tw-dark:border-gray-700 tw-shrink-0">
                    <h3 id={titleId} className="tw-text-xl tw-font-bold tw-text-gray-900 tw-dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="tw-p-2 tw-rounded-full tw-hover:bg-gray-100 tw-dark:hover:bg-gray-700 tw-text-gray-400 tw-hover:text-gray-600 tw-transition-colors tw-h-11 tw-w-11 tw-flex tw-items-center tw-justify-center"
                        aria-label="閉じる"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="tw-p-6 tw-overflow-y-auto tw-flex-1 tw-thin-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="tw-flex tw-items-center tw-justify-end tw-gap-3 tw-p-6 tw-pt-2 tw-border-t tw-border-gray-100 tw-dark:border-gray-700 tw-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
