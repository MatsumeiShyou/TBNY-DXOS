export interface Location {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
}

export interface MasterData {
  locations: Location[];
  items: Item[];
}

export interface WeighingItem {
  locationId: string;
  itemId: string;
  weight: number;
}

export interface WeighingRecordPayload {
  recordId: string; // UUID generated on client
  driverName: string;
  companyName: string | null;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  items: WeighingItem[];
  weighedAt: string; // ISO 8601 format
}

export interface QueuedRequest {
  id: string; // UUID
  payload: WeighingRecordPayload;
  timestamp: number;
}

// Fix: Changed VerificationResult to a discriminated union for better type inference.
export type VerificationResult =
  | {
      success: true;
      userType?: 'company' | 'customer';
      company?: { id: string; name: string };
      customerName?: string;
      drivers?: { id: string; name: string; hasSetPassword?: boolean }[];
    }
  | {
      success: false;
      message: string;
    };

// --- App Settings ---
export type FontSize = 'sm' | 'md' | 'lg';
export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  fontSize: FontSize;
  theme: Theme;
  isPulseEffectEnabled: boolean;
}

// --- Auth Responses ---
export type AuthSuccessResponse = { success: true; driverName: string; companyName: string | null; userType: 'company' | 'customer', settings: UserSettings };
export type AuthFailureResponse = { success: false; message: string };
export type AuthResponse = AuthSuccessResponse | AuthFailureResponse;