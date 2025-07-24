import { create } from 'zustand';
import { CanvasObject } from '@/types/canvas';

interface SelectionState {
  selectedObjects: CanvasObject[];
  selectedObjectIds: string[];
  isMultiSelection: boolean;
  selectionBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  
  // Actions
  selectObject: (object: CanvasObject) => void;
  selectMultiple: (objects: CanvasObject[]) => void;
  addToSelection: (object: CanvasObject) => void;
  removeFromSelection: (objectId: string) => void;
  clearSelection: () => void;
  updateSelectionBounds: () => void;
}

export const useSelectionManager = create<SelectionState>((set, get) => ({
  selectedObjects: [],
  selectedObjectIds: [],
  isMultiSelection: false,
  selectionBounds: null,

  selectObject: (object: CanvasObject) => {
    set({
      selectedObjects: [object],
      selectedObjectIds: [object.id],
      isMultiSelection: false
    });
    get().updateSelectionBounds();
  },

  selectMultiple: (objects: CanvasObject[]) => {
    set({
      selectedObjects: objects,
      selectedObjectIds: objects.map(obj => obj.id),
      isMultiSelection: objects.length > 1
    });
    get().updateSelectionBounds();
  },

  addToSelection: (object: CanvasObject) => {
    const { selectedObjects, selectedObjectIds } = get();
    if (!selectedObjectIds.includes(object.id)) {
      const newSelection = [...selectedObjects, object];
      set({
        selectedObjects: newSelection,
        selectedObjectIds: [...selectedObjectIds, object.id],
        isMultiSelection: newSelection.length > 1
      });
      get().updateSelectionBounds();
    }
  },

  removeFromSelection: (objectId: string) => {
    const { selectedObjects } = get();
    const filtered = selectedObjects.filter(obj => obj.id !== objectId);
    set({
      selectedObjects: filtered,
      selectedObjectIds: filtered.map(obj => obj.id),
      isMultiSelection: filtered.length > 1
    });
    get().updateSelectionBounds();
  },

  clearSelection: () => {
    set({
      selectedObjects: [],
      selectedObjectIds: [],
      isMultiSelection: false,
      selectionBounds: null
    });
  },

  updateSelectionBounds: () => {
    const { selectedObjects } = get();
    
    if (selectedObjects.length === 0) {
      set({ selectionBounds: null });
      return;
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    selectedObjects.forEach(obj => {
      const width = obj.width || 0;
      const height = obj.height || 0;
      
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + width);
      maxY = Math.max(maxY, obj.y + height);
    });

    set({
      selectionBounds: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    });
  }
}));