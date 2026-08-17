import { FormEvent, useMemo, useState } from 'react';

type Mode = 'login' | 'signup';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DemoAuthPage = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const title = mode === 'login' ? 'Welcome back' : 'Create your account';
  const subtitle =
    mode === 'login'
      ? 'Sign in to continue your security demo workflow.'
      : 'Set up a demo account to preview onboarding and dashboard access.';

  const passwordStrength = useMemo(() => {
    if (password.length === 0) {
      return { label: 'None', width: 0 };
    }

    if (password.length < 6) {
      return { label: 'Weak', width: 30 };
    }

    if (password.length < 10) {
      return { label: 'Fair', width: 60 };
    }

    return { label: 'Strong', width: 100 };
  }, [password]);

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setFeedback(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!emailRegex.test(email)) {
      setFeedback('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup' && name.trim().length < 2) {
      setFeedback('Please enter a full name with at least 2 characters.');
      return;
    }

    if (password.length < 6) {
      setFeedback('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setFeedback('Passwords do not match. Please try again.');
      return;
    }

    const message =
      mode === 'login'
        ? `Demo login successful for ${email}.`
        : `Demo signup complete for ${name.trim()} (${email}).`;

    setFeedback(`${message} No real account was created.`);
  };

  return (
    <main className="demo-auth-shell">
      <section className="demo-auth-card" aria-labelledby="demo-auth-title">
        <div className="demo-auth-glow" aria-hidden="true" />

        <header className="demo-auth-header">
          <p className="demo-auth-eyebrow">CYBERSHIELD AUTH DEMO</p>
          <h1 id="demo-auth-title">{title}</h1>
          <p>{subtitle}</p>
        </header>

        <div className="mode-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'active' : ''}
            onClick={() => handleModeChange('login')}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => handleModeChange('signup')}
          >
            Sign up
          </button>
        </div>

        <form className="demo-auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>
              Full name
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Morgan"
              />
            </label>
          )}

          <label>
            Work email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
          </label>

          {mode === 'signup' && (
            <>
              <div className="strength-meter" aria-live="polite">
                <div className="strength-fill" style={{ width: `${passwordStrength.width}%` }} />
              </div>
              <p className="strength-label">Password strength: {passwordStrength.label}</p>

              <label>
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                />
              </label>
            </>
          )}

          <label className="remember-row">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember this device</span>
          </label>

          <button className="submit-btn" type="submit">
            {mode === 'login' ? 'Sign in (Demo)' : 'Create account (Demo)'}
          </button>
        </form>

        <p className={`feedback ${feedback ? 'visible' : ''}`} role="status" aria-live="polite">
          {feedback ?? 'Use any non-sensitive details. This page is isolated for demonstration only.'}
        </p>
      </section>
    </main>
  );
};

export default DemoAuthPage;