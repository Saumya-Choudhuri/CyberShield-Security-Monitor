import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const generateReport = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();

      switch (reportType) {
        case 'daily':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const [threatsRes, blockedRes, adminActionsRes] = await Promise.all([
        supabase
          .from('threat_logs')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('blocked_ips')
          .select('*')
          .gte('blocked_at', startDate.toISOString())
          .order('blocked_at', { ascending: false }),
        supabase
          .from('admin_actions')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
      ]);

      const threats = threatsRes.data || [];
      const blockedIPs = blockedRes.data || [];
      const adminActions = adminActionsRes.data || [];

      const report = {
        generatedAt: new Date().toISOString(),
        reportPeriod: reportType,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        summary: {
          totalThreats: threats.length,
          blockedThreats: threats.filter(t => t.blocked).length,
          allowedThreats: threats.filter(t => !t.blocked).length,
          newBlockedIPs: blockedIPs.length,
          adminActions: adminActions.length,
          severityBreakdown: {
            critical: threats.filter(t => t.severity === 'critical').length,
            high: threats.filter(t => t.severity === 'high').length,
            medium: threats.filter(t => t.severity === 'medium').length,
            low: threats.filter(t => t.severity === 'low').length,
          },
          topThreatTypes: Object.entries(
            threats.reduce((acc: Record<string, number>, t) => {
              acc[t.threat_type] = (acc[t.threat_type] || 0) + 1;
              return acc;
            }, {})
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5),
          topAttackerIPs: Object.entries(
            threats.reduce((acc: Record<string, number>, t) => {
              acc[t.ip_address] = (acc[t.ip_address] || 0) + 1;
              return acc;
            }, {})
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10),
        },
        threats: threats.map(t => ({
          timestamp: t.created_at,
          ip: t.ip_address,
          type: t.threat_type,
          severity: t.severity,
          path: t.request_path,
          blocked: t.blocked,
        })),
        blockedIPs: blockedIPs.map(b => ({
          ip: b.ip_address,
          reason: b.reason,
          threatCount: b.threat_count,
          status: b.status,
          blockedAt: b.blocked_at,
        })),
        adminActions: adminActions.map(a => ({
          timestamp: a.created_at,
          action: a.action_type,
          ip: a.ip_address,
          notes: a.notes,
        })),
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${reportType}-${now.toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <FileText size={24} className="text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Generate Security Report</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Last 24 Hours</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download size={20} className="mr-2" />
          {loading ? 'Generating...' : 'Download Report'}
        </button>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Report includes:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>Complete threat analysis with severity breakdown</li>
            <li>List of all blocked IP addresses</li>
            <li>Top threat types and attacker IPs</li>
            <li>Admin actions taken during the period</li>
            <li>Detailed event logs for investigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
