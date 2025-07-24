import { create } from 'zustand';
import { HistoryEntry } from '@/types/tools';
import { CanvasObject } from '@/types/canvas';

interface HistoryState {
  history: HistoryEntry[];
  currentIndex: number;
  maxHistorySize: number;
  
  // Actions
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getHistoryPreview: () => { undoAction?: string; redoAction?: string; };
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useHistoryManager = create<HistoryState>((set, get) => ({
  history: [],
  currentIndex: -1,
  maxHistorySize: 50,

  addHistoryEntry: (entry) => {
    const { history, currentIndex, maxHistorySize } = get();
    
    const newEntry: HistoryEntry = {
      ...entry,
      id: generateId(),
      timestamp: new Date()
    };

    // Remove any entries after current index (when undoing then doing new action)
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newEntry);

    // Limit history size
    const trimmedHistory = newHistory.slice(-maxHistorySize);
    const newIndex = trimmedHistory.length - 1;

    set({
      history: trimmedHistory,
      currentIndex: newIndex
    });
  },

  undo: () => {
    const { history, currentIndex } = get();
    
    if (currentIndex >= 0) {
      const entry = history[currentIndex];
      set({ currentIndex: currentIndex - 1 });
      return entry;
    }
    
    return null;
  },

  redo: () => {
    const { history, currentIndex } = get();
    
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const entry = history[newIndex];
      set({ currentIndex: newIndex });
      return entry;
    }
    
    return null;
  },

  canUndo: () => {
    const { currentIndex } = get();
    return currentIndex >= 0;
  },

  canRedo: () => {
    const { history, currentIndex } = get();
    return currentIndex < history.length - 1;
  },

  clearHistory: () => {
    set({
      history: [],
      currentIndex: -1
    });
  },

  getHistoryPreview: () => {
    const { history, currentIndex } = get();
    
    const undoEntry = currentIndex >= 0 ? history[currentIndex] : null;
    const redoEntry = currentIndex < history.length - 1 ? history[currentIndex + 1] : null;
    
    return {
      undoAction: undoEntry ? `${undoEntry.action} ${undoEntry.objectId || 'object'}` : undefined,
      redoAction: redoEntry ? `${redoEntry.action} ${redoEntry.objectId || 'object'}` : undefined
    };
  }
}));

// Helper functions for creating common history entries
export const createObjectEntry = (
  action: 'create' | 'delete' | 'modify',
  object: CanvasObject,
  previousState?: CanvasObject
) => ({
  action,
  objectId: object.id,
  newState: object,
  previousState
});

export const createMoveEntry = (
  objectId: string,
  previousPosition: { x: number; y: number },
  newPosition: { x: number; y: number }
) => ({
  action: 'move' as const,
  objectId,
  previousState: previousPosition,
  newState: newPosition
});