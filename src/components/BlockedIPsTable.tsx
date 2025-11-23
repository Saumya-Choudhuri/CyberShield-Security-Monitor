import { BlockedIP } from '../types/security';
import { Ban, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BlockedIPsTableProps {
  blockedIPs: BlockedIP[];
  onUpdate: () => void;
}

const statusConfig = {
  blocked: { color: '#EF4444', icon: Ban, label: 'Blocked', bg: '#FEE2E2' },
  pending_review: { color: '#F59E0B', icon: Clock, label: 'Pending Review', bg: '#FFFBEB' },
  approved: { color: '#10B981', icon: CheckCircle, label: 'Approved', bg: '#D1FAE5' },
};

export function BlockedIPsTable({ blockedIPs, onUpdate }: BlockedIPsTableProps) {
  const handleApprove = async (ip: BlockedIP) => {
    try {
      await supabase
        .from('blocked_ips')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', ip.id);

      await supabase.from('admin_actions').insert({
        admin_id: '00000000-0000-0000-0000-000000000000',
        action_type: 'unblock',
        ip_address: ip.ip_address,
        notes: `Approved unblock for ${ip.ip_address}`,
      });

      onUpdate();
    } catch (error) {
      console.error('Error approving IP:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Blocked IP Addresses</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Threat Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blocked At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blockedIPs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No blocked IPs
                </td>
              </tr>
            ) : (
              blockedIPs.map((ip) => {
                const config = statusConfig[ip.status];
                const Icon = config.icon;
                return (
                  <tr key={ip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {ip.ip_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      {ip.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {ip.threat_count} threats
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(ip.blocked_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: config.bg, color: config.color }}
                      >
                        <Icon size={14} className="mr-1" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {ip.status === 'blocked' && (
                        <button
                          onClick={() => handleApprove(ip)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Approve Unblock
                        </button>
                      )}
                      {ip.status === 'approved' && (
                        <span className="text-green-600">Unblocked</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
