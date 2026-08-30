-- ============================================================
-- RePaperRoute 初期スキーマ構築スクリプト
-- ADR: 001_supabase_hybrid_architecture.md に基づく
-- 実行先: Supabase Dashboard > SQL Editor
-- 注意: このスクリプトは空のプロジェクトに対して1回だけ実行すること
-- ============================================================

-- ===========================================
-- STEP 1: カスタムENUM型の定義
-- ===========================================
CREATE TYPE event_type AS ENUM (
  'PLAN_CREATED',
  'PLAN_UPDATED',
  'PLAN_CONFIRMED',
  'ACTUAL_REGISTERED',
  'ACTUAL_UPDATED',
  'SYSTEM_PURGE'
);

CREATE TYPE job_status AS ENUM (
  'PLANNED',
  'CONFIRMED',
  'COMPLETED',
  'SKIPPED'
);

CREATE TYPE visit_slot AS ENUM ('AM', 'PM', 'TIME', 'FREE');

CREATE TYPE resource_type AS ENUM ('DRIVER', 'VEHICLE');

-- ===========================================
-- STEP 2: 監査証跡テーブルとトリガー関数
-- ===========================================

-- 不変の監査ログテーブル（SDR中枢）
CREATE TABLE event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action_type VARCHAR(10) NOT NULL,
  before_state JSONB,
  after_state JSONB,
  operator_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ハイブリッド監査トリガー関数
-- UPDATEを許容しつつ、変更前後を自動で event_logs に記録する
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO event_logs (
    table_name, record_id, action_type,
    before_state, after_state, operator_id
  ) VALUES (
    TG_TABLE_NAME,
    OLD.id,
    TG_OP,
    row_to_json(OLD)::jsonb,
    row_to_json(NEW)::jsonb,
    auth.uid()  -- Supabase認証から操作者IDを自動取得
  );
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 物理削除防止トリガー関数（パージ例外ルート付き）
CREATE OR REPLACE FUNCTION protect_from_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- システムパージモード時のみ物理削除を許可
  IF current_setting('app.system_purge_mode', true) = 'true' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION '物理削除は禁止されています。論理削除(is_active=false等)を使用してください。';
END;
$$;

-- ===========================================
-- STEP 3: 三層マスタ (支払先 → 仕入先 → 回収先)
-- ===========================================

-- 3-1. 支払先マスタ（最上位層）
CREATE TABLE master_payers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payee_code VARCHAR(50) UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3-2. 仕入先マスタ（中間層）
CREATE TABLE master_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_code VARCHAR(50) UNIQUE,
  payer_id UUID REFERENCES master_payers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3-3. 回収先マスタ（配車の関心事）
-- ※ required_vehicle_id の外部キーは master_vehicles 作成後に追加
CREATE TABLE master_collection_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES master_contractors(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  address TEXT,
  target_item_codes TEXT[],
  time_pattern visit_slot DEFAULT 'FREE',
  preferred_time TIME,
  vehicle_lock BOOLEAN DEFAULT FALSE,
  required_vehicle_id UUID,
  schedule_rules JSONB DEFAULT '{"mon":[], "tue":[], "wed":[], "thu":[], "fri":[], "sat":[], "sun":[]}'::jsonb,
  holiday_collection BOOLEAN DEFAULT FALSE,
  default_duration INTEGER DEFAULT 30,
  note TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3-4. 品目マスタ
CREATE TABLE master_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- STEP 4: リソースマスタ (人・車両・稼働状況)
-- ===========================================

-- 4-1. 作業員マスタ
CREATE TABLE master_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_label TEXT,
  kana TEXT,
  license_types TEXT[],
  can_drive BOOLEAN DEFAULT TRUE,
  can_collect BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4-2. 車両マスタ
CREATE TABLE master_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_no VARCHAR(20) NOT NULL UNIQUE,
  capacity_kg INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3-3 で後回しにした外部キー制約を追加
ALTER TABLE master_collection_points
  ADD CONSTRAINT fk_required_vehicle
  FOREIGN KEY (required_vehicle_id) REFERENCES master_vehicles(id);

-- 4-3. リソース稼働可否管理（休みシフト・車検等）
CREATE TABLE master_resource_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL,
  resource_type resource_type NOT NULL,
  target_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  reason_code VARCHAR(50),
  reason_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (resource_id, target_date)
);

CREATE TRIGGER tr_audit_resource_availability
  BEFORE UPDATE ON master_resource_availability
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ===========================================
-- STEP 5: トランザクション層 (日次配車・実績)
-- ===========================================

CREATE TABLE monthly_exceptions (
  target_date DATE PRIMARY KEY,
  spot_jobs JSONB DEFAULT '[]'::jsonb,
  cancellations JSONB DEFAULT '[]'::jsonb,
  reschedules JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT ALL ON TABLE public.monthly_exceptions TO service_role;
GRANT ALL ON TABLE public.monthly_exceptions TO authenticated;
GRANT ALL ON TABLE public.monthly_exceptions TO anon;

-- 5-1. 案件管理（日次の配車計画）
CREATE TABLE daily_configs (
  planned_date DATE PRIMARY KEY,
  drivers JSONB DEFAULT '[]'::jsonb,
  splits JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT ALL ON TABLE public.daily_configs TO service_role;
GRANT ALL ON TABLE public.daily_configs TO authenticated;
GRANT ALL ON TABLE public.daily_configs TO anon;

CREATE TABLE daily_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_point_id UUID NOT NULL REFERENCES master_collection_points(id),
  status job_status DEFAULT 'PLANNED',
  planned_date DATE NOT NULL,
  planned_time TIME,
  is_skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tr_audit_daily_jobs
  BEFORE UPDATE ON daily_jobs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER tr_prevent_delete_daily_jobs
  BEFORE DELETE ON daily_jobs
  FOR EACH ROW EXECUTE FUNCTION protect_from_delete();

-- 5-2. セルフ計量実績
CREATE TABLE weighing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES daily_jobs(id),
  total_weight INTEGER NOT NULL DEFAULT 0,
  empty_weight INTEGER NOT NULL DEFAULT 0,
  net_weight INTEGER GENERATED ALWAYS AS (total_weight - empty_weight) STORED,
  operator_id UUID NOT NULL REFERENCES master_workers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5-3. 運行実績
CREATE TABLE actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES daily_jobs(id),
  status VARCHAR(20),
  actual_quantity INTEGER NOT NULL DEFAULT 0,
  quantity_unit VARCHAR(10) DEFAULT 'kg',
  is_finalized BOOLEAN DEFAULT FALSE,
  operator_id UUID NOT NULL REFERENCES master_workers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tr_audit_actuals
  BEFORE UPDATE ON actuals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ===========================================
-- STEP 6: テンプレート管理層
-- ===========================================

-- 6-1. テンプレートヘッダ
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_week TEXT,
  target_day TEXT,
  ui_state JSONB DEFAULT '{"jobs":[],"pendingJobs":[],"splits":[]}'::jsonb,
  created_by UUID REFERENCES master_workers(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tr_audit_templates
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- 6-2. テンプレート内の案件（ひな形の中身）
CREATE TABLE template_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  collection_point_id UUID NOT NULL REFERENCES master_collection_points(id),
  worker_id UUID REFERENCES master_workers(id),
  vehicle_id UUID REFERENCES master_vehicles(id),
  planned_time TIME,
  sequence_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 完了確認: 全テーブル一覧
-- ===========================================
-- 以下のクエリで作成されたテーブルを確認できます（実行はオプション）:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;
