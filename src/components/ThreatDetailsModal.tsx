import { ThreatLog } from '../types/security';
import { X } from 'lucide-react';

interface ThreatDetailsModalProps {
  threat: ThreatLog | null;
  onClose: () => void;
}

export function ThreatDetailsModal({ threat, onClose }: ThreatDetailsModalProps) {
  if (!threat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Threat Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <p className="mt-1 text-sm font-mono bg-gray-50 p-2 rounded">{threat.ip_address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <p className="mt-1 text-sm bg-gray-50 p-2 rounded">
                  {new Date(threat.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Threat Type</label>
                <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{threat.threat_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Severity</label>
                <p className="mt-1 text-sm bg-gray-50 p-2 rounded capitalize">{threat.severity}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Request Path</label>
              <p className="mt-1 text-sm bg-gray-50 p-2 rounded break-all">{threat.request_path}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Request Method</label>
              <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{threat.request_method}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">User Agent</label>
              <p className="mt-1 text-sm bg-gray-50 p-2 rounded break-all">
                {threat.user_agent || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1">
                {threat.blocked ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Allowed
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Request Payload</label>
              <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                {JSON.stringify(threat.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
