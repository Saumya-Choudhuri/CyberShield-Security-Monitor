import { ThreatLog } from '../types/security';
import { Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ThreatLogTableProps {
  threats: ThreatLog[];
  onSelect?: (threat: ThreatLog) => void;
}

const severityConfig = {
  low: { color: '#3B82F6', icon: Info, bg: '#EFF6FF' },
  medium: { color: '#F59E0B', icon: AlertCircle, bg: '#FFFBEB' },
  high: { color: '#EF4444', icon: AlertTriangle, bg: '#FEF2F2' },
  critical: { color: '#DC2626', icon: Shield, bg: '#FEE2E2' },
};

export function ThreatLogTable({ threats, onSelect }: ThreatLogTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Recent Threat Detections</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Threat Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {threats.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No threats detected yet
                </td>
              </tr>
            ) : (
              threats.map((threat) => {
                const config = severityConfig[threat.severity];
                const Icon = config.icon;
                return (
                  <tr
                    key={threat.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelect?.(threat)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(threat.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {threat.ip_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {threat.threat_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: config.bg, color: config.color }}
                      >
                        <Icon size={14} className="mr-1" />
                        {threat.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {threat.request_path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {threat.blocked ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Allowed
                        </span>
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
