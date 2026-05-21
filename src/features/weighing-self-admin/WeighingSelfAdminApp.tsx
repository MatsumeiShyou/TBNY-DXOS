import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import DashboardScreen from './components/dashboard/DashboardScreen';
import RecordsScreen from './components/records/RecordsScreen';
import MastersScreen from './components/masters/MastersScreen';
import type { View } from './types';
import SettingsScreen from './components/settings/SettingsScreen';
import { useAppContext } from './hooks/useAppContext';
import GlobalSpinner from './components/ui/GlobalSpinner';
import GlobalErrorScreen from './components/ui/GlobalErrorScreen';
import UsersScreen from './components/users/UsersScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppProvider } from './contexts/AppContext';

const WeighingSelfAdminInnerApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>({ name: 'dashboard' });
  const { isLoading, error, clearError } = useAppContext();

  const handleRetry = () => {
    clearError();
    // A simple reload is often the best fix for a critical bootstrap error
    window.location.reload();
  };

  if (error) {
    return <GlobalErrorScreen error={error} onRetry={handleRetry} />;
  }

  const renderContent = () => {
    switch (currentView.name) {
      case 'dashboard':
        return <DashboardScreen setCurrentView={setCurrentView} />;
      case 'records':
        return <RecordsScreen params={currentView.params} setCurrentView={setCurrentView} />;
      case 'masters':
        return <MastersScreen />;
      case 'users':
        return <UsersScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen setCurrentView={setCurrentView} />;
    }
  };

  return (
    <>
      {isLoading && <GlobalSpinner />}
      <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {renderContent()}
      </Layout>
    </>
  );
};

const WeighingSelfAdminApp: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <WeighingSelfAdminInnerApp />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default WeighingSelfAdminApp;
