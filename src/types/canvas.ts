export type ToolType = 
  | 'select'
  | 'paint'
  | 'brush'
  | 'eraser'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'image'
  | 'speech-bubble'
  | 'line'
  | 'polygon';

export type ObjectType = 
  | 'shape'
  | 'text'
  | 'image'
  | 'speech-bubble'
  | 'drawing';

export interface CanvasObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  properties: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasState {
  objects: CanvasObject[];
  selectedObjectIds: string[];
  tool: ToolType;
  zoom: number;
  panX: number;
  panY: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface PaintingTool {
  type: 'brush' | 'eraser';
  size: number;
  color: string;
  opacity: number;
}

export interface SnapPoint {
  x: number;
  y: number;
  type: 'grid' | 'object' | 'guide';
}