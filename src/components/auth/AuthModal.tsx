import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, Copy, Check, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const {
    loginWithGoogle,
    loginWithGoogleRedirect,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    enableDemoMode,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [unauthorizedDomainDetected, setUnauthorizedDomainDetected] = useState(false);

  const currentHostname = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'habitflow-delta-eight.vercel.app';

  if (!isOpen) return null;

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          setError('Please provide your name or callsign.');
          setSubmitting(false);
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
      } else if (mode === 'reset') {
        await resetPassword(email);
        setInfoMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Invalid email or password. Please verify and try again.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Try signing in.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters long.');
      } else if (msg.includes('auth/popup-closed-by-user')) {
        setError('Google sign-in popup was cancelled.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (useRedirect = false) => {
    setError(null);
    setSubmitting(true);
    try {
      if (useRedirect) {
        await loginWithGoogleRedirect();
      } else {
        await loginWithGoogle();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/unauthorized-domain')) {
        setUnauthorizedDomainDetected(true);
        setShowDomainHelp(true);
        setError(`Domain Authorization Required: "${currentHostname}" must be added to your Firebase Authorized Domains.`);
      } else if (msg.includes('auth/popup-closed-by-user')) {
        setError('Google sign-in popup was closed before completion.');
      } else if (msg.includes('Cross-Origin-Opener-Policy') || msg.includes('window.closed')) {
        setError('Browser popup interaction was blocked. Try "Sign in with Google (Redirect)" below or use Email/Password.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#141B2B] to-[#101522] border border-[#7C5CFC]/30 shadow-2xl p-6 sm:p-8 text-[#F5F7FF] my-8">
        {/* Brand header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#36C5F0] p-0.5 mx-auto shadow-lg shadow-[#7C5CFC]/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#080B12] rounded-[14px] flex items-center justify-center">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-[#7C5CFC] to-[#36C5F0] bg-clip-text text-transparent">
                HF
              </span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            HabitFlow Command Center
          </h2>
          <p className="text-xs text-[#98A2B8]">
            {mode === 'login'
              ? 'Sign in to access your habits, streaks, and personal telemetry'
              : mode === 'register'
              ? 'Initialize your personal productivity command center'
              : 'Reset your account security credentials'}
          </p>
        </div>

        {/* Feedback message */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{error}</span>
              {!showDomainHelp && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDomainHelp(true)}
                    className="text-[#36C5F0] underline font-semibold mt-1 block"
                  >
                    View Firebase Authorized Domain setup guide
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Firebase Domain Authorization Assistance Box */}
        {(showDomainHelp || unauthorizedDomainDetected) && (
          <div className="p-4 mb-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Globe className="w-4 h-4" />
                <span>Authorize Domain in Firebase</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDomainHelp(false)}
                className="text-[11px] text-amber-400/80 hover:text-white"
              >
                Dismiss
              </button>
            </div>

            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Firebase Authentication requires your custom domain to be authorized before allowing Google OAuth sign-in.
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#080B12]/80 border border-amber-500/30 font-mono text-[11px] text-white overflow-hidden">
              <span className="truncate flex-1">{currentHostname}</span>
              <button
                type="button"
                onClick={handleCopyDomain}
                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center gap-1 text-[10px] font-sans font-semibold shrink-0 transition"
              >
                {copiedDomain ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-[#98A2B8] space-y-1">
              <p className="font-semibold text-white">How to add it in 30 seconds:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Click the link below to open Firebase Settings.</li>
                <li>Scroll down to <strong>Authorized domains</strong>.</li>
                <li>Click <strong>Add domain</strong>, paste <span className="text-amber-300 font-mono">{currentHostname}</span>, and Save.</li>
              </ol>
            </div>

            <a
              href="https://console.firebase.google.com/project/inspired-tape-pg02f/authentication/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Open Firebase Authentication Settings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="text-[10px] text-amber-300/70 pt-1 border-t border-amber-500/20">
              Tip: You can also use <strong>Demo Mode</strong> or <strong>Email Sign In</strong> below right away without domain setup!
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 mb-4 rounded-xl bg-[#35D49A]/10 border border-[#35D49A]/30 text-[#35D49A] text-xs">
            {infoMessage}
          </div>
        )}

        {/* Instant Access Demo Mode */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => enableDemoMode()}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC]/30 via-[#36C5F0]/20 to-[#35D49A]/25 hover:from-[#7C5CFC]/45 hover:to-[#35D49A]/35 border border-[#7C5CFC]/60 text-xs font-bold text-white flex items-center justify-center gap-2 transition shadow-lg shadow-[#7C5CFC]/20 group active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-[#35D49A] group-hover:rotate-12 transition-transform" />
            <span>Instant Access · Explore Demo Command Station</span>
          </button>
          <p className="text-[10px] text-center text-[#98A2B8] mt-1.5">
            1-click instant preview with preloaded habits, streaks, tasks, & charts
          </p>
        </div>

        {/* Google One-Click Login */}
        {mode !== 'reset' && (
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={() => handleGoogleSignIn(false)}
              disabled={submitting}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101522] hover:bg-[#141B2B] border border-slate-700 hover:border-[#7C5CFC]/50 text-xs font-semibold text-white flex items-center justify-center gap-3 transition shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{submitting ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Alternative redirect login option for popups blocked */}
            <div className="flex items-center justify-between text-[11px] text-[#98A2B8] px-1">
              <button
                type="button"
                onClick={() => handleGoogleSignIn(true)}
                disabled={submitting}
                className="text-slate-400 hover:text-[#36C5F0] transition flex items-center gap-1"
              >
                <span>Popups blocked? Try Google Redirect</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDomainHelp((prev) => !prev)}
                className="text-[#36C5F0] hover:underline"
              >
                {showDomainHelp ? 'Hide Domain Info' : 'Domain Setup'}
              </button>
            </div>

            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#141B2B] px-3 text-[10px] uppercase font-mono text-[#98A2B8] shrink-0">
                or sign in with email
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>
          </div>
        )}

        {/* Email Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#98A2B8] mb-1">
                Your Callsign / Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex, Maya"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#101522] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#98A2B8] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="commander@habitflow.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#101522] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#98A2B8]">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[11px] text-[#36C5F0] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#101522] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] mt-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F2] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFC]/30 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            <span>
              {submitting
                ? 'Authenticating...'
                : mode === 'login'
                ? 'Sign In to Command Center'
                : mode === 'register'
                ? 'Create HabitFlow Account'
                : 'Send Password Reset'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-[#98A2B8]">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-[#36C5F0] font-semibold hover:underline"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#36C5F0] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
