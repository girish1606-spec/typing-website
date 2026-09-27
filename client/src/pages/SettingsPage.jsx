import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Volume2,
  Sliders,
  Keyboard as KeyboardIcon,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  Save,
  Play,
  Sparkles,
  Crown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { soundService } from '../services/soundService.js';
import { api } from '../services/api.js';
import { Keyboard } from '../components/Keyboard.jsx';

const THEMES = [
  { id: 'midnight', name: 'Midnight', color: '#38bdf8', bg: '#070913', desc: 'Deep slate & electric cyan' },
  { id: 'ocean', name: 'Ocean', color: '#06b6d4', bg: '#031525', desc: 'Nautical navy & vivid aqua' },
  { id: 'forest', name: 'Forest', color: '#10b981', bg: '#051c14', desc: 'Emerald pines & mint' },
  { id: 'sunset', name: 'Sunset', color: '#f43f5e', bg: '#180920', desc: 'Deep plum & coral sunset' },
  { id: 'cyber', name: 'Cyber', color: '#eab308', bg: '#0a0b0d', desc: 'Obsidian & neon chartreuse' },
  { id: 'neon', name: 'Neon', color: '#d946ef', bg: '#050508', desc: 'Pitch black & magenta glow' },
  { id: 'classic', name: 'Classic', color: '#f59e0b', bg: '#14120e', desc: 'Warm sepia & vintage typewriter' },
  { id: 'minimal', name: 'Minimal', color: '#e4e4e7', bg: '#09090b', desc: 'Monochrome precision' },
];

const SOUND_TYPES = [
  { id: 'mechanical', name: 'Mechanical Thock', desc: 'Deep acoustic tactile actuation' },
  { id: 'soft', name: 'Soft Dome', desc: 'Muffled, smooth quiet typing' },
  { id: 'click', name: 'Tactile Click', desc: 'Crisp, snappy high-frequency switch' },
  { id: 'typewriter', name: 'Typewriter Strike', desc: 'Vintage mechanical metal clack' },
  { id: 'minimal', name: 'Minimal Tap', desc: 'Modern subtle digital blip' },
  { id: 'retro', name: 'Retro 8-Bit', desc: 'Nostalgic arcade chip sound' },
  { id: 'silent', name: 'Silent (Mute)', desc: 'Zero sound playback' },
];

export function SettingsPage() {
  const { settings, updateSetting, updateSettings, resetToDefault } = useTheme();
  const { isAuthenticated, isPremium } = useAuth();
  const toast = useToast();

  const [saving, setSaving] = useState(false);

  // Test sound using Web Audio API
  const handleTestSound = (type = settings.soundType) => {
    soundService.playKeyPress(type, settings.soundVolume, true);
  };

  const handleTestErrorSound = () => {
    soundService.playErrorSound(settings.soundVolume, true);
  };

  const handleTestVictorySound = () => {
    soundService.playCompletionSound(settings.soundVolume, true);
  };

  const handleSavePreferences = async () => {
    if (!isAuthenticated) {
      toast.success('Preferences saved locally to browser storage!');
      return;
    }

    try {
      setSaving(true);
      await api.updateProfile({ preferences: settings });
      toast.success('Settings synchronized to your account!');
    } catch {
      toast.success('Settings saved to local storage.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl glass-panel border shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Settings</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalize themes, tactile sound synthesis, and keyboard responsiveness.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetToDefault();
              toast.info('Settings reset to system defaults.');
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TO DEFAULT</span>
          </button>

          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 text-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'SAVE SETTINGS'}</span>
          </button>
        </div>
      </div>

      {/* 1. APPEARANCE & MODE */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <Sun className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Appearance &amp; Display Mode</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'dark', label: 'Dark Mode', icon: <Moon className="w-4 h-4" /> },
            { id: 'light', label: 'Light Mode', icon: <Sun className="w-4 h-4" /> },
            { id: 'system', label: 'System Mode', icon: <Laptop className="w-4 h-4" /> },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => updateSetting('mode', m.id)}
              className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                settings.mode === m.id
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. THEME CUSTOMIZATION */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Theme Customization (8 Themes)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Active: {settings.theme}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => updateSetting('theme', th.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                settings.theme === th.id
                  ? 'ring-2 ring-sky-400 border-transparent shadow-xl'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
              style={{ backgroundColor: th.bg }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-4 h-4 rounded-full shadow-md"
                  style={{ backgroundColor: th.color }}
                />
                {settings.theme === th.id && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
              <h3 className="font-bold text-white text-sm">{th.name}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{th.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. TYPING SOUND CUSTOMIZATION */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Typing Sound Engine (Web Audio API)</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-semibold">Sound:</span>
            <button
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                settings.soundEnabled
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Master Typing Volume: <span className="text-sky-400 font-mono">{settings.soundVolume}%</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Controls keypress acoustic feedback and error chimes
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.soundVolume}
              onChange={(e) => updateSetting('soundVolume', Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Sound Profiles Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
            Mechanical Key Switch Profiles:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SOUND_TYPES.map((st) => (
              <div
                key={st.id}
                onClick={() => {
                  updateSetting('soundType', st.id);
                  handleTestSound(st.id);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  settings.soundType === st.id
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{st.name}</h4>
                  <p className="text-[11px] text-slate-400">{st.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestSound(st.id);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition-colors"
                  title="Test Sound"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Test Audio Controls */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleTestSound()}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> TEST KEY SOUND
          </button>
          <button
            onClick={handleTestErrorSound}
            className="px-4 py-2 rounded-xl bg-rose-900/60 border border-rose-500/40 hover:bg-rose-900 text-rose-200 text-xs font-bold flex items-center gap-1.5"
          >
            TEST ERROR SOUND
          </button>
          <button
            onClick={handleTestVictorySound}
            className="px-4 py-2 rounded-xl bg-amber-900/60 border border-amber-500/40 hover:bg-amber-900 text-amber-200 text-xs font-bold flex items-center gap-1.5"
          >
            TEST VICTORY SOUND
          </button>
        </div>
      </div>

      {/* 4. KEYBOARD CUSTOMIZATION */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <KeyboardIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Visual Keyboard Customization</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Key Shape */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Keycap Shape
            </label>
            <div className="flex gap-2">
              {['rounded', 'pill', 'sharp'].map((sh) => (
                <button
                  key={sh}
                  onClick={() => updateSetting('keyShape', sh)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border ${
                    settings.keyShape === sh
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {sh}
                </button>
              ))}
            </div>
          </div>

          {/* Key Size */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Keycap Size
            </label>
            <div className="flex gap-2">
              {['compact', 'standard', 'large'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateSetting('keySize', sz)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border ${
                    settings.keySize === sz
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Key Spacing */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Key Spacing
            </label>
            <div className="flex gap-2">
              {['tight', 'normal', 'relaxed'].map((sp) => (
                <button
                  key={sp}
                  onClick={() => updateSetting('keySpacing', sp)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border ${
                    settings.keySpacing === sp
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Visual Preview Box */}
        <div className="pt-4 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Live Keyboard Preview:
          </label>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <Keyboard targetKey="f" activeKey="j" />
          </div>
        </div>
      </div>
    </div>
  );
}
