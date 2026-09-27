import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  Clock,
  Sparkles,
  Sliders,
  Volume2,
  Palette,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Crown,
  Play,
  RotateCcw
} from 'lucide-react';
import { soundService } from '../services/soundService.js';
import { useTheme } from '../context/ThemeContext.jsx';

export function LandingPage() {
  const { settings } = useTheme();

  // Interactive Hero Preview state
  const heroSample = "Practice smarter, type faster, and master your keystroke accuracy.";
  const [heroTyped, setHeroTyped] = useState('');
  const [heroStartTime, setHeroStartTime] = useState(null);
  const [heroWpm, setHeroWpm] = useState(0);
  const heroInputRef = useRef(null);

  const handleHeroKeyDown = (e) => {
    if (e.key === 'Backspace') {
      setHeroTyped((prev) => prev.slice(0, -1));
      soundService.playKeyPress(settings.soundType, settings.soundVolume, settings.soundEnabled);
      return;
    }
    if (e.key.length === 1 && heroTyped.length < heroSample.length) {
      if (!heroStartTime) setHeroStartTime(Date.now());
      const nextTyped = heroTyped + e.key;
      setHeroTyped(nextTyped);

      const isCorrect = e.key === heroSample[heroTyped.length];
      if (isCorrect) {
        soundService.playKeyPress(settings.soundType, settings.soundVolume, settings.soundEnabled);
      } else {
        soundService.playErrorSound(settings.soundVolume, settings.soundEnabled);
      }

      // Compute quick live WPM
      const elapsedMins = (Date.now() - (heroStartTime || Date.now())) / 60000;
      if (elapsedMins > 0) {
        const correctChars = nextTyped.split('').filter((c, i) => c === heroSample[i]).length;
        setHeroWpm(Math.round((correctChars / 5) / elapsedMins) || 0);
      }
    }
  };

  const resetHeroTyping = (e) => {
    e.stopPropagation();
    setHeroTyped('');
    setHeroStartTime(null);
    setHeroWpm(0);
    heroInputRef.current?.focus();
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-sky-400" />,
      title: 'Real-Time WPM',
      desc: 'Instant calculation of net words-per-minute, gross typing cadence, and raw velocity with millisecond precision.',
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      title: 'Accuracy Tracking',
      desc: 'Pinpoint keystroke precision, error identification, and character-level heatmaps to elevate your consistency.',
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-400" />,
      title: 'Timed Typing Tests',
      desc: 'Standardized tests from quick 15-second sprints to rigorous 5-minute endurance challenges.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: 'Diverse Practice Modes',
      desc: 'Engage with common English vocabulary, developer code syntax, famous historical quotes, and custom passages.',
    },
    {
      icon: <Sliders className="w-6 h-6 text-fuchsia-400" />,
      title: 'Keyboard Customization',
      desc: 'Interactive tactile visual keyboard with adjustable keycaps, shapes, animations, and target-key guidance.',
    },
    {
      icon: <Volume2 className="w-6 h-6 text-cyan-400" />,
      title: 'Real Typing Sounds',
      desc: 'Synthesized mechanical thocks, soft domes, vintage typewriters, and clicky switches via Web Audio API.',
    },
    {
      icon: <Palette className="w-6 h-6 text-rose-400" />,
      title: 'Stunning Themes',
      desc: 'Immerse yourself in 8 high-contrast palettes: Midnight, Ocean, Forest, Sunset, Cyber, Neon, Classic, and Minimal.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-teal-400" />,
      title: 'Progress Tracking',
      desc: 'Persistent metrics, best scores, historical graphs, and progression curves saved to your personal profile.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create an Account',
      desc: 'Sign up in seconds to unlock personalized tracking, cloud preference sync, and historical analytics.',
    },
    {
      step: '02',
      title: 'Choose Your Typing Mode',
      desc: 'Select from quick sprint, 1-minute, 3-minute, 5-minute endurance, or relaxed practice mode.',
    },
    {
      step: '03',
      title: 'Practice with Real Audio & Visuals',
      desc: 'Type smooth passages with real mechanical switch feedback and interactive on-screen keyboard cues.',
    },
    {
      step: '04',
      title: 'Track Your Performance',
      desc: 'Review comprehensive metrics, accuracy ratings, error breakdowns, and watch your WPM climb.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-600/20 via-indigo-600/20 to-teal-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold tracking-wide uppercase mb-6 shadow-inner"
          >
            <Zap className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
            Next-Gen Typing Practice Platform
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none font-sans"
          >
            Master Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400">
              Typing Speed
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-2xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Practice smarter. Type faster. Improve your accuracy.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/practice"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base sm:text-lg font-bold text-white bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:via-sky-500 hover:to-indigo-500 shadow-xl shadow-sky-500/30 transition-all transform hover:-translate-y-1"
            >
              <Play className="w-5 h-5 fill-white" />
              START TYPING
            </Link>

            <Link
              to="/subscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-semibold text-slate-200 bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/60 hover:text-white transition-all backdrop-blur-md"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              Premium ₹1 Subscription
            </Link>
          </motion.div>

          {/* Interactive Live Hero Typing Box */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            onClick={() => heroInputRef.current?.focus()}
            className="mt-16 max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl border text-left relative overflow-hidden cursor-text"
          >
            <input
              ref={heroInputRef}
              type="text"
              value=""
              onChange={() => {}}
              onKeyDown={handleHeroKeyDown}
              className="absolute opacity-0 pointer-events-none w-0 h-0"
              autoComplete="off"
            />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">TYPE SPEED &bull; Interactive Sandbox</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-sky-400 font-bold">{heroWpm > 0 ? `${heroWpm} WPM` : '0 WPM'}</span>
                <button
                  onClick={resetHeroTyping}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Reset Sandbox"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-lg sm:text-2xl font-mono leading-relaxed select-none break-words min-h-[70px]">
              {heroSample.split('').map((char, index) => {
                const typedChar = heroTyped[index];
                const isCurrent = index === heroTyped.length;

                let charClass = 'text-slate-600';
                if (typedChar !== undefined) {
                  charClass = typedChar === char ? 'text-sky-400 font-medium' : 'text-rose-400 bg-rose-500/20 rounded font-bold';
                }

                return (
                  <span
                    key={index}
                    className={`relative ${charClass} ${isCurrent ? 'bg-sky-500/20 text-white rounded' : ''}`}
                  >
                    {isCurrent && (
                      <span className="absolute -left-[2px] top-0 bottom-0 w-[2.5px] bg-sky-400 animate-cursor-blink shadow-sm shadow-sky-400" />
                    )}
                    {char}
                  </span>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Click here and start typing to test your speed instantly</span>
              </div>
              <Link to="/practice" className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                Full Practice Mode <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-950/40 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-sky-400">Engineered for Typists</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything You Need to Type at Lightning Speed
            </p>
            <p className="mt-3 text-base text-slate-400">
              Professional tools and micro-interactions designed to push your typing past 100+ Words Per Minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl glass-panel glass-panel-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-md">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-sky-400">Seamless Flow</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How It Works
            </p>
            <p className="mt-3 text-base text-slate-400">
              Follow these simple steps to start leveling up your typing agility right away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl glass-panel border border-slate-800/80 flex flex-col"
              >
                <span className="text-4xl font-black text-sky-500/20 font-mono mb-2">{s.step}</span>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Section (₹1 Promo Card) */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 glass-panel border border-amber-500/30 relative shadow-2xl">
            <div className="absolute -top-3 right-8 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg">
              SPECIAL ACCESS &bull; ₹1 ONLY
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-6 h-6 text-amber-400" />
                  <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                    TYPE SPEED PREMIUM
                  </span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  Unlock Complete Professional Typing Mastery
                </h3>
                <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                  Gain instant access to advanced typing tests, in-depth analytical tracking, all 8 premium themes, tactile switch sound profiles, and priority modes.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Advanced typing tests',
                    'Detailed performance statistics',
                    'All 8 premium themes unlocked',
                    'All typing sound profiles',
                    'Advanced keyboard customization',
                    'Unlimited practice modes',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  One-Time Subscription
                </span>
                <div className="my-2 flex items-baseline justify-center gap-1 font-mono">
                  <span className="text-5xl font-black text-white">₹1</span>
                  <span className="text-slate-400 text-sm font-sans font-medium">/ complete pass</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Secure instant UPI &amp; QR verification. Verified by admin.
                </p>

                <Link
                  to="/subscription"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/20 transition-all text-center"
                >
                  SUBSCRIBE FOR ₹1
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Verified backend transaction workflow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
