-- Protocol: SDR (State / Decision / Reason) Synchronization
-- Description: Standardize staffs table and implement SECURE master update RPC (ADR-0012)
-- Author: Antigravity Agent
-- Date: 2026-04-29

-- 1. staffsテーブルに is_active カラムを追加
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. セキュアなマスタ更新用 RPC プロシージャの実装 (ADR-0012)
CREATE OR REPLACE FUNCTION rpc_execute_master_update(
    p_table_name text,
    p_id uuid,
    p_core_data jsonb,
    p_ext_data jsonb,
    p_decision_type text,
    p_reason text,
    p_user_id uuid
) RETURNS void AS 
SET search_path = public
$$
DECLARE
    v_staff_id uuid;
    v_new_id uuid;
    v_query text;
    v_cols text;
    v_vals text;
    v_updates text;
    v_invalid_col text;
BEGIN
    -- A. テーブル・ホワイトリスト (ADR-0012: DXOS_VAL_01)
    IF p_table_name NOT IN ('staffs', 'vehicles', 'locations', 'payers', 'suppliers') THEN
        RAISE EXCEPTION 'DXOS_VAL_01: Unauthorized table access [%]', p_table_name;
    END IF;

    -- B. カラム・整合性検証 (ADR-0012: DXOS_VAL_02)
    SELECT key INTO v_invalid_col 
    FROM jsonb_object_keys(p_core_data) AS key
    WHERE key NOT IN (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = p_table_name 
        AND table_schema = 'public'
    ) 
    LIMIT 1;

    IF v_invalid_col IS NOT EXISTS THEN -- jsonb_object_keys might return null if empty, but we check if any found
        -- noop
    ELSIF v_invalid_col IS NOT NULL THEN
        RAISE EXCEPTION 'DXOS_VAL_02: Invalid column [%] in table [%]', v_invalid_col, p_table_name;
    END IF;

    -- C. auth.uid() から staff_id を取得
    SELECT id INTO v_staff_id FROM staffs WHERE auth_uid = p_user_id;
    IF v_staff_id IS NULL THEN
        RAISE EXCEPTION 'DXOS_AUTH_01: Active staff record not found for auth_uid: %', p_user_id;
    END IF;

    -- D. マスタテーブルの更新/挿入
    IF p_id IS NULL THEN
        -- INSERT 処理
        SELECT string_agg(quote_ident(key), ', '), string_agg(quote_literal(value), ', ')
        FROM jsonb_each_text(p_core_data)
        INTO v_cols, v_vals;

        v_query := format('INSERT INTO %I (%s) VALUES (%s) RETURNING id', p_table_name, v_cols, v_vals);
        EXECUTE v_query INTO v_new_id;
    ELSE
        -- UPDATE 処理
        SELECT string_agg(format('%I = %L', key, value), ', ')
        FROM jsonb_each_text(p_core_data)
        INTO v_updates;

        v_query := format('UPDATE %I SET %s, updated_at = now() WHERE id = %L', p_table_name, v_updates, p_id);
        EXECUTE v_query;
        v_new_id := p_id;
    END IF;

    -- E. event_logs への SDR 証跡記録
    INSERT INTO event_logs (
        actor_id,
        decision_code,
        reason_code,
        reason_note,
        target_table,
        target_id,
        payload
    ) VALUES (
        v_staff_id,
        p_decision_type,
        'MANUAL_ENTRY',
        p_reason,
        p_table_name,
        v_new_id,
        p_core_data || p_ext_data
    );

    -- F. staffs テーブルの last_event_id 更新
    UPDATE staffs SET last_event_id = (SELECT id FROM event_logs WHERE target_id = v_new_id ORDER BY created_at DESC LIMIT 1)
    WHERE id = v_staff_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 既存データへの適用
UPDATE staffs SET is_active = true WHERE is_active IS NULL;
