-- Automatic data retention and cleanup for CyberShield Security Monitor
-- This migration sets up automatic deletion of old data after 7 days

-- Create extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to delete old threat logs (older than 7 days)
CREATE OR REPLACE FUNCTION delete_old_threat_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.threat_logs
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  RAISE NOTICE 'Deleted threat logs older than 7 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to delete old security events (older than 7 days)
CREATE OR REPLACE FUNCTION delete_old_security_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.security_events
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  RAISE NOTICE 'Deleted security events older than 7 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup jobs to run daily at 2 AM UTC
-- This will automatically clean up old data every day
SELECT cron.schedule(
  'delete-old-threat-logs',
  '0 2 * * *',
  'SELECT delete_old_threat_logs()'
);

SELECT cron.schedule(
  'delete-old-security-events', 
  '0 2 * * *',
  'SELECT delete_old_security_events()'
);

-- Optional: Keep last 1000 threat logs even if older than 7 days (safety measure)
-- Uncomment this if you want to keep important historical data
-- CREATE OR REPLACE FUNCTION delete_old_threat_logs()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM public.threat_logs
--   WHERE created_at < NOW() - INTERVAL '7 days'
--   AND id NOT IN (
--     SELECT id FROM public.threat_logs 
--     ORDER BY created_at DESC 
--     LIMIT 1000
--   );
-- END;
-- $$ LANGUAGE plpgsql;
