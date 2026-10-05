import { useState, useEffect } from 'react';

type TabKey = 'login' | 'signup';

interface AuthPortalProps {
  onAuthenticated?: () => void;
}

const tabConfig: Record<TabKey, string> = {
  login: 'Login',
  signup: 'Sign Up',
};

export function AuthPortal({ onAuthenticated }: AuthPortalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<'success' | 'error' | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Load AI analysis from localStorage on mount
  useEffect(() => {
    const savedAnalysis = localStorage.getItem('lastAIAnalysis');
    if (savedAnalysis) {
      setAiAnalysis(savedAnalysis);
    }
  }, []);

  // Save AI analysis to localStorage whenever it changes
  useEffect(() => {
    if (aiAnalysis) {
      localStorage.setItem('lastAIAnalysis', aiAnalysis);
    }
  }, [aiAnalysis]);

  // Auto-clear AI analysis after 5 minutes
  useEffect(() => {
    if (!aiAnalysis) return;

    const timeout = setTimeout(() => {
      clearAIAnalysis();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timeout);
  }, [aiAnalysis]);

  const resetState = () => {
    setPassword('');
    setConfirmPassword('');
    setLoading(false);
  };

  const clearAIAnalysis = () => {
    localStorage.removeItem('lastAIAnalysis');
    setAiAnalysis(null);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setVariant(type);
  };

  const handleLogin = async () => {
    setAiAnalysis('Demo security check passed. No real account or credentials are used.');
    showMessage('Demo login successful. Opening the workspace.', 'success');
    onAuthenticated?.();
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      return;
    }

    showMessage('Demo account created. Opening the workspace.', 'success');
    onAuthenticated?.();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (activeTab === 'login') {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } finally {
      resetState();
    }
  };

  const renderTabs = () => (
    <div className="flex border-b border-slate-700 mb-6">
      {(Object.keys(tabConfig) as TabKey[]).map(tab => (
        <button
          key={tab}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === tab
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => {
            setActiveTab(tab);
            setMessage(null);
            setVariant(null);
            clearAIAnalysis(); // Clear AI analysis when switching tabs
          }}
          type="button"
        >
          {tabConfig[tab]}
        </button>
      ))}
    </div>
  );

  return (
    <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Auth Portal</h2>
          <p className="text-sm text-gray-400">
            Exercise CyberShield by attempting real logins directly inside the dashboard.
          </p>
        </div>
      </div>

      {renderTabs()}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="auth-email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-900 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-900 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
        </div>

        {activeTab === 'signup' && (
          <div>
            <label htmlFor="auth-confirm" className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="auth-confirm"
              type="password"
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-900 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
            />
          </div>
        )}

        {message && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              variant === 'success'
                ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                : 'bg-red-500/10 text-red-300 border border-red-500/30'
            }`}
          >
            {message}
          </div>
        )}

        {aiAnalysis && (
          <div className="rounded-lg px-4 py-2 text-sm bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center justify-between">
            <span>
              <span className="font-semibold">🤖 AI Security Check:</span> {aiAnalysis}
            </span>
            <button
              type="button"
              onClick={clearAIAnalysis}
              className="ml-2 text-blue-400 hover:text-blue-200 font-semibold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-3 transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
              Processing...
            </span>
          ) : (
            tabConfig[activeTab]
          )}
        </button>
      </form>

    </section>
  );
}
