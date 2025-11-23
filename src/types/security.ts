export interface ThreatLog {
  id: string;
  ip_address: string;
  threat_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  request_path: string;
  request_method: string;
  user_agent: string | null;
  payload: Record<string, unknown>;
  blocked: boolean;
  created_at: string;
}

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  threat_count: number;
  status: 'blocked' | 'pending_review' | 'approved';
  blocked_at: string;
  approved_by: string | null;
  approved_at: string | null;
  metadata: Record<string, unknown>;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  ip_address: string;
  notes: string | null;
  created_at: string;
}

export interface SecurityRule {
  id: string;
  rule_name: string;
  rule_type: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalThreats: number;
  blockedIPs: number;
  threatsToday: number;
  criticalThreats: number;
}
