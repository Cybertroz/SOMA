/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  School,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppUserRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const {
    signIn,
    loginError,
    lockoutRemainingSec,
    resetPassword,
    clearLoginError,
  } = useAuth();

  const [email, setEmail] = useState('admin@limuru.ac.ke');
  const [password, setPassword] = useState('Admin@2026');
  const [selectedRole, setSelectedRole] = useState<AppUserRole>('headteacher');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Forgot password modal
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ loading: boolean; message: string | null; success: boolean | null }>({
    loading: false,
    message: null,
    success: null,
  });

  const handleRoleQuickSelect = (role: AppUserRole) => {
    setSelectedRole(role);
    clearLoginError();
    if (role === 'headteacher') {
      setEmail('admin@limuru.ac.ke');
      setPassword('Admin@2026');
    } else if (role === 'deputy') {
      setEmail('deputy@limuru.ac.ke');
      setPassword('Deputy@2026');
    } else if (role === 'bursar') {
      setEmail('bursar@limuru.ac.ke');
      setPassword('Bursar@2026');
    } else if (role === 'teacher') {
      setEmail('teacher@limuru.ac.ke');
      setPassword('Teacher@2026');
    } else if (role === 'parent') {
      setEmail('parent@limuru.ac.ke');
      setPassword('Parent@2026');
    } else if (role === 'moe_official') {
      setEmail('belio.kipsang@education.go.ke');
      setPassword('Moe@2026');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password, rememberMe);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetStatus({ loading: true, message: null, success: null });
    const res = await resetPassword(resetEmail);
    setResetStatus({ loading: false, message: res.message, success: res.success });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-[#042f2e] to-[#064e3b] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Republic Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs py-2 border-b border-emerald-800/40 text-emerald-200/80">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-base">🇰🇪</span>
          <span className="font-bold tracking-wider uppercase">Republic of Kenya · Ministry of Education</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] font-bold">
            Kiambu County Directorate
          </span>
        </div>
      </div>

      {/* Centered Main Sign-In Card Container */}
      <div className="my-auto py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-emerald-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Top Brand & School Crest */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-amber-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 transform hover:rotate-2 transition-transform">
              <School className="w-8 h-8 text-amber-300" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                LIMURU MODEL COMPREHENSIVE SCHOOL
              </h1>
              <p className="text-xs text-emerald-300/90 font-medium mt-0.5">
                Ministry of Education · Kiambu County
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-mono uppercase tracking-wider shadow-xs">
                Center 20401823
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                CBC Hub Portal
              </span>
            </div>
          </div>

          {/* Lockout Warning Banner if 5 failed attempts */}
          {lockoutRemainingSec > 0 && (
            <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 animate-pulse">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-white block">Security Lockout Active</strong>
                <span>Multiple incorrect login attempts. System locked for </span>
                <span className="font-mono font-black text-amber-300">{lockoutRemainingSec}s</span>.
              </div>
            </div>
          )}

          {/* Inline Login Error Display */}
          {loginError && lockoutRemainingSec === 0 && (
            <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">{loginError}</span>
              </div>
              <button onClick={clearLoginError} className="text-rose-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1.5">
                Institutional Role / Portal
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleQuickSelect(e.target.value as AppUserRole)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-emerald-700/60 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="headteacher">Head Teacher / Principal (Full Authority)</option>
                  <option value="deputy">Deputy Principal (Academics & Curricular)</option>
                  <option value="bursar">Bursar / Accounts (Fee Ledger & Voteheads)</option>
                  <option value="teacher">Class & Subject Teacher (CBC & Assessments)</option>
                  <option value="parent">Parent / Guardian (Learner Progress)</option>
                  <option value="moe_official">Ministry Official / Inspector (View & Print Only)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Email / Username Field */}
            <div>
              <label className="block text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@limuru.ac.ke"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearLoginError();
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-emerald-700/60 rounded-xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearLoginError();
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/90 border border-emerald-700/60 rounded-xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember this workstation</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">15m session idle lock</span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting || lockoutRemainingSec > 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to School Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Collapsible Demo Accounts Hint */}
          <div className="border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Accounts Quick-Fill (Test Workstations)</span>
              </span>
              {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoAccounts && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-emerald-900/80 space-y-2 text-[11px] font-mono">
                <div
                  onClick={() => handleRoleQuickSelect('headteacher')}
                  className="p-1.5 rounded hover:bg-slate-800/80 cursor-pointer flex justify-between items-center transition-colors border border-transparent hover:border-emerald-800"
                >
                  <span className="text-white font-bold">Head Teacher:</span>
                  <span className="text-emerald-300">admin@limuru.ac.ke / Admin@2026</span>
                </div>
                <div
                  onClick={() => handleRoleQuickSelect('bursar')}
                  className="p-1.5 rounded hover:bg-slate-800/80 cursor-pointer flex justify-between items-center transition-colors border border-transparent hover:border-emerald-800"
                >
                  <span className="text-white font-bold">Bursar:</span>
                  <span className="text-emerald-300">bursar@limuru.ac.ke / Bursar@2026</span>
                </div>
                <div
                  onClick={() => handleRoleQuickSelect('teacher')}
                  className="p-1.5 rounded hover:bg-slate-800/80 cursor-pointer flex justify-between items-center transition-colors border border-transparent hover:border-emerald-800"
                >
                  <span className="text-white font-bold">Teacher:</span>
                  <span className="text-emerald-300">teacher@limuru.ac.ke / Teacher@2026</span>
                </div>
                <div
                  onClick={() => handleRoleQuickSelect('deputy')}
                  className="p-1.5 rounded hover:bg-slate-800/80 cursor-pointer flex justify-between items-center transition-colors border border-transparent hover:border-emerald-800"
                >
                  <span className="text-white font-bold">Deputy:</span>
                  <span className="text-emerald-300">deputy@limuru.ac.ke / Deputy@2026</span>
                </div>
                <div
                  onClick={() => handleRoleQuickSelect('parent')}
                  className="p-1.5 rounded hover:bg-slate-800/80 cursor-pointer flex justify-between items-center transition-colors border border-transparent hover:border-emerald-800"
                >
                  <span className="text-white font-bold">Parent:</span>
                  <span className="text-emerald-300">parent@limuru.ac.ke / Parent@2026</span>
                </div>
                <div
                  onClick={() => handleRoleQuickSelect('moe_official')}
                  className="p-1.5 rounded hover:bg-amber-950/40 cursor-pointer flex justify-between items-center transition-colors border border-transparent hover:border-amber-500/50"
                >
                  <span className="text-amber-300 font-bold">Ministry (Dr. Belio Kipsang):</span>
                  <span className="text-amber-200">belio.kipsang@education.go.ke / Moe@2026</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-700/60 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
              </div>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetStatus({ loading: false, message: null, success: null });
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Enter your registered school institutional email address. Firebase Authentication will dispatch a password recovery link.
            </p>

            {resetStatus.message && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  resetStatus.success
                    ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
                    : 'bg-rose-950/80 border border-rose-700 text-rose-200'
                }`}
              >
                {resetStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{resetStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@limuru.ac.ke"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetStatus.loading}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {resetStatus.loading ? 'Dispatching...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Disclaimer & Note */}
      <footer className="w-full max-w-6xl mx-auto py-3 text-center text-[11px] text-emerald-300/60 border-t border-emerald-900/40 font-mono">
        Limuru Model Comprehensive School · Integrated CBC & KEMIS Governance System · Production Firebase Auth & Firestore RBAC
      </footer>
    </div>
  );
};
