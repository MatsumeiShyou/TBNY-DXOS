
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
        <div className="fixed inset-0 bg-black/60 z-40 pointer-events-none transition-opacity duration-300 backdrop-blur-[1px]" />
      )}
      
      {/* Help Content Modal */}
      <Modal 
        isOpen={!!selectedHelpKey} 
        onClose={closeHelp} 
        title={selectedHelpKey ? (HELP_CONTENT[selectedHelpKey as string]?.title || '') : ''}
        agentId="help:modal"
      >
        {selectedHelpKey && HELP_CONTENT[selectedHelpKey as string] && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-start">
               <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 mr-3">
                 <i className="fa-solid fa-circle-question text-green-600 text-xl"></i>
               </div>
               <div>
                  <h4 className="font-bold text-green-900 mb-1">どんな機能？</h4>
                  <p className="text-sm text-green-800 leading-relaxed font-medium">
                    {HELP_CONTENT[selectedHelpKey as string].description}
                  </p>
               </div>
            </div>
            
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center text-sm uppercase tracking-wider">
                    <i className="fa-solid fa-hand-point-up mr-2 text-primary"></i>
                    アクション / 操作
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {HELP_CONTENT[selectedHelpKey as string].action}
                </p>
             </div>
             
             <button 
               onClick={closeHelp} 
               className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold active:scale-[0.98] transition-transform shadow-lg shadow-slate-900/20"
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
    <div className={`relative ${wrapperClassName}`}>
        {/* Overlay that intercepts clicks */}
        <div 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectHelp(helpId as string);
            }}
            className={`absolute -inset-1 z-50 bg-green-400/20 ring-4 ring-green-400 rounded-xl cursor-help animate-pulse ${className}`}
        >
            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs font-bold">
              ?
            </div>
        </div>
        {/* Actual Content (visual only) */}
        <div className="relative z-40 pointer-events-none">
            {children}
        </div>
    </div>
  );
};
