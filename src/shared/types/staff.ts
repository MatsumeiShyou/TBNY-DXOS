/**
 * TBNY DXOS Standard Staff Schema Types
 */

export interface Staff {
  id: string;
  auth_uid: string | null;
  name: string;
  role: 'admin' | 'staff' | 'driver' | 'office';
  allowed_apps: string[];
  is_active: boolean;
  last_event_id: string | null;
  vehicle_info?: { id: string; name: string } | null;
  phone_number?: string | null;
  created_at: string;
  updated_at: string;
}

export type StaffRole = Staff['role'];
