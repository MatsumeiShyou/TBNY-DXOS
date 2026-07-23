-- ============================================================
-- ADDITIVE-ONLY MIGRATION: Add missing production tables and columns
-- ============================================================

-- 1. board_actions: add 'date' column (app expects 'date', while table had 'scheduled_date')
ALTER TABLE public.board_actions ADD COLUMN IF NOT EXISTS date date;

-- 2. routes: add 'confirmed_snapshot' and lock state columns
ALTER TABLE public.routes 
    ADD COLUMN IF NOT EXISTS confirmed_snapshot jsonb,
    ADD COLUMN IF NOT EXISTS edit_locked_at timestamptz,
    ADD COLUMN IF NOT EXISTS edit_locked_by uuid,
    ADD COLUMN IF NOT EXISTS last_activity_at timestamptz,
    ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

-- 3. exception_reason_masters
CREATE TABLE IF NOT EXISTS public.exception_reason_masters (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    label text NOT NULL,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. master_items
CREATE TABLE IF NOT EXISTS public.master_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    unit text,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. master_collection_points
CREATE TABLE IF NOT EXISTS public.master_collection_points (
    location_id text NOT NULL PRIMARY KEY,
    id uuid,
    name text NOT NULL,
    display_name text,
    furigana text,
    address text,
    latitude numeric,
    longitude numeric,
    area text,
    company_phone text,
    manager_phone text,
    site_contact_phone text,
    weighing_site_id text,
    is_spot boolean,
    is_spot_only boolean,
    is_active boolean DEFAULT true,
    note text,
    safety_note text,
    entry_instruction text,
    time_constraint_type text,
    time_range_start text,
    time_range_end text,
    visit_slot text,
    vehicle_restriction_type text,
    restricted_vehicle_id uuid,
    target_item_category text,
    special_type text,
    contractor_id uuid,
    default_route_code text,
    collection_days jsonb,
    recurrence_pattern text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
