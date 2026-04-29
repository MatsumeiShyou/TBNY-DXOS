import { useNotification as useDXNotification } from '../hooks/useNotification';


/**
 * RePaper Route 向け Notification Adapter
 */
export const useNotification = () => {
    const { showNotification } = useDXNotification();
    return {
        showNotification
    };
};
