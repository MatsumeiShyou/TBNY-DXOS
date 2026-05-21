import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { View } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="tw-flex tw-h-screen tw-bg-background-primary">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView.name} 
        setCurrentView={(name) => {
          setCurrentView({ name });
          setIsSidebarOpen(false);
        }}
      />
      <div className="tw-flex tw-flex-col tw-flex-1">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="tw-flex-1 tw-p-4 sm:tw-p-6 lg:tw-p-8 tw-overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
