import React from 'react';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
    activeView: string;
    onViewChange: (view: string) => void;
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ activeView, onViewChange, children }) => {
    return (
        <div className="tw-flex tw-h-screen tw-w-screen tw-bg-slate-50 tw-overflow-hidden">
            {/* Sidebar (Fixed Width) */}
            <Sidebar activeView={activeView} onViewChange={onViewChange} />

            {/* Main Content (Flex Grow) */}
            <main className="tw-flex-1 tw-flex tw-flex-col tw-min-w-0 tw-overflow-hidden tw-relative">
                {children}
            </main>
        </div>
    );
};
