export interface WeighingItem {
  id: string;
  locationId: string;
  locationName: string;
  itemId: string;
  itemName: string;
  weight: number;
  method: '台貫' | '目見当';
}

export interface WeighingRecord {
  recordId: string;
  driverId: string; // Added driverId
  driverName: string;
  companyName: string | null;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  weighedAt: string;
  items: WeighingItem[];
  status: '完了' | '修正済' | '未確認';
  modificationHistory: Modification[];
}

export interface Modification {
  timestamp: string;
  editor: string;
  change: string;
}

export interface Company {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Driver {
    id: string;
    name: string;
    companyId?: string; // Belongs to a Company
    customerId?: string; // Or a Customer
    createdAt: string;
}

export interface Customer {
    id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
    createdAt: string;
}

export interface Location {
    id: string;
    name: string;
    address?: string;
    customerId?: string; // Can be linked to a customer
    createdAt: string;
    allowedItemIds?: string[] | null;
}

export interface Item {
    id: string;
    name: string;
    category: string;
    createdAt: string;
}

export type MasterData = Company | Driver | Customer | Location | Item;

export interface UserAccount {
  id: string; // driver.id
  name: string;
  companyId?: string;
  customerId?: string;
  passwordStatus: 'SET' | 'PENDING';
  accountStatus: 'ACTIVE' | 'INACTIVE';
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  effectiveTheme: EffectiveTheme;
}

export type ViewName = 'dashboard' | 'records' | 'masters' | 'users' | 'settings';

export type View = {
  name: ViewName;
  params?: Record<string, string | undefined>;
};

export interface DashboardSummary {
  todayCount: number;
  monthCount: number;
  unconfirmedCount: number;
  errorCount: number;
}

export interface TimeSeriesData {
  key: string; // e.g., '2025-11-09'
  count: number;
  netWeight: number;
  items: Record<string, number>;
}

export interface ChartFilter {
    dateFrom?: string;
    dateTo?: string;
}

export interface RecordFilters {
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
  status?: WeighingRecord['status'];
  companyName?: string;
  driverId?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

export interface AppContextValue {
  isLoading: boolean;
  error: Error | null;
  withStatusHandling: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>;
  clearError: () => void;
}

export interface DateRange {
  from: string;
  to: string;
}
