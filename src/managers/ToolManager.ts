import { create } from 'zustand';
import { ToolProperties } from '@/types/tools';
import { ToolType } from '@/types/canvas';

interface ToolState {
  activeTool: ToolType;
  toolProperties: ToolProperties;
  isToolWindowOpen: boolean;
  selectedObjectType: string | null;
  userClosedToolWindow: boolean;
  
  // Actions
  setActiveTool: (tool: ToolType) => void;
  updateToolProperties: (properties: Partial<ToolProperties>) => void;
  openToolWindow: (objectType: string) => void;
  closeToolWindow: () => void;
  resetToDefaults: () => void;
}

const defaultToolProperties: ToolProperties = {
  brushSize: 5,
  brushColor: '#000000',
  brushOpacity: 1,
  fillColor: '#3b82f6',
  strokeColor: '#1e40af',
  strokeWidth: 2,
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  textAlign: 'left',
  bubbleStyle: 'round',
  tailPosition: 'bottom-left',
  opacity: 1,
  visible: true
};

export const useToolManager = create<ToolState>((set, get) => ({
  activeTool: 'select',
  toolProperties: defaultToolProperties,
  isToolWindowOpen: false,
  selectedObjectType: null,
  userClosedToolWindow: false,

  setActiveTool: (tool: ToolType) => {
    set({ activeTool: tool });
    
    // Only auto-open tool window if user hasn't manually closed it
    // and it's not already open
    const currentState = get();
    if (['rectangle', 'circle', 'text', 'speech-bubble'].includes(tool) && 
        !currentState.isToolWindowOpen && 
        !currentState.userClosedToolWindow) {
      get().openToolWindow(tool);
    }
  },

  updateToolProperties: (properties: Partial<ToolProperties>) => {
    set(state => ({
      toolProperties: { ...state.toolProperties, ...properties }
    }));
  },

  openToolWindow: (objectType: string) => {
    set({ 
      isToolWindowOpen: true, 
      selectedObjectType: objectType,
      userClosedToolWindow: false
    });
  },

  closeToolWindow: () => {
    set({ 
      isToolWindowOpen: false, 
      selectedObjectType: null,
      userClosedToolWindow: true
    });
  },

  resetToDefaults: () => {
    set({ 
      toolProperties: defaultToolProperties,
      activeTool: 'select',
      isToolWindowOpen: false,
      selectedObjectType: null,
      userClosedToolWindow: false
    });
  }
}));