import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import type { Staff } from '../../types/staff';

/**
 * AuthAdapter
 * 
 * 認証レイヤーと業務ドメイン（Staff）レイヤーを分離・統合するアダプター。
 * 全社標準 Staff スキーマへの準拠を保証する。
 */
export const AuthAdapter = {
  /**
   * 現在のセッションを取得
   */
  async getSession() {
    return await supabase.auth.getSession();
  },

  /**
   * localStorage に認証トークンが存在するかを同期的に確認する
   */
  hasCachedSession(): boolean {
    if (typeof window === 'undefined') return false;
    // sb-[project-id]-auth-token 形式のキーを探す
    return Object.keys(localStorage).some(key => 
      key.startsWith('sb-') && key.endsWith('-auth-token')
    );
  },

  /**
   * 認証状態の変更を監視
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * メールアドレスとパスワードによるサインイン
   * @param authUid Supabase Auth の User.id
   */
  async getStaffByAuthUid(authUid: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from('staffs')
      .select('*')
      .eq('auth_uid', authUid)
      .eq('is_active', true) // アクティブなスタッフのみ許可
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        console.warn(`[AuthAdapter] No active staff found for auth_uid: ${authUid}`);
        return null;
      }
      console.error('[AuthAdapter] Error fetching staff:', error.message);
      throw error;
    }

    return data as Staff;
  },

  /**
   * メールアドレスとパスワードによるサインイン
   */
  async signInWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Google OAuth によるサインイン
   */
  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  },

  /**
   * サインアウト
   */
  async signOut() {
    return await supabase.auth.signOut();
  },

  /**
   * スタッフの権限（allowed_apps）をチェックする
   */
  hasAppAccess(staff: Staff, appId: string): boolean {
    return staff.allowed_apps.includes(appId);
  }
};
