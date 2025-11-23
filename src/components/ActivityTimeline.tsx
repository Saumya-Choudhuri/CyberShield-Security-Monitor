import { ThreatLog } from '../types/security';
import { Shield, AlertTriangle, Clock } from 'lucide-react';

interface ActivityTimelineProps {
  threats: ThreatLog[];
}

export function ActivityTimeline({ threats }: ActivityTimelineProps) {
  const recentActivity = threats.slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Real-Time Activity Feed</h2>
      <div className="space-y-4">
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          recentActivity.map((threat, index) => (
            <div key={threat.id} className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  threat.blocked ? 'bg-red-100' : 'bg-yellow-100'
                }`}
              >
                {threat.blocked ? (
                  <Shield size={20} className="text-red-600" />
                ) : (
                  <AlertTriangle size={20} className="text-yellow-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {threat.blocked ? 'Blocked' : 'Detected'} {threat.threat_type}
                  </p>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {new Date(threat.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  IP: {threat.ip_address} • {threat.request_method} {threat.request_path}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
