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
   * auth_uid に紐づくスタッフ情報を取得する
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
   * スタッフの権限（allowed_apps）をチェックする
   */
  hasAppAccess(staff: Staff, appId: string): boolean {
    return staff.allowed_apps.includes(appId);
  }
};
