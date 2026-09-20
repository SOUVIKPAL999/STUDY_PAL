import React, { useState } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Bug,
  Sigma,
  GraduationCap,
  MessageSquare,
  Bookmark,
  FileText,
  TrendingUp,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Conversation, StudyMode, UtilityPanelTab } from '../types';
import { STUDY_MODES } from '../data/modes';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedMode: StudyMode;
  isCollapsed: boolean;
  isOpenMobile: boolean;
  onSelectConversation: (id: string) => void;
  onNewChat: (mode?: StudyMode) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onToggleBookmarkConversation: (id: string) => void;
  onSelectMode: (mode: StudyMode) => void;
  onSwitchUtilityTab: (tab: UtilityPanelTab) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  selectedMode,
  isCollapsed,
  isOpenMobile,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onToggleBookmarkConversation,
  onSelectMode,
  onSwitchUtilityTab,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Mode icon mapper
  const getModeIcon = (mode: StudyMode) => {
    switch (mode) {
      case 'concept-explainer':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'code-debugger':
        return <Bug className="w-4 h-4 text-emerald-400" />;
      case 'math-solver':
        return <Sigma className="w-4 h-4 text-amber-400" />;
      case 'exam-revision':
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900/95 dark:bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      {/* 1. Header & New Chat */}
      <div className="p-3 border-b border-slate-800 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            onNewChat(selectedMode);
            if (isOpenMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Start a new study conversation"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Chat</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Study Mode Selector */}
      <div className="p-3 border-b border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Study Modes</span>
          <span className="text-[10px] text-slate-400 lowercase">select active</span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {(Object.keys(STUDY_MODES) as StudyMode[]).map((modeKey) => {
            const config = STUDY_MODES[modeKey];
            const isSelected = selectedMode === modeKey;
            return (
              <button
                key={modeKey}
                type="button"
                onClick={() => onSelectMode(modeKey)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                    : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                }`}
              >
                {getModeIcon(modeKey)}
                <span className="truncate flex-1">{config.name}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
          <span>Recent Conversations</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredConversations.length}
          </span>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-slate-400">
            {searchQuery ? 'No matching conversations found.' : 'No conversations yet. Start a new chat!'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800 border border-slate-700 text-slate-100 font-medium'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
                    <span className="shrink-0">{getModeIcon(conv.mode)}</span>
                    {isEditing ? (
                      <form
                        onSubmit={(e) => saveRename(conv.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 flex-1"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white w-full focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Save title"
                          aria-label="Save title"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Cancel"
                          aria-label="Cancel rename"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate" title={conv.title}>
                        {conv.title}
                      </span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Bookmark button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmarkConversation(conv.id);
                        }}
                        className={`p-1 rounded hover:bg-slate-700 ${
                          conv.bookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title={conv.bookmarked ? 'Bookmarked' : 'Bookmark conversation'}
                        aria-label="Bookmark conversation"
                      >
                        <Bookmark className="w-3 h-3" fill={conv.bookmarked ? 'currentColor' : 'none'} />
                      </button>

                      {/* Rename button */}
                      <button
                        type="button"
                        onClick={(e) => startRename(conv, e)}
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                        title="Rename conversation"
                        aria-label="Rename conversation"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete conversation "${conv.title}"?`)) {
                            onDeleteConversation(conv.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Quick Nav for Utility Panel */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Academic Tools
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => {
              onSwitchUtilityTab('notes');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 transition-colors text-[11px] cursor-pointer"
            title="Open Quick Notes"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Notes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSwitchUtilityTab('bookmarks');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors text-[11px] cursor-pointer"
            title="Open Bookmarks"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Bookmarks</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSwitchUtilityTab('progress');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 transition-colors text-[11px] cursor-pointer"
            title="View Session Progress"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Progress</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 shrink-0 h-full ${
          isCollapsed ? 'w-12' : 'w-64 lg:w-72'
        }`}
      >
        {isCollapsed ? (
          <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 gap-3">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNewChat(selectedMode)}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
              title="New Chat"
              aria-label="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative h-full">
            {content}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center shadow"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs h-full z-50 shadow-2xl">
            {content}
            <button
              type="button"
              onClick={onCloseMobile}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
