export interface Workspace {
  id: string;
  name: string;
  path: string;
  directoryHandle?: FileSystemDirectoryHandle;
  createdAt: Date;
  lastAccessed: Date;
}

export interface ProjectAsset {
  id: string;
  name: string;
  type: 'image' | 'text' | 'template';
  filePath: string;
  size: number;
  createdAt: Date;
}

export interface ProjectMetadata {
  description?: string;
  tags: string[];
  author?: string;
  version: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'image' | 'meme' | 'story' | 'comic';
  workspaceId: string;
  assets: ProjectAsset[];
  metadata: ProjectMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceConfig {
  version: string;
  appName: string;
  createdAt: Date;
  lastModified: Date;
}

export interface ProjectIndex {
  projects: Array<{
    id: string;
    name: string;
    type: Project['type'];
    lastModified: Date;
    folderPath: string;
  }>;
}