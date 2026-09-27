import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Users,
  Trophy,
  Play,
  RotateCcw,
  Zap,
  Target,
  Flag,
  Copy,
  Check,
  Crown,
  Sparkles,
  ArrowRight,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { soundService } from '../services/soundService.js';
import { api } from '../services/api.js';

const SAMPLE_RACE_TEXTS = [
  "Speed is not about rushing through keys; it is the rhythm of clarity, deliberate practice, and effortless precision on the home row.",
  "The quiet hum of a workspace paired with the tactile response of mechanical switches creates a sanctuary for deep mental flow.",
  "Clean code is not written by luck; it is crafted through disciplined thought, rigorous refactoring, and continuous refinement.",
  "Technology moves at a relentless pace, and the keyboard remains humanity's primary conduit to digital creativity and discovery."
];

export function MultiplayerPage() {
  const { user } = useAuth();
  const { settings, updateSetting } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'room'
  const [roomCode, setRoomCode] = useState('SPEED-92');
  const [copiedCode, setCopiedCode] = useState(false);

  // Race lifecycle: 'lobby' | 'countdown' | 'racing' | 'finished'
  const [raceState, setRaceState] = useState('lobby');
  const [countdown, setCountdown] = useState(3);

  // Passage & Typing state
  const [raceText, setRaceText] = useState(SAMPLE_RACE_TEXTS[0]);
  const [charStates, setCharStates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [userWpm, setUserWpm] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Competitors
  const [competitors, setCompetitors] = useState([
    { id: 'comp-1', name: 'VelocityViper', targetWpm: 84, progress: 0, finished: false, finishTime: null, avatar: '⚡' },
    { id: 'comp-2', name: 'KeyNinja_99', targetWpm: 92, progress: 0, finished: false, finishTime: null, avatar: '🥷' },
    { id: 'comp-3', name: 'FingerFrenzy', targetWpm: 76, progress: 0, finished: false, finishTime: null, avatar: '🔥' },
  ]);

  const [standings, setStandings] = useState([]);

  const inputRef = useRef(null);
  const raceTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const competitorTimerRef = useRef(null);

  // Initialize passage
  const initPassage = useCallback(() => {
    const text = SAMPLE_RACE_TEXTS[Math.floor(Math.random() * SAMPLE_RACE_TEXTS.length)];
    setRaceText(text);
    setCharStates(new Array(text.length).fill('pending'));
    setCurrentIndex(0);
    setCorrectCount(0);
    setErrorCount(0);
    setUserWpm(0);
    setElapsedSeconds(0);
    setStandings([]);
    setCompetitors([
      { id: 'comp-1', name: 'VelocityViper', targetWpm: Math.floor(78 + Math.random() * 15), progress: 0, finished: false, finishTime: null, avatar: '⚡' },
      { id: 'comp-2', name: 'KeyNinja_99', targetWpm: Math.floor(85 + Math.random() * 15), progress: 0, finished: false, finishTime: null, avatar: '🥷' },
      { id: 'comp-3', name: 'FingerFrenzy', targetWpm: Math.floor(70 + Math.random() * 15), progress: 0, finished: false, finishTime: null, avatar: '🔥' },
    ]);
  }, []);

  useEffect(() => {
    initPassage();
    return () => {
      if (raceTimerRef.current) clearInterval(raceTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (competitorTimerRef.current) clearInterval(competitorTimerRef.current);
    };
  }, [initPassage]);

  // Start race countdown
  const startRaceCountdown = () => {
    initPassage();
    setRaceState('countdown');
    setCountdown(3);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          startRacingPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Racing Phase
  const startRacingPhase = () => {
    setRaceState('racing');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);

    const startTime = Date.now();

    // User Timer
    raceTimerRef.current = setInterval(() => {
      const elapsed = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
      setElapsedSeconds(elapsed);
    }, 500);

    // Simulated Competitor Motion
    competitorTimerRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;

      setCompetitors((prev) =>
        prev.map((c) => {
          if (c.finished) return c;
          const charsTyped = (c.targetWpm * 5 / 60) * elapsedSec;
          const progress = Math.min(100, (charsTyped / raceText.length) * 100);

          if (progress >= 100 && !c.finished) {
            const finishTime = elapsedSec.toFixed(1);
            setStandings((st) => [
              ...st,
              { name: c.name, avatar: c.avatar, wpm: c.targetWpm, time: finishTime }
            ]);
            return { ...c, progress: 100, finished: true, finishTime };
          }
          return { ...c, progress };
        })
      );
    }, 300);
  };

  // Finish Race for Player
  const finishPlayerRace = () => {
    if (raceTimerRef.current) clearInterval(raceTimerRef.current);
    if (competitorTimerRef.current) clearInterval(competitorTimerRef.current);

    setRaceState('finished');
    const finalWpm = Math.round((correctCount / 5) / (Math.max(1, elapsedSeconds) / 60)) || 0;
    const finalTime = elapsedSeconds.toFixed(1);

    setStandings((st) => [
      ...st,
      { name: user?.name || 'You', avatar: '🏎️', wpm: finalWpm, time: finalTime, isUser: true }
    ]);

    soundService.playCompletionSound(settings.soundVolume, settings.soundEnabled);

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}

    // Save test result to API if authenticated
    api.saveTypingResult({
      wpm: finalWpm,
      accuracy: Math.round((correctCount / (correctCount + errorCount || 1)) * 100),
      errors: errorCount,
      duration: elapsedSeconds,
      mode: 'quick',
      category: 'multiplayer'
    }).catch(() => {});
  };

  // Keyboard input handler
  const handleKeyDown = (e) => {
    if (raceState !== 'racing') return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
        const prevIdx = currentIndex - 1;
        const nextStates = [...charStates];
        nextStates[prevIdx] = 'pending';
        setCharStates(nextStates);
        setCurrentIndex(prevIdx);
        soundService.playKeyPress(settings.soundType, settings.soundVolume, settings.soundEnabled);
      }
      return;
    }

    if (e.key.length === 1 && currentIndex < raceText.length) {
      const expectedChar = raceText[currentIndex];
      const isCorrect = e.key === expectedChar;

      const nextStates = [...charStates];
      if (isCorrect) {
        nextStates[currentIndex] = 'correct';
        setCorrectCount((c) => c + 1);
        soundService.playKeyPress(settings.soundType, settings.soundVolume, settings.soundEnabled);
      } else {
        nextStates[currentIndex] = 'incorrect';
        setErrorCount((err) => err + 1);
        soundService.playErrorSound(settings.soundVolume, settings.soundEnabled);
      }

      setCharStates(nextStates);
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      // Realtime WPM
      const mins = Math.max(1, elapsedSeconds) / 60;
      setUserWpm(Math.round(((correctCount + (isCorrect ? 1 : 0)) / 5) / mins));

      if (nextIdx >= raceText.length) {
        finishPlayerRace();
      }
    }
  };

  const userProgress = raceText.length > 0 ? Math.min(100, (currentIndex / raceText.length) * 100) : 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success('Room code copied! Share with friends to race.');
  };

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
      onClick={() => {
        if (raceState === 'racing' && inputRef.current) inputRef.current.focus();
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl sm:text-4xl font-black text-white font-mono">
              1v1 MULTIPLAYER RACING ARENA
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time head-to-head sprint racing. Test your velocity against live contenders.
          </p>
        </div>

        {/* Mode Switcher Pills */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
              activeTab === 'quick'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quick Race
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
              activeTab === 'room'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Private Room
          </button>
        </div>
      </div>

      {/* Private Room Info (If Private Room Tab Active) */}
      {activeTab === 'room' && (
        <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white font-mono">Private Race Room Code: <strong className="text-purple-300">{roomCode}</strong></p>
              <p className="text-xs text-slate-400">Give this code to your opponent to race on the exact same passage.</p>
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono uppercase"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'COPIED!' : 'COPY CODE'}
          </button>
        </div>
      )}

      {/* Multi-Lane Race Track */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Flag className="w-4 h-4 text-emerald-400" /> LIVE RACE TRACK
          </span>
          <span>{raceState === 'racing' ? `Elapsed: ${elapsedSeconds}s` : 'Status: Ready'}</span>
        </div>

        {/* Lanes */}
        <div className="space-y-4">
          {/* User's Lane */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-sky-500/40 relative">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                🏎️ {user?.name || 'You (Player)'}
              </span>
              <span className="text-white font-black">{userWpm} WPM &bull; {Math.round(userProgress)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full"
                style={{ width: `${userProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Competitor Lanes */}
          {competitors.map((comp) => (
            <div key={comp.id} className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 relative">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  {comp.avatar} {comp.name}
                </span>
                <span className="text-slate-400 font-mono">
                  {comp.finished ? `Finished (${comp.finishTime}s)` : `${comp.targetWpm} WPM &bull; ${Math.round(comp.progress)}%`}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${comp.progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Race Stage / Typing Canvas */}
      {raceState === 'lobby' ? (
        <div className="p-12 rounded-3xl bg-slate-950/70 border border-slate-800 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/40">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-mono">
              READY ON THE STARTING GRID
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Place your hands on the home row. When the lights go green, type as fast and accurately as possible.
            </p>
          </div>
          <button
            onClick={startRaceCountdown}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-500/25 text-sm font-mono uppercase tracking-wider transform hover:-translate-y-0.5 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            ENTER RACE NOW
          </button>
        </div>
      ) : raceState === 'countdown' ? (
        <div className="p-16 rounded-3xl bg-slate-950 border border-amber-500/40 text-center space-y-4 shadow-2xl">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            GET READY...
          </p>
          <div className="text-7xl sm:text-9xl font-black text-white font-mono animate-pulse">
            {countdown === 0 ? 'GO!' : countdown}
          </div>
          <p className="text-xs text-slate-400 font-mono">Focus your eyes on the text</p>
        </div>
      ) : raceState === 'racing' ? (
        <div
          className="relative p-8 sm:p-10 rounded-3xl bg-slate-950 border border-sky-500/40 shadow-2xl min-h-[220px] flex flex-col justify-center cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            value=""
            onChange={() => {}}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          <div className="font-mono text-xl sm:text-2xl sm:leading-relaxed leading-relaxed tracking-wide select-none break-words">
            {raceText.split('').map((char, index) => {
              const state = charStates[index];
              const isCurrent = index === currentIndex;

              let charClass = 'text-slate-500';
              if (state === 'correct') {
                charClass = 'text-emerald-400 font-medium';
              } else if (state === 'incorrect') {
                charClass = 'text-rose-400 bg-rose-500/20 rounded px-0.5 font-bold';
              }

              return (
                <span
                  key={index}
                  className={`relative ${charClass} ${
                    isCurrent ? 'bg-sky-500/20 text-white font-bold rounded' : ''
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -left-[2px] top-0 bottom-0 w-[2.5px] bg-sky-400 animate-cursor-blink shadow-sm shadow-sky-400" />
                  )}
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        /* Finished Podium & Standings */
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 border border-amber-500/40 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-1">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase">
              RACE FINISHED!
            </h2>
            <p className="text-xs text-slate-400 mt-1">Here are the final standings across the grid:</p>
          </div>

          {/* Standings Table */}
          <div className="max-w-md mx-auto divide-y divide-slate-800/80 font-mono text-sm border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
            {standings.map((st, i) => (
              <div
                key={i}
                className={`p-3.5 flex items-center justify-between ${
                  st.isUser ? 'bg-sky-950/40 text-sky-300 font-bold' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    i === 0 ? 'bg-amber-400 text-slate-950' : i === 1 ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{i + 1}
                  </span>
                  <span>{st.avatar} {st.name} {st.isUser && '(YOU)'}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-sky-400">{st.wpm} WPM</span>
                  <span className="text-slate-500 text-xs ml-2">{st.time}s</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={startRaceCountdown}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 text-xs font-mono uppercase tracking-wider shadow-lg"
            >
              <RotateCcw className="w-4 h-4" /> RACE AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
