import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function DeveloperLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { developerLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide developer credentials.');
      return;
    }

    try {
      setLoading(true);
      const res = await developerLogin(email.trim(), password);
      toast.success(res.message || 'Developer authenticated successfully.');
      navigate('/developer/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid developer credentials. Unauthorized access.');
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
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-950/90 border border-amber-500/40 shadow-2xl shadow-amber-500/10 backdrop-blur-xl relative"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/40">
            <Shield className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-2">
            Restricted Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
            DEVELOPER CONSOLE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System administration &amp; payment verification
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
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
              Developer Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="girish@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
              Developer Secret Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                aria-label={showPassword ? 'Hide developer password' : 'Show developer password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 disabled:opacity-60 text-sm flex items-center justify-center gap-2 font-mono uppercase"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                AUTHENTICATE DEVELOPER <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-3">
          <div>
            <p className="text-xs text-slate-400 font-mono mb-2">Need to provision a new developer?</p>
            <Link
              to="/developer/register"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 hover:border-amber-400 transition-all font-mono uppercase tracking-wider"
            >
              CREATE DEVELOPER ACCOUNT
            </Link>
          </div>

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
