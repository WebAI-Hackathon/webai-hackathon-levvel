export type EditorMode = 'paint' | 'meme' | 'story' | 'comic';

export interface EditorFile {
  id: string;
  name: string;
  type: 'project' | 'image' | 'text' | 'template';
  path: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  children?: EditorFile[];
}

export interface EditorProject {
  id: string;
  name: string;
  mode: EditorMode;
  files: EditorFile[];
  activeFileId?: string;
  canvasState: any;
  metadata: {
    description?: string;
    tags: string[];
    author?: string;
    version: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PanelLayout {
  leftPanel: {
    width: number;
    isCollapsed: boolean;
  };
  rightPanel: {
    width: number;
    isCollapsed: boolean;
  };
  centerPanel: {
    activeTab: string;
  };
}