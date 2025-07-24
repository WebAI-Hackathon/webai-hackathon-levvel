import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import type { Project } from '@/types/workspace';

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  isProjectLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const { currentWorkspace } = useWorkspaceStore();

  const saveProject = async () => {
    if (!currentProject || !currentWorkspace) return;
    
    setIsProjectLoading(true);
    try {
      // TODO: Implement actual project saving to workspace
      console.log('Saving project:', currentProject);
    } finally {
      setIsProjectLoading(false);
    }
  };

  const loadProject = async (projectId: string) => {
    if (!currentWorkspace) return;
    
    setIsProjectLoading(true);
    try {
      // TODO: Implement actual project loading from workspace
      console.log('Loading project:', projectId);
    } finally {
      setIsProjectLoading(false);
    }
  };

  return (
    <ProjectContext.Provider value={{
      currentProject,
      setCurrentProject,
      saveProject,
      loadProject,
      isProjectLoading
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}