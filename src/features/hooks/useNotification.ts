import { createContext, useContext } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationContextValue {
    showNotification: (message: string, type?: NotificationType) => void;
}

export const NotificationContext = createContext<NotificationContextValue>({
    showNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);
