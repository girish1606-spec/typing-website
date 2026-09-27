import React from 'react';
import { Link } from 'react-router-dom';
import { Keyboard, Zap, Heart, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 py-10 mt-auto text-sm text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-200 tracking-wider font-mono">
              TYPE<span className="text-sky-400">SPEED</span>
            </p>
            <p className="text-xs text-slate-500">Master your typing speed and precision.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
          <Link to="/practice" className="hover:text-sky-400 transition-colors">Typing Practice</Link>
          <Link to="/leaderboard" className="hover:text-sky-400 transition-colors">Leaderboard</Link>
          <Link to="/subscription" className="hover:text-sky-400 transition-colors">Premium ₹1</Link>
          <Link to="/settings" className="hover:text-sky-400 transition-colors">Settings</Link>
          <Link to="/developer/login" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors">
            <Shield className="w-3.5 h-3.5" /> Developer Portal
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span>for speed typists worldwide &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
