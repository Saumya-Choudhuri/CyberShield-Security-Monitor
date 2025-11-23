import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ThreatLog, BlockedIP, DashboardStats } from '../types/security';

export function useSecurityData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalThreats: 0,
    blockedIPs: 0,
    threatsToday: 0,
    criticalThreats: 0,
  });
  const [recentThreats, setRecentThreats] = useState<ThreatLog[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [threatsRes, blockedRes, todayThreatsRes, criticalRes] = await Promise.all([
        supabase.from('threat_logs').select('*', { count: 'exact', head: true }),
        supabase.from('blocked_ips').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
        supabase.from('threat_logs').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('threat_logs').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
      ]);

      setStats({
        totalThreats: threatsRes.count || 0,
        blockedIPs: blockedRes.count || 0,
        threatsToday: todayThreatsRes.count || 0,
        criticalThreats: criticalRes.count || 0,
      });

      const { data: threats } = await supabase
        .from('threat_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: blocked } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });

      setRecentThreats(threats || []);
      setBlockedIPs(blocked || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const threatChannel = supabase
      .channel('threat_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threat_logs' }, () => {
        fetchData();
      })
      .subscribe();

    const blockedChannel = supabase
      .channel('blocked_ips_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_ips' }, () => {
        fetchData();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(threatChannel);
      supabase.removeChannel(blockedChannel);
    };
  }, [fetchData]);

  return { stats, recentThreats, blockedIPs, loading, refetch: fetchData };
}
