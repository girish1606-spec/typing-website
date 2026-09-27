import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  Zap,
  Target,
  Clock,
  Search,
  ArrowRight,
  TrendingUp,
  Activity,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const LEADERBOARD_MODES = [
  { id: 'all', label: 'Overall Champions' },
  { id: 'quick', label: '15s Sprint' },
  { id: '1min', label: '1 Minute' },
  { id: '3min', label: '3 Minutes' },
  { id: '5min', label: '5 Minutes' },
];

export function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [topThree, setTopThree] = useState({ gold: null, silver: null, bronze: null });
  const [rankings, setRankings] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await api.getLeaderboard({ mode: selectedMode, limit: 100 });
        if (res && res.success) {
          setTopThree(res.topThree || { gold: null, silver: null, bronze: null });
          setRankings(res.rankings || []);
          setTotalParticipants(res.totalParticipants || 0);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [selectedMode]);

  const filteredRankings = rankings.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const formatPracticeTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      return `${(mins / 60).toFixed(1)} hrs`;
    }
    return `${mins}m`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest"
        >
          <Trophy className="w-4 h-4 fill-amber-400" />
          Global Typist Hall of Fame
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          WORLDWIDE <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300">LEADERBOARD</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Compete against the world's most disciplined speed typists. Every keystroke is verified and benchmarked in real-time.
        </p>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {LEADERBOARD_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all font-mono uppercase tracking-wider ${
                selectedMode === mode.id
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border border-sky-400'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium (Gold, Silver, Bronze) */}
      {!loading && (topThree.gold || topThree.silver || topThree.bronze) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
          {/* 2nd Place (Silver) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1 p-6 rounded-3xl bg-slate-950/80 border border-slate-700/60 shadow-xl relative text-center flex flex-col items-center justify-between min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 border border-slate-600 flex items-center justify-center shadow-lg -mt-10 mb-3">
              <Medal className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">
              RANK #2 &bull; SILVER
            </span>
            <div className="my-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-black text-xl flex items-center justify-center mx-auto mb-2 border-2 border-slate-500 shadow-md">
                {topThree.silver?.name?.charAt(0).toUpperCase() || '2'}
              </div>
              <h3 className="font-bold text-white text-base truncate max-w-[200px]">
                {topThree.silver?.name || 'Awaiting Contender'}
              </h3>
              {topThree.silver?.subscriptionStatus === 'active' && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              )}
            </div>
            <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-around font-mono text-xs">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Velocity</p>
                <p className="font-black text-slate-200 text-base">{topThree.silver?.bestWpm || 0} WPM</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Accuracy</p>
                <p className="font-semibold text-emerald-400">{topThree.silver?.bestAccuracy || 0}%</p>
              </div>
            </div>
          </motion.div>

          {/* 1st Place (Gold) - Elevated */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-950/90 to-slate-950 border-2 border-amber-400/60 shadow-2xl shadow-amber-500/15 relative text-center flex flex-col items-center justify-between min-h-[330px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 -mt-14 mb-3 border-2 border-yellow-300">
              <Crown className="w-7 h-7 fill-slate-950" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-widest font-mono">
              <Sparkles className="w-3 h-3" /> REIGNING CHAMPION #1
            </span>
            <div className="my-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mb-2 border-4 border-amber-400 shadow-xl">
                {topThree.gold?.name?.charAt(0).toUpperCase() || '1'}
              </div>
              <h3 className="font-black text-white text-lg truncate max-w-[220px]">
                {topThree.gold?.name || 'Awaiting Champion'}
              </h3>
              {topThree.gold?.subscriptionStatus === 'active' && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-sm">
                  PRO MEMBER
                </span>
              )}
            </div>
            <div className="w-full pt-4 border-t border-amber-500/20 flex items-center justify-around font-mono">
              <div>
                <p className="text-[10px] text-amber-300/70 uppercase">Velocity</p>
                <p className="font-black text-amber-300 text-2xl tracking-tight">{topThree.gold?.bestWpm || 0} WPM</p>
              </div>
              <div>
                <p className="text-[10px] text-amber-300/70 uppercase">Accuracy</p>
                <p className="font-black text-emerald-400 text-lg">{topThree.gold?.bestAccuracy || 0}%</p>
              </div>
            </div>
          </motion.div>

          {/* 3rd Place (Bronze) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="order-3 p-6 rounded-3xl bg-slate-950/80 border border-amber-700/40 shadow-xl relative text-center flex flex-col items-center justify-between min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-900/60 text-amber-400 border border-amber-700/60 flex items-center justify-center shadow-lg -mt-10 mb-3">
              <Medal className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 font-mono">
              RANK #3 &bull; BRONZE
            </span>
            <div className="my-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 font-black text-xl flex items-center justify-center mx-auto mb-2 border-2 border-amber-700/60 shadow-md">
                {topThree.bronze?.name?.charAt(0).toUpperCase() || '3'}
              </div>
              <h3 className="font-bold text-white text-base truncate max-w-[200px]">
                {topThree.bronze?.name || 'Awaiting Contender'}
              </h3>
              {topThree.bronze?.subscriptionStatus === 'active' && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              )}
            </div>
            <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-around font-mono text-xs">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Velocity</p>
                <p className="font-black text-slate-200 text-base">{topThree.bronze?.bestWpm || 0} WPM</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Accuracy</p>
                <p className="font-semibold text-emerald-400">{topThree.bronze?.bestAccuracy || 0}%</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Table Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Full Leaderboard Rankings</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filteredRankings.length} {filteredRankings.length === 1 ? 'Typist' : 'Typists'}
            </span>
          </div>

          {/* Search Typists */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search typist..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredRankings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No typist rankings found.</p>
            <p className="text-xs text-slate-500 mt-1">Be the first to record a score in this category!</p>
            <Link
              to="/practice"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 text-xs font-mono uppercase"
            >
              Start Typing Sprint
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">
                  <th className="pb-3 pl-3 w-16">Rank</th>
                  <th className="pb-3">Typist</th>
                  <th className="pb-3 text-right">Top Speed</th>
                  <th className="pb-3 text-right">Accuracy</th>
                  <th className="pb-3 text-right hidden sm:table-cell">Practices</th>
                  <th className="pb-3 pr-3 text-right hidden md:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredRankings.map((typist) => {
                  const isCurrentUser = user && (typist.userId === user._id || typist.userId === user.id);

                  return (
                    <tr
                      key={typist.userId || typist.rank}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isCurrentUser ? 'bg-sky-950/30 border-l-4 border-l-sky-400' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 pl-3">
                        {typist.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                            1
                          </span>
                        ) : typist.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-300 text-slate-950 font-black text-xs shadow-md">
                            2
                          </span>
                        ) : typist.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-700 text-white font-black text-xs shadow-md">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs pl-2">
                            #{typist.rank}
                          </span>
                        )}
                      </td>

                      {/* Typist Profile Column */}
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {typist.name ? typist.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-bold text-white text-sm">
                                {typist.name}
                              </span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold border border-sky-500/30">
                                  YOU
                                </span>
                              )}
                              {typist.subscriptionStatus === 'active' && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                                  PRO
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-sans">
                              {typist.role === 'developer' ? 'Verified Developer' : 'Active Typist'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Best Speed */}
                      <td className="py-4 text-right">
                        <span className="text-base font-black text-sky-400">
                          {typist.bestWpm}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">WPM</span>
                      </td>

                      {/* Best Accuracy */}
                      <td className="py-4 text-right text-emerald-400 font-semibold text-xs">
                        {typist.bestAccuracy}%
                      </td>

                      {/* Tests Completed */}
                      <td className="py-4 text-right text-slate-400 text-xs hidden sm:table-cell">
                        {typist.testsCompleted || '-'}
                      </td>

                      {/* Total Practice Time */}
                      <td className="py-4 pr-3 text-right text-slate-500 text-xs hidden md:table-cell">
                        {typist.totalPracticeTime ? formatPracticeTime(typist.totalPracticeTime) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Call to Action Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-950 to-indigo-950/60 border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Think you can claim the <span className="text-amber-400">#1 Spot</span>?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Warm up your fingers, dial in your mechanical acoustics, and enter the sprint arena.
          </p>
        </div>

        <Link
          to="/practice"
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-teal-300 hover:from-sky-300 hover:to-teal-200 shadow-xl shadow-sky-500/20 text-xs font-mono uppercase tracking-wider shrink-0 transition-transform transform hover:-translate-y-0.5"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          START SPRINT CHALLENGE <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
