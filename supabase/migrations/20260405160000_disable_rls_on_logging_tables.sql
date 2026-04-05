-- Disable RLS on logging tables to allow service to write
-- These tables only contain threat logs and blocked IPs - not sensitive user data
-- Service role should be able to write freely

ALTER TABLE public.threat_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions DISABLE ROW LEVEL SECURITY;

-- But keep SELECT RLS policies for dashboard anon access
-- So anon can still read threat logs with these policies

-- Re-enable with new policies that allow service writes
ALTER TABLE public.threat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can write threat logs"
  ON public.threat_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can write blocked ips"
  ON public.blocked_ips
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant full permissions to all roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.threat_logs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_ips TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_actions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_rules TO anon, authenticated, service_role;
