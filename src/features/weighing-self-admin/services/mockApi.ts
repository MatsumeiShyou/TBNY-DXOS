import type { WeighingRecord, WeighingItem, DashboardSummary, TimeSeriesData, RecordFilters, Company, Driver, Customer, Location, Item, DateRange, UserAccount } from '../types';

let mockCompaniesMaster: Company[] = [
    { id: 'comp_001', name: '〇〇運送', contactPerson: '山田 運送部長', phone: '03-1111-1111', address: '東京都千代田区1-1-1', createdAt: new Date('2024-01-15').toISOString() },
    { id: 'comp_002', name: '△△配送', contactPerson: '佐藤 配車担当', phone: '045-222-2222', address: '神奈川県横浜市中区2-2-2', createdAt: new Date('2024-02-20').toISOString() },
    { id: 'comp_003', name: '□□物流', contactPerson: '鈴木 物流課長', phone: '048-333-3333', address: '埼玉県さいたま市大宮区3-3-3', createdAt: new Date('2024-03-10').toISOString() },
];

let mockDriversMaster: Driver[] = [
    { id: 'drv_001', name: '山田太郎', companyId: 'comp_001', createdAt: new Date('2024-02-01').toISOString() },
    { id: 'drv_002', name: '田中花子', companyId: 'comp_001', createdAt: new Date('2024-02-01').toISOString() },
    { id: 'drv_003', name: '鈴木一郎', companyId: 'comp_002', createdAt: new Date('2024-03-01').toISOString() },
    { id: 'drv_004', name: '佐藤次郎', companyId: 'comp_003', createdAt: new Date('2024-04-01').toISOString() },
    { id: 'drv_005', name: '高橋三郎', customerId: 'cust_001', createdAt: new Date('2024-04-15').toISOString() },
];

let mockCustomersMaster: Customer[] = [
    { id: 'cust_001', name: '株式会社テスト商事', contactPerson: '試験 一郎', phone: '03-9999-9999', address: '東京都新宿区', createdAt: new Date('2025-01-10').toISOString() },
    { id: 'cust_002', name: 'サンプル工業', contactPerson: '見本 花子', phone: '06-8888-8888', address: '大阪府大阪市', createdAt: new Date('2025-02-15').toISOString() },
];

let mockLocationsMaster: Location[] = [
    { id: 'loc_001', name: 'A新聞社', address: '東京都中央区', customerId: undefined, createdAt: new Date('2024-05-10').toISOString(), allowedItemIds: ['item_001', 'item_002'] },
    { id: 'loc_002', name: 'Bスーパー', address: '神奈川県川崎市', customerId: undefined, createdAt: new Date('2024-06-20').toISOString(), allowedItemIds: null },
];

let mockItemsMaster: Item[] = [
    { id: 'item_001', name: '新聞', category: '古紙', createdAt: new Date('2024-01-01').toISOString() },
    { id: 'item_002', name: '段ボール', category: '古紙', createdAt: new Date('2024-01-01').toISOString() },
    { id: 'item_003', name: '鉄くず', category: '金属', createdAt: new Date('2024-01-01').toISOString() },
    { id: 'item_004', name: 'アルミ缶', category: '金属', createdAt: new Date('2024-01-01').toISOString() },
];

const mockUserAccounts: UserAccount[] = mockDriversMaster.map((driver, index) => ({
    id: driver.id,
    name: driver.name,
    companyId: driver.companyId,
    customerId: driver.customerId,
    passwordStatus: index % 3 === 0 ? 'PENDING' : 'SET',
    accountStatus: index % 5 === 0 ? 'INACTIVE' : 'ACTIVE',
}));

const mockRecords: WeighingRecord[] = [];

// Generate a larger, more realistic dataset
for (let i = 1; i <= 200; i++) {
  const date = new Date(2025, 10, 20 - Math.floor(i / 10));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  
  const gross = (300 + Math.floor(Math.random() * 500)) * 10;
  const tare = (150 + Math.floor(Math.random() * 100)) * 10;
  const net = gross - tare;
  
  const driver = mockDriversMaster[i % mockDriversMaster.length];
  let companyName: string | null = null;
    if (driver.companyId) {
        const company = mockCompaniesMaster.find(c => c.id === driver.companyId);
        companyName = company ? company.name : null;
    } else if (driver.customerId) {
        const customer = mockCustomersMaster.find(c => c.id === driver.customerId);
        companyName = customer ? customer.name : null;
    }

  const errorWeight = (Math.floor(Math.random() * 5) - 2) * 10; // -20, -10, 0, 10, 20
  const itemsTotal = net - errorWeight;

  const item1WeightInTens = Math.floor(Math.random() * (itemsTotal / 10 - 1)) + 1;
  const item1Weight = item1WeightInTens * 10;
  const item2Weight = itemsTotal - item1Weight;

  const randomItem1 = mockItemsMaster[i % mockItemsMaster.length];
  const randomItem2 = mockItemsMaster[(i + 1) % mockItemsMaster.length];

  mockRecords.push({
    recordId: `rec_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}_${String(i).padStart(3, '0')}`,
    driverId: driver.id,
    driverName: driver.name,
    companyName: companyName,
    grossWeight: gross,
    tareWeight: tare,
    netWeight: net,
    weighedAt: date.toISOString(),
    status: (['完了', '未確認', '修正済'] as WeighingRecord['status'][])[i % 3],
    items: [
      { id: `wi_${i}_1`, locationId: 'loc_001', locationName: 'A新聞社', itemId: randomItem1.id, itemName: randomItem1.name, weight: item1Weight, method: '台貫' },
      { id: `wi_${i}_2`, locationId: 'loc_002', locationName: 'Bスーパー', itemId: randomItem2.id, itemName: randomItem2.name, weight: item2Weight, method: '目見当' },
    ],
    modificationHistory: i % 10 === 0 ? [
        { timestamp: date.toISOString(), editor: 'admin', change: '総重量を修正' }
    ] : []
  });
}

export const getDashboardSummary = async (_dateRange?: DateRange | null): Promise<DashboardSummary> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const today = new Date('2025-11-20T00:00:00');
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const todayRecords = mockRecords.filter(r => new Date(r.weighedAt).toDateString() === today.toDateString());
            const monthRecords = mockRecords.filter(r => new Date(r.weighedAt) >= startOfMonth);
            const unconfirmed = mockRecords.filter(r => r.status === '未確認');
            
            resolve({
                todayCount: todayRecords.length,
                monthCount: monthRecords.length,
                unconfirmedCount: unconfirmed.length,
                errorCount: 0,
            });
        }, 300);
    });
};

export const getDashboardTimeSeries = async (dateRange?: DateRange | null): Promise<TimeSeriesData[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const series: { [key: string]: { count: number; netWeight: number; items: Record<string, number> } } = {};
            
            let startDate: Date;
            const endDate = new Date('2025-11-20T23:59:59');

            if (dateRange && dateRange.from && dateRange.to) {
                startDate = new Date(dateRange.from + 'T00:00:00');
            } else {
                startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 30);
            }

            const relevantRecords = mockRecords.filter(r => {
                const recordDate = new Date(r.weighedAt);
                return recordDate >= startDate && recordDate <= endDate;
            });

            relevantRecords.forEach(r => {
                const dateKey = new Date(r.weighedAt).toISOString().split('T')[0];
                if (!series[dateKey]) {
                    series[dateKey] = { count: 0, netWeight: 0, items: {} };
                }
                series[dateKey].count += 1;
                series[dateKey].netWeight += r.netWeight;

                r.items.forEach(item => {
                    if (!series[dateKey].items[item.itemName]) {
                        series[dateKey].items[item.itemName] = 0;
                    }
                    series[dateKey].items[item.itemName] += item.weight;
                });
            });
            
            const result = Object.keys(series).sort().map(key => ({
                key,
                count: series[key].count,
                netWeight: series[key].netWeight,
                items: series[key].items,
            }));

            resolve(result);
        }, 700);
    });
};

export const getRecentRecords = async (limit: number): Promise<WeighingRecord[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const sorted = [...mockRecords].sort((a, b) => new Date(b.weighedAt).getTime() - new Date(a.weighedAt).getTime());
      resolve(sorted.slice(0, limit));
    }, 500);
  });
};

export const getAllRecords = async (page: number, perPage: number, filters?: RecordFilters): Promise<{ records: WeighingRecord[], total: number }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let filteredRecords = [...mockRecords];

            if (filters) {
                if (filters.dateFrom) {
                    filteredRecords = filteredRecords.filter(r => new Date(r.weighedAt).toISOString().split('T')[0] >= filters.dateFrom!);
                }
                if (filters.dateTo) {
                    filteredRecords = filteredRecords.filter(r => new Date(r.weighedAt).toISOString().split('T')[0] <= filters.dateTo!);
                }
                if (filters.keyword) {
                    const keyword = filters.keyword.toLowerCase();
                    filteredRecords = filteredRecords.filter(r => 
                        r.recordId.toLowerCase().includes(keyword) ||
                        r.driverName.toLowerCase().includes(keyword)
                    );
                }
                if (filters.status) {
                    filteredRecords = filteredRecords.filter(r => r.status === filters.status);
                }
                if (filters.companyName) {
                    filteredRecords = filteredRecords.filter(r => r.companyName === filters.companyName);
                }
                if (filters.driverId) {
                    filteredRecords = filteredRecords.filter(r => r.driverId === filters.driverId);
                }
            }
            
            const total = filteredRecords.length;
            const start = (page - 1) * perPage;
            const end = start + perPage;
            const sorted = filteredRecords.sort((a, b) => new Date(b.weighedAt).getTime() - new Date(a.weighedAt).getTime());

            resolve({
                records: sorted.slice(start, end),
                total: total,
            });
        }, 800);
    });
};

export const getRecordById = async (recordId: string): Promise<WeighingRecord> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const record = mockRecords.find(r => r.recordId === recordId);
            if (record) {
                resolve(JSON.parse(JSON.stringify(record)));
            } else {
                reject(new Error("Record not found"));
            }
        }, 300);
    });
};

export const updateWeighingRecord = async (recordId: string, updates: { grossWeight: number, tareWeight: number }): Promise<WeighingRecord> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const recordIndex = mockRecords.findIndex(r => r.recordId === recordId);
            if (recordIndex === -1) {
                return reject(new Error("Record not found"));
            }

            const record = mockRecords[recordIndex];
            const originalGross = record.grossWeight;
            const originalTare = record.tareWeight;

            record.grossWeight = updates.grossWeight;
            record.tareWeight = updates.tareWeight;
            record.netWeight = updates.grossWeight - updates.tareWeight;
            
            record.status = '修正済';

            const changes = [];
            if (originalGross !== updates.grossWeight) changes.push(`総重量を ${originalGross}kg から ${updates.grossWeight}kg に変更`);
            if (originalTare !== updates.tareWeight) changes.push(`空車重量を ${originalTare}kg から ${updates.tareWeight}kg に変更`);

            record.modificationHistory.unshift({
                timestamp: new Date().toISOString(),
                editor: 'admin',
                change: changes.join('; ')
            });
            
            resolve(JSON.parse(JSON.stringify(record)));
        }, 500);
    });
};

export const deleteRecord = async (recordId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const initialLength = mockRecords.length;
            const index = mockRecords.findIndex(r => r.recordId === recordId);
            if (index > -1) {
                mockRecords.splice(index, 1);
                if (mockRecords.length < initialLength) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Deletion failed unexpectedly.'));
                }
            } else {
                reject(new Error('Record not found.'));
            }
        }, 600);
    });
};

export const exportAllRecords = async (filters?: RecordFilters): Promise<WeighingRecord[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let filteredRecords = [...mockRecords];
             if (filters) {
                if (filters.driverId) {
                    filteredRecords = filteredRecords.filter(r => r.driverId === filters.driverId);
                }
             }
            const sorted = filteredRecords.sort((a, b) => new Date(b.weighedAt).getTime() - new Date(a.weighedAt).getTime());
            resolve(sorted);
        }, 1200);
    });
};

export const addWeighingItem = async (recordId: string, newItemData: Omit<WeighingItem, 'id'>): Promise<WeighingRecord> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const record = mockRecords.find(r => r.recordId === recordId);
            if (!record) return reject(new Error('Record not found'));
            
            const newItem: WeighingItem = {
                ...newItemData,
                id: `wi_${Date.now()}`
            };
            record.items.push(newItem);

            record.modificationHistory.unshift({
                timestamp: new Date().toISOString(),
                editor: 'admin',
                change: `品目「${newItem.itemName}」を追加 (${newItem.weight}kg)`
            });

            record.status = '修正済';
            resolve(JSON.parse(JSON.stringify(record)));
        }, 500);
    });
};

export const updateWeighingItem = async (recordId: string, itemId: string, updates: Partial<Omit<WeighingItem, 'id'>>): Promise<WeighingRecord> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const record = mockRecords.find(r => r.recordId === recordId);
            if (!record) return reject(new Error('Record not found'));
            
            const itemIndex = record.items.findIndex(i => i.id === itemId);
            if (itemIndex === -1) return reject(new Error('Item not found'));

            const originalItem = { ...record.items[itemIndex] };
            const updatedItem = { ...originalItem, ...updates };

            const changes = [];
            if (updates.itemName && updates.itemName !== originalItem.itemName) {
                changes.push(`品目を「${originalItem.itemName}」から「${updates.itemName}」に変更`);
            }
            if (updates.weight !== undefined && updates.weight !== originalItem.weight) {
                changes.push(`品目「${originalItem.itemName}」の重量を ${originalItem.weight}kg から ${updates.weight}kg に変更`);
            }
            if (updates.locationName && updates.locationName !== originalItem.locationName) {
                changes.push(`品目「${updatedItem.itemName}」の回収先を「${originalItem.locationName}」から「${updates.locationName}」に変更`);
            }
             if (updates.method && updates.method !== originalItem.method) {
                changes.push(`品目「${updatedItem.itemName}」の計量方法を「${originalItem.method}」から「${updates.method}」に変更`);
            }

            if (changes.length > 0) {
                 record.modificationHistory.unshift({
                    timestamp: new Date().toISOString(),
                    editor: 'admin',
                    change: changes.join('; ')
                });
            }

            record.items[itemIndex] = updatedItem;
            record.status = '修正済';
            resolve(JSON.parse(JSON.stringify(record)));
        }, 500);
    });
};

export const deleteWeighingItem = async (recordId: string, itemId: string): Promise<WeighingRecord> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const record = mockRecords.find(r => r.recordId === recordId);
            if (!record) return reject(new Error('Record not found'));

            const itemToDelete = record.items.find(i => i.id === itemId);
            if (!itemToDelete) return reject(new Error('Item not found for deletion'));

            const initialLength = record.items.length;
            record.items = record.items.filter(i => i.id !== itemId);

            if (record.items.length < initialLength) {
                record.modificationHistory.unshift({
                    timestamp: new Date().toISOString(),
                    editor: 'admin',
                    change: `品目「${itemToDelete.itemName}」を削除 (${itemToDelete.weight}kg)`
                });
                record.status = '修正済';
                resolve(JSON.parse(JSON.stringify(record)));
            } else {
                reject(new Error('Item not found for deletion'));
            }
        }, 500);
    });
};

export const getCompanies = async (): Promise<string[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockCompaniesMaster.map(c => c.name));
        }, 200);
    });
};

const createApi = <T extends { id: string; createdAt: string; name: string }>(mockData: T[], name: string) => ({
    get: async (): Promise<T[]> => new Promise(res => setTimeout(() => res([...mockData].sort((a, b) => a.name.localeCompare(b.name, 'ja'))), 300)),
    add: async (data: Omit<T, 'id' | 'createdAt'>): Promise<T> => new Promise(res => setTimeout(() => {
        const newItem = { ...data, id: `${name}_${Date.now()}`, createdAt: new Date().toISOString() } as T;
        mockData.push(newItem);
        res(newItem);
    }, 400)),
    update: async (id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> => new Promise((res, rej) => setTimeout(() => {
        const index = mockData.findIndex(item => item.id === id);
        if (index === -1) return rej(new Error(`${name} not found`));
        const updatedItem = { ...mockData[index], ...updates };
        mockData[index] = updatedItem;
        res(updatedItem);
    }, 400)),
    delete: async (id: string): Promise<{ success: boolean }> => new Promise(res => setTimeout(() => {
        const initialLength = mockData.length;
        const newData = mockData.filter(item => item.id !== id);
        if (name === 'companies') mockCompaniesMaster = newData as Company[];
        if (name === 'drivers') mockDriversMaster = newData as unknown as Driver[];
        if (name === 'customers') mockCustomersMaster = newData as Customer[];
        if (name === 'locations') mockLocationsMaster = newData as Location[];
        if (name === 'items') mockItemsMaster = newData as unknown as Item[];
        res({ success: newData.length < initialLength });
    }, 600)),
});

export const companyApi = createApi<Company>(mockCompaniesMaster, 'comp');
export const driverApi = createApi<Driver>(mockDriversMaster, 'drv');
export const customerApi = createApi<Customer>(mockCustomersMaster, 'cust');
export const locationApi = createApi<Location>(mockLocationsMaster, 'loc');
export const itemApi = createApi<Item>(mockItemsMaster, 'item');

export const getDriversMaster = async (): Promise<Driver[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockDriversMaster].sort((a,b) => a.name.localeCompare(b.name, 'ja')));
        }, 200);
    });
};

export const getLocationsMaster = async (): Promise<Location[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockLocationsMaster].sort((a,b) => a.name.localeCompare(b.name, 'ja')));
        }, 200);
    });
};

export const getItemsMaster = async (): Promise<Item[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockItemsMaster].sort((a,b) => a.name.localeCompare(b.name, 'ja')));
        }, 200);
    });
};

export const getUserAccounts = async (): Promise<UserAccount[]> => {
    return new Promise(res => setTimeout(() => res(JSON.parse(JSON.stringify(mockUserAccounts.sort((a, b) => a.name.localeCompare(b.name, 'ja'))))), 500));
};

export const updateUserAccountStatus = async (userId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<UserAccount> => {
    return new Promise((res, rej) => setTimeout(() => {
        const userIndex = mockUserAccounts.findIndex(u => u.id === userId);
        if (userIndex === -1) return rej(new Error('User not found'));
        mockUserAccounts[userIndex].accountStatus = status;
        res(JSON.parse(JSON.stringify(mockUserAccounts[userIndex])));
    }, 300));
};

export const resetUserPassword = async (userId: string): Promise<UserAccount> => {
    return new Promise((res, rej) => setTimeout(() => {
        const userIndex = mockUserAccounts.findIndex(u => u.id === userId);
        if (userIndex === -1) return rej(new Error('User not found'));
        mockUserAccounts[userIndex].passwordStatus = 'PENDING';
        res(JSON.parse(JSON.stringify(mockUserAccounts[userIndex])));
    }, 300));
};
