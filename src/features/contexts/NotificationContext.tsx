import { useState, useCallback, type ReactNode } from 'react';
import { NotificationContext, type NotificationType } from '../hooks/useNotification';

interface Notification {
    message: string;
    type: NotificationType;
    id: number;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notification, setNotification] = useState<Notification | null>(null);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Date.now();
        setNotification({ message, type, id });

        setTimeout(() => {
            setNotification(current => current?.id === id ? null : current);
        }, 3000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '16px',
                    background: notification.type === 'error' ? '#fee2e2'
                              : notification.type === 'warning' ? '#fef3c7'
                              : notification.type === 'success' ? '#d1fae5'
                              : '#dbeafe',
                    color: notification.type === 'error' ? '#991b1b'
                         : notification.type === 'warning' ? '#92400e'
                         : notification.type === 'success' ? '#065f46'
                         : '#1e40af',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 9999
                }}>
                    {notification.message}
                </div>
            )}
        </NotificationContext.Provider>
    );
};
