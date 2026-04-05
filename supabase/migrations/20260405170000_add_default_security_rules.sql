-- Add default security rules for threat detection
INSERT INTO public.security_rules (rule_name, rule_type, pattern, severity, enabled)
VALUES
  -- SQL Injection patterns
  ('SQL Injection', 'pattern_match', '(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|onload|onerror|alert|prompt|confirm)', 'critical', true),
  
  -- XSS patterns
  ('Cross-Site Scripting', 'pattern_match', '(<script|javascript:|on\w+\s*=|<iframe|<object|<embed)', 'critical', true),
  
  -- Path traversal
  ('Path Traversal', 'pattern_match', '(\.\./|\.\.\\|%2e%2e|\.\.%2f|%252e%252e)', 'high', true),
  
  -- Common scanner user agents
  ('Scanner Detection', 'pattern_match', '(sqlmap|nikto|nmap|masscan|nessus|openvas|qualys|burp|zaproxy|w3af|metasploit|dirbuster)', 'medium', true),
  
  -- Command injection
  ('Command Injection', 'pattern_match', '(;|\||&&|`|%0a|%0d|\$\(|exec|system|shell_exec|passthru|proc_open)', 'high', true),
  
  -- XXE attacks
  ('XXE Attack', 'pattern_match', '(<!ENTITY|SYSTEM|PUBLIC|\%xxe|\%file)', 'high', true);

-- Verify rules were added
SELECT COUNT(*) as total_rules FROM public.security_rules WHERE enabled = true;
