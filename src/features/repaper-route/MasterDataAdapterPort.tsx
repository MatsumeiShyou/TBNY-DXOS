import useSWR from 'swr';
import { supabase } from '../../shared/lib/supabase/client';
import React, { createContext, useContext, useMemo } from 'react';

const MasterDataContext = createContext<any>(null);

export const MasterDataProvider = ({ children }: { children: React.ReactNode }) => {
    const fetchTable = async (table: string) => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        return data || [];
    };

    const { data: drivers, isLoading: drLoading } = useSWR('master/drivers', () => fetchTable('drivers'));
    const { data: vehicles, isLoading: veLoading } = useSWR('master/master_vehicles', () => fetchTable('master_vehicles'));
    const { data: points, isLoading: poLoading } = useSWR('master/master_collection_points', () => fetchTable('master_collection_points'));
    const { data: items, isLoading: itLoading } = useSWR('master/master_items', () => fetchTable('master_items'));

    const value = useMemo(() => ({
        drivers: drivers || [],
        vehicles: vehicles || [],
        points: points || [],
        customers: points || [], // Alias for legacy code
        items: items || [],
        isLoading: drLoading || veLoading || poLoading || itLoading,
        refresh: async () => { /* revalidate occurs via SWR automatically or manual mutate if needed */ }
    }), [drivers, vehicles, points, items, drLoading, veLoading, poLoading, itLoading]);

    return (
        <MasterDataContext.Provider value={value}>
            {children}
        </MasterDataContext.Provider>
    );
};

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
