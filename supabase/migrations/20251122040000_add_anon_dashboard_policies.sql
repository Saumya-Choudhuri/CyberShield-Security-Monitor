-- Allow the public dashboard (anon key) to read monitoring tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'threat_logs'
      AND policyname = 'Dashboard anon can view threat logs'
  ) THEN
    EXECUTE 'CREATE POLICY "Dashboard anon can view threat logs"
      ON threat_logs
      FOR SELECT
      TO anon
      USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blocked_ips'
      AND policyname = 'Dashboard anon can view blocked IPs'
  ) THEN
    EXECUTE 'CREATE POLICY "Dashboard anon can view blocked IPs"
      ON blocked_ips
      FOR SELECT
      TO anon
      USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'security_rules'
      AND policyname = 'Dashboard anon can view security rules'
  ) THEN
    EXECUTE 'CREATE POLICY "Dashboard anon can view security rules"
      ON security_rules
      FOR SELECT
      TO anon
      USING (true);';
  END IF;
END
$$;
