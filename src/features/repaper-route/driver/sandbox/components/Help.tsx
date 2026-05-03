
import React, { createContext, useContext, useState } from 'react';
import { HELP_CONTENT } from '../constants';
import { Modal } from './Widgets';

type HelpKey = keyof typeof HELP_CONTENT;

interface HelpContextType {
  isHelpMode: boolean;
  toggleHelpMode: () => void;
  selectedHelpKey: HelpKey | null;
  selectHelp: (key: string) => void;
  closeHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [selectedHelpKey, setSelectedHelpKey] = useState<HelpKey | null>(null);

  const toggleHelpMode = () => setIsHelpMode(prev => !prev);
  const selectHelp = (key: string) => setSelectedHelpKey(key as HelpKey);
  const closeHelp = () => setSelectedHelpKey(null);

  return (
    <HelpContext.Provider value={{ isHelpMode, toggleHelpMode, selectedHelpKey, selectHelp, closeHelp }}>
      {children}
      
      {/* Dimming Overlay for Help Mode */}
      {isHelpMode && (
        <div className="tw-fixed tw-inset-0 tw-bg-black/60 tw-z-40 tw-pointer-events-none tw-transition-opacity tw-duration-300 tw-backdrop-blur-[1px]" />
      )}
      
      {/* Help Content Modal */}
      <Modal 
        isOpen={!!selectedHelpKey} 
        onClose={closeHelp} 
        title={selectedHelpKey ? (HELP_CONTENT[selectedHelpKey as string]?.title || '') : ''}
      >
        {selectedHelpKey && HELP_CONTENT[selectedHelpKey as string] && (
          <div className="tw-space-y-6">
            <div className="tw-bg-green-50 tw-p-4 tw-rounded-xl tw-border tw-border-green-200 tw-flex tw-items-start">
               <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-green-100 tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-mr-3">
                 <i className="fa-solid fa-circle-question tw-text-green-600 tw-text-xl"></i>
               </div>
               <div>
                  <h4 className="tw-font-bold tw-text-green-900 tw-mb-1">どんな機能？</h4>
                  <p className="tw-text-sm tw-text-green-800 tw-leading-relaxed tw-font-medium">
                    {HELP_CONTENT[selectedHelpKey as string].description}
                  </p>
               </div>
            </div>
            
             <div className="tw-bg-white tw-p-4 tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-sm">
                <h4 className="tw-font-bold tw-text-slate-700 tw-mb-2 tw-flex tw-items-center tw-text-sm tw-uppercase tw-tracking-wider">
                    <i className="fa-solid fa-hand-point-up tw-mr-2 tw-text-primary"></i>
                    アクション / 操作
                </h4>
                <p className="tw-text-sm tw-text-slate-600 tw-leading-relaxed">
                  {HELP_CONTENT[selectedHelpKey as string].action}
                </p>
             </div>
             
             <button 
               onClick={closeHelp} 
               className="tw-w-full tw-py-3 tw-bg-slate-800 tw-text-white tw-rounded-xl tw-font-bold active:tw-scale-[0.98] tw-transition-transform tw-shadow-lg tw-shadow-slate-900/20"
             >
                 閉じる
             </button>
          </div>
        )}
      </Modal>
    </HelpContext.Provider>
  );
};

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) throw new Error('useHelp must be used within a HelpProvider');
  return context;
};

interface HelpTargetProps {
  helpId: HelpKey;
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export const HelpTarget: React.FC<HelpTargetProps> = ({ helpId, children, className = '', wrapperClassName = '' }) => {
  const { isHelpMode, selectHelp } = useHelp();

  if (!isHelpMode) return <>{children}</>;

  return (
    <div className={`tw-relative ${wrapperClassName}`}>
        {/* Overlay that intercepts clicks */}
        <div 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectHelp(helpId as string);
            }}
            className={`tw-absolute -tw-inset-1 tw-z-50 tw-bg-green-400/20 tw-ring-4 tw-ring-green-400 tw-rounded-xl tw-cursor-help tw-animate-pulse ${className}`}
        >
            <div className="tw-absolute tw-top-0 tw-right-0 -tw-mt-2 -tw-mr-2 tw-bg-green-500 tw-text-white tw-w-6 tw-h-6 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-md tw-border-2 tw-border-white tw-text-xs tw-font-bold">
              ?
            </div>
        </div>
        {/* Actual Content (visual only) */}
        <div className="tw-relative tw-z-40 tw-pointer-events-none">
            {children}
        </div>
    </div>
  );
};
