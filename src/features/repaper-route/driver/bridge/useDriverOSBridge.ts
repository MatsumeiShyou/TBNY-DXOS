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
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          master_collection_points (
            latitude,
            longitude,
            address,
            display_name
          )
        `)
        .eq('driver_id', currentUser.id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      if (data) {
        setStops(data.map((job: any) => {
          const point = job.master_collection_points;
          return {
            id: job.id,
            customerName: point?.display_name || job.customer_name || '名称不明',
            address: point?.address || job.address || '住所不明',
            lat: point?.latitude || 35.6,
            lng: point?.longitude || 139.7,
            scheduledTime: job.start_time ? job.start_time.slice(11, 16) : '00:00',
            status: (job.status === 'confirmed' || job.weight_kg) ? StopStatus.COMPLETED : StopStatus.PENDING,
            items: [
              { 
                id: `${job.id}-item-1`, 
                name: job.item_category || '回収品', 
                defaultWeight: job.weight_kg || 0,
                isCollected: !!job.weight_kg
              }
            ],
            isPriority: !!job.is_admin_forced,
            notes: job.note || '',
            arrivalTime: job.actual_time || undefined,
            departureTime: job.actual_time || undefined
          };
        }));
      }
    } catch (err) {
      console.error('[BRIDGE] Failed to fetch stops:', err);
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
    return {
      id: currentUser.id,
      name: currentUser.name,
      vehicleId: '未割当',
      vehicleName: '車両未指定',
      currentStatus: DriverStatus.IDLE,
    };
  }, [currentUser?.id, currentUser?.name]); //currentUser.vehicle への依存を削除

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
