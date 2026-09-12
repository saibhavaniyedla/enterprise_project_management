import React, { useState } from 'react';
import {
  Shield,
  Key,
  Mail,
  Lock,
  ArrowRight,
  User,
  Zap,
  CheckCircle2,
  Building2,
  Sparkles,
  UserPlus,
  Briefcase,
  Layers,
  Globe,
} from 'lucide-react';
import { TeamMember } from '../../types';
import { registerNewUser, loginUser, loginWithGoogle, loginAsGuest, UserScopedData } from '../../lib/userAuthEngine';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  companyName: string;
  loginTime: string;
}

interface LoginViewProps {
  members: TeamMember[];
  onLoginSuccess: (session: UserSession, userScopedData?: UserScopedData) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  members,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // Sign In fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupCompanyName, setSignupCompanyName] = useState('');
  const [signupRole, setSignupRole] = useState('Product Manager');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser(email, password);
      const session: UserSession = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: `${result.user.role} • ${result.user.companyName}`,
        avatar: result.user.avatar,
        companyName: result.user.companyName,
        loginTime: new Date().toISOString(),
      };
      setSuccessMsg('Authentication successful! Loading your real-time workspace...');
      setTimeout(() => {
        onLoginSuccess(session);
      }, 400);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        console.warn('Login credential mismatch:', err.code);
        setErrorMsg('Invalid email or password. Please verify credentials or switch to Sign Up to create your workspace.');
        return;
      }
      if (err.code === 'auth/operation-not-allowed' || String(err?.message).includes('operation-not-allowed')) {
        console.warn('Email/Password provider not active in Firebase Console.');
        setErrorMsg('Email/Password provider is not active in Firebase Console for this project. Please use "Sign In with Google" (configured and ready) or enter via "Explore Demo Workspace" below.');
        return;
      }
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signupName || !signupEmail || !signupPassword) {
      setErrorMsg('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (signupPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerNewUser({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        companyName: signupCompanyName || `${signupName}'s Workspace`,
        role: signupRole,
      });

      const session: UserSession = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: `${result.user.role} • ${result.user.companyName}`,
        avatar: result.user.avatar,
        companyName: result.user.companyName,
        loginTime: new Date().toISOString(),
      };

      setSuccessMsg(`Workspace provisioned in Firestore! Welcome, ${result.user.name}.`);
      setTimeout(() => {
        onLoginSuccess(session, result.initialData);
      }, 500);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.warn('Signup email already in use:', signupEmail);
        setErrorMsg('An account with this email already exists.');
        return;
      }
      if (err.code === 'auth/operation-not-allowed' || String(err?.message).includes('operation-not-allowed')) {
        console.warn('Email/Password auth not enabled in Firebase Console.');
        setErrorMsg('Email/Password provider is not active in Firebase Console for this project. Please use "Sign In with Google" (configured and ready) or click "Explore Demo Workspace" below.');
        return;
      }
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle();
      const session: UserSession = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: `${result.user.role} • ${result.user.companyName}`,
        avatar: result.user.avatar,
        companyName: result.user.companyName,
        loginTime: new Date().toISOString(),
      };
      setSuccessMsg(`Signed in with Google as ${result.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(session);
      }, 400);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.info('Google sign-in popup closed by user.');
        return;
      }
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Pop-up window was blocked by your browser. Please allow pop-ups for this domain, or click "Explore Demo Workspace" for instant preview access.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestDemoAccess = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const result = await loginAsGuest(
        signupName.trim() || 'Enterprise Architect',
        signupCompanyName.trim() || 'FusionSprint Labs'
      );
      const session: UserSession = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: `${result.user.role} • ${result.user.companyName}`,
        avatar: result.user.avatar,
        companyName: result.user.companyName,
        loginTime: new Date().toISOString(),
      };
      setSuccessMsg(`Instant workspace ready! Loading as ${result.user.name}...`);
      setTimeout(() => {
        onLoginSuccess(session, result.initialData);
      }, 400);
    } catch (err: any) {
      console.error('Guest access error:', err);
      setErrorMsg('Failed to initialize demo workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <header className="p-6 lg:p-8 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Sprint Flow Workspace</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                Real-Time OS
              </span>
            </h1>
            <p className="text-xs text-slate-400">Multi-Tenant Project & Workspace Engine</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Account & Workspace Portal</span>
        </div>
      </header>

      {/* Main Login / Signup Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Auth Forms */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6 flex flex-col justify-between">
            {/* Quick Access Hero: Google Workspace & Demo Mode */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/40 border border-violet-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Google Authentication Verified
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Recommended
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2.5 transition shadow-lg shadow-violet-500/10 active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuestDemoAccess}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Explore Demo Workspace</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-800/80 w-full" />
              <span className="bg-slate-900/80 px-3 text-[10px] uppercase font-mono text-slate-400">
                or sign in with custom credentials
              </span>
            </div>

            {/* Tab Switcher: Sign Up vs Sign In */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    authMode === 'signup'
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account (Sign Up)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    authMode === 'login'
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Log In to Workspace</span>
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {authMode === 'signup' ? 'Create Your Scoped Workspace' : 'Sign In to Your Workspace'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {authMode === 'signup'
                    ? 'Register your profile, provision isolated team workspaces, and manage live sprints.'
                    : 'Access your scoped workspaces, projects, team boards, and automated deadline alerts.'}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-medium space-y-2">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.includes('already exists') && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setEmail(signupEmail);
                        setErrorMsg(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow transition"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Switch to Log In with this email</span>
                    </button>
                  </div>
                )}
                {errorMsg.includes('switch to Sign Up') && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setSignupEmail(email);
                        setErrorMsg(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account with this email</span>
                    </button>
                  </div>
                )}
                {(errorMsg.includes('Google') || errorMsg.includes('Firebase Console') || errorMsg.includes('Demo')) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-[11px] flex items-center gap-1.5 shadow"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span>Continue with Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGuestDemoAccess}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1.5 border border-slate-700"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Instant Demo Workspace</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORM: Sign Up */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-400">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-400">Workspace / Org Name *</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={signupCompanyName}
                        onChange={(e) => setSignupCompanyName(e.target.value)}
                        placeholder="Acme Tech Labs"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase text-slate-400">Work Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="john@acme.corp"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-400">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 4 chars"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-400">Your Role</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="Product Manager">Product Manager</option>
                        <option value="Lead Engineer">Lead Engineer</option>
                        <option value="Frontend Engineer">Frontend Engineer</option>
                        <option value="Backend Engineer">Backend Engineer</option>
                        <option value="UX Designer">UX Designer</option>
                        <option value="QA Lead">QA Lead</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-violet-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Initializing Account & Workspace...</span>
                  ) : (
                    <>
                      <span>Sign Up & Create Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900/80 px-2 text-[10px] uppercase font-mono text-slate-500">or</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                >
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Continue with Google Workspace</span>
                </button>
              </form>
            )}

            {/* FORM: Log In */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-400">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-400">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-violet-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Log In & Select Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900/80 px-2 text-[10px] uppercase font-mono text-slate-500">or</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                >
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Log In with Google Workspace</span>
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-800/80 text-xs text-center text-slate-400">
              {authMode === 'signup' ? (
                <p>
                  Already have a registered account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-violet-400 font-bold hover:underline"
                  >
                    Log In
                  </button>
                </p>
              ) : (
                <p>
                  Need a new isolated workspace?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-violet-400 font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Key Multi-Tenant Features */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-inner">
                <Layers className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-white leading-snug">
                Workspace Isolation & Automatic Sprint Rollover
              </h3>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict Project & Team Isolation:</strong> Each user account owns its custom workspaces and projects.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sprint Auto-Archiver Service:</strong> Automatically completes expired sprints & rolls over unfinished tasks to the next sprint.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Workspace Navigation Flow:</strong> Access Dashboard first to choose a workspace, then unlock remaining sprint boards and developer hubs.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 text-xs text-slate-400 space-y-1.5 font-mono">
              <span className="text-slate-300 font-bold block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Live System Engine:
              </span>
              <p className="text-[11px] text-slate-400">✓ Sprint Auto-Archiver: Active</p>
              <p className="text-[11px] text-slate-400">✓ Multi-tenant Storage: Persistent</p>
              <p className="text-[11px] text-slate-400">✓ Locked Workspace Flow: Enforced</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 border-t border-slate-900 z-10 font-mono">
        Multi-Tenant Enterprise Workspace Platform • Sprint Auto-Archiver & Real-Time Data Engine
      </footer>
    </div>
  );
};
