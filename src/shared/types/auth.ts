/**
 * Auth Types — DXOS 全体で共有される認証・ユーザー情報
 */

export type UserRole = 'admin' | 'staff' | 'driver' | 'viewer';

export interface DXUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  allowed_apps: string[];
    permissions: {
        can_manage_master: boolean;
        can_view_audit: boolean;
        can_edit_board: boolean;
        can_edit_past_records: boolean;
    };

  last_event_id?: string | null;
  avatar_url?: string;
  vehicle_info?: { id: string; name: string } | null;
}


export interface AuthSession {
  user: DXUser | null;
  expires_at?: number;
}
