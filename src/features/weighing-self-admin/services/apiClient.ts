/* eslint-disable @typescript-eslint/no-explicit-any */

// This file contains a client for communicating with a Google Apps Script backend.
// It provides a template for calling server-side functions using `google.script.run`.
// To make this work, you must implement corresponding functions in your Apps Script project.
// The `google` object is provided by the GAS environment when the web app is served.

// Declare google.script.run to inform TypeScript about its existence.
declare const google: {
  script: {
    run: any;
  };
};

import type { WeighingRecord, WeighingItem, DashboardSummary, TimeSeriesData, RecordFilters, Company, Driver, Customer, Location, Item, DateRange, UserAccount } from '../types';

/**
 * A generic helper function to call a server-side Google Apps Script function.
 * @param functionName The name of the function to call in your Apps Script project.
 * @param args The arguments to pass to the server-side function.
 * @returns A promise that resolves with the data returned by the server function.
 */
const serverCall = <T>(functionName: string, ...args: any[]): Promise<T> => {
    // Guard against running in a non-GAS environment.
    // The api.ts switcher should prevent this, but this is a failsafe.
    if (typeof google === 'undefined' || !google.script || !google.script.run) {
      const errorMessage = `[apiClient] 'google.script.run' is not available. This client should only be used in a Google Apps Script environment.`;
      console.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    return new Promise((resolve, reject) => {
        google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)[functionName](...args);
    });
};

// --- Dashboard & Records API ---

export const getDashboardSummary = (dateRange?: DateRange | null): Promise<DashboardSummary> => serverCall<DashboardSummary>('getDashboardSummary', dateRange);
export const getDashboardTimeSeries = (dateRange?: DateRange | null): Promise<TimeSeriesData[]> => serverCall<TimeSeriesData[]>('getDashboardTimeSeries', dateRange);
export const getRecentRecords = (limit: number): Promise<WeighingRecord[]> => serverCall<WeighingRecord[]>('getRecentRecords', limit);
export const getAllRecords = (page: number, perPage: number, filters?: RecordFilters): Promise<{ records: WeighingRecord[], total: number }> => serverCall<{ records: WeighingRecord[], total: number }>('getAllRecords', page, perPage, filters);
export const getRecordById = (recordId: string): Promise<WeighingRecord> => serverCall<WeighingRecord>('getRecordById', recordId);
export const updateWeighingRecord = (recordId: string, updates: { grossWeight: number, tareWeight: number }): Promise<WeighingRecord> => serverCall<WeighingRecord>('updateWeighingRecord', recordId, updates);
export const deleteRecord = (recordId: string): Promise<{ success: boolean }> => serverCall<{ success: boolean }>('deleteRecord', recordId);
export const exportAllRecords = (filters?: RecordFilters): Promise<WeighingRecord[]> => serverCall<WeighingRecord[]>('exportAllRecords', filters);

// --- Record Item Manipulation APIs ---

export const addWeighingItem = (recordId: string, newItemData: Omit<WeighingItem, 'id'>): Promise<WeighingRecord> => serverCall<WeighingRecord>('addWeighingItem', recordId, newItemData);
export const updateWeighingItem = (recordId: string, itemId: string, updates: Partial<Omit<WeighingItem, 'id'>>): Promise<WeighingRecord> => serverCall<WeighingRecord>('updateWeighingItem', recordId, itemId, updates);
export const deleteWeighingItem = (recordId: string, itemId: string): Promise<WeighingRecord> => serverCall<WeighingRecord>('deleteWeighingItem', recordId, itemId);

// --- Filter Dropdown Data ---
export const getCompanies = (): Promise<string[]> => serverCall<string[]>('getCompanies');

// --- Master Data APIs ---

const createApi = <T extends { id: string }>(entityName: string) => ({
    get: (): Promise<T[]> => serverCall<T[]>(`get${entityName}s`), // e.g., getCompanies
    add: (data: Omit<T, 'id' | 'createdAt'>): Promise<T> => serverCall<T>(`add${entityName}`, data), // e.g., addCompany
    update: (id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> => serverCall<T>(`update${entityName}`, id, updates), // e.g., updateCompany
    delete: (id: string): Promise<{ success: boolean }> => serverCall<{ success: boolean }>(`delete${entityName}`, id), // e.g., deleteCompany
});

export const companyApi = createApi<Company>('Company');
export const driverApi = createApi<Driver>('Driver');
export const customerApi = createApi<Customer>('Customer');
export const locationApi = createApi<Location>('Location');
export const itemApi = createApi<Item>('Item');


// For RecordsFilter dropdown
export const getDriversMaster = (): Promise<Driver[]> => serverCall<Driver[]>('getDriversMaster');
export const getLocationsMaster = (): Promise<Location[]> => serverCall<Location[]>('getLocationsMaster');
export const getItemsMaster = (): Promise<Item[]> => serverCall<Item[]>('getItemsMaster');

// --- User Account Management APIs ---
export const getUserAccounts = (): Promise<UserAccount[]> => serverCall<UserAccount[]>('getUserAccounts');
export const updateUserAccountStatus = (userId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<UserAccount> => serverCall<UserAccount>('updateUserAccountStatus', userId, status);
export const resetUserPassword = (userId: string): Promise<UserAccount> => serverCall<UserAccount>('resetUserPassword', userId);
