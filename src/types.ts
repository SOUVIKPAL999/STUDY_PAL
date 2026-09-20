/**
 * Types and interfaces for AI Study Pal
 * Semester 3 CSE (AI/ML/DS) Academic Project
 */

export type StudyMode = 'concept-explainer' | 'code-debugger' | 'math-solver' | 'exam-revision';

export interface StudyModeConfig {
  id: StudyMode;
  name: string;
  tagline: string;
  description: string;
  placeholder: string;
  icon: string;
  badgeColor: string;
  suggestedPrompts: { title: string; prompt: string; subject: string }[];
}

export interface MessageMetadata {
  mode?: StudyMode;
  isDemo?: boolean;
  model?: string;
  durationMs?: number;
  error?: boolean;
  tokensEstimated?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  isDemo?: boolean;
  metadata?: MessageMetadata;
}

export interface Conversation {
  id: string;
  title: string;
  mode: StudyMode;
  createdAt: string;
  updatedAt: string;
  bookmarked?: boolean;
  messages: Message[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  conversationId?: string;
  conversationTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  messageId: string;
  conversationId: string;
  conversationTitle: string;
  mode: StudyMode;
  label: string;
  content: string;
  createdAt: string;
}

export type UtilityPanelTab = 'notes' | 'bookmarks' | 'progress';

export interface UserPreferences {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  utilityPanelTab: UtilityPanelTab;
  selectedMode: StudyMode;
  soundEnabled: boolean;
}

export interface StudyProgress {
  sessionStartedAt: string;
  questionsAsked: number;
  questionsCompleted: number;
  dailyGoal: number;
  activeMode: StudyMode;
  modeStats: Record<StudyMode, { asked: number; completed: number }>;
}

export interface ChatApiRequest {
  mode: StudyMode;
  query: string;
  messages?: { role: 'user' | 'assistant' | 'system'; content: string }[];
  conversationId?: string;
}

export interface ChatApiResponse {
  ok: boolean;
  answer?: string;
  mode: StudyMode;
  isDemo: boolean;
  model?: string;
  error?: string;
  durationMs?: number;
}

export interface HealthApiResponse {
  status: string;
  ok: boolean;
  isDemo: boolean;
  model: string;
  version: string;
  academicTrack: string;
}
