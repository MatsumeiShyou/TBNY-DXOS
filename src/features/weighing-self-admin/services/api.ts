import * as mockApi from './mockApi';
import * as apiClient from './apiClient';

// --- API Switch ---
// DXOS移行に伴い、一時的にMockAPIに固定してGAS依存のクラッシュを回避する（MVP実装）
const USE_MOCK_API = true;

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
