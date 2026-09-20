import React from 'react';
import {
  X,
  BookOpen,
  Bug,
  Sigma,
  GraduationCap,
  Sparkles,
  Zap,
  HardDrive,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                AI Study Pal • Academic Documentation
              </h2>
              <p className="text-[11px] text-slate-400">
                Semester 3 CSE (AI/ML/DS) Formal Project Guide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Overview */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Project Vision & Pedagogical Philosophy</span>
            </h3>
            <p className="text-slate-300">
              <strong>AI Study Pal</strong> is an intelligent study companion engineered specifically for undergraduate students in Computer Science, Artificial Intelligence, and Data Science. Instead of behaving like a generic conversational bot, it adopts the persona of an empathetic, academically rigorous university mentor.
            </p>
          </div>

          {/* Section 2: Four Study Modes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">
              The Four Academic Study Modes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-blue-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Concept Explainer</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Breaks down theoretical ideas using simple analogies first, defines formal academic terminology, presents rigorous mathematical formulation with LaTeX, and includes a check-your-understanding self-test.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-emerald-400">
                  <Bug className="w-4 h-4" />
                  <span>Code Debugger</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Conducts root-cause failure analysis, pinpoints memory leaks or race conditions, generates clean idiomatic code, states environment assumptions, and constructs verification unit tests.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-amber-400">
                  <Sigma className="w-4 h-4" />
                  <span>Math Solver</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Restates problems with precision, states mathematical theorems, derives analytical steps with high-fidelity KaTeX formulas, frames the final answer clearly, and performs sanity verification.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-purple-400">
                  <GraduationCap className="w-4 h-4" />
                  <span>Exam Revision</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Generates high-yield exam cheat sheets, highlights the top 3 semester pitfalls and tricky traps, provides rapid-fire practice questions, and delivers a 60-second self-quiz.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Dual Engine & Offline Demo */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
            <h3 className="text-xs font-semibold text-indigo-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Live AI Engine & Offline Demo Mode</span>
            </h3>
            <p className="text-[11px] text-slate-300">
              The application connects directly to <strong>Google Gemini API (gemini-3.8-flash)</strong> on the backend. When API keys are unconfigured or unavailable, it automatically activates the <strong>Academic Demo Mode</strong>, which utilizes a built-in repository of real CSE exam solutions without breaking or displaying mock errors.
            </p>
          </div>

          {/* Section 4: Privacy & Keyboard Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Local Storage Persistence</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All conversations, markdown notes, bookmarks, and session progress are preserved in your browser's versioned storage (<code className="text-indigo-300">ai-study-pal:v1</code>). No student credentials or keys are ever stored on the client.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1">
                <li><kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Enter</kbd> : Send active prompt</li>
                <li><kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Shift + Enter</kbd> : Newline in composer</li>
                <li><kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Esc</kbd> : Close open modal</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 text-[11px] text-slate-400">
          <span>CSE Semester 3 • Academic Year 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
          >
            Got it, continue studying
          </button>
        </div>
      </div>
    </div>
  );
};
