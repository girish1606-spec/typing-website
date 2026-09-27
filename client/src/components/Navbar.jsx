import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard as KeyboardIcon,
  Zap,
  Crown,
  LayoutDashboard,
  Settings as SettingsIcon,
  Receipt,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export function Navbar() {
  const { user, isAuthenticated, isDeveloper, isPremium, logout } = useAuth();
  const { settings, updateSetting } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const toggleThemeMode = () => {
    updateSetting('mode', settings.mode === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Practice', path: '/practice', highlight: true },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Subscription', path: '/subscription' },
    ...(isAuthenticated ? [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Payments', path: '/payments' },
    ] : []),
    { label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-500 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <KeyboardIcon className="w-5 h-5 text-white" />
              <Zap className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1 fill-yellow-300 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white flex items-center gap-1 font-mono">
                TYPE<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">SPEED</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase -mt-1 hidden sm:block">
                Precision &bull; Velocity
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-sky-400 bg-sky-950/40 border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                } ${link.highlight && !isActive(link.path) ? 'text-sky-300' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Dark/Light Toggle */}
            <button
              onClick={toggleThemeMode}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle Theme"
            >
              {settings.mode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-sky-500/50 transition-all text-sm font-medium text-slate-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-600/30 text-sky-400 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name || 'Account'}</span>
                  {isPremium && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Crown className="w-3 h-3 fill-amber-300" /> PRO
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl border border-slate-700/80 p-2 z-50 text-sm"
                    >
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isPremium
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isPremium ? 'Premium Plan (₹1)' : 'Free Tier'}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sky-400" /> Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <User className="w-4 h-4 text-sky-400" /> My Profile
                      </Link>

                      <Link
                        to="/payments"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <Receipt className="w-4 h-4 text-sky-400" /> My Payments
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <SettingsIcon className="w-4 h-4 text-sky-400" /> Settings
                      </Link>

                      {isDeveloper && (
                        <Link
                          to="/developer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 border-t border-slate-800 mt-1"
                        >
                          <Shield className="w-4 h-4 text-amber-400" /> Developer Console
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border-t border-slate-800 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Completely Separate Developer Sign In Entry */}
            {!isDeveloper && (
              <Link
                to="/developer/login"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-500/30 hover:bg-amber-900/40 hover:border-amber-400 transition-all"
                title="Developer and Administrator Secure Sign In"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Developer</span> Sign In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleThemeMode}
              className="p-2 rounded-lg text-slate-400 hover:text-white"
              aria-label="Toggle Theme"
            >
              {settings.mode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium ${
                  isActive(link.path)
                    ? 'text-sky-400 bg-sky-950/50 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-slate-300 hover:text-white"
                  >
                    My Profile
                  </Link>
                  {isDeveloper && (
                    <Link
                      to="/developer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-amber-300 font-semibold"
                    >
                      Developer Console
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-rose-400 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl font-medium text-slate-200 bg-slate-900 border border-slate-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/developer/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 mt-2"
                  >
                    Developer Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
