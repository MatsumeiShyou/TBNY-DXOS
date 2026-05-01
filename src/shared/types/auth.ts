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
  last_event_id?: string | null;
  avatar_url?: string;
}

export interface AuthSession {
  user: DXUser | null;
  expires_at?: number;
}
