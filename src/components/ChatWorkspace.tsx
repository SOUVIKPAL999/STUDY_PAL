import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  Bookmark,
  FilePlus,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Bug,
  Sigma,
  GraduationCap,
  ArrowDown,
  CornerDownLeft,
  Info,
} from 'lucide-react';
import { Conversation, Message, StudyMode } from '../types';
import { STUDY_MODES } from '../data/modes';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatWorkspaceProps {
  conversation: Conversation | null;
  selectedMode: StudyMode;
  isLoading: boolean;
  isDemo: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  onRetry: () => void;
  onRegenerate: () => void;
  onSaveToNotes: (content: string, title?: string) => void;
  onBookmarkMessage: (message: Message) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  conversation,
  selectedMode,
  isLoading,
  isDemo,
  error,
  onSendMessage,
  onRetry,
  onRegenerate,
  onSaveToNotes,
  onBookmarkMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentMode = conversation?.mode || selectedMode;
  const modeConfig = STUDY_MODES[currentMode] || STUDY_MODES['concept-explainer'];
  const messages = conversation?.messages || [];

  // Auto-scroll logic respecting user manual scroll up
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 120;
    setShowScrollBottom(isScrolledUp);
  };

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setValidationError('Please enter a query or question before sending.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }
    setValidationError(null);
    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getModeHeaderIcon = () => {
    switch (currentMode) {
      case 'concept-explainer':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'code-debugger':
        return <Bug className="w-4 h-4 text-emerald-400" />;
      case 'math-solver':
        return <Sigma className="w-4 h-4 text-amber-400" />;
      case 'exam-revision':
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-950/90 dark:bg-slate-950 relative overflow-hidden">
      {/* 1. Workspace Sub-header */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs">
          {getModeHeaderIcon()}
          <span className="font-semibold text-slate-200">{modeConfig.name}</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400 text-[11px] truncate max-w-md">
            {modeConfig.tagline}
          </span>
        </div>

        {/* Engine mode pill */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isDemo ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className="hidden xs:inline">
            {isDemo ? 'Academic Demo' : 'Google Gemini'}
          </span>
        </div>
      </div>

      {/* 2. Messages / Welcome Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
      >
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="max-w-2xl mx-auto my-6 sm:my-10 text-center space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {modeConfig.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                {modeConfig.description}
              </p>
            </div>

            {/* Suggested prompt cards */}
            <div className="space-y-2 pt-2 text-left">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                Suggested Academic Prompts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {modeConfig.suggestedPrompts.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage(card.prompt)}
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {card.subject}
                      </span>
                      <CornerDownLeft className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-200 line-clamp-1">
                      {card.title}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                      {card.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLastAssistant = !isUser && index === messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/90 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs font-normal'
                        : 'bg-slate-900/90 dark:bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {/* Assistant message header tag */}
                    {!isUser && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
                        <span className="font-medium text-indigo-300">
                          AI Study Pal
                        </span>
                        {msg.isDemo && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                            Demo Response
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    {isUser ? (
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}

                    {/* Actions toolbar for assistant messages */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                        {/* Copy Response */}
                        <button
                          type="button"
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
                          title="Copy response"
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>

                        {/* Save to Notes */}
                        <button
                          type="button"
                          onClick={() =>
                            onSaveToNotes(
                              msg.content,
                              `Study Note - ${new Date().toLocaleDateString()}`
                            )
                          }
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 hover:text-indigo-300 transition-colors"
                          title="Save response as a note"
                        >
                          <FilePlus className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px]">Save Note</span>
                        </button>

                        {/* Bookmark Message */}
                        <button
                          type="button"
                          onClick={() => onBookmarkMessage(msg)}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 hover:text-amber-300 transition-colors"
                          title="Bookmark this explanation"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px]">Bookmark</span>
                        </button>

                        {/* Regenerate (if last message) */}
                        {isLastAssistant && (
                          <button
                            type="button"
                            onClick={onRegenerate}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors disabled:opacity-50"
                            title="Regenerate response"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                            />
                            <span className="text-[11px]">Regenerate</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading / Thinking Indicator */}
            {isLoading && (
              <div className="flex gap-3 sm:gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/90 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-xs p-4 text-xs text-slate-300 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>AI Study Pal is formulating your explanation...</span>
                </div>
              </div>
            )}

            {/* Error Banner with Retry */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Jump to Bottom button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-24 right-6 z-20 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 transition-all"
          title="Jump to latest message"
          aria-label="Jump to latest message"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* 3. Composer / Input Field */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 relative z-10">
        <div className="max-w-3xl mx-auto">
          {validationError && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="relative rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500 shadow-inner">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={modeConfig.placeholder}
              rows={1}
              disabled={isLoading}
              className="w-full bg-transparent px-3.5 pt-3 pb-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed min-h-[44px]"
            />

            {/* Composer Footer Actions */}
            <div className="absolute bottom-2 left-3 right-2 flex items-center justify-between text-[11px] text-slate-500">
              <div className="hidden sm:flex items-center gap-2">
                <span>
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Enter</kbd> to send
                </span>
                <span>•</span>
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Shift+Enter</kbd> for newline
                </span>
              </div>
              <div className="sm:hidden text-[10px]">
                {inputText.length} chars
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] font-mono">
                  {inputText.length > 0 ? `${inputText.length} chars` : ''}
                </span>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isLoading || !inputText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label="Send message"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
