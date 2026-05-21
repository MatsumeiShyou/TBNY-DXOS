import { GAS_API_URL } from '../constants';
import type { MasterData, WeighingRecordPayload, VerificationResult, UserSettings, AuthResponse } from '../types';

// Mock functions for development since we don't have a real GAS URL
const MOCK_API = true;

const mockLocations = [
  { id: 'loc1', name: 'A商事' },
  { id: 'loc2', name: 'B新聞社' },
  { id: 'loc3', name: 'Cリサイクル' },
];
const mockItems = [
  { id: 'item1', name: '段ボール' },
  { id: 'item2', name: '新聞' },
  { id: 'item3', name: '雑誌' },
];

// --- Mock User Database ---
const mockUsers: { [key: string]: { pass: string | null; company?: string; type: 'company' | 'customer' } } = {
  '山田 太郎': { pass: null, company: 'A商事', type: 'company' },
  '佐藤 花子': { pass: 'Sato-pass123!', company: 'A商事', type: 'company' },
  '鈴木 一郎': { pass: null, type: 'customer' },
};

// --- Mock User Settings Database ---
const mockUserSettings: { [key: string]: UserSettings } = {
  '佐藤 花子': { fontSize: 'lg', theme: 'dark', isPulseEffectEnabled: false },
};

const defaultSettings: UserSettings = { fontSize: 'md', theme: 'system', isPulseEffectEnabled: true };


async function fetchGasAPI<T>(action: string, method: 'GET' | 'POST', body?: object): Promise<T> {
  const url = GAS_API_URL;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  };

  const payload = { ...body, action };

  if (method === 'POST') {
    options.body = JSON.stringify(payload);
  }

  // Use a redirect to handle GAS responses. This is a common pattern.
  // options.redirect = 'follow';

  // For POST request, GAS often requires text/plain for some configurations
  if (method === 'POST') {
      const textBody = JSON.stringify(payload);
      options.body = textBody;
      options.headers = {'Content-Type': 'text/plain;charset=utf-8'};
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API call for action '${action}' failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result.status === 'error') {
      throw new Error(result.message || 'API returned an error');
  }
  return result.data;
}

export const authenticate = async (name: string, personalPassword: string): Promise<AuthResponse> => {
  if (MOCK_API) {
    console.log('MOCK authenticate:', { name, personalPassword });
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers[name];
    if (user && user.pass === personalPassword) {
      return {
        success: true,
        driverName: name,
        companyName: user.company || null,
        userType: user.type,
        settings: mockUserSettings[name] || defaultSettings,
      };
    } else {
      return { success: false, message: '個人パスワードが正しくありません。' };
    }
  }
  return fetchGasAPI<AuthResponse>('authenticate', 'POST', { name, personalPassword });
};

export const setInitialPassword = async (driverName: string, newPassword: string): Promise<AuthResponse> => {
    if (MOCK_API) {
        console.log('MOCK setInitialPassword for:', driverName);
        await new Promise(resolve => setTimeout(resolve, 500));
        const user = mockUsers[driverName];
        if (user) {
            user.pass = newPassword;
            return {
                success: true,
                driverName,
                companyName: user.company || null,
                userType: user.type,
                settings: mockUserSettings[driverName] || defaultSettings,
            };
        }
        return { success: false, message: 'ユーザーが見つかりません。' };
    }
    return fetchGasAPI<AuthResponse>('setInitialPassword', 'POST', { driverName, newPassword });
}

export const changePassword = async (driverName: string, oldPassword: string, newPassword: string): Promise<AuthResponse> => {
    if (MOCK_API) {
        console.log('MOCK changePassword for:', driverName);
        await new Promise(resolve => setTimeout(resolve, 500));
        const user = mockUsers[driverName];
        if (user && user.pass === oldPassword) {
            user.pass = newPassword;
            return {
                success: true,
                driverName,
                companyName: user.company || null,
                userType: user.type,
                settings: mockUserSettings[driverName] || defaultSettings,
            };
        }
        return { success: false, message: '現在のパスワードが正しくありません。' };
    }
    return fetchGasAPI<AuthResponse>('changePassword', 'POST', { driverName, oldPassword, newPassword });
}

export const saveUserSettings = async (driverName: string, settings: UserSettings): Promise<{ success: boolean }> => {
    if (MOCK_API) {
        console.log('MOCK saveUserSettings for:', driverName, settings);
        await new Promise(resolve => setTimeout(resolve, 300));
        mockUserSettings[driverName] = settings;
        return { success: true };
    }
    return fetchGasAPI<{ success: boolean }>('saveUserSettings', 'POST', { driverName, settings });
}

export const verifyPin = async (pin: string): Promise<VerificationResult> => {
  if (MOCK_API) {
    console.log('MOCK verifyPin:', { pin });
    await new Promise(resolve => setTimeout(resolve, 500));

    if (pin === 'Pass1234!') {
      return {
        success: true,
        userType: 'company',
        company: { id: 'comp1', name: 'A商事' },
        drivers: [
          { id: 'driver1', name: '山田 太郎', hasSetPassword: mockUsers['山田 太郎'].pass !== null },
          { id: 'driver2', name: '佐藤 花子', hasSetPassword: mockUsers['佐藤 花子'].pass !== null },
        ],
      };
    } else if (pin === 'Customer@1') {
      return {
        success: true,
        userType: 'customer',
        customerName: '鈴木 一郎様',
        drivers: [
          { id: 'driver3', name: '鈴木 一郎', hasSetPassword: mockUsers['鈴木 一郎'].pass !== null },
        ],
      };
    } else {
      return { success: false, message: '会社PINコードが正しくありません。' };
    }
  }
  return fetchGasAPI<VerificationResult>('verifyPin', 'POST', { pin });
};

export const getMasterData = async (): Promise<MasterData> => {
   if (MOCK_API) {
    console.log('MOCK getMasterData');
    return new Promise(resolve => setTimeout(() => resolve({ locations: mockLocations, items: mockItems }), 500));
  }
  return fetchGasAPI<MasterData>('getMasterData', 'GET');
};

export const submitWeighingRecord = async (record: WeighingRecordPayload): Promise<{ success: boolean }> => {
  if (MOCK_API) {
    console.log('MOCK submitWeighingRecord:', record);
    // Simulate potential failure
    if (Math.random() < 0.1) {
       return new Promise((_, reject) => setTimeout(() => reject(new Error("Mock API submission failed")), 1000));
    }
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  }
  return fetchGasAPI<{ success: boolean }>('submitRecord', 'POST', { record });
};

export const getHistory = async (driverName: string): Promise<WeighingRecordPayload[]> => {
  if (MOCK_API) {
    console.log('MOCK getHistory for:', driverName);
    const mockHistory: WeighingRecordPayload[] = [
      {
        recordId: 'uuid-test-scenario',
        driverName: '山田 太郎',
        companyName: 'A商事',
        grossWeight: 3000,
        tareWeight: 1000,
        netWeight: 2000,
        items: [
          { locationId: 'loc1', itemId: 'item1', weight: 1200 },
          { locationId: 'loc2', itemId: 'item2', weight: 850 },
        ],
        weighedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      },
      {
        recordId: 'uuid-1',
        driverName: '山田 太郎',
        companyName: 'A商事',
        grossWeight: 3250,
        tareWeight: 1500,
        netWeight: 1750,
        items: [
          { locationId: 'own-company', itemId: 'item1', weight: 1000 },
          { locationId: 'loc2', itemId: 'item2', weight: 750 },
        ],
        weighedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      },
      {
        recordId: 'uuid-2',
        driverName: '山田 太郎',
        companyName: 'A商事',
        grossWeight: 4100,
        tareWeight: 1510,
        netWeight: 2590,
        items: [
          { locationId: 'loc3', itemId: 'item1', weight: 1500 },
          { locationId: 'loc1', itemId: 'item3', weight: 1090 },
        ],
        weighedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      },
      {
        recordId: 'uuid-3',
        driverName: '山田 太郎',
        companyName: 'A商事',
        grossWeight: 2800,
        tareWeight: 1490,
        netWeight: 1310,
        items: [
          { locationId: 'own-company', itemId: 'item2', weight: 1310 },
        ],
        weighedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      },
      {
        recordId: 'uuid-4',
        driverName: '鈴木 一郎',
        companyName: null, // Customer has no company
        grossWeight: 1500,
        tareWeight: 800,
        netWeight: 700,
        items: [
          { locationId: 'customer-self', itemId: 'item1', weight: 700 },
        ],
        weighedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      },
    ];
    const filteredHistory = mockHistory.filter(r => r.driverName === driverName);
    return new Promise(resolve => setTimeout(() => resolve(filteredHistory), 800));
  }
  return fetchGasAPI<WeighingRecordPayload[]>('getHistory', 'POST', { driverName });
};

export const updateWeighingRecord = async (record: WeighingRecordPayload): Promise<{ success: boolean }> => {
  if (MOCK_API) {
    console.log('MOCK updateWeighingRecord:', record);
    if (record.grossWeight < record.tareWeight) {
       return new Promise((_, reject) => setTimeout(() => reject(new Error("Mock API update failed: Gross weight cannot be less than tare weight.")), 1000));
    }
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  }
  return fetchGasAPI<{ success: boolean }>('updateRecord', 'POST', { record });
};