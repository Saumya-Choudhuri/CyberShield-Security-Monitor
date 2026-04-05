-- Fix policies to allow Edge Functions to insert threat logs
-- Edge functions use service_role which should bypass RLS, but we'll add explicit anon policies too

-- Allow anon (and service) to insert threat logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'threat_logs'
      AND policyname = 'Allow insert threat logs from services'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow insert threat logs from services"
      ON threat_logs
      FOR INSERT
      TO anon
      WITH CHECK (true);';
  END IF;
END
$$;

-- Allow anon to insert blocked IPs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blocked_ips'
      AND policyname = 'Allow insert blocked IPs from services'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow insert blocked IPs from services"
      ON blocked_ips
      FOR INSERT
      TO anon
      WITH CHECK (true);';
  END IF;
END
$$;

-- Allow anon to update blocked IPs (for threat count updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blocked_ips'
      AND policyname = 'Allow update blocked IPs from services'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow update blocked IPs from services"
      ON blocked_ips
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);';
  END IF;
END
$$;

-- Allow anon to update threat logs if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'threat_logs'
      AND policyname = 'Allow update threat logs from services'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow update threat logs from services"
      ON threat_logs
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);';
  END IF;
END
$$;

-- Also ensure service_role has full access (should be automatic but explicit is better)
ALTER TABLE threat_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.threat_logs TO service_role;
GRANT ALL ON public.blocked_ips TO service_role;
GRANT ALL ON public.admin_actions TO service_role;
GRANT ALL ON public.security_rules TO service_role;
