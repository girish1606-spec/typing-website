import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Activity,
  ArrowRight,
  TrendingUp,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api.js';

export function DeveloperDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDeveloperStats();
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load developer stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Pending Verifications',
      value: stats?.pendingApprovals || 0,
      sub: 'Awaiting developer review',
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-500/20 to-yellow-500/5',
      border: 'border-amber-500/40',
      action: '/developer/payments?status=Pending',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue || 0}`,
      sub: 'Verified ₹1 subscriptions',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/5',
      border: 'border-emerald-500/40',
      action: '/developer/payments?status=Approved',
    },
    {
      title: 'Approved Subscriptions',
      value: stats?.approvedPayments || 0,
      sub: 'Active premium users',
      icon: <CheckCircle2 className="w-6 h-6 text-sky-400" />,
      color: 'from-sky-500/20 to-indigo-500/5',
      border: 'border-sky-500/40',
      action: '/developer/payments?status=Approved',
    },
    {
      title: 'Rejected / Refund Workflows',
      value: (stats?.rejectedPayments || 0) + (stats?.refundedPayments || 0),
      sub: 'Flagged or refunded',
      icon: <AlertCircle className="w-6 h-6 text-rose-400" />,
      color: 'from-rose-500/20 to-pink-500/5',
      border: 'border-rose-500/40',
      action: '/developer/payments?status=Rejected',
    },
    {
      title: 'Registered Users',
      value: stats?.totalUsers || 0,
      sub: 'Total community typists',
      icon: <Users className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-500/5',
      border: 'border-purple-500/40',
    },
    {
      title: 'Typing Tests Conducted',
      value: stats?.totalTests || 0,
      sub: 'Global test runs',
      icon: <Activity className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/5',
      border: 'border-cyan-500/40',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-950/90 border border-amber-500/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                System Administration
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
                DEVELOPER COMMAND CENTER
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervise platform operations, audit payment submissions, and manage the subscription refund pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors"
            title="Refresh Metrics"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Link
            to="/developer/payments"
            className="px-5 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 font-mono uppercase tracking-wider"
          >
            <Receipt className="w-4 h-4" />
            <span>PAYMENT CONSOLE &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className={`p-6 rounded-3xl glass-panel border ${card.border} bg-gradient-to-br ${card.color} shadow-lg transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                {card.icon}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-4xl font-black text-white font-mono tracking-tight">
                {loading ? '...' : card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>

            {card.action && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <Link
                  to={card.action}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Manage Records <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Action Navigation Card */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white">Payment Approval &amp; Verification Workflow</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review user-submitted UTR / Transaction IDs against your bank or UPI records and toggle subscriptions.
          </p>
        </div>

        <Link
          to="/developer/payments"
          className="px-6 py-3.5 rounded-xl font-bold text-white bg-slate-900 border border-slate-700 hover:border-amber-400/80 hover:bg-slate-800 text-xs flex items-center gap-2 transition-all font-mono"
        >
          <span>OPEN PAYMENT MANAGEMENT</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </Link>
      </div>
    </div>
  );
}
