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
    console.log('🔍 Fetching security data...');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log('📊 Making Supabase queries...');

      const [threatsRes, blockedRes, todayThreatsRes, criticalRes] = await Promise.all([
        supabase.from('threat_logs').select('*', { count: 'exact', head: true }),
        supabase.from('blocked_ips').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
        supabase.from('threat_logs').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('threat_logs').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
      ]);

      console.log('✅ Query results:', {
        totalThreats: threatsRes.count,
        blockedIPs: blockedRes.count,
        threatsToday: todayThreatsRes.count,
        criticalThreats: criticalRes.count
      });

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

      console.log('📋 Fetched data:', {
        threatsCount: threats?.length || 0,
        blockedCount: blocked?.length || 0
      });

      setRecentThreats(threats || []);
      setBlockedIPs(blocked || []);
      console.log('✅ Data fetch complete');
    } catch (error) {
      console.error('❌ Error fetching security data:', error);
      // Set some default data so the app doesn't stay blank
      setStats({
        totalThreats: 0,
        blockedIPs: 0,
        threatsToday: 0,
        criticalThreats: 0,
      });
      setRecentThreats([]);
      setBlockedIPs([]);
    } finally {
      console.log('🏁 Setting loading to false');
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
