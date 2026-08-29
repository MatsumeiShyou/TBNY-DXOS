-- フェーズ5(Auth/RLS)までの暫定措置として、全テーブルのRLSを無効化（または全許可ポリシーを設定）
-- 今回は、RLSがデフォルトで有効になっていてアクセス拒否されるのを防ぐため、明示的にポリシーを追加します。

-- まずRLSを有効化
ALTER TABLE master_payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_resource_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weighing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;

-- 誰でもアクセス可能な全許可ポリシー（フェーズ5で適切なロールベースポリシーに置き換えます）
CREATE POLICY "Allow all operations for anon" ON master_payers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON master_contractors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON master_collection_points FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON master_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON master_workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON master_vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON master_resource_availability FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON daily_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON weighing_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON actuals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON template_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON event_logs FOR ALL USING (true) WITH CHECK (true);
