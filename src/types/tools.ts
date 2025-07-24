export interface ToolProperties {
  // Brush/Painting properties
  brushSize?: number;
  brushColor?: string;
  brushOpacity?: number;
  
  // Shape properties
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Image properties
  brightness?: number;
  contrast?: number;
  saturation?: number;
  filter?: string;
  
  // Speech bubble properties
  bubbleStyle?: 'round' | 'square' | 'thought';
  tailPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  
  // General properties
  opacity?: number;
  visible?: boolean;
}

export interface ToolWindow {
  id: string;
  title: string;
  objectType: string;
  isOpen: boolean;
  properties: ToolProperties;
}

export interface HistoryEntry {
  id: string;
  action: 'create' | 'delete' | 'modify' | 'move';
  timestamp: Date;
  objectId?: string;
  previousState?: any;
  newState?: any;
}