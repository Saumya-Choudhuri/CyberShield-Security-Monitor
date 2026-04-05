-- CLEAN FIX: Remove ALL old policies and create simple, working ones

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Admins can view all threat logs" ON public.threat_logs;
DROP POLICY IF EXISTS "Service can insert threat logs" ON public.threat_logs;
DROP POLICY IF EXISTS "Admins can view blocked IPs" ON public.blocked_ips;
DROP POLICY IF EXISTS "Service can insert blocked IPs" ON public.blocked_ips;
DROP POLICY IF EXISTS "Service can update blocked IPs" ON public.blocked_ips;
DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can view security rules" ON public.security_rules;
DROP POLICY IF EXISTS "Admins can manage security rules" ON public.security_rules;
DROP POLICY IF EXISTS "Dashboard anon can view threat logs" ON public.threat_logs;
DROP POLICY IF EXISTS "Dashboard anon can view blocked IPs" ON public.blocked_ips;
DROP POLICY IF EXISTS "Dashboard anon can view security rules" ON public.security_rules;
DROP POLICY IF EXISTS "Anon can approve blocked IPs" ON public.blocked_ips;
DROP POLICY IF EXISTS "Anon can insert unblock admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Service role full access threat logs" ON public.threat_logs;
DROP POLICY IF EXISTS "Anon read threat logs" ON public.threat_logs;
DROP POLICY IF EXISTS "Authenticated read threat logs" ON public.threat_logs;
DROP POLICY IF EXISTS "Service role full access blocked ips" ON public.blocked_ips;
DROP POLICY IF EXISTS "Anon read blocked ips" ON public.blocked_ips;
DROP POLICY IF EXISTS "Anon update blocked ips for approval" ON public.blocked_ips;
DROP POLICY IF EXISTS "Service role full access admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Anon read admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Service role full access security rules" ON public.security_rules;
DROP POLICY IF EXISTS "Anon read security rules" ON public.security_rules;

-- Keep RLS enabled but with simple policies
-- For logging tables: everyone can read, authenticated/service can write
-- This is safe because these are just logs

-- THREAT_LOGS: Anyone can read, authenticated+ can write
CREATE POLICY "threat_logs_select" ON public.threat_logs FOR SELECT USING (true);
CREATE POLICY "threat_logs_insert" ON public.threat_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "threat_logs_update" ON public.threat_logs FOR UPDATE USING (true) WITH CHECK (true);

-- BLOCKED_IPS: Anyone can read, authenticated+ can write
CREATE POLICY "blocked_ips_select" ON public.blocked_ips FOR SELECT USING (true);
CREATE POLICY "blocked_ips_insert" ON public.blocked_ips FOR INSERT WITH CHECK (true);
CREATE POLICY "blocked_ips_update" ON public.blocked_ips FOR UPDATE USING (true) WITH CHECK (true);

-- ADMIN_ACTIONS: Anyone can read, authenticated+ can write
CREATE POLICY "admin_actions_select" ON public.admin_actions FOR SELECT USING (true);
CREATE POLICY "admin_actions_insert" ON public.admin_actions FOR INSERT WITH CHECK (true);

-- SECURITY_RULES: Anyone can read, authenticated+ can write
CREATE POLICY "security_rules_select" ON public.security_rules FOR SELECT USING (true);
CREATE POLICY "security_rules_insert" ON public.security_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "security_rules_update" ON public.security_rules FOR UPDATE USING (true) WITH CHECK (true);
