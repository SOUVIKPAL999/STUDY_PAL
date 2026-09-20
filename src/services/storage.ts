import {
  Bookmark,
  Conversation,
  Note,
  StudyMode,
  StudyProgress,
  UserPreferences,
} from '../types';

const STORAGE_PREFIX = 'ai-study-pal:v1:';

const KEYS = {
  CONVERSATIONS: `${STORAGE_PREFIX}conversations`,
  ACTIVE_CONVERSATION_ID: `${STORAGE_PREFIX}active-conversation-id`,
  NOTES: `${STORAGE_PREFIX}notes`,
  BOOKMARKS: `${STORAGE_PREFIX}bookmarks`,
  PREFERENCES: `${STORAGE_PREFIX}preferences`,
  PROGRESS: `${STORAGE_PREFIX}progress`,
};

const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && window.localStorage !== null;
  } catch {
    return false;
  }
}

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    if (isLocalStorageAvailable()) {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    }
    const memRaw = memoryStore[key];
    if (!memRaw) return fallback;
    const memParsed = JSON.parse(memRaw);
    return memParsed ?? fallback;
  } catch (err) {
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    memoryStore[key] = serialized;
    if (isLocalStorageAvailable()) {
      window.localStorage.setItem(key, serialized);
    }
    return true;
  } catch (err) {
    return false;
  }
}

function safeRemoveItem(key: string): void {
  try {
    delete memoryStore[key];
    if (isLocalStorageAvailable()) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

// Initial Seed Data for Semester 3 CSE (AI/ML/DS)
const INITIAL_CONVERSATION: Conversation = {
  id: 'conv-sample-1',
  title: 'Attention Mechanism & Multi-Head Projections',
  mode: 'concept-explainer',
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
  bookmarked: true,
  messages: [
    {
      id: 'msg-sample-1',
      role: 'user',
      content: 'Explain Scaled Dot-Product Attention in Transformers with mathematical formulas and an intuitive library analogy.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg-sample-2',
      role: 'assistant',
      content: `### 1. Intuition in Plain Language
Imagine you are at a university library looking for research papers.
- **Query ($Q$)**: The research topic written on your index card (e.g., *"gradient descent optimization"*).
- **Key ($K$)**: The title label on each book spine on the shelf.
- **Value ($V$)**: The actual chapter contents inside each book.

You compare your query card against every book's title to calculate how relevant each book is (the *attention score*). You then take a weighted combination of their contents based on those scores.

---

### 2. Formal Mathematical Definition
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Where $\\sqrt{d_k}$ is the temperature scaling factor to prevent vanishing gradients during softmax when dimension $d_k$ is large.`,
      createdAt: new Date(Date.now() - 3600000 * 2 + 5000).toISOString(),
      isDemo: true,
      metadata: {
        mode: 'concept-explainer',
        durationMs: 420,
      },
    },
  ],
};

const INITIAL_NOTE: Note = {
  id: 'note-sample-1',
  title: 'Scaled Attention Scaling Factor',
  content: 'Dividing by sqrt(d_k) prevents dot-product values from growing too large in high dimensions, which would cause the softmax gradient to vanish during backpropagation.',
  conversationId: 'conv-sample-1',
  conversationTitle: 'Attention Mechanism & Multi-Head Projections',
  createdAt: new Date(Date.now() - 1800000).toISOString(),
  updatedAt: new Date(Date.now() - 1800000).toISOString(),
};

const INITIAL_BOOKMARK: Bookmark = {
  id: 'bm-sample-1',
  messageId: 'msg-sample-2',
  conversationId: 'conv-sample-1',
  conversationTitle: 'Attention Mechanism & Multi-Head Projections',
  mode: 'concept-explainer',
  label: 'Scaled Dot-Product Formula & Library Analogy',
  content: 'Formal mathematical formulation: Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V',
  createdAt: new Date(Date.now() - 1800000).toISOString(),
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  utilityPanelTab: 'progress',
  selectedMode: 'concept-explainer',
  soundEnabled: true,
};

export const DEFAULT_PROGRESS: StudyProgress = {
  sessionStartedAt: new Date().toISOString(),
  questionsAsked: 1,
  questionsCompleted: 1,
  dailyGoal: 5,
  activeMode: 'concept-explainer',
  modeStats: {
    'concept-explainer': { asked: 1, completed: 1 },
    'code-debugger': { asked: 0, completed: 0 },
    'math-solver': { asked: 0, completed: 0 },
    'exam-revision': { asked: 0, completed: 0 },
  },
};

// Storage Helpers
export const StorageService = {
  // Conversations
  getConversations(): Conversation[] {
    const data = safeGetItem<Conversation[]>(KEYS.CONVERSATIONS, [INITIAL_CONVERSATION]);
    if (!Array.isArray(data)) return [INITIAL_CONVERSATION];
    return data;
  },

  saveConversations(conversations: Conversation[]): void {
    safeSetItem(KEYS.CONVERSATIONS, conversations);
  },

  getConversation(id: string): Conversation | undefined {
    const list = this.getConversations();
    return list.find((c) => c.id === id);
  },

  upsertConversation(conversation: Conversation): void {
    const list = this.getConversations();
    const index = list.findIndex((c) => c.id === conversation.id);
    if (index >= 0) {
      list[index] = { ...conversation, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(conversation);
    }
    this.saveConversations(list);
  },

  deleteConversation(id: string): void {
    const list = this.getConversations().filter((c) => c.id !== id);
    this.saveConversations(list);
    if (this.getActiveConversationId() === id) {
      this.setActiveConversationId(list[0]?.id || null);
    }
  },

  getActiveConversationId(): string | null {
    return safeGetItem<string | null>(KEYS.ACTIVE_CONVERSATION_ID, 'conv-sample-1');
  },

  setActiveConversationId(id: string | null): void {
    safeSetItem(KEYS.ACTIVE_CONVERSATION_ID, id);
  },

  // Notes
  getNotes(): Note[] {
    const data = safeGetItem<Note[]>(KEYS.NOTES, [INITIAL_NOTE]);
    return Array.isArray(data) ? data : [INITIAL_NOTE];
  },

  saveNotes(notes: Note[]): void {
    safeSetItem(KEYS.NOTES, notes);
  },

  upsertNote(note: Note): void {
    const list = this.getNotes();
    const index = list.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      list[index] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(note);
    }
    this.saveNotes(list);
  },

  deleteNote(id: string): void {
    const list = this.getNotes().filter((n) => n.id !== id);
    this.saveNotes(list);
  },

  // Bookmarks
  getBookmarks(): Bookmark[] {
    const data = safeGetItem<Bookmark[]>(KEYS.BOOKMARKS, [INITIAL_BOOKMARK]);
    return Array.isArray(data) ? data : [INITIAL_BOOKMARK];
  },

  saveBookmarks(bookmarks: Bookmark[]): void {
    safeSetItem(KEYS.BOOKMARKS, bookmarks);
  },

  addBookmark(bookmark: Bookmark): void {
    const list = this.getBookmarks();
    if (!list.some((b) => b.id === bookmark.id || (b.messageId === bookmark.messageId && b.conversationId === bookmark.conversationId))) {
      list.unshift(bookmark);
      this.saveBookmarks(list);
    }
  },

  removeBookmark(id: string): void {
    const list = this.getBookmarks().filter((b) => b.id !== id);
    this.saveBookmarks(list);
  },

  // Preferences
  getPreferences(): UserPreferences {
    return safeGetItem<UserPreferences>(KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  },

  savePreferences(prefs: UserPreferences): void {
    safeSetItem(KEYS.PREFERENCES, prefs);
  },

  // Progress
  getProgress(): StudyProgress {
    return safeGetItem<StudyProgress>(KEYS.PROGRESS, DEFAULT_PROGRESS);
  },

  saveProgress(progress: StudyProgress): void {
    safeSetItem(KEYS.PROGRESS, progress);
  },

  recordQuestionAsked(mode: StudyMode): StudyProgress {
    const current = this.getProgress();
    const modeStats = current.modeStats || DEFAULT_PROGRESS.modeStats;
    const modeRecord = modeStats[mode] || { asked: 0, completed: 0 };
    
    const updated: StudyProgress = {
      ...current,
      questionsAsked: (current.questionsAsked || 0) + 1,
      activeMode: mode,
      modeStats: {
        ...modeStats,
        [mode]: {
          ...modeRecord,
          asked: modeRecord.asked + 1,
        },
      },
    };
    this.saveProgress(updated);
    return updated;
  },

  recordQuestionCompleted(mode: StudyMode): StudyProgress {
    const current = this.getProgress();
    const modeStats = current.modeStats || DEFAULT_PROGRESS.modeStats;
    const modeRecord = modeStats[mode] || { asked: 1, completed: 0 };

    const updated: StudyProgress = {
      ...current,
      questionsCompleted: (current.questionsCompleted || 0) + 1,
      activeMode: mode,
      modeStats: {
        ...modeStats,
        [mode]: {
          ...modeRecord,
          completed: modeRecord.completed + 1,
        },
      },
    };
    this.saveProgress(updated);
    return updated;
  },

  // Reset/Clear Local Data
  clearAllLocalData(): void {
    safeRemoveItem(KEYS.CONVERSATIONS);
    safeRemoveItem(KEYS.ACTIVE_CONVERSATION_ID);
    safeRemoveItem(KEYS.NOTES);
    safeRemoveItem(KEYS.BOOKMARKS);
    safeRemoveItem(KEYS.PREFERENCES);
    safeRemoveItem(KEYS.PROGRESS);
  },
};
