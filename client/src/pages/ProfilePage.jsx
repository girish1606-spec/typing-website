import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Crown,
  Trophy,
  Activity,
  Clock,
  CheckCircle,
  Save,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function ProfilePage() {
  const { user, isPremium, isSubscriptionPending, setUser, refreshProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setUpdating(true);
      const res = await api.updateProfile({ name: name.trim() });
      if (res && res.user) {
        setUser(res.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const stats = user?.typingStatistics || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Card */}
      <div className="p-8 rounded-3xl glass-panel border shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-4xl flex items-center justify-center uppercase shadow-xl shadow-sky-500/20 shrink-0">
          {user?.name?.[0] || 'U'}
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name}</h1>
            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Crown className="w-3.5 h-3.5 fill-amber-300" /> Premium Member
              </span>
            ) : isSubscriptionPending ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Verification Pending
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                Free Tier
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-2">
            <Mail className="w-4 h-4 text-slate-500" /> {user?.email}
          </p>

          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2">
            <Calendar className="w-4 h-4 text-slate-500" /> Member since{' '}
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Link
            to="/payments"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Receipt className="w-3.5 h-3.5 text-sky-400" />
            <span>My Payments</span>
          </Link>
          {!isPremium && (
            <Link
              to="/subscription"
              className="px-4 py-2 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Get Pro (₹1)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase">Best Speed</span>
          <div className="text-3xl font-black text-sky-400 font-mono my-1">
            {stats.bestWpm || 0}
          </div>
          <span className="text-[11px] text-slate-500">Words Per Minute</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Speed</span>
          <div className="text-3xl font-black text-emerald-400 font-mono my-1">
            {stats.averageWpm || 0}
          </div>
          <span className="text-[11px] text-slate-500">Overall Mean</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase">Tests Taken</span>
          <div className="text-3xl font-black text-purple-400 font-mono my-1">
            {stats.testsCompleted || 0}
          </div>
          <span className="text-[11px] text-slate-500">Recorded Runs</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase">Practice Time</span>
          <div className="text-2xl font-black text-amber-400 font-mono my-1">
            {Math.round((stats.totalPracticeTime || 0) / 60)}m
          </div>
          <span className="text-[11px] text-slate-500">Minutes Spent</span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border shadow-xl">
        <h2 className="text-lg font-bold text-white mb-2">Edit Account Information</h2>
        <p className="text-xs text-slate-400 mb-6">Update your display name across tests and leaderboards.</p>

        <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Email is permanently linked to your account identity.
            </span>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="py-3 px-6 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 text-xs flex items-center gap-2 shadow-lg shadow-sky-600/25"
          >
            <Save className="w-4 h-4" />
            <span>{updating ? 'Saving...' : 'UPDATE PROFILE'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
