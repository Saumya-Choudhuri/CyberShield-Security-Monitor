-- SAFER approach: Keep RLS enabled but add explicit service_role policies
-- This is more secure than disabling RLS

-- Re-enable RLS on all tables (it should already be on, but let's be explicit)
ALTER TABLE public.threat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_rules ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive policies from previous migration
DROP POLICY IF EXISTS "Service can write threat logs" ON public.threat_logs;
DROP POLICY IF EXISTS "Service can write blocked ips" ON public.blocked_ips;
DROP POLICY IF EXISTS "Allow insert threat logs from services" ON public.threat_logs;
DROP POLICY IF EXISTS "Allow insert blocked IPs from services" ON public.blocked_ips;
DROP POLICY IF EXISTS "Allow update blocked IPs from services" ON public.blocked_ips;
DROP POLICY IF EXISTS "Allow update threat logs from services" ON public.threat_logs;

-- Create proper role-specific policies
-- For threat_logs: allow service_role full access, anon read-only
CREATE POLICY "Service role full access threat logs"
  ON public.threat_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anon read threat logs"
  ON public.threat_logs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated read threat logs"
  ON public.threat_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- For blocked_ips: allow service_role full access, anon read + update for approval
CREATE POLICY "Service role full access blocked ips"
  ON public.blocked_ips
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anon read blocked ips"
  ON public.blocked_ips
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon update blocked ips for approval"
  ON public.blocked_ips
  FOR UPDATE
  TO anon
  USING (status = 'blocked')
  WITH CHECK (status = 'approved');

-- For admin_actions: allow service_role full access, anon read
CREATE POLICY "Service role full access admin actions"
  ON public.admin_actions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anon read admin actions"
  ON public.admin_actions
  FOR SELECT
  TO anon
  USING (true);

-- For security_rules: allow service_role full access, anon read
CREATE POLICY "Service role full access security rules"
  ON public.security_rules
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anon read security rules"
  ON public.security_rules
  FOR SELECT
  TO anon
  USING (true);

-- Grant explicit permissions to service_role
GRANT ALL ON public.threat_logs TO service_role;
GRANT ALL ON public.blocked_ips TO service_role;
GRANT ALL ON public.admin_actions TO service_role;
GRANT ALL ON public.security_rules TO service_role;

-- Grant read permissions to anon
GRANT SELECT ON public.threat_logs TO anon;
GRANT SELECT, UPDATE ON public.blocked_ips TO anon;
GRANT SELECT ON public.admin_actions TO anon;
GRANT SELECT ON public.security_rules TO anon;
