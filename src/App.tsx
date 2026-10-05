import { useState } from 'react';
import { Shield, Activity, Lock, TrendingUp, Trash2, LogOut } from 'lucide-react';
import { useSecurityData } from './hooks/useSecurityData';
import { StatCard } from './components/StatCard';
import { ThreatLogTable } from './components/ThreatLogTable';
import { BlockedIPsTable } from './components/BlockedIPsTable';
import { ActivityTimeline } from './components/ActivityTimeline';
import { ReportGenerator } from './components/ReportGenerator';
import { ThreatDetailsModal } from './components/ThreatDetailsModal';
import { PrivacySettings } from './components/PrivacySettings';
import { ThreatLog } from './types/security';
import { AuthPortal } from './components/AuthPortal';

function App() {
  const [accessMode, setAccessMode] = useState<'locked' | 'demo' | 'live'>('locked');
  const isDemoMode = accessMode === 'demo';
  const { stats, recentThreats, blockedIPs, loading, refetch, clearDemoData } = useSecurityData(isDemoMode);
  const [selectedThreat, setSelectedThreat] = useState<ThreatLog | null>(null);
  const [activeTab, setActiveTab] = useState<'threats' | 'blocked'>('threats');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  if (accessMode === 'locked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-12 flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3 text-white">
              <Shield className="text-cyan-300" size={28} />
              <span className="font-bold tracking-wide">CyberShield</span>
            </div>
            <button
              type="button"
              onClick={() => setAccessMode('demo')}
              className="flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/20"
            >
              <Shield size={17} />
              Open workspace
            </button>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
            <div>
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Public product demo</p>
                <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">See every threat at a glance.</h1>
                <p className="mt-4 max-w-xl text-lg leading-8 text-slate-400">Use any details to try the demo. Login and signup are simulated, and every record in the workspace is fictional.</p>
              </div>
              <AuthPortal
                onAuthenticated={() => setAccessMode('demo')}
                onTryDemo={() => setAccessMode('demo')}
              />
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/[0.06] p-7 text-slate-200 shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">How it works</p>
              <ol className="mt-6 space-y-6">
                <li className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300 font-bold text-slate-950">1</span><span><strong className="block text-white">Enter the workspace</strong><span className="text-sm text-slate-400">Use Login, Sign up, or Open Admin. No real account is required.</span></span></li>
                <li className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300 font-bold text-slate-950">2</span><span><strong className="block text-white">Review the overview</strong><span className="text-sm text-slate-400">See threat volume, critical events, activity, and a sample report.</span></span></li>
                <li className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300 font-bold text-slate-950">3</span><span><strong className="block text-white">Explore the workspace</strong><span className="text-sm text-slate-400">Review activity, threat logs, blocked IPs, and reports together.</span></span></li>
                <li className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300 font-bold text-slate-950">4</span><span><strong className="block text-white">Delete your data</strong><span className="text-sm text-slate-400">Use the Delete my data button at the top whenever you want to clear the demo records.</span></span></li>
              </ol>
              <div className="mt-8 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">Demo mode uses reserved example IP addresses and never changes production data.</div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Debug info
  console.log('🚀 App component rendered');
  console.log('Loading state:', loading);
  console.log('Stats:', stats);

  if (loading) {
    console.log('⏳ Showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading security dashboard...</div>
      </div>
    );
  }

  console.log('✅ Showing main dashboard');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield size={40} className="text-blue-500 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">CyberShield Security Monitor</h1>
                <p className="text-gray-400 mt-1">Real-time threat detection and automated protection</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
            <button
              onClick={() => setAccessMode('locked')}
              className="flex items-center gap-2 rounded bg-slate-700 px-3 py-2 font-semibold text-white transition-colors hover:bg-slate-600"
              title="Sign out"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Exit</span>
            </button>
            <button
              onClick={() => setShowPrivacySettings(true)}
              className="flex items-center gap-2 rounded bg-red-600 px-3 py-2 font-semibold text-white transition-colors hover:bg-red-700"
              title="Delete my data"
            >
              <Trash2 size={18} />
              <span>Delete my data</span>
            </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isDemoMode && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            <span><strong>Public demo mode:</strong> all records are fictional and actions are read-only.</span>
            <span className="rounded bg-cyan-400/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide">Demo</span>
          </div>
        )}
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

        <>
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
            <BlockedIPsTable blockedIPs={blockedIPs} onUpdate={refetch} readOnly={isDemoMode} />
          )}
        </>
      </main>

      <ThreatDetailsModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />
      
      {showPrivacySettings && (
        <PrivacySettings
          onClose={() => setShowPrivacySettings(false)}
          onDeleted={isDemoMode ? clearDemoData : refetch}
          demoMode={isDemoMode}
        />
      )}

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
