-- Allow anon to update blocked_ips status from blocked to approved
CREATE POLICY "Anon can approve blocked IPs"
  ON blocked_ips FOR UPDATE
  TO anon
  USING (status = 'blocked')
  WITH CHECK (status = 'approved');

-- Allow anon to insert admin actions for unblock
CREATE POLICY "Anon can insert unblock admin actions"
  ON admin_actions FOR INSERT
  TO anon
  WITH CHECK (action_type = 'unblock');
