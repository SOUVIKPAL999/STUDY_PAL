import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';
import { Conversation, Note, Bookmark } from '../types';

describe('StorageService', () => {
  beforeEach(() => {
    // Clear in-memory mock localStorage before each test
    StorageService.clearAllLocalData();
  });

  it('should seed default conversations if empty', () => {
    const convs = StorageService.getConversations();
    expect(convs.length).toBeGreaterThan(0);
    expect(convs[0].messages.length).toBeGreaterThan(0);
  });

  it('should save and retrieve custom conversations', () => {
    const testConv: Conversation = {
      id: 'test-conv-1',
      title: 'Test Algorithms Chat',
      mode: 'concept-explainer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'What is QuickSort?',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    StorageService.saveConversations([testConv]);
    const retrieved = StorageService.getConversations();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe('test-conv-1');
    expect(retrieved[0].title).toBe('Test Algorithms Chat');
  });

  it('should manage notes: upsert and delete', () => {
    const note: Note = {
      id: 'note-test-1',
      title: 'Eigenvalues Note',
      content: 'det(A - lambda*I) = 0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.upsertNote(note);
    let notes = StorageService.getNotes();
    expect(notes.some((n) => n.id === 'note-test-1')).toBe(true);

    // Update note content
    StorageService.upsertNote({
      ...note,
      content: 'Updated content with trace theorem',
    });
    notes = StorageService.getNotes();
    const updatedNote = notes.find((n) => n.id === 'note-test-1');
    expect(updatedNote?.content).toContain('trace theorem');

    // Delete note
    StorageService.deleteNote('note-test-1');
    notes = StorageService.getNotes();
    expect(notes.some((n) => n.id === 'note-test-1')).toBe(false);
  });

  it('should manage bookmarks: add and remove', () => {
    const bm: Bookmark = {
      id: 'bm-test-1',
      messageId: 'msg-1',
      conversationId: 'conv-1',
      conversationTitle: 'Linear Algebra',
      mode: 'math-solver',
      label: 'Bayes theorem derivation',
      content: 'P(A|B) = P(B|A)P(A)/P(B)',
      createdAt: new Date().toISOString(),
    };

    StorageService.addBookmark(bm);
    let bookmarks = StorageService.getBookmarks();
    expect(bookmarks.some((b) => b.id === 'bm-test-1')).toBe(true);

    StorageService.removeBookmark('bm-test-1');
    bookmarks = StorageService.getBookmarks();
    expect(bookmarks.some((b) => b.id === 'bm-test-1')).toBe(false);
  });

  it('should update progress metrics on question asked and completed', () => {
    const p1 = StorageService.recordQuestionAsked('concept-explainer');
    expect(p1.questionsAsked).toBeGreaterThanOrEqual(1);

    const p2 = StorageService.recordQuestionCompleted('concept-explainer');
    expect(p2.questionsCompleted).toBeGreaterThanOrEqual(1);
    expect(p2.modeStats['concept-explainer'].completed).toBeGreaterThanOrEqual(1);
  });
});
