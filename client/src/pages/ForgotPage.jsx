import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, User, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export function ForgotPage() {
  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'email'
  
  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: request token, 2: set new password
  
  // Forgot Email state
  const [registeredName, setRegisteredName] = useState('');
  const [emailHints, setEmailHints] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const toast = useToast();
  const navigate = useNavigate();

  // Step 1: Request Password Reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.forgotPassword({ email: forgotEmail.trim() });
      setSuccessMsg(res.message || 'Recovery instructions generated.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      setResetStep(2);
      toast.info('Enter your new password below.');
    } catch (err) {
      setError(err.message || 'Could not initiate password reset.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetToken.trim() || !newPassword || !confirmPassword) {
      setError('Please complete all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.resetPassword({
        token: resetToken.trim(),
        newPassword,
        confirmPassword,
      });
      toast.success(res.message || 'Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Email Lookup
  const handleLookupEmail = async (e) => {
    e.preventDefault();
    setError('');
    setEmailHints([]);

    if (!registeredName.trim()) {
      setError('Please enter your registered name.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.forgotEmail({ name: registeredName.trim() });
      if (res.hints && res.hints.length > 0) {
        setEmailHints(res.hints);
        setSuccessMsg('Masked account hint found.');
      } else {
        setError('No verified account found with that name.');
      }
    } catch (err) {
      setError(err.message || 'Unable to locate account. You may create a new account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/10 blur-[130px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-panel shadow-2xl border"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 mb-3 border border-sky-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Account Recovery</h1>
          <p className="text-sm text-slate-400 mt-1">Secure and verified account restoration.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'password'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Forgot Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'email'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Forgot Email
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Forgot Password */}
        {activeTab === 'password' && (
          <div>
            {resetStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      CONTINUE TO RESET <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Recovery Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="py-2.5 px-4 rounded-xl font-medium text-slate-300 bg-slate-800 text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 text-xs flex items-center justify-center gap-2"
                  >
                    {loading ? 'Updating...' : 'SAVE NEW PASSWORD'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Forgot Email */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <form onSubmit={handleLookupEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Registered Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={registeredName}
                    onChange={(e) => setRegisteredName(e.target.value)}
                    placeholder="Enter your registered name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Searching...' : 'RECOVER EMAIL HINT'}
              </button>
            </form>

            {emailHints.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-sky-500/40">
                <p className="text-xs text-slate-400 mb-2 font-medium">Masked Registered Account:</p>
                {emailHints.map((hint, i) => (
                  <div key={i} className="font-mono text-sm font-bold text-sky-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    {hint}
                  </div>
                ))}
                <p className="text-[11px] text-slate-500 mt-2">
                  For account security, characters are partially masked.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Option 3: Fallback Create New Account */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Cannot recover your old account? You can start fresh safely:
          </p>
          <Link
            to="/register"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/90 border border-slate-700 hover:border-sky-500/50 transition-all"
          >
            CREATE NEW ACCOUNT
          </Link>
          <div>
            <Link to="/login" className="text-xs text-slate-400 hover:text-sky-400">
              Return to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
