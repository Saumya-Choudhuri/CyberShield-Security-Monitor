import { useState } from 'react';
import { Shield, Activity, Lock, TrendingUp } from 'lucide-react';
import { useSecurityData } from './hooks/useSecurityData';
import { StatCard } from './components/StatCard';
import { ThreatLogTable } from './components/ThreatLogTable';
import { BlockedIPsTable } from './components/BlockedIPsTable';
import { ActivityTimeline } from './components/ActivityTimeline';
import { ReportGenerator } from './components/ReportGenerator';
import { ThreatDetailsModal } from './components/ThreatDetailsModal';
import { ThreatLog } from './types/security';
import { AuthPortal } from './components/AuthPortal';

function App() {
  const { stats, recentThreats, blockedIPs, loading, refetch } = useSecurityData();
  const [selectedThreat, setSelectedThreat] = useState<ThreatLog | null>(null);
  const [activeTab, setActiveTab] = useState<'threats' | 'blocked'>('threats');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading security dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Shield size={40} className="text-blue-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white">CyberShield Security Monitor</h1>
              <p className="text-gray-400 mt-1">Real-time threat detection and automated protection</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AuthPortal />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Threats Detected"
            value={stats.totalThreats}
            icon={Activity}
            color="#3B82F6"
          />
          <StatCard
            title="Blocked IP Addresses"
            value={stats.blockedIPs}
            icon={Lock}
            color="#EF4444"
          />
          <StatCard
            title="Threats Today"
            value={stats.threatsToday}
            icon={TrendingUp}
            color="#F59E0B"
          />
          <StatCard
            title="Critical Threats"
            value={stats.criticalThreats}
            icon={Shield}
            color="#DC2626"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ActivityTimeline threats={recentThreats} />
          </div>
          <div>
            <ReportGenerator />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('threats')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'threats'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Threat Logs
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'blocked'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Blocked IPs
            </button>
          </div>
        </div>

        {activeTab === 'threats' ? (
          <ThreatLogTable threats={recentThreats} onSelect={setSelectedThreat} />
        ) : (
          <BlockedIPsTable blockedIPs={blockedIPs} onUpdate={refetch} />
        )}
      </main>

      <ThreatDetailsModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />

      <footer className="bg-slate-800 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            CyberShield Security Monitor • Real-time protection powered by AI-driven threat detection
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
