import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const FamilyLogin: React.FC = () => {
  const { signIn, familyStatus, diagnosticInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/family-rsvp';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authorized, redirect immediately
  useEffect(() => {
    if (familyStatus === 'authorized') {
      navigate(from, { replace: true });
    }
  }, [familyStatus, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const authError = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (authError) {
      // Map common Supabase error codes to human-friendly messages
      if (
        authError.message.toLowerCase().includes('invalid login') ||
        authError.message.toLowerCase().includes('invalid credentials')
      ) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(authError.message);
      }
      return;
    }

    // familyStatus will update via onAuthStateChange → useEffect above will redirect
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo / monogram */}
        <div className="login-monogram" aria-hidden="true">
          <span>V</span>
          <span className="ampersand">&amp;</span>
          <span>A</span>
        </div>

        <h1 className="login-title">Family Dashboard</h1>
        <p className="login-subtitle">Vanshita &amp; Ankit — RSVP Management</p>

        {familyStatus === 'unauthorized' && (
          <div className="login-alert login-alert--warn" role="alert">
            <p style={{ margin: 0 }}>
              Your account is not authorized as a family member. Please contact the website
              administrator.
            </p>
            {import.meta.env.DEV && diagnosticInfo && (
              <details style={{ marginTop: '0.6rem', fontSize: '0.8rem', textAlign: 'left', opacity: 0.9 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>🛠 Dev Diagnostics</summary>
                <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div><strong>Account:</strong> {diagnosticInfo.checkedEmail || 'No email detected'}</div>
                  <div><strong>User ID:</strong> {diagnosticInfo.userId || 'N/A'}</div>
                  <div><strong>Database Table:</strong> {diagnosticInfo.dbTableStatus} {diagnosticInfo.dbErrorMessage ? `(${diagnosticInfo.dbErrorMessage})` : ''}</div>
                  <div><strong>Configured Allowlist:</strong> {diagnosticInfo.allowedEmailsConfigured.length > 0 ? diagnosticInfo.allowedEmailsConfigured.join(', ') : 'None'}</div>
                </div>
              </details>
            )}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="family-email" className="login-label">
              Email
            </label>
            <input
              id="family-email"
              className="login-input"
              type="email"
              autoComplete="email"
              placeholder="family@example.com"
              value={email}
              disabled={isSubmitting}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="family-password" className="login-label">
              Password
            </label>
            <input
              id="family-password"
              className="login-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              disabled={isSubmitting}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="login-alert login-alert--error" role="alert">
              {error}
            </div>
          )}

          <button
            id="family-login-submit"
            className="login-btn"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          This page is private. Only authorized family members may access RSVP data.
        </p>
      </div>
    </div>
  );
};
