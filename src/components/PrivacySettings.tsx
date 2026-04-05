import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface PrivacySettingsProps {
  onClose: () => void;
}

export function PrivacySettings({ onClose }: PrivacySettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handleDeleteData = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      const deleteUrl =
        import.meta.env.VITE_SUPABASE_URL +
        '/functions/v1/delete-user-data';

      const response = await fetch(deleteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          confirm_deletion: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          '✅ All your data has been permanently deleted. Your IP address and all activities have been removed.'
        );
        setMessageType('success');
        setShowConfirm(false);
        
        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.error || 'Failed to delete data');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error deleting data. Please try again.');
      setMessageType('error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Privacy Settings</h2>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            🗑️ Delete All My Data
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Permanently delete all your activities, threat logs, and blocked IP status from our system.
          </p>
          <p className="text-red-400 text-xs mb-4">
            ⚠️ <strong>WARNING:</strong> This action cannot be undone!
          </p>

          <div className="bg-slate-600 rounded p-3 mb-4">
            <p className="text-gray-300 text-xs">
              <strong>This will delete:</strong>
            </p>
            <ul className="text-gray-400 text-xs mt-2 space-y-1">
              <li>✓ All threat logs associated with your IP</li>
              <li>✓ Your blocked IP status (if any)</li>
              <li>✓ All activity records</li>
              <li>✓ Security event history</li>
            </ul>
          </div>

          {message && (
            <div
              className={`rounded p-3 mb-4 text-sm ${
                messageType === 'success'
                  ? 'bg-green-900 text-green-200'
                  : 'bg-red-900 text-red-200'
              }`}
            >
              {message}
            </div>
          )}

          {!showConfirm ? (
            <button
              onClick={handleDeleteData}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete All My Data
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-red-300 text-sm font-semibold">
                Are you absolutely sure? This cannot be undone!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                  className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-red-900 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Forever'}
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Close
        </button>

        <p className="text-gray-400 text-xs mt-4 text-center">
          💡 After deletion, you can safely use CyberShield without any previous activity history.
        </p>
      </div>
    </div>
  );
}
