import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  CheckCircle,
  Zap,
  Volume2,
  Palette,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function SubscriptionPage() {
  const { isAuthenticated, isPremium, isSubscriptionPending } = useAuth();
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: 'Advanced Typing Tests',
      desc: 'Exclusive access to coding passages, technical syntax, and literature endurance tests.',
    },
    {
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      title: 'Detailed Performance Statistics',
      desc: 'Deep keystroke heatmaps, speed progression curves, and consistency analysis.',
    },
    {
      icon: <Palette className="w-5 h-5 text-rose-400" />,
      title: 'All 8 Premium Themes Unlocked',
      desc: 'Midnight, Ocean, Forest, Sunset, Cyber, Neon, Classic, and Minimal visual environments.',
    },
    {
      icon: <Volume2 className="w-5 h-5 text-emerald-400" />,
      title: 'All Typing Sound Profiles',
      desc: 'Authentic mechanical thocks, clicky blue switches, vintage typewriters, and cushioned taps.',
    },
    {
      icon: <Crown className="w-5 h-5 text-yellow-400" />,
      title: 'Advanced Keyboard Customization',
      desc: 'Sculpt key shapes, sizes, tactile animations, spacing, and accent color highlights.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
      title: 'Premium Practice Modes',
      desc: 'Custom text input practice, timed leaderboards, and zero-error mastery drills.',
    },
  ];

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/payment' } } });
    } else {
      navigate('/payment');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Crown className="w-4 h-4 fill-amber-300" />
          Pro Membership
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          TYPE SPEED PREMIUM — <span className="text-amber-400 font-mono">₹1</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
          Upgrade your typing experience with complete access to advanced tests, sound engines, custom aesthetics, and detailed analytics.
        </p>
      </div>

      {/* Main Pricing Card */}
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-8 sm:p-12 glass-panel border border-amber-500/40 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle amber gradient banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Official Plan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                TYPE SPEED PREMIUM PASS
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Lifetime access to all current and upcoming premium features
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1 font-mono">
                <span className="text-5xl font-black text-amber-400">₹1</span>
                <span className="text-slate-400 text-sm font-sans font-medium">/ one-time</span>
              </div>
              <span className="text-[11px] text-slate-500">Tax inclusive &bull; Secure UPI</span>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button & Badges */}
          <div className="pt-6 border-t border-slate-800 flex flex-col items-center gap-4">
            {isPremium ? (
              <div className="w-full py-4 px-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-center font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                You are already a Premium Member!
              </div>
            ) : isSubscriptionPending ? (
              <div className="w-full py-4 px-6 rounded-2xl bg-sky-950/60 border border-sky-500/40 text-sky-200 text-center font-bold text-sm flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-sky-400" />
                Payment submitted. Awaiting developer verification.
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                className="w-full py-4 px-8 rounded-2xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-2 uppercase tracking-wider font-mono"
              >
                SUBSCRIBE FOR ₹1 <ArrowRight className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> Developer Approval Workflow
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> 100% Refundable Guarantee
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
