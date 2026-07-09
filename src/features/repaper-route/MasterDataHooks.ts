import { createContext, useContext } from 'react';

export const MasterDataContext = createContext<any>(null);

export const useMasterDataContext = () => {
    const context = useContext(MasterDataContext);
    if (!context) {
        // Fallback for safety
        return {
            customers: [], vehicles: [], items: [], points: [], drivers: [],
            isLoading: false, refresh: async () => {}
        };
    }
    return context;
};

// Backward compatibility hooks
export const useMasterData = () => useMasterDataContext();

export const useMasterPoints = () => {
    const { points, isLoading } = useMasterDataContext();
    return { points, isLoading };
};

export const useMasterDrivers = () => {
    const { drivers, isLoading } = useMasterDataContext();
    return { drivers, isLoading };
};

export const useMasterVehicles = () => {
    const { vehicles, isLoading } = useMasterDataContext();
    return { vehicles, isLoading };
};
