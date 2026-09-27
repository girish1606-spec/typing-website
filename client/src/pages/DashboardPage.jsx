import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  Clock,
  Trophy,
  Activity,
  Crown,
  Play,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export function DashboardPage() {
  const { user, isPremium, isSubscriptionPending, refreshProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getUserStatistics();
        if (res && res.success) {
          setStats(res.statistics);
          setRecentTests(res.recentTests || []);
        }
      } catch (err) {
        console.error('Failed to load user stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
    refreshProfile();
  }, [refreshProfile]);

  const formatTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = (mins / 60).toFixed(1);
      return `${hrs} hrs`;
    }
    return `${mins}m ${secs}s`;
  };

  const statCards = [
    {
      label: 'Best Speed',
      value: `${stats?.bestWpm || 0} WPM`,
      sub: 'All-time personal record',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-yellow-500/5',
      border: 'border-amber-500/30',
    },
    {
      label: 'Average Speed',
      value: `${stats?.averageWpm || 0} WPM`,
      sub: 'Cumulative velocity',
      icon: <TrendingUp className="w-5 h-5 text-sky-400" />,
      color: 'from-sky-500/20 to-indigo-500/5',
      border: 'border-sky-500/30',
    },
    {
      label: 'Average Accuracy',
      value: `${stats?.averageAccuracy || 0}%`,
      sub: 'Keystroke precision',
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/5',
      border: 'border-emerald-500/30',
    },
    {
      label: 'Tests Completed',
      value: stats?.testsCompleted || 0,
      sub: 'Practices recorded',
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/20 to-fuchsia-500/5',
      border: 'border-purple-500/30',
    },
    {
      label: 'Practice Time',
      value: formatTime(stats?.totalPracticeTime || 0),
      sub: 'Time spent typing',
      icon: <Clock className="w-5 h-5 text-rose-400" />,
      color: 'from-rose-500/20 to-pink-500/5',
      border: 'border-rose-500/30',
    },
    {
      label: 'Last Recorded',
      value: `${stats?.lastWpm || 0} WPM`,
      sub: 'Most recent sprint',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/5',
      border: 'border-cyan-500/30',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner Greeting & Start Practice Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl glass-panel border shadow-2xl relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Welcome back, <span className="text-sky-400">{user?.name}</span>!
            </h1>
            {isPremium ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Crown className="w-3.5 h-3.5 fill-amber-300" /> Premium Member
              </span>
            ) : isSubscriptionPending ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                <AlertCircle className="w-3.5 h-3.5" /> Verification Pending
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Free Tier
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm max-w-xl">
            Track your typing metrics, conquer new practice challenges, and push your fingers to peak performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/practice"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:via-sky-500 hover:to-indigo-500 shadow-xl shadow-sky-500/30 transition-all transform hover:-translate-y-0.5 text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            START PRACTICE
          </Link>

          {!isPremium && (
            <Link
              to="/subscription"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-slate-200 bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-sm hover:text-white transition-all"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              Upgrade for ₹1
            </Link>
          )}
        </div>
      </div>

      {/* Subscription Status Announcement (If Pending or Free) */}
      {isSubscriptionPending && (
        <div className="p-4 rounded-2xl bg-sky-950/60 border border-sky-500/40 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-sky-200">
            <AlertCircle className="w-5 h-5 text-sky-400 shrink-0" />
            <span>
              Your <strong>₹1 Premium Subscription</strong> payment has been submitted and is waiting for developer verification.
            </span>
          </div>
          <Link to="/payments" className="text-xs font-bold text-sky-400 hover:underline shrink-0">
            View Payment Status &rarr;
          </Link>
        </div>
      )}

      {/* Statistic Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Performance Overview</h2>
          <span className="text-xs text-slate-400">Synchronized with your profile</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className={`p-6 rounded-2xl glass-panel border ${card.border} bg-gradient-to-br ${card.color} shadow-lg transition-all flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    {card.icon}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {card.value}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Typing History & Progression Chart */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Typing Velocity Progression</h2>
            <p className="text-xs text-slate-400 mt-1">Visualizing your recent speed trajectory</p>
          </div>
          <div className="flex items-center gap-3">
            {stats && stats.testsCompleted > 0 && (
              <button
                onClick={() => {
                  const summary = `⚡ TYPE SPEED Stats for ${user?.name}:\n🏆 Best: ${stats.bestWpm} WPM\n📈 Average: ${stats.averageWpm} WPM\n🎯 Accuracy: ${stats.averageAccuracy}%\n⏱️ Practice: ${Math.round(stats.totalPracticeTime / 60)} mins\nPractice at http://localhost:5173`;
                  navigator.clipboard.writeText(summary);
                  alert('Typing stats copied to clipboard!');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Copy Stats
              </button>
            )}
            <Link
              to="/practice"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              New Session <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* SVG Historical Speed Progression Graph */}
        {recentTests.length > 1 && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold text-slate-300">WPM Trend Curve (Last Sessions)</span>
              <span className="font-mono text-[11px] text-sky-400">Average: {stats?.averageWpm || 0} WPM</span>
            </div>
            <div className="w-full h-32 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                <line x1="0" y1="25" x2="500" y2="25" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />

                {(() => {
                  const testsReversed = [...recentTests].reverse();
                  const maxW = Math.max(...testsReversed.map(t => t.wpm), (stats?.bestWpm || 60) + 10);
                  const minW = Math.max(0, Math.min(...testsReversed.map(t => t.wpm)) - 10);
                  const range = Math.max(maxW - minW, 20);

                  const pts = testsReversed.map((t, i) => {
                    const x = (i / (testsReversed.length - 1)) * 500;
                    const y = 90 - ((t.wpm - minW) / range) * 80;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={pts}
                      />
                      {testsReversed.map((t, i) => {
                        const x = (i / (testsReversed.length - 1)) * 500;
                        const y = 90 - ((t.wpm - minW) / range) * 80;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
                            <text x={x} y={y - 8} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                              {t.wpm}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {recentTests.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <RotateCcw className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No typing tests recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">Take your first typing sprint to see your progress here.</p>
            <Link
              to="/practice"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-sky-600 hover:bg-sky-500 text-xs"
            >
              Start Typing Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Mode</th>
                  <th className="pb-3">Speed</th>
                  <th className="pb-3">Accuracy</th>
                  <th className="pb-3">Errors</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3 pr-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentTests.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 pl-2 font-sans font-medium text-slate-300 capitalize text-xs">
                      {t.mode || '1min'}
                    </td>
                    <td className="py-3.5 font-bold text-sky-400">
                      {t.wpm} <span className="text-[10px] text-slate-500">WPM</span>
                    </td>
                    <td className="py-3.5 text-emerald-400 font-semibold">
                      {t.accuracy}%
                    </td>
                    <td className="py-3.5 text-rose-400 text-xs">
                      {t.errors || 0}
                    </td>
                    <td className="py-3.5 text-slate-400 text-xs font-sans">
                      {t.duration}s
                    </td>
                    <td className="py-3.5 pr-2 text-right text-xs text-slate-500 font-sans">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
