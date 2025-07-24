import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComicProject, ProjectFile, ProjectFileType } from '@/types/project';

interface ProjectState {
  currentProject: ComicProject | null;
  projects: ComicProject[];
  selectedFile: ProjectFile | null;
  
  // Actions
  setCurrentProject: (project: ComicProject) => void;
  createProject: (name: string, aspectRatio: string) => void;
  updateProject: (updates: Partial<ComicProject>) => void;
  deleteProject: (projectId: string) => void;
  
  // File management
  setSelectedFile: (file: ProjectFile | null) => void;
  createFile: (parentId: string | null, name: string, type: ProjectFileType) => void;
  deleteFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void;
  moveFile: (fileId: string, newParentId: string | null) => void;
}

const generateId = () => crypto.randomUUID();

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],
      selectedFile: null,

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      createProject: (name, aspectRatio) => {
        const newProject: ComicProject = {
          id: generateId(),
          name,
          description: '',
          aspectRatio,
          files: [
            {
              id: 'assets',
              name: 'Assets',
              type: 'folder',
              path: '/assets',
              children: [
                {
                  id: 'hero-img',
                  name: 'hero-image.png',
                  type: 'image',
                  path: '/assets/hero-image.png',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 2400000,
                    dimensions: { width: 1920, height: 1080 }
                  },
                  content: {
                    url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
                    type: 'image/png'
                  }
                },
                {
                  id: 'character-design',
                  name: 'character-design.jpg',
                  type: 'image',
                  path: '/assets/character-design.jpg',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 1800000,
                    dimensions: { width: 1200, height: 1600 }
                  },
                  content: {
                    url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop',
                    type: 'image/jpeg'
                  }
                },
                {
                  id: 'background-art',
                  name: 'background-cityscape.png',
                  type: 'image',
                  path: '/assets/background-cityscape.png',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 3100000,
                    dimensions: { width: 2560, height: 1440 }
                  },
                  content: {
                    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
                    type: 'image/png'
                  }
                }
              ],
              metadata: { lastModified: new Date(), created: new Date() }
            },
            {
              id: 'stories',
              name: 'Stories',
              type: 'folder',
              path: '/stories',
              children: [
                {
                  id: 'chapter-1',
                  name: 'Chapter-1-Origin.story',
                  type: 'story',
                  path: '/stories/Chapter-1-Origin.story',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 45000
                  },
                  content: {
                    text: `<h1>Chapter 1: The Origin</h1>
<p>In the bustling metropolis of Neo Tokyo, where neon lights pierce through perpetual smog and towering skyscrapers reach toward a polluted sky, our story begins...</p>

<h2>Scene 1: The Discovery</h2>
<p>Maya Tanaka, a 22-year-old software engineer, discovers an encrypted message hidden in the city's traffic management system. The message contains coordinates to an abandoned warehouse in the industrial district.</p>

<blockquote>
<p>"The truth lies where the old meets the new. Follow the digital breadcrumbs, but beware - they are watching."</p>
</blockquote>

<p>Maya's fingers trembled as she decoded the final layer of encryption. Whatever this was, it was far more sophisticated than anything she'd encountered in her day job...</p>`,
                    panels: [
                      {
                        id: 'panel-1',
                        textPosition: { start: 156, end: 298 },
                        visualContent: {
                          type: 'image',
                          reference: 'hero-img',
                          position: { x: 50, y: 50 },
                          size: { width: 300, height: 200 }
                        },
                        notes: 'Wide shot of Neo Tokyo skyline at night'
                      },
                      {
                        id: 'panel-2',
                        textPosition: { start: 456, end: 612 },
                        visualContent: {
                          type: 'image',
                          reference: 'character-design',
                          position: { x: 50, y: 300 },
                          size: { width: 250, height: 300 }
                        },
                        notes: 'Close-up of Maya at her computer, focused expression'
                      }
                    ]
                  }
                },
                {
                  id: 'chapter-2',
                  name: 'Chapter-2-Meeting.story',
                  type: 'story',
                  path: '/stories/Chapter-2-Meeting.story',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 32000
                  },
                  content: {
                    text: `<h1>Chapter 2: The Meeting</h1>
<p>The warehouse stood silent against the night sky, its broken windows like hollow eyes staring into the darkness...</p>`,
                    panels: []
                  }
                }
              ],
              metadata: { lastModified: new Date(), created: new Date() }
            },
            {
              id: 'comics',
              name: 'Comics',
              type: 'folder',
              path: '/comics',
              children: [
                {
                  id: 'issue-1',
                  name: 'Issue-1-Pilot.comic',
                  type: 'comic',
                  path: '/comics/Issue-1-Pilot.comic',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 125000
                  },
                  content: {
                    pages: [
                      {
                        id: 'page-1',
                        panels: [
                          {
                            id: 'panel-1-1',
                            x: 50,
                            y: 50,
                            width: 300,
                            height: 200,
                            frameStyle: 'classic',
                            content: {
                              type: 'image',
                              reference: 'hero-img'
                            }
                          },
                          {
                            id: 'panel-1-2',
                            x: 400,
                            y: 50,
                            width: 300,
                            height: 200,
                            frameStyle: 'classic',
                            content: {
                              type: 'image',
                              reference: 'character-design'
                            }
                          }
                        ]
                      }
                    ],
                    aspectRatio: '16:9',
                    pageLayout: 'single'
                  }
                }
              ],
              metadata: { lastModified: new Date(), created: new Date() }
            },
            {
              id: 'frames',
              name: 'Frames',
              type: 'folder',
              path: '/frames',
              children: [
                {
                  id: 'action-frame',
                  name: 'Action-Sequence.frame',
                  type: 'frame',
                  path: '/frames/Action-Sequence.frame',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 8500
                  },
                  content: {
                    frameData: {
                      id: 'action-frame-1',
                      type: 'panel',
                      x: 0,
                      y: 0,
                      width: 400,
                      height: 300,
                      rotation: 0,
                      zIndex: 1,
                      properties: {
                        frameStyle: 'jagged',
                        borderWidth: 3,
                        borderColor: '#ff0000'
                      },
                      imageRef: 'background-art'
                    }
                  }
                }
              ],
              metadata: { lastModified: new Date(), created: new Date() }
            },
            {
              id: 'templates',
              name: 'Templates',
              type: 'folder',
              path: '/templates',
              children: [
                {
                  id: 'standard-page',
                  name: 'Standard-Page.template',
                  type: 'template',
                  path: '/templates/Standard-Page.template',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 12000
                  },
                  content: {
                    templateData: {
                      name: 'Standard Comic Page',
                      description: 'A standard 6-panel comic page layout',
                      aspectRatio: '4:3',
                      panels: [
                        { x: 50, y: 50, width: 200, height: 150, frameStyle: 'classic' },
                        { x: 300, y: 50, width: 200, height: 150, frameStyle: 'classic' },
                        { x: 550, y: 50, width: 200, height: 150, frameStyle: 'classic' },
                        { x: 50, y: 250, width: 200, height: 150, frameStyle: 'classic' },
                        { x: 300, y: 250, width: 200, height: 150, frameStyle: 'classic' },
                        { x: 550, y: 250, width: 200, height: 150, frameStyle: 'classic' }
                      ]
                    }
                  }
                }
              ],
              metadata: { lastModified: new Date(), created: new Date() }
            },
            {
              id: 'canvas',
              name: 'Canvas',
              type: 'folder',
              path: '/canvas',
              children: [
                {
                  id: 'sample-canvas',
                  name: 'Sample-Artwork.canvas',
                  type: 'canvas',
                  path: '/canvas/Sample-Artwork.canvas',
                  metadata: { 
                    lastModified: new Date(), 
                    created: new Date(),
                    size: 15000,
                    dimensions: { width: 800, height: 600 }
                  },
                  content: {
                    canvasData: {
                      version: '1.0',
                      objects: [],
                      background: '#ffffff',
                      width: 800,
                      height: 600
                    }
                  }
                }
              ],
              metadata: { lastModified: new Date(), created: new Date() }
            }
          ],
          settings: {
            gridSize: 20,
            snapToGrid: true,
            showGrid: true,
            pageLayout: 'single',
            defaultFrameStyle: 'classic'
          },
          metadata: {
            tags: ['superhero', 'cyberpunk', 'action'],
            version: '1.0.0',
            created: new Date(),
            lastModified: new Date()
          }
        };

        set(state => ({
          projects: [...state.projects, newProject],
          currentProject: newProject
        }));
      },

      updateProject: (updates) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const updatedProject = {
          ...currentProject,
          ...updates,
          metadata: {
            ...currentProject.metadata,
            ...updates.metadata,
            lastModified: new Date()
          }
        };

        set(state => ({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === currentProject.id ? updatedProject : p
          )
        }));
      },

      deleteProject: (projectId) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProject: state.currentProject?.id === projectId ? null : state.currentProject
        }));
      },

      setSelectedFile: (file) => {
        set({ selectedFile: file });
      },

      createFile: (parentId, name, type) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const newFile: ProjectFile = {
          id: generateId(),
          name,
          type,
          path: parentId ? `${parentId}/${name}` : `/${name}`,
          parentId: parentId || undefined,
          metadata: {
            lastModified: new Date(),
            created: new Date()
          }
        };

        const updateFiles = (files: ProjectFile[]): ProjectFile[] => {
          return files.map(file => {
            if (file.id === parentId) {
              return {
                ...file,
                children: [...(file.children || []), newFile]
              };
            }
            if (file.children) {
              return {
                ...file,
                children: updateFiles(file.children)
              };
            }
            return file;
          });
        };

        const updatedFiles = parentId ? updateFiles(currentProject.files) : [...currentProject.files, newFile];

        get().updateProject({ files: updatedFiles });
      },

      deleteFile: (fileId) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const removeFile = (files: ProjectFile[]): ProjectFile[] => {
          return files.filter(file => {
            if (file.id === fileId) return false;
            if (file.children) {
              file.children = removeFile(file.children);
            }
            return true;
          });
        };

        const updatedFiles = removeFile(currentProject.files);
        get().updateProject({ files: updatedFiles });
      },

      updateFile: (fileId, updates) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const updateFile = (files: ProjectFile[]): ProjectFile[] => {
          return files.map(file => {
            if (file.id === fileId) {
              return {
                ...file,
                ...updates,
                metadata: {
                  ...file.metadata,
                  ...updates.metadata,
                  lastModified: new Date()
                }
              };
            }
            if (file.children) {
              return {
                ...file,
                children: updateFile(file.children)
              };
            }
            return file;
          });
        };

        const updatedFiles = updateFile(currentProject.files);
        get().updateProject({ files: updatedFiles });
      },

      moveFile: (fileId, newParentId) => {
        // TODO: Implement file moving logic
        console.log('Move file:', { fileId, newParentId });
      }
    }),
    {
      name: 'comic-studio-projects',
      partialize: (state) => ({ 
        projects: state.projects,
        currentProject: state.currentProject 
      })
    }
  )
);