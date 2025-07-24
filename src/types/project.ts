export type ProjectFileType = 'comic' | 'frame' | 'story' | 'image' | 'template' | 'canvas' | 'folder';

export interface ProjectFile {
  id: string;
  name: string;
  type: ProjectFileType;
  path: string;
  parentId?: string;
  children?: ProjectFile[];
  metadata?: {
    size?: number;
    aspectRatio?: string;
    dimensions?: { width: number; height: number };
    lastModified: Date;
    created: Date;
  };
  content?: any; // Type-specific content
}

export interface ComicProject {
  id: string;
  name: string;
  description?: string;
  aspectRatio: string; // e.g., "16:9", "4:3", "A4"
  files: ProjectFile[];
  settings: {
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
    pageLayout: 'single' | 'double';
    defaultFrameStyle: string;
  };
  metadata: {
    author?: string;
    tags: string[];
    version: string;
    created: Date;
    lastModified: Date;
  };
}

export interface FrameData {
  id: string;
  type: 'panel' | 'speech-bubble' | 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  properties: Record<string, any>;
  imageRef?: string; // Reference to image file
}

export interface StoryPanel {
  id: string;
  textPosition: { start: number; end: number };
  visualContent: {
    type: 'image' | 'frame' | 'canvas';
    reference: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  };
  notes?: string;
}

export interface SpeechBubble {
  id: string;
  text: string;
  style: 'round' | 'square' | 'thought' | 'shout' | 'whisper';
  tailPosition: { x: number; y: number };
  tailDirection: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}