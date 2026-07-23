-- ============================================================
-- ADDITIVE-ONLY MIGRATION: 配車履歴の完全保存基盤
-- ============================================================
-- 安全保証:
--   - DROP 命令: なし
--   - RENAME 命令: なし
--   - ALTER COLUMN (型変更): なし
--   - 既存テーブル・列の削除: なし
--   - 既存データへの影響: なし
--
-- 使用する操作:
--   - CREATE TABLE IF NOT EXISTS (存在しなければ作成、あれば何もしない)
--   - ALTER TABLE ADD COLUMN IF NOT EXISTS (存在しなければ追加、あれば何もしない)
--   - CREATE UNIQUE INDEX IF NOT EXISTS
--   - CREATE OR REPLACE FUNCTION (関数の作成または上書き)
--   - CREATE POLICY (RLSポリシーの追加)
--
-- 対象環境: ローカル開発 (Docker Supabase) および 本番 Supabase
-- ============================================================

-- ============================================================
-- 1. profiles テーブル
--    本番: 存在する → IF NOT EXISTS でスキップ
--    ローカル: 存在しない → 新規作成
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    vehicle_info text,
    user_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    can_edit_board boolean DEFAULT false,
    device_mode text DEFAULT 'auto'::text,
    CONSTRAINT check_device_mode_values CHECK (device_mode = ANY (ARRAY['auto'::text, 'pc'::text, 'tablet'::text, 'mobile'::text]))
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_all_authenticated') THEN
        CREATE POLICY profiles_all_authenticated ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================================
-- 2. master_vehicles テーブル
--    本番: 存在する → IF NOT EXISTS でスキップ
--    ローカル: 存在しない → 新規作成
-- ============================================================
CREATE TABLE IF NOT EXISTS public.master_vehicles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    number text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    callsign text,
    updated_at timestamp with time zone DEFAULT now(),
    furigana text,
    note text,
    max_payload numeric(10,2),
    legacy_id text
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'master_vehicles' AND policyname = 'master_vehicles_read_all') THEN
        CREATE POLICY master_vehicles_read_all ON public.master_vehicles FOR SELECT USING (true);
    END IF;
END $$;

-- ============================================================
-- 3. drivers テーブル (ドライバーマスタ)
--    本番: 存在しない → 新規作成
--    ローカル: 存在しない → 新規作成
-- ============================================================
CREATE TABLE IF NOT EXISTS public.drivers (
    id text NOT NULL PRIMARY KEY,
    driver_name text NOT NULL,
    vehicle_number text,
    route_name text,
    display_color text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    default_split_driver_name text,
    default_split_time text,
    default_split_vehicle_number text,
    note text,
    furigana text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'drivers_all_authenticated') THEN
        CREATE POLICY drivers_all_authenticated ON public.drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================================
-- 4. routes テーブルへの列追加
--    本番: scheduled_date (PK), data, confirmed_snapshot 等が既存
--    ソースコード: date, drivers, jobs, pending, splits を期待
--    → 足りない列だけ追加。既存列は一切触らない。
-- ============================================================
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS date text;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS drivers jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS jobs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS pending jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS splits jsonb DEFAULT '[]'::jsonb;

-- date 列にユニーク制約を追加 (ソースコードが .eq('date', today).single() でアクセスするため)
CREATE UNIQUE INDEX IF NOT EXISTS idx_routes_date_unique ON public.routes(date);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'routes' AND policyname = 'routes_all_authenticated') THEN
        CREATE POLICY routes_all_authenticated ON public.routes FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================================
-- 5. board_actions テーブル (操作ログ)
--    本番: 存在する → IF NOT EXISTS でスキップ
--    ローカル: 存在しない → 新規作成
-- ============================================================
CREATE TABLE IF NOT EXISTS public.board_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    scheduled_date date NOT NULL,
    user_id uuid,
    action_type text NOT NULL,
    payload jsonb NOT NULL,
    reason text,
    source_app text DEFAULT 'dxos'::text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_actions_date ON public.board_actions USING btree (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_board_actions_created_at ON public.board_actions USING btree (created_at);

ALTER TABLE public.board_actions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'board_actions' AND policyname = 'board_actions_insert_authenticated') THEN
        CREATE POLICY board_actions_insert_authenticated ON public.board_actions FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'board_actions' AND policyname = 'board_actions_select_authenticated') THEN
        CREATE POLICY board_actions_select_authenticated ON public.board_actions FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- board_actions.user_id → auth.users(id) 外部キー (既存であればスキップ)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'board_actions_user_id_fkey' AND table_name = 'board_actions'
    ) THEN
        ALTER TABLE public.board_actions
            ADD CONSTRAINT board_actions_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- ============================================================
-- 6. board_daily_summaries テーブル (日別実績サマリー) [新規]
--    本番: 存在しない → 新規作成
--    ローカル: 存在しない → 新規作成
-- ============================================================
CREATE TABLE IF NOT EXISTS public.board_daily_summaries (
    route_date text NOT NULL PRIMARY KEY,
    total_jobs integer DEFAULT 0,
    completed_jobs integer DEFAULT 0,
    skipped_jobs integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.board_daily_summaries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'board_daily_summaries' AND policyname = 'summaries_all_authenticated') THEN
        CREATE POLICY summaries_all_authenticated ON public.board_daily_summaries FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================================
-- 7. RPC: rpc_record_board_action
--    ソースコードが呼び出す操作ログ記録関数。
--    本番: 存在しない → 新規作成
--    CREATE OR REPLACE なので、既存があっても安全に上書き。
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_record_board_action(
    p_date text,
    p_action_type text,
    p_payload jsonb,
    p_reason text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO public.board_actions (scheduled_date, action_type, payload, reason, user_id, source_app)
    VALUES (
        p_date::date,
        p_action_type,
        p_payload,
        p_reason,
        auth.uid(),
        'dxos'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. RPC: rpc_execute_board_update
--    アプリ本体から盤面保存時に呼び出される関数。
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_execute_board_update(
    p_date text,
    p_new_state jsonb,
    p_ext_data jsonb DEFAULT '{}'::jsonb,
    p_decision_type text DEFAULT 'MANUAL_SAVE'::text,
    p_reason text DEFAULT '一時保存'::text,
    p_user_id text DEFAULT NULL,
    p_client_meta jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb AS $$
DECLARE
    v_uid uuid;
BEGIN
    -- Fallback user ID to auth.uid() if not provided
    IF p_user_id IS NULL THEN
        v_uid := auth.uid();
    ELSE
        BEGIN
            v_uid := p_user_id::uuid;
        EXCEPTION WHEN invalid_text_representation THEN
            v_uid := NULL;
        END;
    END IF;

    -- 1. routes テーブルへの UPSERT
    INSERT INTO public.routes (
        name, date, drivers, jobs, pending, splits, updated_at,
        edit_locked_by, edit_locked_at, last_activity_at,
        confirmed_at, confirmed_snapshot
    )
    VALUES (
        p_date || ' 配車',
        p_date,
        COALESCE(p_new_state->'drivers', '[]'::jsonb),
        COALESCE(p_new_state->'jobs', '[]'::jsonb),
        COALESCE(p_new_state->'pending', '[]'::jsonb),
        COALESCE(p_new_state->'splits', '[]'::jsonb),
        now(),
        (p_new_state->>'edit_locked_by')::uuid,
        (p_new_state->>'edit_locked_at')::timestamptz,
        (p_new_state->>'last_activity_at')::timestamptz,
        (p_new_state->>'confirmed_at')::timestamptz,
        p_new_state->'confirmed_snapshot'
    )
    ON CONFLICT (date) DO UPDATE SET
        drivers = COALESCE(EXCLUDED.drivers, routes.drivers),
        jobs = COALESCE(EXCLUDED.jobs, routes.jobs),
        pending = COALESCE(EXCLUDED.pending, routes.pending),
        splits = COALESCE(EXCLUDED.splits, routes.splits),
        updated_at = EXCLUDED.updated_at,
        edit_locked_by = EXCLUDED.edit_locked_by,
        edit_locked_at = EXCLUDED.edit_locked_at,
        last_activity_at = EXCLUDED.last_activity_at,
        confirmed_at = EXCLUDED.confirmed_at,
        confirmed_snapshot = EXCLUDED.confirmed_snapshot;

    -- 2. 操作ログの記録
    INSERT INTO public.board_actions (scheduled_date, action_type, payload, reason, user_id, source_app)
    VALUES (
        p_date::date,
        p_decision_type,
        p_new_state,
        p_reason,
        v_uid,
        'dxos'
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
