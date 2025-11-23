/*
  # Cybersecurity Threat Detection System

  1. New Tables
    - `threat_logs`
      - `id` (uuid, primary key) - Unique identifier for each threat event
      - `ip_address` (text) - IP address of the attacker
      - `threat_type` (text) - Type of threat detected (SQL Injection, XSS, DDoS, etc.)
      - `severity` (text) - Severity level (low, medium, high, critical)
      - `request_path` (text) - URL path that was targeted
      - `request_method` (text) - HTTP method used
      - `user_agent` (text) - Browser/client user agent
      - `payload` (jsonb) - Complete request details
      - `blocked` (boolean) - Whether the request was blocked
      - `created_at` (timestamptz) - When the threat was detected
    
    - `blocked_ips`
      - `id` (uuid, primary key) - Unique identifier
      - `ip_address` (text, unique) - Blocked IP address
      - `reason` (text) - Reason for blocking
      - `threat_count` (integer) - Number of threats from this IP
      - `status` (text) - Status: blocked, pending_review, approved
      - `blocked_at` (timestamptz) - When the IP was blocked
      - `approved_by` (uuid) - Admin who approved unblocking
      - `approved_at` (timestamptz) - When unblocking was approved
      - `metadata` (jsonb) - Additional information
    
    - `admin_actions`
      - `id` (uuid, primary key) - Unique identifier
      - `admin_id` (uuid) - Admin who took the action
      - `action_type` (text) - Type of action (unblock, whitelist, etc.)
      - `ip_address` (text) - IP address affected
      - `notes` (text) - Admin notes
      - `created_at` (timestamptz) - When the action was taken
    
    - `security_rules`
      - `id` (uuid, primary key) - Unique identifier
      - `rule_name` (text) - Name of the security rule
      - `rule_type` (text) - Type of rule (rate_limit, pattern_match, etc.)
      - `pattern` (text) - Pattern to match against
      - `severity` (text) - Severity level to assign
      - `enabled` (boolean) - Whether the rule is active
      - `created_at` (timestamptz) - When the rule was created

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admins to manage the system
    - Add policies for the security service to log threats
*/

CREATE TABLE IF NOT EXISTS threat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  threat_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  request_path text NOT NULL,
  request_method text NOT NULL,
  user_agent text,
  payload jsonb DEFAULT '{}'::jsonb,
  blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text UNIQUE NOT NULL,
  reason text NOT NULL,
  threat_count integer DEFAULT 1,
  status text DEFAULT 'blocked',
  blocked_at timestamptz DEFAULT now(),
  approved_by uuid,
  approved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action_type text NOT NULL,
  ip_address text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_type text NOT NULL,
  pattern text NOT NULL,
  severity text DEFAULT 'medium',
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_threat_logs_ip ON threat_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_threat_logs_created ON threat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_status ON blocked_ips(status);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips(ip_address);

ALTER TABLE threat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all threat logs"
  ON threat_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service can insert threat logs"
  ON threat_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view blocked IPs"
  ON blocked_ips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service can insert blocked IPs"
  ON blocked_ips FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service can update blocked IPs"
  ON blocked_ips FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view all admin actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert admin actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view security rules"
  ON security_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage security rules"
  ON security_rules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO security_rules (rule_name, rule_type, pattern, severity) VALUES
  ('SQL Injection Detection', 'pattern_match', '(union|select|insert|update|delete|drop|exec|script)', 'critical'),
  ('XSS Detection', 'pattern_match', '(<script|javascript:|onerror|onload)', 'high'),
  ('Path Traversal', 'pattern_match', '(\.\./|\.\.\\)', 'high'),
  ('Rate Limit Violation', 'rate_limit', '100', 'medium'),
  ('Suspicious User Agent', 'pattern_match', '(bot|crawler|scanner|nikto|sqlmap)', 'medium')
ON CONFLICT DO NOTHING;