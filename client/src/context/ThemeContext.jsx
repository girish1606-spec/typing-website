import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  theme: 'midnight',
  mode: 'dark',
  soundEnabled: true,
  soundType: 'mechanical',
  soundVolume: 70,
  accentColor: '#38bdf8',
  keyShape: 'rounded',
  keySize: 'standard',
  keySpacing: 'normal',
  keyAnimation: 'press',
  keyColor: 'default',
  borderRadius: 'rounded-xl',
  uiDensity: 'normal',
  animationIntensity: 'normal',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('typespeed_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply attributes to DOM on change
  useEffect(() => {
    try {
      localStorage.setItem('typespeed_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }

    const root = document.documentElement;

    // Apply Theme
    root.setAttribute('data-theme', settings.theme || 'midnight');

    // Apply Mode (dark/light)
    let isDark = true;
    if (settings.mode === 'light') {
      isDark = false;
    } else if (settings.mode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Apply Accent color override if specified
    if (settings.accentColor) {
      root.style.setProperty('--accent', settings.accentColor);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateSettings = (newValues) => {
    setSettings((prev) => ({ ...prev, ...newValues }));
  };

  const resetToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        resetToDefault,
        DEFAULT_SETTINGS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
