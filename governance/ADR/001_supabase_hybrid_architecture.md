# Architecture Decision Record: 001
# Title: Supabase ハイブリッド・アーキテクチャへの移行とSDRモデルの実装
**Date:** 2026-08-24
**Status:** Accepted (Approved by User)

## 1. Context (背景と課題)
現在のシステムは、フロントエンド（React/Vite）からローカルAPIを経由してPC上のJSONファイル（`master.json` 等）を直接書き換えるプロトタイプ状態である。
本格運用に向けてデータベース（Supabase/PostgreSQL）への移行が必要であるが、以下の厳しい制約と設計理念（DX設計憲法）を両立させる必要があった。

1. **運用コストゼロの恒久化**: Supabaseの無料枠（500MB制限、1週間非アクティブ停止）を永久に回避すること。
2. **監査証跡（SDRモデル）の確保**: 「状態と履歴は不可逆」「削除・上書きの原則禁止」を守り、誰がいつ何を判断したかのログ（SDR）を物理レベルで残すこと。
3. **現場UX（人間の意思決定支援）の維持**: 複雑な申請フローや過剰な制約を設けず、フロントエンドからの直感的な「一括操作・修正」を阻害しないこと。

## 2. Decision (決定事項)
完全なAppend-Only設計（理想）と、直感的なCRUD（現実）を調和させた **「ハイブリッド監査モデル」** を採用する。
フロントエンドからは通常の `UPDATE` 操作を許容しつつ、データベース側のストアドトリガー（Event Sourcing）が裏側で自動的に不変の監査ログを生成するアーキテクチャとする。

## 3. Architecture Details (アーキテクチャ詳細)

### 3.1. Hot / Log / Media のストレージ分離
*   **Hot (Supabase)**: マスタ、最新の配車計画、実績、直近の監査ログ。
*   **Log (GAS / Spreadsheet)**: 期間経過後の過去データ、大量のGPS位置情報等。
*   **Media (Cloudflare R2)**: 写真等のバイナリデータ（一定期間でパージ）。

### 3.2. マスタの3層分離と孤児データ排除
請求の関心事（支払先・仕入先）と配車の関心事（回収現場）を分離し、`ON DELETE RESTRICT` を用いて「親なき孤児データ」の発生を物理的に防ぐ。
*   `master_payers` (支払先) -> `master_contractors` (仕入先) -> `master_collection_points` (現場)

### 3.3. ハイブリッド監査トリガー (Event Sourcing)
トランザクションテーブル（`daily_jobs` 等）への `UPDATE` 時に、裏側で `audit_trigger_func` が起動。Supabaseの `auth.uid()` を取得して操作者を特定し、変更前後（Before/After）のJSONスナップショットを `event_logs` に自動挿入する。

### 3.4. システムパージ例外（無料枠対策）
「No Delete」の原則を守りつつ、500MB制限を回避するため、`protect_from_delete` トリガーに例外ルートを設ける。
`app.system_purge_mode = true` のシステム変数がセットされたトランザクション（GASによる半年経過データのアーカイブバッチ等）に限り、物理削除を許可する。

## 4. UI / UX Strategy (フロントエンド設計方針)

### 4.1. 3層マスタの入力UX（コンボボックス自動分配）
UIを3画面に分割して入力の手間を増やすことはしない。現在の「1つの画面（`CustomerManagementModal`）」のまま、支払先・仕入先の入力欄を「検索可能コンボボックス」に変更する。
既存名を選択、または新規名を入力させ、保存時のAPI通信（非同期処理）の裏側で3層テーブルに適切に分配・INSERTするロジックを組む。

### 4.2. リソース休み管理（GAS主導 ＋ 簡易トグル）
複雑なシフト管理画面は作らない。毎朝GASから「休みシフト」を `master_resource_availability` に自動インポートし、プロジェクト凍結防止のヘルスチェックを兼ねる。
アプリ上には、突発的な欠勤・故障に対応するための「稼働/休止トグルスイッチ」のみを設置する。

## 5. Migration Roadmap (移行ロードマップ)

*   **Step 1**: DDLの完全定義とSupabaseプロジェクトへのテーブル構築。
*   **Step 2**: Node.jsスクリプトによる `master.json` 等のクレンジングと、新3層マスタへのデータ移行。
*   **Step 3**: フロントエンド（`storageService.ts`等）の通信先を、ViteローカルAPIからSupabase Clientへリプレイス。
*   **Step 4**: 監査トリガー（`event_logs` 生成）およびシステムパージ例外関数の実装。
*   **Step 5**: Supabase Authの有効化と、RLS（行レベルセキュリティ）によるロール別アクセス制御の適用。
*   **Step 6**: GAS等を用いた自動ヘルスチェック、および過去データのエクスポート/パージ運用の構築。

---

## Appendix: 完全版DDL (Physical Schema)

```sql
-- ==========================================
-- 1. カスタムENUM
-- ==========================================
CREATE TYPE event_type AS ENUM ('PLAN_CREATED', 'PLAN_UPDATED', 'PLAN_CONFIRMED', 'ACTUAL_REGISTERED', 'ACTUAL_UPDATED', 'SYSTEM_PURGE');
CREATE TYPE job_status AS ENUM ('PLANNED', 'CONFIRMED', 'COMPLETED', 'SKIPPED');
CREATE TYPE visit_slot AS ENUM ('AM', 'PM', 'TIME', 'FREE');
CREATE TYPE resource_type AS ENUM ('DRIVER', 'VEHICLE');

-- ==========================================
-- 2. 監査証跡（不変層）
-- ==========================================
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

CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO event_logs (table_name, record_id, action_type, before_state, after_state, operator_id)
  VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION protect_from_delete() RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('app.system_purge_mode', true) = 'true' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION '物理削除は禁止されています。論理削除を使用してください。';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. 三層マスタ (支払先 -> 仕入先 -> 回収先)
-- ==========================================
CREATE TABLE master_payers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payee_code VARCHAR(50) UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE master_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_code VARCHAR(50) UNIQUE,
  payer_id UUID REFERENCES master_payers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE master_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. リソースマスタ (人・車・稼働状況)
-- ==========================================
CREATE TABLE master_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_label TEXT,
  can_drive BOOLEAN DEFAULT TRUE,
  can_collect BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE master_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_no VARCHAR(20) NOT NULL UNIQUE,
  capacity_kg INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE master_collection_points ADD CONSTRAINT fk_required_vehicle FOREIGN KEY (required_vehicle_id) REFERENCES master_vehicles(id);

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
CREATE TRIGGER tr_audit_resource BEFORE UPDATE ON master_resource_availability FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ==========================================
-- 5. トランザクション層 (日次配車・実績)
-- ==========================================
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
CREATE TRIGGER tr_audit_daily_jobs BEFORE UPDATE ON daily_jobs FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER tr_prevent_delete_daily_jobs BEFORE DELETE ON daily_jobs FOR EACH ROW EXECUTE FUNCTION protect_from_delete();

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
CREATE TRIGGER tr_audit_actuals BEFORE UPDATE ON actuals FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ==========================================
-- 6. テンプレート管理層
-- ==========================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES master_workers(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER tr_audit_templates BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

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
```
