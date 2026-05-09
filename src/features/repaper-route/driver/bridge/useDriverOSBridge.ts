import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../../shared/lib/supabase/client';
import type { Stop, Vehicle, Colleague } from '../sandbox/types';
import { StopStatus, DriverStatus } from '../sandbox/types';

/**
 * useDriverOSBridge
 * 
 * 真実のデータ層への唯一のアクセスポイント。
 * メモ化により参照の安定性を確保し、UI の無限ループを防止する。
 */
export const useDriverOSBridge = () => {
  const { currentUser } = useAuth();
  const [stops, setStops] = useState<Stop[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableColleagues, setAvailableColleagues] = useState<Colleague[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // マスタ：車両一覧のフェッチ
  const fetchVehicles = useCallback(async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_active', true);
    
    if (!error && data) {
      setAvailableVehicles(data.map(v => ({
        id: v.id || '',
        name: v.callsign || v.number || '不明な車両',
        plateNumber: v.number || '',
        isInspected: false,
        tareWeight: 0
      })));
    }
  }, []);

  // マスタ：同僚（スタッフ）一覧のフェッチ
  const fetchColleagues = useCallback(async () => {
    const { data, error } = await supabase
      .from('staffs')
      .select('*')
      .neq('id', currentUser?.id || '');

    if (!error && data) {
      setAvailableColleagues(data.map(s => ({
        id: s.id,
        name: s.name,
        status: DriverStatus.IDLE,
        distance: '不明',
        phoneNumber: '00-0000-0000'
      })));
    }
  }, [currentUser?.id]);

  // 案件データのフェッチ
  const refreshStops = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // Admin 側と整合させるため、routes テーブルの JSONB から取得
      const { data: routeRows, error: rError } = await supabase
        .from('routes')
        .select('*')
        .eq('driver_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (rError) throw rError;

      const latestRoute = routeRows?.[0];
      const rawJobs = Array.isArray(latestRoute?.jobs) ? latestRoute.jobs : [];

      setStops(rawJobs.map((job: any) => ({
        id: job.id,
        customerName: job.customer_name || job.display_name || '名称不明',
        address: job.address || '住所不明',
        lat: job.lat || 35.6,
        lng: job.lng || 139.7,
        scheduledTime: job.scheduled_time || '00:00',
        status: job.status === 'confirmed' ? StopStatus.COMPLETED : StopStatus.PENDING,
        items: Array.isArray(job.items) ? job.items : [
          { 
            id: `${job.id}-item-1`, 
            name: job.item_category || '回収品', 
            defaultWeight: job.weight_kg || 0,
            isCollected: !!job.weight_kg
          }
        ],
        isPriority: !!job.is_priority,
        notes: job.notes || '',
        arrivalTime: job.actual_time || undefined,
        departureTime: job.actual_time || undefined
      })));
    } catch (err) {
      console.error('[BRIDGE] Failed to fetch route stops:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      refreshStops();
      fetchVehicles();
      fetchColleagues();
    }
  }, [currentUser?.id]); // 関数を除外し、ID 変更時のみ実行するように固定

  // 実績記録
  const recordDecision = useCallback(async (
    type: string, 
    userId: string, 
    meta: any, 
    data?: any, 
    targetId?: string
  ) => {
    try {
      // ログ記録
      await supabase.from('event_logs').insert({
        staff_id: userId,
        event_type: type,
        payload: { meta, data, targetId },
        occurred_at: new Date().toISOString()
      });

      if (targetId && (type === 'STOP_ARRIVAL' || type === 'STOP_COMPLETION')) {
        const updates: any = {};
        if (type === 'STOP_ARRIVAL') updates.actual_time = data?.time || new Date().toISOString();
        if (type === 'STOP_COMPLETION') {
          updates.status = 'confirmed';
          updates.weight_kg = data?.items?.reduce((sum: number, i: any) => sum + (i.weight || 0), 0) || 0;
        }
        await supabase.from('jobs').update(updates).eq('id', targetId);
        refreshStops();
      }
    } catch (err) {
      console.error('[BRIDGE] Failed to record decision:', err);
    }
  }, [refreshStops]);

  // 戻り値のメモ化（無限ループ防止）
  const user = useMemo(() => {
    if (!currentUser) return null;
    
    // staffs テーブルからの詳細があれば優先、なければ Auth の情報で最小構成を作成
    return {
      id: currentUser.id,
      name: currentUser.name || 'Unknown Driver',
      vehicleId: '未割当',
      vehicleName: '車両未指定',
      currentStatus: DriverStatus.IDLE,
    };
  }, [currentUser?.id, currentUser?.name]);

  return {
    user,
    stops,
    availableVehicles,
    availableColleagues,
    isLoading,
    recordDecision,
    refreshStops
  };
};
