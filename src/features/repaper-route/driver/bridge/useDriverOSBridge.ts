import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../../shared/lib/supabase/client';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Stop, Vehicle, Colleague } from './types';
import { StopStatus, DriverStatus } from './types';

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
        tareWeight: v.empty_vehicle_weight || 0,
        maxLoadingCapacity: v.max_loading_capacity || 0
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
        phoneNumber: s.phone_number || ''
      })));
    }
  }, [currentUser?.id]);

  // 案件データのフェッチ — SSOT: jobs テーブル (Option A / TASK-001)
  const refreshStops = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // jobs テーブルから当該ドライバーの当日分を取得し、
      // customers テーブルから住所情報を補完する
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const { data: jobRows, error: jError } = await supabase
        .from('jobs')
        .select('*, customers(name, address, lat, lng)')
        .eq('driver_id', currentUser.id)
        .eq('scheduled_date', today)
        .order('start_time', { ascending: true });

      if (jError) throw jError;

      const rawJobs = jobRows || [];

      setStops(rawJobs.map((job: any) => {
        const customer = job.customers || {};
        return {
          id: job.id,
          customerName: job.customer_name || customer.name || '名称不明',
          address: customer.address || '住所不明',
          lat: customer.lat || 35.6,
          lng: customer.lng || 139.7,
          scheduledTime: job.start_time || '00:00',
          status: job.status === 'confirmed' ? StopStatus.COMPLETED : StopStatus.PENDING,
          items: Array.isArray(job.task_details?.items) ? job.task_details.items : [
            { 
              id: `${job.id}-item-1`, 
              name: job.item_category || '回収品', 
              defaultWeight: job.weight_kg || 0,
              isCollected: !!job.weight_kg
            }
          ],
          isPriority: !!job.is_spot,
          notes: job.note || job.special_notes || '',
          arrivalTime: job.actual_time || undefined,
          departureTime: job.actual_time || undefined
        };
      }));
    } catch (err) {
      console.error('[BRIDGE] Failed to fetch stops from jobs table:', err);
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

  // メディアアップロード（Cloudflare R2 準拠）
  const uploadMedia = useCallback(async (file: Blob, folder: string): Promise<{url: string, path: string, provider: 'r2' | 'supabase'}> => {
    const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
    const endpoint = import.meta.env.VITE_R2_ENDPOINT;
    const bucket = import.meta.env.VITE_R2_BUCKET_NAME;
    const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-your-id.r2.dev';

    if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
      console.error('[BRIDGE] R2 Configuration missing in .env');
      throw new Error('STORAGE_CONFIG_ERROR');
    }

    // R2 (S3互換) クライアントの初期化
    const client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    const fileName = `${Date.now()}.jpg`;
    const path = `${folder}/${fileName}`;
    
    try {
      console.log(`[BRIDGE] Generating presigned URL for ${path}...`);
      // スマホのブラウザから直接AWS SDKでアップロードするとストリーム解釈エラーが起きるため、
      // 署名付きURL（Presigned URL）を発行し、ブラウザ標準の fetch API で送信する方式に変更
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        ContentType: "image/jpeg",
      });
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });

      console.log(`[BRIDGE] Uploading via native fetch...`);
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      if (!uploadRes.ok) {
        throw new Error(`HTTP Error ${uploadRes.status}: ${uploadRes.statusText}`);
      }

      return {
        url: `${publicUrl}/${path}`,
        path: path,
        provider: 'r2'
      };
    } catch (err) {
      console.error('[BRIDGE] R2 Upload failed:', err);
      throw err;
    }
  }, []);

  // 戻り値のメモ化（無限ループ防止）
  const user = useMemo(() => {
    if (!currentUser) return null;
    
    // staffs テーブルからの詳細があれば優先、なければ Auth の情報で最小構成を作成
    return {
      id: currentUser.id,
      name: currentUser.name || 'Unknown Driver',
      vehicleId: currentUser.vehicle_info?.id || '未割当',
      vehicleName: currentUser.vehicle_info?.name || '車両未指定',
      currentStatus: DriverStatus.IDLE,
    };
  }, [currentUser?.id, currentUser?.name, currentUser?.vehicle_info]);

  return {
    user,
    stops,
    availableVehicles,
    availableColleagues,
    isLoading,
    recordDecision,
    refreshStops,
    uploadMedia
  };
};
