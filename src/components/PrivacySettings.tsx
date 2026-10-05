import { useState } from 'react';
import { ShieldAlert, Trash2 } from 'lucide-react';

interface PrivacySettingsProps {
  onClose: () => void;
  onDeleted: () => void;
  demoMode?: boolean;
}

export function PrivacySettings({ onClose, onDeleted, demoMode = false }: PrivacySettingsProps) {
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
      if (demoMode) {
        onDeleted();
        setMessage('Demo data cleared. No real records were changed.');
        setMessageType('success');
        setShowConfirm(false);
        return;
      }

      // First, get the user's actual IP from their browser
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp = ipData.ip;

      console.log('🗑️ User IP detected:', userIp);

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
          user_ip: userIp, // Send user's actual IP
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `✅ All your data has been permanently deleted. Your IP address (${userIp}) and all activities have been removed.`
        );
        setMessageType('success');
        setShowConfirm(false);
        onDeleted();
        
        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.error || 'Failed to delete data');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
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
          <ShieldAlert className="w-6 h-6 text-cyan-300" />
          <h2 className="text-2xl font-bold text-white">Privacy</h2>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-700/70 p-4 mb-6">
          <p className="text-gray-200 text-sm">Delete the activity connected to your IP address.</p>
          <ul className="mt-3 space-y-1 text-xs text-gray-400">
            <li>Threat logs and activity history</li>
            <li>Blocked IP records</li>
            <li>Admin actions connected to your IP</li>
          </ul>
          <p className="mt-4 text-xs text-red-300">This cannot be undone.</p>

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
              Delete my data
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-red-300 text-sm font-semibold">
                Delete your data now?
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
                  {isDeleting ? 'Deleting...' : 'Yes, delete it'}
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
          You can continue using the demo after deletion.
        </p>
      </div>
    </div>
  );
}
