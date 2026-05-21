
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
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Title */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-700 dark:text-slate-200 truncate">
            {getTitle()}
          </h1>
        </div>

        {/* Center: Login Info */}
        <div className="flex flex-1 justify-center items-center text-center px-2">
            <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-sm text-slate-600 dark:text-slate-300 truncate">
                <User className="inline h-4 w-4 mr-2" />
                {companyName ? (
                <span title={`${companyName} / ${driverName}`}><strong>{companyName}</strong> / {driverName}</span>
                ) : (
                <span title={`${driverName} 様`}>{driverName} 様</span>
                )}
            </div>
        </div>
        
        {/* Right: Logout Button */}
        <div className="flex-1 flex justify-end">
          <Button onClick={handleLogout} variant="secondary" size="sm" title="ログアウト">
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;