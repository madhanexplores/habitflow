import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  CheckCircle2,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const {
    loginAsGuest,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    loginWithGoogle,
    loginWithGoogleRedirect,
    enableDemoMode,
  } = useAuth();

  // Active tab: 'quick' (Instant 1-Click Station), 'google' (Google Sign In), 'email' (Email / Password), 'reset' (Forgot Password)
  const [activeTab, setActiveTab] = useState<'quick' | 'google' | 'email' | 'reset'>('quick');
  const [emailSubMode, setEmailSubMode] = useState<'signin' | 'register'>('signin');

  // Form states
  const [quickName, setQuickName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [providerNotAllowed, setProviderNotAllowed] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  const currentHostname =
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : 'habitflow-delta-eight.vercel.app';

  if (!isOpen) return null;

  // Handle Instant 1-Click Guest / Commander Launch
  const handleQuickLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setProviderNotAllowed(false);
    setSubmitting(true);

    try {
      const finalName = quickName.trim() || 'Commander';
      await loginAsGuest(finalName);
    } catch (err: unknown) {
      console.warn('Quick launch fallback:', err);
      // Fallback directly to local station
      enableDemoMode(quickName.trim() || 'Commander');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Email / Password authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setProviderNotAllowed(false);
    setSubmitting(true);

    try {
      if (emailSubMode === 'signin') {
        if (!email.trim() || !password) {
          setError('Please provide both email and password.');
          setSubmitting(false);
          return;
        }
        await loginWithEmail(email.trim(), password);
      } else if (emailSubMode === 'register') {
        if (!displayName.trim()) {
          setError('Please choose your name or callsign.');
          setSubmitting(false);
          return;
        }
        if (!email.trim() || !password) {
          setError('Please provide email and a password (min 6 characters).');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }
        await registerWithEmail(email.trim(), password, displayName.trim());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed') || msg.includes('operation-not-allowed')) {
        setProviderNotAllowed(true);
        setError('Firebase Authentication: Email/Password sign-in provider is disabled in Firebase Console.');
      } else if (
        msg.includes('auth/invalid-credential') ||
        msg.includes('auth/wrong-password') ||
        msg.includes('auth/user-not-found')
      ) {
        setError('Incorrect email or password. Verify credentials or register a new account.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Switch to Sign In.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters long.');
      } else if (msg.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);

    try {
      if (!email.trim()) {
        setError('Please enter your email to receive a password reset link.');
        setSubmitting(false);
        return;
      }
      await resetPassword(email.trim());
      setInfoMessage('Password reset link sent to your inbox. Check your email!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed')) {
        setProviderNotAllowed(true);
        setError('Firebase Authentication: Email provider is disabled in Firebase Console.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Google Sign-In helper
  const handleGoogleSignIn = async (useRedirect = false) => {
    setError(null);
    setProviderNotAllowed(false);
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
        setShowDomainHelp(true);
        setError(`Domain Authorization Required: "${currentHostname}" must be added to your Firebase Authorized Domains.`);
      } else if (msg.includes('auth/popup-closed-by-user')) {
        setError('Sign-in popup was closed.');
      } else if (msg.includes('Cross-Origin-Opener-Policy') || msg.includes('window.closed')) {
        setError('Browser popup interaction blocked. Try "Sign in with Google (Redirect)" below or use Quick Launch.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04060A]/85 backdrop-blur-lg overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#141B2B] via-[#0F1422] to-[#0A0D17] border border-[#7C5CFC]/30 shadow-2xl p-6 sm:p-8 text-[#F5F7FF] my-6 transition-all">
        {/* Glow ambient accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-[#7C5CFC]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6 relative">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] via-[#36C5F0] to-[#35D49A] p-0.5 mx-auto shadow-lg shadow-[#7C5CFC]/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#080B12] rounded-[14px] flex items-center justify-center">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-[#7C5CFC] via-[#36C5F0] to-[#35D49A] bg-clip-text text-transparent">
                HF
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            HabitFlow Station
          </h2>
          <p className="text-xs text-[#98A2B8]">
            {activeTab === 'quick' && 'Instant 1-click station entry — no passwords required'}
            {activeTab === 'google' && 'Sign in using your Google account'}
            {activeTab === 'email' && (emailSubMode === 'signin' ? 'Sign in with your email credentials' : 'Create a new HabitFlow account')}
            {activeTab === 'reset' && 'Reset your password credentials'}
          </p>
        </div>

        {/* Navigation Tabs */}
        {activeTab !== 'reset' && (
          <div className="flex rounded-xl bg-[#090D18] p-1 border border-slate-800/80 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('quick');
                setError(null);
                setProviderNotAllowed(false);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'quick'
                  ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6342E8] text-white shadow-md shadow-[#7C5CFC]/30'
                  : 'text-[#98A2B8] hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#36C5F0]" />
              <span>Quick Station</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setError(null);
                setProviderNotAllowed(false);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'google'
                  ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6342E8] text-white shadow-md shadow-[#7C5CFC]/30'
                  : 'text-[#98A2B8] hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('email');
                setError(null);
                setProviderNotAllowed(false);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'email'
                  ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6342E8] text-white shadow-md shadow-[#7C5CFC]/30'
                  : 'text-[#98A2B8] hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          </div>
        )}

        {/* OPERATION NOT ALLOWED EXPLANATION / RESOLUTION CARD */}
        {providerNotAllowed && (
          <div className="p-4 mb-4 rounded-2xl bg-gradient-to-b from-amber-500/15 to-amber-950/20 border border-amber-500/35 text-amber-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Firebase Auth Provider Disabled</span>
            </div>

            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              In your Firebase Project (<span className="font-mono text-white">inspired-tape-pg02f</span>), Email/Password and Anonymous sign-in methods are currently turned off. Only Google Sign-In is configured by default.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => enableDemoMode(quickName || displayName || 'Commander')}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#36C5F0] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch Instant Station (No setup needed)</span>
              </button>

              <a
                href="https://console.firebase.google.com/project/inspired-tape-pg02f/authentication/providers"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Enable Providers in Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>
        )}

        {/* DOMAIN AUTHORIZATION HELP */}
        {showDomainHelp && (
          <div className="p-4 mb-4 rounded-2xl bg-gradient-to-b from-blue-500/15 to-blue-950/20 border border-blue-500/35 text-blue-200 text-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-blue-300">
                <HelpCircle className="w-4 h-4" />
                <span>Authorize Vercel Domain</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDomainHelp(false)}
                className="text-[11px] text-blue-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>

            <p className="text-[11px] text-blue-200/90 leading-relaxed">
              To use Google OAuth on your deployed site, add <strong className="text-white font-mono">{currentHostname}</strong> to Firebase Authorized Domains:
            </p>

            <a
              href="https://console.firebase.google.com/project/inspired-tape-pg02f/authentication/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>Add Domain in Firebase Settings</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        )}

        {/* Regular Feedback Message */}
        {error && !providerNotAllowed && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 text-[11px] leading-relaxed">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400/80 hover:text-white text-xs font-bold shrink-0 ml-1"
            >
              ×
            </button>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1 text-[11px] leading-relaxed">{infoMessage}</div>
          </div>
        )}

        {/* TAB 1: QUICK LAUNCH (100% RELIABLE INSTANT ACCESS) */}
        {activeTab === 'quick' && (
          <form onSubmit={handleQuickLaunch} className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#182035]/80 to-[#101626]/80 border border-[#7C5CFC]/25 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-[#36C5F0]" />
                <span>Instant Command Station Entry</span>
              </div>
              <p className="text-[11px] text-[#98A2B8] leading-relaxed">
                Launch immediately without remembering passwords. All your habits, streaks, and tasks persist seamlessly across reloads.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                  Choose Callsign / Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="e.g. Commander Madhan, Alex, Phoenix"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC] transition"
                  />
                </div>
              </div>

              {/* Callsign Quick Pickers */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400">Presets:</span>
                {['Commander', 'Madhan', 'Navigator', 'Apex', 'Titan'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuickName(preset)}
                    className="px-2 py-0.5 rounded-md bg-[#090D18] hover:bg-[#7C5CFC]/20 border border-slate-800 text-[10px] text-[#98A2B8] hover:text-[#36C5F0] transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] via-[#6342E8] to-[#36C5F0] hover:brightness-110 active:scale-[0.99] text-xs font-bold text-white flex items-center justify-center gap-2 transition shadow-lg shadow-[#7C5CFC]/30 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Launching Station...</span>
                </>
              ) : (
                <>
                  <span>Launch Command Station</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Feature Perks */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-400 text-center">
              <div className="p-2 rounded-xl bg-[#090D18]/60 border border-slate-800/60">
                <div className="text-emerald-400 font-bold mb-0.5">Instant</div>
                <div>Zero login errors</div>
              </div>
              <div className="p-2 rounded-xl bg-[#090D18]/60 border border-slate-800/60">
                <div className="text-[#36C5F0] font-bold mb-0.5">Persistent</div>
                <div>Saves all routines</div>
              </div>
              <div className="p-2 rounded-xl bg-[#090D18]/60 border border-slate-800/60">
                <div className="text-[#7C5CFC] font-bold mb-0.5">Reliable</div>
                <div>Works on all devices</div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: GOOGLE SIGN IN (FIREBASE CONFIG DEFAULT) */}
        {activeTab === 'google' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#182035]/80 to-[#101626]/80 border border-[#7C5CFC]/25 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
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
                <span>Google Cloud Authentication</span>
              </div>
              <p className="text-[11px] text-[#98A2B8] leading-relaxed">
                Connect using your official Google account. Cloud syncs habits and personal telemetry across all your browsers and machines.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleGoogleSignIn(false)}
              disabled={submitting}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#101522] hover:bg-[#151C2E] border border-slate-700 hover:border-[#7C5CFC]/60 text-xs font-semibold text-white flex items-center justify-center gap-3 transition shadow-md disabled:opacity-50"
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
              <span>{submitting ? 'Connecting...' : 'Continue with Google (Popup)'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleGoogleSignIn(true)}
              disabled={submitting}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-xl bg-transparent hover:bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 hover:text-white flex items-center justify-center gap-2 transition"
            >
              <span>Popups blocked? Try Google Redirect</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowDomainHelp((prev) => !prev)}
                className="text-[11px] text-[#36C5F0] hover:underline"
              >
                {showDomainHelp ? 'Hide Domain Instructions' : 'Vercel Custom Domain Setup Info'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL / PASSWORD */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {/* Submode Switcher */}
            <div className="flex border-b border-slate-800 pb-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setEmailSubMode('signin');
                  setError(null);
                  setProviderNotAllowed(false);
                }}
                className={`flex-1 text-xs font-bold pb-1 border-b-2 transition ${
                  emailSubMode === 'signin'
                    ? 'border-[#7C5CFC] text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailSubMode('register');
                  setError(null);
                  setProviderNotAllowed(false);
                }}
                className={`flex-1 text-xs font-bold pb-1 border-b-2 transition ${
                  emailSubMode === 'register'
                    ? 'border-[#7C5CFC] text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Create Account
              </button>
            </div>

            {emailSubMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#98A2B8] mb-1">
                  Your Name / Callsign
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhan Kumar, Alex"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#98A2B8]">
                  Email Address
                </label>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="commander@habitflow.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#98A2B8]">
                  Password
                </label>
                {emailSubMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('reset');
                      setError(null);
                    }}
                    className="text-[10px] text-[#36C5F0] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] mt-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6342E8] hover:brightness-110 active:scale-[0.99] text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFC]/30 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {emailSubMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 4: PASSWORD RESET */}
        {activeTab === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#98A2B8] mb-1">
                Enter your account email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="commander@habitflow.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6342E8] hover:brightness-110 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFC]/30 transition disabled:opacity-50"
            >
              <span>{submitting ? 'Sending...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('email');
                  setError(null);
                }}
                className="text-xs text-[#36C5F0] hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Bottom Station Launcher Shortcut */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-[#98A2B8]">
          <span>Need immediate access?</span>
          <button
            type="button"
            onClick={() => enableDemoMode('Commander')}
            className="text-[#35D49A] hover:underline font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Demo Sandbox</span>
          </button>
        </div>
      </div>
    </div>
  );
};
