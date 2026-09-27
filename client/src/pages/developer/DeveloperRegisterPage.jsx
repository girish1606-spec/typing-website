import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function DeveloperRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [developerSecret, setDeveloperSecret] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { developerRegister } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !developerSecret.trim()) {
      setError('Name, email, and developer secret passcode are required.');
      return;
    }

    if (password.length < 6) {
      setError('Developer password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await developerRegister({
        name: name.trim(),
        email: email.trim(),
        developerSecret: developerSecret.trim(),
        password,
        confirmPassword,
      });

      toast.success(res.message || 'Developer account created successfully!');
      navigate('/developer/dashboard');
    } catch (err) {
      setError(err.message || 'Developer registration failed. Please verify your passcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Security amber ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-slate-950/95 border border-amber-500/40 shadow-2xl shadow-amber-500/10 backdrop-blur-xl relative"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/40">
            <Shield className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-2">
            Admin Provisioning
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
            CREATE DEVELOPER ACCOUNT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision official administrator credentials with approval privileges
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 font-mono">
              Developer Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 font-mono">
              Developer Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@typespeed.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 font-mono">
              Master Developer Secret Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={developerSecret}
                onChange={(e) => setDeveloperSecret(e.target.value)}
                placeholder="Enter authorization secret key"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs font-mono"
              />
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-400/80 font-mono">
              <Info className="w-3.5 h-3.5" />
              <span>Default master secret: <strong className="text-amber-300 font-bold">DEV_ADMIN_SECRET_2025</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 font-mono">
              Developer Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength */}
            {password && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Security Strength:</span>
                  <span className="font-semibold text-amber-300">{strength.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1 w-full">
                  <div className={`rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`} />
                  <div className={`rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`} />
                  <div className={`rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 font-mono">
              Confirm Developer Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter developer password"
                className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 disabled:opacity-60 text-xs flex items-center justify-center gap-2 font-mono uppercase tracking-wider"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                CREATE DEVELOPER ACCOUNT <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400 font-mono">
            Already have developer credentials?{' '}
            <Link to="/developer/login" className="font-bold text-amber-400 hover:text-amber-300">
              Developer Sign In
            </Link>
          </p>

          <div>
            <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              &larr; Return to Normal User Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
