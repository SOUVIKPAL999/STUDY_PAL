import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  HelpCircle,
  Clock,
  Menu,
  SlidersHorizontal,
  GraduationCap,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { StudyMode } from '../types';
import { STUDY_MODES } from '../data/modes';

interface NavbarProps {
  currentMode: StudyMode;
  theme: 'dark' | 'light';
  isDemo: boolean;
  onToggleTheme: () => void;
  onOpenHelp: () => void;
  onOpenClearData: () => void;
  onToggleSidebar: () => void;
  onToggleUtilityPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  theme,
  isDemo,
  onToggleTheme,
  onOpenHelp,
  onOpenClearData,
  onToggleSidebar,
  onToggleUtilityPanel,
}) => {
  const [seconds, setSeconds] = useState(0);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeConfig = STUDY_MODES[currentMode] || STUDY_MODES['concept-explainer'];

  return (
    <header className="h-14 border-b border-slate-800 dark:border-slate-800/80 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle Conversations Sidebar"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-sm sm:text-base tracking-tight">
                AI Study Pal
              </span>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0 • Semester 3
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <GraduationCap className="w-3 h-3 text-indigo-400" />
              <span>CSE • AI/ML & Data Science</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Active Mode & Session Timer */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="font-medium text-slate-200">{modeConfig.name}</span>
        </div>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/40 text-xs text-slate-400"
          title="Active study session duration"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-slate-300">{formatDuration(seconds)}</span>
        </div>

        {/* Engine status indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
            isDemo
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
          title={isDemo ? 'Offline Academic Demo Engine active' : 'Live Google Gemini AI active'}
        >
          <Zap className="w-3 h-3" />
          <span>{isDemo ? 'Demo Mode' : 'Live Gemini AI'}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Reset Data */}
        <button
          type="button"
          onClick={onOpenClearData}
          className="p-1.5 sm:px-2 sm:py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          title="Clear local data"
          aria-label="Clear local data"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden xl:inline text-[11px]">Reset Data</span>
        </button>

        {/* Help & About */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="p-1.5 sm:px-2 sm:py-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="About AI Study Pal & Documentation"
          aria-label="Help and Documentation"
        >
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline text-[11px]">Docs & Guide</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Right utility drawer toggle on mobile/tablet */}
        <button
          type="button"
          onClick={onToggleUtilityPanel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle Notes & Progress Panel"
          title="Notes & Progress"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
