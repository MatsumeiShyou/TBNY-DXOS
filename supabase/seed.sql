-- ============================================================
-- Seed data for local development (Docker Supabase)
-- ============================================================
-- NOTE: ユーザーアカウントの作成は seed.sql では行いません。
--       Supabase GoTrue は auth.users への直接INSERTでは
--       auth.identities を生成しないため、ログインできません。
--       アカウント作成は db reset 後に以下を実行してください:
--         node supabase/setup_local_accounts.mjs
-- ============================================================

-- 1. profiles entries (auth accounts とは独立して作成可能)
INSERT INTO public.profiles (id, name, role, can_edit_board)
VALUES ('local-admin', 'デモ管理者', 'admin', true)
ON CONFLICT (id) DO NOTHING;

-- 2. master_vehicles
INSERT INTO public.master_vehicles (id, number, callsign, is_active) VALUES
('a0000001-0000-0000-0000-000000000001', '12-34', '1号車', true),
('a0000001-0000-0000-0000-000000000002', '56-78', '2号車', true)
ON CONFLICT (id) DO NOTHING;

-- 3. drivers
INSERT INTO public.drivers (id, driver_name, vehicle_number, route_name, display_color, display_order, is_active) VALUES
('d-001', '田中太郎', '12-34', 'Aコース', 'blue', 1, true),
('d-002', '佐藤次郎', '56-78', 'Bコース', 'green', 2, true)
ON CONFLICT (id) DO NOTHING;

-- 4. routes (demo: today's data)
INSERT INTO public.routes (name, date, drivers, jobs, pending, splits, updated_at) VALUES
('2026-07-22 配車',
 '2026-07-22',
 '[{"id": "d-001", "name": "d-001", "driverName": "田中太郎", "currentVehicle": "12-34", "course": "Aコース", "color": "blue"}]',
 '[{"id": "job-1", "title": "回収テスト", "status": "planned", "taskType": "collection", "driverId": "d-001"}]',
 '[]',
 '[]',
 now()
) ON CONFLICT DO NOTHING;

-- 5. board_daily_summaries
INSERT INTO public.board_daily_summaries (route_date, total_jobs, completed_jobs, skipped_jobs) VALUES
('2026-07-22', 1, 0, 0),
('2026-07-21', 10, 10, 0)
ON CONFLICT (route_date) DO NOTHING;
