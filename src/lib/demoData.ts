import { BlockedIP, DashboardStats, ThreatLog } from '../types/security';

export const demoStats: DashboardStats = {
  totalThreats: 248,
  blockedIPs: 12,
  threatsToday: 34,
  criticalThreats: 7,
};

export const demoThreats: ThreatLog[] = [
  {
    id: 'demo-threat-1',
    ip_address: '203.0.113.42',
    threat_type: 'SQL Injection',
    severity: 'critical',
    request_path: '/api/users?sort=1',
    request_method: 'GET',
    user_agent: 'Mozilla/5.0 (Demo Scanner)',
    payload: { source: 'demo fixture', pattern: 'union select' },
    blocked: true,
    created_at: '2026-10-05T14:42:00.000Z',
  },
  {
    id: 'demo-threat-2',
    ip_address: '198.51.100.27',
    threat_type: 'Failed Login Attempt',
    severity: 'high',
    request_path: '/auth/login',
    request_method: 'POST',
    user_agent: 'curl/8.4.0',
    payload: { source: 'demo fixture', attempts: 5 },
    blocked: true,
    created_at: '2026-10-05T13:18:00.000Z',
  },
  {
    id: 'demo-threat-3',
    ip_address: '192.0.2.88',
    threat_type: 'Path Traversal',
    severity: 'medium',
    request_path: '/download?file=../../etc/passwd',
    request_method: 'GET',
    user_agent: 'Demo Security Researcher',
    payload: { source: 'demo fixture', pattern: '../' },
    blocked: false,
    created_at: '2026-10-05T11:06:00.000Z',
  },
];

export const demoBlockedIPs: BlockedIP[] = [
  {
    id: 'demo-ip-1',
    ip_address: '203.0.113.42',
    reason: 'SQL Injection, repeated access attempts',
    threat_count: 18,
    status: 'blocked',
    blocked_at: '2026-10-05T14:42:00.000Z',
    approved_by: null,
    approved_at: null,
    metadata: { source: 'demo fixture' },
  },
  {
    id: 'demo-ip-2',
    ip_address: '198.51.100.27',
    reason: 'Failed Login Attempt',
    threat_count: 5,
    status: 'approved',
    blocked_at: '2026-10-04T09:46:25.000Z',
    approved_by: 'demo-admin',
    approved_at: '2026-10-04T10:02:00.000Z',
    metadata: { source: 'demo fixture' },
  },
];