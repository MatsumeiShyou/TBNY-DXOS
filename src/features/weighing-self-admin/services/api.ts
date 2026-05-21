import * as mockApi from './mockApi';
import * as apiClient from './apiClient';

// --- API Switch ---
// Automatically selects the API based on the execution environment.
// In a Google Apps Script web app, `google.script.run` will be available.
// In a local development environment, it will be undefined, so we use the mock API.
// @ts-expect-error google is global in Google Apps Script environment
const USE_MOCK_API = typeof google === 'undefined' || !google.script || !google.script.run;

const api = USE_MOCK_API ? mockApi : apiClient;

export const {
    getDashboardSummary,
    getDashboardTimeSeries,
    getRecentRecords,
    getAllRecords,
    getRecordById,
    updateWeighingRecord,
    deleteRecord,
    exportAllRecords,
    addWeighingItem,
    updateWeighingItem,
    deleteWeighingItem,
    getCompanies,
    companyApi,
    driverApi,
    customerApi,
    locationApi,
    itemApi,
    getDriversMaster,
    getLocationsMaster,
    getItemsMaster,
    getUserAccounts,
    updateUserAccountStatus,
    resetUserPassword,
} = api;
