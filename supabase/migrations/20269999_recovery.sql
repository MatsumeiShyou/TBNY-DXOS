-- ==========================================
-- RECOVERY SQL: Create missing master tables
-- ==========================================
-- 執行場所: Supabase Dashboard -> SQL Editor
-- 目的: 物理的に欠落しているマスタテーブル群の復旧

-- 1. Payers (支払先)
CREATE TABLE IF NOT EXISTS payers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    code text UNIQUE NOT NULL,
    closing_date integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_event_id uuid,
    is_active boolean DEFAULT true
);

-- 2. Suppliers (仕入先)
CREATE TABLE IF NOT EXISTS suppliers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    code text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_event_id uuid,
    is_active boolean DEFAULT true
);

-- 3. Locations (現場/回収先)
CREATE TABLE IF NOT EXISTS locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    address text,
    weighing_allowed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_event_id uuid,
    is_active boolean DEFAULT true
);

-- 4. RLS Enablement
ALTER TABLE payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- 5. Basic Policies (Authenticated users can do everything for now - Adjust as needed)
DO $$ 
BEGIN
    -- Payers Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all for auth users' AND tablename = 'payers') THEN
        CREATE POLICY "Enable all for auth users" ON payers FOR ALL TO authenticated USING (true);
    END IF;
    -- Suppliers Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all for auth users' AND tablename = 'suppliers') THEN
        CREATE POLICY "Enable all for auth users" ON suppliers FOR ALL TO authenticated USING (true);
    END IF;
    -- Locations Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all for auth users' AND tablename = 'locations') THEN
        CREATE POLICY "Enable all for auth users" ON locations FOR ALL TO authenticated USING (true);
    END IF;
END $$;
