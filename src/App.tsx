import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Conversation,
  Message,
  Note,
  StudyMode,
  StudyProgress,
  UserPreferences,
  UtilityPanelTab,
} from './types';
import {
  DEFAULT_PREFERENCES,
  DEFAULT_PROGRESS,
  StorageService,
} from './services/storage';
import { STUDY_MODES } from './data/modes';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatWorkspace } from './components/ChatWorkspace';
import { UtilityPanel } from './components/UtilityPanel';
import { HelpModal } from './components/HelpModal';
import { ClearDataModal } from './components/ClearDataModal';

export default function App() {
  // State from persistent local storage
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    StorageService.getConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    () => StorageService.getActiveConversationId()
  );
  const [notes, setNotes] = useState<Note[]>(() => StorageService.getNotes());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    StorageService.getBookmarks()
  );
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    StorageService.getPreferences()
  );
  const [progress, setProgress] = useState<StudyProgress>(() =>
    StorageService.getProgress()
  );

  // Runtime UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  // Mobile / Modal states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileUtilityOpen, setIsMobileUtilityOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);

  // Active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  // Sync theme with DOM root
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    StorageService.savePreferences(preferences);
  }, [preferences.theme]);

  // Check backend health and engine mode
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isDemo === 'boolean') {
          setIsDemo(data.isDemo);
        }
      })
      .catch((err) => {
        console.warn('[AI Study Pal] Health check failed, remaining in demo mode:', err);
        setIsDemo(true);
      });
  }, []);

  // Keyboard shortcut listener (Esc closes modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHelpOpen(false);
        setIsClearDataOpen(false);
        setIsMobileSidebarOpen(false);
        setIsMobileUtilityOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // New Chat creation
  const handleNewChat = (mode?: StudyMode) => {
    const targetMode = mode || preferences.selectedMode || 'concept-explainer';
    const modeConfig = STUDY_MODES[targetMode];
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: `New ${modeConfig.name}`,
      mode: targetMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConversationId(newConv.id);
    StorageService.saveConversations(updated);
    StorageService.setActiveConversationId(newConv.id);
    setError(null);
  };

  // Select conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    StorageService.setActiveConversationId(id);
    setError(null);
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
    );
    setConversations(updated);
    StorageService.saveConversations(updated);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    StorageService.saveConversations(updated);
    if (activeConversationId === id) {
      const nextId = updated[0]?.id || null;
      setActiveConversationId(nextId);
      StorageService.setActiveConversationId(nextId);
    }
  };

  // Toggle bookmark conversation
  const handleToggleBookmarkConversation = (id: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, bookmarked: !c.bookmarked } : c
    );
    setConversations(updated);
    StorageService.saveConversations(updated);
  };

  // Switch study mode
  const handleSelectMode = (mode: StudyMode) => {
    setPreferences((prev) => ({ ...prev, selectedMode: mode }));
    // If active conversation has no messages, update its mode directly
    if (activeConversation && activeConversation.messages.length === 0) {
      const updated = conversations.map((c) =>
        c.id === activeConversation.id ? { ...c, mode: mode, title: `New ${STUDY_MODES[mode].name}` } : c
      );
      setConversations(updated);
      StorageService.saveConversations(updated);
    } else {
      // Otherwise start a new chat in that mode
      handleNewChat(mode);
    }
  };

  // Send message
  const handleSendMessage = async (text: string) => {
    setError(null);
    setLastQuery(text);

    let currentConv = activeConversation;
    let updatedConvs = [...conversations];

    // Auto-create conversation if none exists
    if (!currentConv) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: text.length > 35 ? `${text.substring(0, 35)}...` : text,
        mode: preferences.selectedMode || 'concept-explainer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      currentConv = newConv;
      updatedConvs = [newConv, ...updatedConvs];
      setActiveConversationId(newConv.id);
      StorageService.setActiveConversationId(newConv.id);
    }

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    // Auto-title conversation on first message if default
    let updatedTitle = currentConv.title;
    if (currentConv.messages.length === 0 || currentConv.title.startsWith('New ')) {
      updatedTitle = text.length > 40 ? `${text.substring(0, 40)}...` : text;
    }

    const withUserMessage: Conversation = {
      ...currentConv,
      title: updatedTitle,
      updatedAt: new Date().toISOString(),
      messages: [...currentConv.messages, userMessage],
    };

    updatedConvs = updatedConvs.map((c) => (c.id === withUserMessage.id ? withUserMessage : c));
    setConversations(updatedConvs);
    StorageService.saveConversations(updatedConvs);

    // Update progress: questions asked
    const updatedProgress = StorageService.recordQuestionAsked(withUserMessage.mode);
    setProgress(updatedProgress);

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          mode: withUserMessage.mode,
          messages: withUserMessage.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to receive academic response from server.');
      }

      const assistantMessage: Message = {
        id: `msg-assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No response generated.',
        createdAt: new Date().toISOString(),
        isDemo: data.isDemo,
        metadata: {
          mode: data.mode,
          model: data.model,
          durationMs: data.durationMs,
        },
      };

      if (typeof data.isDemo === 'boolean') {
        setIsDemo(data.isDemo);
      }

      const withAssistantMessage: Conversation = {
        ...withUserMessage,
        updatedAt: new Date().toISOString(),
        messages: [...withUserMessage.messages, assistantMessage],
      };

      const finalConvs = updatedConvs.map((c) =>
        c.id === withAssistantMessage.id ? withAssistantMessage : c
      );
      setConversations(finalConvs);
      StorageService.saveConversations(finalConvs);

      // Record completed question in study progress
      const finalProgress = StorageService.recordQuestionCompleted(withUserMessage.mode);
      setProgress(finalProgress);
    } catch (err: any) {
      console.error('[AI Study Pal] Chat error:', err);
      setError(err.message || 'An error occurred while connecting to the study engine.');
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const msgs = [...activeConversation.messages];
    // Find last user query
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Pop the trailing assistant response if present
    if (msgs[msgs.length - 1].role === 'assistant') {
      msgs.pop();
      const updatedConv = {
        ...activeConversation,
        messages: msgs,
        updatedAt: new Date().toISOString(),
      };
      const updatedList = conversations.map((c) =>
        c.id === updatedConv.id ? updatedConv : c
      );
      setConversations(updatedList);
      StorageService.saveConversations(updatedList);
    }

    handleSendMessage(lastUserMsg.content);
  };

  // Retry on error
  const handleRetry = () => {
    if (lastQuery) {
      handleSendMessage(lastQuery);
    }
  };

  // Notes operations
  const handleSaveNote = (note: Note) => {
    StorageService.upsertNote(note);
    setNotes(StorageService.getNotes());
  };

  const handleDeleteNote = (id: string) => {
    StorageService.deleteNote(id);
    setNotes(StorageService.getNotes());
  };

  const handleSaveToNotes = (content: string, title?: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title || 'Study Explanation Note',
      content: content,
      conversationId: activeConversation?.id,
      conversationTitle: activeConversation?.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageService.upsertNote(newNote);
    setNotes(StorageService.getNotes());
    // Switch to notes tab and open mobile drawer if on mobile
    setPreferences((prev) => ({ ...prev, utilityPanelTab: 'notes' }));
    setIsMobileUtilityOpen(true);
  };

  // Bookmarks operations
  const handleBookmarkMessage = (message: Message) => {
    if (!activeConversation) return;
    const firstLine = message.content.split('\n')[0].replace(/^[#*\s]+/, '') || 'Academic Snippet';
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      messageId: message.id,
      conversationId: activeConversation.id,
      conversationTitle: activeConversation.title,
      mode: activeConversation.mode,
      label: firstLine.length > 50 ? `${firstLine.substring(0, 50)}...` : firstLine,
      content: message.content.substring(0, 300),
      createdAt: new Date().toISOString(),
    };
    StorageService.addBookmark(newBookmark);
    setBookmarks(StorageService.getBookmarks());
  };

  const handleDeleteBookmark = (id: string) => {
    StorageService.removeBookmark(id);
    setBookmarks(StorageService.getBookmarks());
  };

  // Clear data
  const handleClearAllData = () => {
    StorageService.clearAllLocalData();
    setConversations(StorageService.getConversations());
    setActiveConversationId(StorageService.getActiveConversationId());
    setNotes(StorageService.getNotes());
    setBookmarks(StorageService.getBookmarks());
    setPreferences(DEFAULT_PREFERENCES);
    setProgress(DEFAULT_PROGRESS);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentMode={activeConversation?.mode || preferences.selectedMode || 'concept-explainer'}
        theme={preferences.theme}
        isDemo={isDemo}
        onToggleTheme={() =>
          setPreferences((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenClearData={() => setIsClearDataOpen(true)}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onToggleUtilityPanel={() => setIsMobileUtilityOpen(!isMobileUtilityOpen)}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          selectedMode={preferences.selectedMode}
          isCollapsed={preferences.sidebarCollapsed}
          isOpenMobile={isMobileSidebarOpen}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onToggleBookmarkConversation={handleToggleBookmarkConversation}
          onSelectMode={handleSelectMode}
          onSwitchUtilityTab={(tab) => {
            setPreferences((prev) => ({ ...prev, utilityPanelTab: tab }));
            setIsMobileUtilityOpen(true);
          }}
          onToggleCollapse={() =>
            setPreferences((prev) => ({
              ...prev,
              sidebarCollapsed: !prev.sidebarCollapsed,
            }))
          }
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Chat Workspace */}
        <ChatWorkspace
          conversation={activeConversation}
          selectedMode={preferences.selectedMode}
          isLoading={isLoading}
          isDemo={isDemo}
          error={error}
          onSendMessage={handleSendMessage}
          onRetry={handleRetry}
          onRegenerate={handleRegenerate}
          onSaveToNotes={handleSaveToNotes}
          onBookmarkMessage={handleBookmarkMessage}
        />

        {/* Right Utility Panel */}
        <UtilityPanel
          activeTab={preferences.utilityPanelTab}
          notes={notes}
          bookmarks={bookmarks}
          progress={progress}
          activeConversationId={activeConversationId}
          activeConversationTitle={activeConversation?.title || 'Current Study Session'}
          isOpenMobile={isMobileUtilityOpen}
          onSelectTab={(tab) =>
            setPreferences((prev) => ({ ...prev, utilityPanelTab: tab }))
          }
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onOpenConversation={handleSelectConversation}
          onDeleteBookmark={handleDeleteBookmark}
          onCloseMobile={() => setIsMobileUtilityOpen(false)}
          onUpdateDailyGoal={(goal) => {
            const updated = { ...progress, dailyGoal: goal };
            StorageService.saveProgress(updated);
            setProgress(updated);
          }}
        />
      </div>

      {/* Documentation & Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Clear Data Confirmation Modal */}
      <ClearDataModal
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
        onConfirm={handleClearAllData}
      />
    </div>
  );
}
