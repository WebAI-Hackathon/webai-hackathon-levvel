import { EditorProject, EditorFile } from '@/types/editor';

const createMockFile = (
  id: string,
  name: string,
  type: EditorFile['type'],
  parentId?: string
): EditorFile => ({
  id,
  name,
  type,
  path: parentId ? `/${parentId}/${name}` : `/${name}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  parentId,
  children: type === 'project' ? [] : undefined
});

const mockFiles: EditorFile[] = [
  createMockFile('assets', 'Assets', 'project'),
  createMockFile('templates', 'Templates', 'project'),
  createMockFile('characters', 'Characters', 'project'),
  createMockFile('hero-bg', 'hero-background.jpg', 'image', 'assets'),
  createMockFile('char1', 'superhero.png', 'image', 'characters'),
  createMockFile('char2', 'villain.png', 'image', 'characters'),
  createMockFile('story1', 'chapter-1.md', 'text'),
  createMockFile('bubble-template', 'speech-bubbles.svg', 'template', 'templates'),
];

export const mockProjects: EditorProject[] = [
  {
    id: 'comic-project-1',
    name: 'Superhero Adventures',
    mode: 'comic',
    files: mockFiles,
    activeFileId: 'hero-bg',
    canvasState: {
      objects: [],
      selectedObjectIds: [],
      tool: 'select',
      zoom: 1,
      panX: 0,
      panY: 0,
      gridVisible: true,
      snapToGrid: true,
      gridSize: 20
    },
    metadata: {
      description: 'A thrilling superhero comic series',
      tags: ['superhero', 'action', 'adventure'],
      author: 'Comic Creator',
      version: '1.0.0'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'meme-project-1',
    name: 'Funny Memes Collection',
    mode: 'meme',
    files: [
      createMockFile('meme1', 'distracted-boyfriend.jpg', 'image'),
      createMockFile('meme2', 'drake-pointing.jpg', 'image'),
    ],
    canvasState: {
      objects: [],
      selectedObjectIds: [],
      tool: 'text',
      zoom: 1,
      panX: 0,
      panY: 0,
      gridVisible: false,
      snapToGrid: false,
      gridSize: 10
    },
    metadata: {
      description: 'Collection of popular meme templates',
      tags: ['meme', 'humor', 'viral'],
      author: 'Meme Master',
      version: '1.0.0'
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  }
];

// TODO: Replace with actual workspace integration
export const getCurrentProject = (): EditorProject => {
  return mockProjects[0];
};

export const getProjectById = (id: string): EditorProject | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const updateProject = (id: string, updates: Partial<EditorProject>): EditorProject => {
  const project = getProjectById(id);
  if (!project) throw new Error(`Project ${id} not found`);
  
  const updatedProject = { ...project, ...updates, updatedAt: new Date() };
  // TODO: Persist to workspace
  return updatedProject;
};