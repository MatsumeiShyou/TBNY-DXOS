
import React from 'react';
import { useWeighingAuth } from '../../contexts/WeighingAuthContext';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import Button from '../ui/Button';
import { User, LogOut } from 'lucide-react';
import type { AppView } from '../../WeighingSelfDriverApp';


interface HeaderProps {
    currentView: AppView;
}

const Header: React.FC<HeaderProps> = ({ currentView }) => {
  const { driverName, companyName, logout } = useWeighingAuth();
  const { resetSession } = useWeighingSession();
  
  const handleLogout = () => {
    logout();
    resetSession();
  };

  const getTitle = () => {
    switch (currentView) {
        case 'weighing': return '計量記録';
        case 'history': return '計量履歴';
        case 'settings': return '設定';
        default: return 'セルフ計量記録';
    }
  }


  return (
    <header className="tw-bg-white dark:bg-slate-800 tw-shadow-md tw-sticky tw-top-0 tw-z-20 tw-border-b tw-border-slate-200 dark:border-slate-700">
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-3 tw-flex tw-justify-between tw-items-center">
        {/* Left: Title */}
        <div className="tw-flex-1">
          <h1 className="tw-text-xl tw-font-bold tw-text-slate-700 dark:text-slate-200 tw-truncate">
            {getTitle()}
          </h1>
        </div>

        {/* Center: Login Info */}
        <div className="tw-flex tw-flex-1 tw-justify-center tw-items-center tw-text-center tw-px-2">
            <div className="tw-bg-slate-100 dark:bg-slate-700 tw-px-3 tw-py-1.5 tw-rounded-full tw-text-sm tw-text-slate-600 dark:text-slate-300 tw-truncate">
                <User className="tw-inline tw-h-4 tw-w-4 tw-mr-2" />
                {companyName ? (
                <span title={`${companyName} / ${driverName}`}><strong>{companyName}</strong> / {driverName}</span>
                ) : (
                <span title={`${driverName} 様`}>{driverName} 様</span>
                )}
            </div>
        </div>
        
        {/* Right: Logout Button */}
        <div className="tw-flex-1 tw-flex tw-justify-end">
          <Button onClick={handleLogout} variant="secondary" size="sm" title="ログアウト">
            <LogOut className="tw-h-4 tw-w-4 sm:mr-2" />
            <span className="tw-hidden sm:inline">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;