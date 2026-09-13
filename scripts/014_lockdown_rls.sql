
-- ==========================================
-- 014_lockdown_rls.sql
-- Security Lockdown for RLS and Permissions
-- ==========================================

-- 1. Revoke anon access from ALL tables in public schema
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.' || quote_ident(r.tablename) || ' FROM anon;';
    END LOOP;
END
\$\$ ;

-- 2. Ensure RLS is enabled on all tables
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END
\$\$ ;

-- 3. Lock down event_logs to INSERT only for authenticated users
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.event_logs;
CREATE POLICY "Allow authenticated insert only" ON public.event_logs
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read only" ON public.event_logs
FOR SELECT TO authenticated USING (true);
