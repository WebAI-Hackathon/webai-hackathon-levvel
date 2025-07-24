import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace, Project } from '@/types/workspace';
import { WorkspaceManager } from '@/lib/workspaceHandler';

interface WorkspaceState {
  // State
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;

  // Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (workspaceId: string) => void;
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  setLoading: (loading: boolean) => void;

  // Async actions
  selectWorkspace: () => Promise<void>;
  loadProjects: () => Promise<void>;
  createProject: (name: string, type: Project['type']) => Promise<Project | null>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWorkspace: null,
      workspaces: [],
      currentProject: null,
      projects: [],
      isLoading: false,

      // Actions
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      
      addWorkspace: (workspace) => set((state) => ({
        workspaces: [...state.workspaces, workspace]
      })),
      
      removeWorkspace: (workspaceId) => set((state) => ({
        workspaces: state.workspaces.filter(w => w.id !== workspaceId),
        currentWorkspace: state.currentWorkspace?.id === workspaceId ? null : state.currentWorkspace
      })),
      
      setCurrentProject: (project) => set({ currentProject: project }),
      
      setProjects: (projects) => set({ projects }),
      
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      
      updateProject: (project) => set((state) => ({
        projects: state.projects.map(p => p.id === project.id ? project : p),
        currentProject: state.currentProject?.id === project.id ? project : state.currentProject
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),

      // Async actions
      selectWorkspace: async () => {
        const { setLoading, setCurrentWorkspace, addWorkspace, loadProjects } = get();
        
        setLoading(true);
        try {
          const manager = WorkspaceManager.getInstance();
          const workspace = await manager.selectWorkspace();
          
          if (workspace) {
            setCurrentWorkspace(workspace);
            addWorkspace(workspace);
            await loadProjects();
          }
        } finally {
          setLoading(false);
        }
      },

      loadProjects: async () => {
        const { currentWorkspace, setProjects, setLoading } = get();
        
        if (!currentWorkspace) return;
        
        setLoading(true);
        try {
          const manager = WorkspaceManager.getInstance();
          const projects = await manager.listProjects(currentWorkspace);
          setProjects(projects);
        } finally {
          setLoading(false);
        }
      },

      createProject: async (name: string, type: Project['type']) => {
        const { currentWorkspace, addProject, setLoading } = get();
        
        if (!currentWorkspace) return null;
        
        setLoading(true);
        try {
          const manager = WorkspaceManager.getInstance();
          const project = await manager.createProject(currentWorkspace, name, type);
          
          if (project) {
            addProject(project);
          }
          
          return project;
        } finally {
          setLoading(false);
        }
      }
    }),
    {
      name: 'comic-sandbox-workspace',
      partialize: (state) => ({
        workspaces: state.workspaces.map(w => ({ ...w, directoryHandle: undefined })),
        currentWorkspace: state.currentWorkspace ? { ...state.currentWorkspace, directoryHandle: undefined } : null
      })
    }
  )
);