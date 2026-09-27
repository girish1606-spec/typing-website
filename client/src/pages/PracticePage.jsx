import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Zap,
  Target,
  Clock,
  RotateCcw,
  Volume2,
  VolumeX,
  Keyboard as KeyboardIcon,
  Crown,
  Trophy,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
  Home,
  FileCode,
  Quote,
  Type,
  FileText,
  X,
  TrendingUp,
  Bot,
  Gamepad2,
  Award
} from 'lucide-react';
import { Keyboard } from '../components/Keyboard.jsx';
import { CertificateModal } from '../components/CertificateModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { soundService } from '../services/soundService.js';
import { api } from '../services/api.js';

const MODES = [
  { id: 'quick', label: '15s Sprint', duration: 15 },
  { id: '1min', label: '1 Minute', duration: 60 },
  { id: '3min', label: '3 Minutes', duration: 180 },
  { id: '5min', label: '5 Minutes', duration: 300 },
  { id: 'practice', label: 'Practice (Unlimited)', duration: null },
];

const CATEGORIES = [
  { id: 'standard', label: 'Standard Prose', icon: <Type className="w-3.5 h-3.5" /> },
  { id: 'code', label: 'Developer Code', icon: <FileCode className="w-3.5 h-3.5" /> },
  { id: 'quotes', label: 'Famous Quotes', icon: <Quote className="w-3.5 h-3.5" /> },
  { id: 'words', label: 'Common Words', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'custom', label: 'Custom Text', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
];

const PACE_BOT_OPTIONS = [
  { wpm: 0, label: 'Bot Off' },
  { wpm: 40, label: '40 WPM' },
  { wpm: 60, label: '60 WPM' },
  { wpm: 80, label: '80 WPM' },
  { wpm: 100, label: '100 WPM' },
  { wpm: 120, label: '120 WPM' },
];

export function PracticePage() {
  const { user, isPremium } = useAuth();
  const { settings, updateSetting } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  // Test state
  const [selectedMode, setSelectedMode] = useState('1min');
  const [selectedCategory, setSelectedCategory] = useState('standard');
  const [paceBotWpm, setPaceBotWpm] = useState(0);
  const [targetText, setTargetText] = useState('');
  const [loadingText, setLoadingText] = useState(true);
  const [activeKey, setActiveKey] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [certificateOpen, setCertificateOpen] = useState(false);

  // Custom text modal state
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

  // Performance metrics state
  const [charStates, setCharStates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [wpmHistory, setWpmHistory] = useState([]);

  // Timing state
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Load passage for selected mode & category
  const fetchPassage = useCallback(async (mode, category) => {
    if (category === 'custom') return;
    try {
      setLoadingText(true);
      const res = await api.getTypingTexts(mode, category);
      if (res && res.text) {
        setTargetText(res.text);
        setCharStates(new Array(res.text.length).fill('pending'));
      }
    } catch {
      const fallback = "Mastering your typing speed requires patience, accurate posture, and steady rhythm. Let your fingers glide smoothly over the keys.";
      setTargetText(fallback);
      setCharStates(new Array(fallback.length).fill('pending'));
    } finally {
      setLoadingText(false);
    }
  }, []);

  // Initialize or reset test
  const resetTest = useCallback((modeToUse = selectedMode, categoryToUse = selectedCategory) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const modeConfig = MODES.find((m) => m.id === modeToUse) || MODES[1];

    setIsStarted(false);
    setIsFinished(false);
    setFinalResult(null);
    setCurrentIndex(0);
    setCorrectCount(0);
    setErrorCount(0);
    setWpm(0);
    setAccuracy(100);
    setElapsedSeconds(0);
    setWpmHistory([]);
    setTimeLeft(modeConfig.duration !== null ? modeConfig.duration : 0);
    setActiveKey('');

    if (categoryToUse !== 'custom') {
      fetchPassage(modeToUse, categoryToUse);
    } else if (customInputText) {
      setTargetText(customInputText);
      setCharStates(new Array(customInputText.length).fill('pending'));
      setLoadingText(false);
    }

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  }, [selectedMode, selectedCategory, customInputText, fetchPassage]);

  useEffect(() => {
    resetTest(selectedMode, selectedCategory);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedMode, selectedCategory]);

  // Finish test and calculate final scores
  const finishTest = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);

    const timeInMinutes = Math.max(elapsedSeconds, 1) / 60;
    const finalWpm = Math.round((correctCount / 5) / timeInMinutes) || 0;
    const totalTyped = correctCount + errorCount;
    const finalAcc = totalTyped > 0 ? Number(((correctCount / totalTyped) * 100).toFixed(1)) : 100;

    let rating = 'Consistent Typist';
    if (finalWpm >= 100) rating = 'Typing Grandmaster';
    else if (finalWpm >= 80) rating = 'Lightning Demon';
    else if (finalWpm >= 60) rating = 'Pro Typist';
    else if (finalWpm >= 40) rating = 'Agile Speedster';

    const resultPayload = {
      wpm: finalWpm,
      rawWpm: Math.round(((totalTyped / 5) / timeInMinutes)) || finalWpm,
      accuracy: finalAcc,
      errors: errorCount,
      correctChars: correctCount,
      incorrectChars: errorCount,
      totalChars: totalTyped,
      duration: elapsedSeconds || 1,
      mode: selectedMode,
      category: selectedCategory,
      rating,
      textSnippet: targetText.slice(0, 80),
      timeline: wpmHistory,
      paceBotWpm,
      beatBot: paceBotWpm > 0 ? finalWpm >= paceBotWpm : null,
    };

    setFinalResult(resultPayload);

    // Audio victory chime
    soundService.playCompletionSound(settings.soundVolume, settings.soundEnabled);

    // Confetti celebration
    if (finalWpm >= 60 || finalAcc >= 95) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#34d399', '#facc15', '#f43f5e']
        });
      } catch {
        // Confetti optional
      }
    }

    // Save test result to backend API
    try {
      await api.saveTypingResult(resultPayload);
    } catch (e) {
      console.warn('Could not sync typing test result:', e);
    }
  }, [correctCount, errorCount, elapsedSeconds, selectedMode, selectedCategory, targetText, wpmHistory, settings]);

  // Timer Tick handler
  useEffect(() => {
    if (!isStarted || isFinished) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        const currentMode = MODES.find((m) => m.id === selectedMode);

        if (currentMode && currentMode.duration !== null) {
          setTimeLeft((tl) => {
            if (tl <= 1) {
              finishTest();
              return 0;
            }
            return tl - 1;
          });
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isFinished, selectedMode, finishTest]);

  // Live WPM, Accuracy, and History recording
  useEffect(() => {
    if (!isStarted || elapsedSeconds === 0) return;
    const timeInMinutes = elapsedSeconds / 60;
    const liveWpm = Math.round((correctCount / 5) / timeInMinutes);
    const totalTyped = correctCount + errorCount;
    const liveAcc = totalTyped > 0 ? Number(((correctCount / totalTyped) * 100).toFixed(1)) : 100;

    setWpm(liveWpm || 0);
    setAccuracy(liveAcc);

    // Track WPM progression every second for timeline chart
    setWpmHistory((prev) => [
      ...prev,
      { second: elapsedSeconds, wpm: liveWpm || 0 }
    ]);
  }, [correctCount, errorCount, elapsedSeconds, isStarted]);

  // Handle Keystrokes & Esc shortcut
  const handleKeyDown = (e) => {
    // Esc to restart
    if (e.key === 'Escape') {
      resetTest();
      return;
    }

    if (isFinished) return;

    // Trigger visual active key reaction on keyboard
    setActiveKey(e.key);
    setTimeout(() => setActiveKey(''), 120);

    // Ignore modifier keys alone
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    // Prevent default scrolling for Space
    if (e.key === ' ') {
      e.preventDefault();
    }

    // Start timer on first genuine keystroke
    if (!isStarted) {
      setIsStarted(true);
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      if (currentIndex > 0) {
        const prevIdx = currentIndex - 1;
        const prevStatus = charStates[prevIdx];
        if (prevStatus === 'correct') {
          setCorrectCount((c) => Math.max(0, c - 1));
        } else if (prevStatus === 'incorrect') {
          setErrorCount((err) => Math.max(0, err - 1));
        }

        const nextStates = [...charStates];
        nextStates[prevIdx] = 'pending';
        setCharStates(nextStates);
        setCurrentIndex(prevIdx);

        soundService.playKeyPress(settings.soundType, settings.soundVolume, settings.soundEnabled);
      }
      return;
    }

    // Character key evaluation
    if (e.key.length === 1 && currentIndex < targetText.length) {
      const expectedChar = targetText[currentIndex];
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
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= targetText.length) {
        finishTest();
      }
    }
  };

  const handleApplyCustomText = () => {
    if (!customInputText.trim()) {
      toast.error('Please enter some text to practice.');
      return;
    }
    setSelectedCategory('custom');
    setTargetText(customInputText.trim());
    setCharStates(new Array(customInputText.trim().length).fill('pending'));
    setCustomModalOpen(false);
    resetTest(selectedMode, 'custom');
    toast.success('Custom practice text applied!');
  };

  const progressPercent = targetText.length > 0 ? Math.min(100, Math.round((currentIndex / targetText.length) * 100)) : 0;
  const botCharsTyped = paceBotWpm > 0 && isStarted ? Math.min(targetText.length, Math.floor((paceBotWpm * 5 / 60) * elapsedSeconds)) : 0;
  const botProgressPercent = targetText.length > 0 ? Math.min(100, Math.round((botCharsTyped / targetText.length) * 100)) : 0;
  const deltaChars = currentIndex - botCharsTyped;
  const deltaWords = Math.round(deltaChars / 5);
  const targetChar = targetText[currentIndex] || '';

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 focus:outline-none"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top Configuration Pill Bar: Duration & Categories */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 rounded-2xl glass-panel border">
        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMode(m.id);
                resetTest(m.id, selectedCategory);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMode === m.id
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.id === 'custom') {
                  setCustomModalOpen(true);
                } else {
                  setSelectedCategory(cat.id);
                  resetTest(selectedMode, cat.id);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Pace Bot / Ghost Racer Selector */}
        <div className="flex items-center gap-1.5 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
          <Bot className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-[11px] font-mono text-slate-400 hidden xl:inline">Ghost Bot:</span>
          <select
            value={paceBotWpm}
            onChange={(e) => {
              setPaceBotWpm(Number(e.target.value));
              resetTest(selectedMode, selectedCategory);
            }}
            className="bg-slate-900 border border-slate-700 text-purple-300 text-xs rounded-xl px-2 py-1 focus:outline-none focus:border-purple-400 font-mono font-medium"
            title="Practice against a target Pace Bot"
          >
            {PACE_BOT_OPTIONS.map((opt) => (
              <option key={opt.wpm} value={opt.wpm}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sound, Keyboard & Restart Quick Toggles */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateSetting('soundEnabled', !settings.soundEnabled);
            }}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              settings.soundEnabled
                ? 'bg-slate-900 border-sky-500/40 text-sky-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Typing Sound"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline capitalize">{settings.soundType}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowKeyboard(!showKeyboard);
            }}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              showKeyboard
                ? 'bg-slate-900 border-sky-500/40 text-sky-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Visual Keyboard"
          >
            <KeyboardIcon className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              resetTest(selectedMode, selectedCategory);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white transition-colors"
            title="Restart Test (or press Esc)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-Time Metrics HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
            <Zap className="w-5 h-5 fill-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{wpm}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">WPM (Speed)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{accuracy}%</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Accuracy</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              {selectedMode === 'practice'
                ? `${elapsedSeconds}s`
                : `${timeLeft}s`}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {selectedMode === 'practice' ? 'Elapsed' : 'Time Remaining'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{progressPercent}%</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Progress</div>
          </div>
        </div>
      </div>

      {/* Race Track / Progress Bar */}
      {paceBotWpm > 0 ? (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 shadow-lg space-y-3 -mt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">🏎️ You ({wpm} WPM)</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-purple-400 font-bold">🤖 Ghost Bot ({paceBotWpm} WPM)</span>
            </div>
            {isStarted && (
              <div className="text-[11px]">
                {deltaChars >= 0 ? (
                  <span className="text-emerald-400 font-bold">+{Math.max(1, deltaWords)} words ahead ⚡</span>
                ) : (
                  <span className="text-rose-400 font-bold">-{Math.abs(deltaWords)} words behind ⚠️</span>
                )}
              </div>
            )}
          </div>

          {/* User Track */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-400 to-teal-400"
                style={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Ghost Bot Track */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${botProgressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden -mt-2">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      {/* Interactive Typing Container */}
      <div
        className="relative p-6 sm:p-10 rounded-3xl glass-panel border shadow-2xl min-h-[220px] flex flex-col justify-center cursor-text"
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

        {loadingText ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading passage...</p>
          </div>
        ) : (
          <div className="font-mono text-xl sm:text-2xl sm:leading-relaxed leading-relaxed tracking-wide select-none break-words">
            {targetText.split('').map((char, index) => {
              const state = charStates[index];
              const isCurrent = index === currentIndex;

              let charClass = 'text-slate-500 transition-colors';
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
        )}

        {/* Practice Mode Manual Finish button */}
        {selectedMode === 'practice' && isStarted && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={finishTest}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg"
            >
              Complete Practice Run
            </button>
          </div>
        )}

        {/* Start typing prompt */}
        {!isStarted && !loadingText && (
          <div className="mt-4 text-xs font-sans text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Click here and start typing to begin the countdown...</span>
            </div>
            <span className="hidden sm:inline text-slate-500 font-mono text-[11px]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Esc</kbd> to restart anytime
            </span>
          </div>
        )}
      </div>

      {/* Visual On-Screen Keyboard */}
      <AnimatePresence>
        {showKeyboard && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
          >
            <Keyboard activeKey={activeKey} targetKey={targetChar} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Text Modal */}
      <AnimatePresence>
        {customModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-slate-700 shadow-2xl relative"
            >
              <button
                onClick={() => setCustomModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Custom Practice Passage</h3>
                  <p className="text-xs text-slate-400">Paste your own articles, code, or quotes</p>
                </div>
              </div>

              <textarea
                rows="6"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="Paste or type your custom text here..."
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
              />

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomText}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg"
                >
                  APPLY CUSTOM TEXT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Results Modal with SVG Speed Graph */}
      <AnimatePresence>
        {isFinished && finalResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl p-8 sm:p-10 rounded-3xl glass-panel border border-slate-700 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-500" />

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 mb-2 border border-sky-500/30">
                  <Trophy className="w-7 h-7 text-amber-400" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-sky-950 text-sky-300 text-xs font-bold tracking-wider uppercase border border-sky-800">
                    {finalResult.rating}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-sans">Typing Test Complete!</h2>
              </div>

              {/* Core Result Cards */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Speed</span>
                  <div className="text-4xl font-black text-sky-400 font-mono my-1">
                    {finalResult.wpm}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">WPM (Words/Min)</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Accuracy</span>
                  <div className="text-4xl font-black text-emerald-400 font-mono my-1">
                    {finalResult.accuracy}%
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Precision Rate</span>
                </div>
              </div>

              {/* Pace Bot Duel Outcome */}
              {finalResult.paceBotWpm > 0 && (
                <div
                  className={`p-3.5 rounded-2xl mb-4 border text-center font-mono text-xs ${
                    finalResult.beatBot
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                      : 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                  }`}
                >
                  {finalResult.beatBot ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-base">🏆</span>
                      <span>
                        <strong>VICTORY!</strong> You outpaced the {finalResult.paceBotWpm} WPM Ghost Bot by{' '}
                        <strong className="text-emerald-400">+{finalResult.wpm - finalResult.paceBotWpm} WPM</strong>!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-base">🤖</span>
                      <span>
                        The {finalResult.paceBotWpm} WPM Ghost Bot took the lead by{' '}
                        <strong className="text-rose-400">{finalResult.paceBotWpm - finalResult.wpm} WPM</strong>. Try again!
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* SVG Speed Timeline Chart */}
              {wpmHistory.length > 2 && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Speed Trajectory (WPM over Time)
                    </span>
                    <span className="font-mono text-[10px]">Peak: {Math.max(...wpmHistory.map(h => h.wpm))} WPM</span>
                  </div>
                  <div className="w-full h-24 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 80" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
                      <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
                      
                      {/* Polyline speed curve */}
                      {(() => {
                        const maxW = Math.max(...wpmHistory.map(h => h.wpm), 60);
                        const points = wpmHistory.map((h, idx) => {
                          const x = (idx / (wpmHistory.length - 1)) * 400;
                          const y = 75 - (h.wpm / maxW) * 65;
                          return `${x},${y}`;
                        }).join(' ');

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                            {wpmHistory.map((h, idx) => {
                              if (idx % Math.ceil(wpmHistory.length / 8) === 0 || idx === wpmHistory.length - 1) {
                                const x = (idx / (wpmHistory.length - 1)) * 400;
                                const y = 75 - (h.wpm / maxW) * 65;
                                return (
                                  <circle key={idx} cx={x} cy={y} r="3" fill="#38bdf8" />
                                );
                              }
                              return null;
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Correct Characters:</span>
                  <span className="font-mono font-bold text-emerald-400">{finalResult.correctChars}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Incorrect Keystrokes:</span>
                  <span className="font-mono font-bold text-rose-400">{finalResult.errors}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Duration:</span>
                  <span className="font-mono text-slate-200">{finalResult.duration} seconds</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Mode &amp; Category:</span>
                  <span className="font-mono text-slate-200 capitalize">{finalResult.mode} &bull; {finalResult.category || 'standard'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => setCertificateOpen(true)}
                  className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 font-mono uppercase tracking-wider"
                >
                  <Award className="w-4 h-4" />
                  GENERATE OFFICIAL CERTIFICATE
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => resetTest(selectedMode, selectedCategory)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
                  >
                    <RotateCcw className="w-4 h-4" />
                    TRY AGAIN
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    BACK TO DASHBOARD
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Certificate Modal */}
      {finalResult && (
        <CertificateModal
          isOpen={certificateOpen}
          onClose={() => setCertificateOpen(false)}
          userName={user?.name || 'Speed Typist'}
          wpm={finalResult.wpm}
          accuracy={finalResult.accuracy}
          duration={finalResult.duration}
          mode={finalResult.mode}
          rating={finalResult.rating}
        />
      )}
    </div>
  );
}
