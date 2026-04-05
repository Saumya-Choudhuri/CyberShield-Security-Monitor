-- Add a function to allow users to delete their own data
CREATE OR REPLACE FUNCTION delete_user_data()
RETURNS json AS $$
DECLARE
  user_ip text;
  deleted_threat_logs int;
  deleted_blocked_ips int;
  deleted_admin_actions int;
BEGIN
  -- Get the user's IP from context (if available)
  user_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
  
  IF user_ip IS NULL THEN
    user_ip := current_setting('request.headers', true)::json->>'x-real-ip';
  END IF;
  
  IF user_ip IS NULL THEN
    RETURN json_build_object('error', 'Could not determine IP address');
  END IF;

  -- Delete threat logs for this IP
  DELETE FROM public.threat_logs WHERE ip_address = user_ip;
  GET DIAGNOSTICS deleted_threat_logs = ROW_COUNT;

  -- Delete blocked_ips entry for this IP
  DELETE FROM public.blocked_ips WHERE ip_address = user_ip;
  GET DIAGNOSTICS deleted_blocked_ips = ROW_COUNT;

  -- Delete admin actions related to this IP
  DELETE FROM public.admin_actions WHERE ip_address = user_ip;
  GET DIAGNOSTICS deleted_admin_actions = ROW_COUNT;

  -- Log the deletion request in a new audit table
  INSERT INTO public.data_deletion_requests (ip_address, deletion_date, reason)
  VALUES (user_ip, now(), 'User requested data deletion');

  RETURN json_build_object(
    'success', true,
    'message', 'All your data has been deleted',
    'deleted_threat_logs', deleted_threat_logs,
    'deleted_blocked_ips', deleted_blocked_ips,
    'deleted_admin_actions', deleted_admin_actions,
    'ip_address', user_ip
  );
END;
$$ LANGUAGE plpgsql;

-- Create table to track deletion requests (for privacy audit)
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  deletion_date timestamptz DEFAULT now(),
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on deletion requests
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read deletion requests (public record)
CREATE POLICY "Anyone can read deletion requests"
  ON public.data_deletion_requests FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.data_deletion_requests TO anon, authenticated;
