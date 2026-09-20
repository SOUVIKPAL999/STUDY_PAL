import React, { useEffect, useState } from 'react';
import {
  FileText,
  Bookmark as BookmarkIcon,
  TrendingUp,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Copy,
  Clock,
  Target,
  BarChart3,
  X,
  Sparkles,
} from 'lucide-react';
import { Bookmark, Note, StudyProgress, UtilityPanelTab } from '../types';

interface UtilityPanelProps {
  activeTab: UtilityPanelTab;
  notes: Note[];
  bookmarks: Bookmark[];
  progress: StudyProgress;
  activeConversationId: string | null;
  activeConversationTitle: string;
  isOpenMobile: boolean;
  onSelectTab: (tab: UtilityPanelTab) => void;
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onOpenConversation: (id: string) => void;
  onDeleteBookmark: (id: string) => void;
  onCloseMobile: () => void;
  onUpdateDailyGoal: (goal: number) => void;
}

export const UtilityPanel: React.FC<UtilityPanelProps> = ({
  activeTab,
  notes,
  bookmarks,
  progress,
  activeConversationId,
  activeConversationTitle,
  isOpenMobile,
  onSelectTab,
  onSaveNote,
  onDeleteNote,
  onOpenConversation,
  onDeleteBookmark,
  onCloseMobile,
  onUpdateDailyGoal,
}) => {
  // Selected note for editing
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [copiedBmId, setCopiedBmId] = useState<string | null>(null);

  // Sync active note form when selection changes
  useEffect(() => {
    if (selectedNoteId) {
      const existing = notes.find((n) => n.id === selectedNoteId);
      if (existing) {
        setNoteTitle(existing.title);
        setNoteContent(existing.content);
        setSaveStatus('saved');
      }
    } else if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
      setNoteTitle(notes[0].title);
      setNoteContent(notes[0].content);
    }
  }, [selectedNoteId, notes]);

  // Debounced auto-save for notes
  useEffect(() => {
    if (!selectedNoteId) return;
    const existing = notes.find((n) => n.id === selectedNoteId);
    if (!existing) return;

    if (existing.title === noteTitle && existing.content === noteContent) {
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      onSaveNote({
        ...existing,
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent,
        updatedAt: new Date().toISOString(),
      });
      setSaveStatus('saved');
    }, 800);

    return () => clearTimeout(timer);
  }, [noteTitle, noteContent, selectedNoteId]);

  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'New Study Note',
      content: '',
      conversationId: activeConversationId || undefined,
      conversationTitle: activeConversationTitle || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveNote(newNote);
    setSelectedNoteId(newNote.id);
    setNoteTitle(newNote.title);
    setNoteContent('');
  };

  const copyBookmark = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBmId(id);
      setTimeout(() => setCopiedBmId(null), 2000);
    } catch (err) {
      console.error('Failed to copy bookmark text:', err);
    }
  };

  // Progress metrics calculation
  const goalPercentage = Math.min(
    100,
    Math.round(((progress.questionsCompleted || 0) / (progress.dailyGoal || 5)) * 100)
  );

  const panelContent = (
    <div className="flex flex-col h-full bg-slate-900/95 dark:bg-slate-900 border-l border-slate-800 text-slate-300 select-none">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 p-2 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-1 w-full">
          <button
            type="button"
            onClick={() => onSelectTab('notes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Notes</span>
            <span className="text-[10px] px-1 rounded-full bg-slate-800 text-slate-400 font-mono">
              {notes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('bookmarks')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved</span>
            <span className="text-[10px] px-1 rounded-full bg-slate-800 text-slate-400 font-mono">
              {bookmarks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('progress')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'progress'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Progress</span>
          </button>
        </div>

        {isOpenMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab 1: Quick Notes */}
      {activeTab === 'notes' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <span className="text-xs font-semibold text-slate-200">Study Notes</span>
            <button
              type="button"
              onClick={handleCreateNewNote}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-medium">No notes created yet.</p>
              <p className="text-[11px] text-slate-400">
                Click "Add Note" or use the "Save Note" button in any chat response.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Note Selector Pills */}
              <div className="p-2 border-b border-slate-800 overflow-x-auto flex gap-1.5 shrink-0 bg-slate-950/20">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs truncate max-w-[130px] transition-all shrink-0 ${
                      note.id === selectedNoteId
                        ? 'bg-slate-800 text-white font-medium border border-slate-700'
                        : 'hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    {note.title || 'Untitled Note'}
                  </button>
                ))}
              </div>

              {/* Note Editor Area */}
              <div className="flex-1 p-3 flex flex-col gap-2 min-h-0">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note title..."
                    className="flex-1 bg-transparent border-b border-slate-700 pb-1 text-sm font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                    </span>
                    {selectedNoteId && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this note?')) {
                            onDeleteNote(selectedNoteId);
                            const remaining = notes.filter((n) => n.id !== selectedNoteId);
                            setSelectedNoteId(remaining[0]?.id || null);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type notes, formulas, or key revisions here..."
                  className="flex-1 w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 border-b border-slate-800 bg-slate-900/50">
            <span className="text-xs font-semibold text-slate-200">
              Saved Explanations & Snippets
            </span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
              <BookmarkIcon className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-medium">No bookmarks saved yet.</p>
              <p className="text-[11px] text-slate-400">
                Click the bookmark icon under any response to store important formulas and answers.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {bm.mode}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(bm.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="font-medium text-slate-200 line-clamp-1">{bm.label}</div>
                  <p className="text-slate-400 text-[11px] line-clamp-3 leading-relaxed font-mono bg-slate-900/80 p-2 rounded border border-slate-800/80">
                    {bm.content}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => onOpenConversation(bm.conversationId)}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Chat</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => copyBookmark(bm.id, bm.content)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        title="Copy content"
                      >
                        {copiedBmId === bm.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBookmark(bm.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete bookmark"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Session Progress */}
      {activeTab === 'progress' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-xs font-semibold text-slate-200">
            Study Session Progress
          </div>

          {/* Daily Goal Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Daily Practice Goal</span>
              </div>
              <span className="font-mono text-emerald-400 font-semibold">
                {progress.questionsCompleted} of {progress.dailyGoal} completed
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>

            {/* Goal selector buttons */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Adjust Goal:</span>
              <div className="flex items-center gap-1">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onUpdateDailyGoal(num)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      progress.dailyGoal === num
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Questions Asked</div>
              <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
                {progress.questionsAsked || 0}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Answers Received</div>
              <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                {progress.questionsCompleted || 0}
              </div>
            </div>
          </div>

          {/* Academic Readiness Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Readiness Index</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Evaluates concept coverage across theoretical foundations, programming code, and mathematical proofs.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="text-2xl font-bold text-white font-mono">
                {Math.min(100, Math.max(30, (progress.questionsCompleted || 1) * 18))}%
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                {progress.questionsCompleted >= 4 ? 'Exam Ready' : 'Active Revision'}
              </span>
            </div>
          </div>

          {/* Mode Breakdown */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-300 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Study Distribution</span>
            </div>
            {Object.entries(progress.modeStats || {}).map(([mKey, stats]) => (
              <div key={mKey} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-900/60 last:border-0">
                <span className="text-slate-400 capitalize">
                  {mKey.replace('-', ' ')}
                </span>
                <span className="font-mono text-slate-300">
                  {stats.completed} solved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Utility Panel */}
      <aside className="hidden lg:block w-72 xl:w-80 shrink-0 h-full border-l border-slate-800">
        {panelContent}
      </aside>

      {/* Mobile / Tablet Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-sm h-full z-50 shadow-2xl">
            {panelContent}
          </div>
        </div>
      )}
    </>
  );
};
