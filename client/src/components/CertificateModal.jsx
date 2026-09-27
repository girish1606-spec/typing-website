import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  Printer,
  X,
  Share2,
  Download,
  ShieldCheck,
  Sparkles,
  Trophy
} from 'lucide-react';

export function CertificateModal({
  isOpen,
  onClose,
  userName = 'Speed Typist',
  wpm = 94,
  accuracy = 98.5,
  duration = 60,
  mode = '1 Minute Challenge',
  rating = 'Typing Grandmaster',
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}) {
  const certificateRef = useRef(null);

  if (!isOpen) return null;

  const certificateId = `TS-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const text = `🏆 Official TYPE SPEED Certificate\nCertified: ${userName}\nSpeed: ${wpm} WPM | Accuracy: ${accuracy}%\nRank: ${rating}\nID: ${certificateId}\nVerified at http://localhost:5173`;
    navigator.clipboard.writeText(text);
    alert('Certificate verification summary copied to clipboard!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-700 shadow-2xl relative my-8"
        >
          {/* Action Bar (Not printed) */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 print:hidden">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Official Proficiency Certificate</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md font-mono uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:text-white"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Canvas / Frame */}
          <div
            ref={certificateRef}
            className="p-8 sm:p-14 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-4 border-amber-500/60 shadow-2xl relative text-center text-slate-100 overflow-hidden font-sans print:m-0 print:border-amber-600 print:text-black print:bg-white"
          >
            {/* Corner Decorative Filigree Elements */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400/80" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400/80" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400/80" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400/80" />

            {/* Inner Border */}
            <div className="absolute inset-4 border border-amber-500/20 pointer-events-none rounded-xl" />

            {/* Ambient Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800/10 text-9xl font-black select-none pointer-events-none tracking-widest font-mono">
              TYPE SPEED
            </div>

            {/* Header / Seal */}
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-xl mb-1 border-2 border-yellow-200">
                <Trophy className="w-8 h-8" />
              </div>

              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400 font-mono">
                International Typing Standards &bull; Verified Benchmark
              </p>

              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
                Certificate of Typing Proficiency
              </h1>

              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-3" />

              <p className="text-xs text-slate-400 font-serif italic">
                This official credential certifies that
              </p>

              {/* Recipient Name */}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight py-1 font-mono uppercase">
                {userName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                has successfully completed the standardized velocity examination on the{' '}
                <strong className="text-white">TYPE SPEED Platform</strong>, exhibiting outstanding keystroke fluency, zero-latency rhythm, and verified finger agility.
              </p>

              {/* Performance Metrics Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 max-w-2xl mx-auto">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
                  <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Velocity</p>
                  <p className="text-2xl font-black text-white font-mono">{wpm} <span className="text-xs text-slate-400">WPM</span></p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                  <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Accuracy</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">{accuracy}%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/30">
                  <p className="text-[10px] text-sky-400 font-mono uppercase tracking-wider">Duration</p>
                  <p className="text-2xl font-black text-white font-mono">{duration}s</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30">
                  <p className="text-[10px] text-purple-400 font-mono uppercase tracking-wider">Skill Level</p>
                  <p className="text-sm font-bold text-purple-300 truncate mt-1">{rating}</p>
                </div>
              </div>

              {/* Signatures & Gold Seal */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                {/* Authority Signature */}
                <div className="text-center sm:text-left space-y-1">
                  <p className="font-serif italic text-sm text-slate-300">Marcus Vance</p>
                  <div className="w-36 h-[1px] bg-slate-700" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    Director of Velocity Standards
                  </p>
                </div>

                {/* Wax / Ribbon Seal */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border border-amber-300/40">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <span className="text-[8px] font-black tracking-widest text-amber-300 uppercase">VERIFIED</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1">ID: {certificateId}</span>
                </div>

                {/* Verification Date */}
                <div className="text-center sm:text-right space-y-1">
                  <p className="font-mono text-xs text-slate-300">{date}</p>
                  <div className="w-36 h-[1px] bg-slate-700" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    Date of Certification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
