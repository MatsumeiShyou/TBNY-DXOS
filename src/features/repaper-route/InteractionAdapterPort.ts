import { createContext, useContext } from 'react';

export type DeviceMode = 'auto' | 'pc' | 'tablet' | 'mobile';
export type ActiveDeviceMode = 'pc' | 'tablet' | 'mobile';

interface InteractionContextType {
    deviceMode: DeviceMode;
    activeMode: ActiveDeviceMode;
    setDeviceMode: (mode: DeviceMode) => void;
}

export const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export const useInteraction = () => {
    const context = useContext(InteractionContext);
    if (!context) {
        // Fallback for standalone migration
        return {
            deviceMode: 'auto',
            activeMode: 'pc',
            setDeviceMode: () => {}
        };
    }
    return context;
};
