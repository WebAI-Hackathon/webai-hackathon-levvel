import { toast } from "sonner";
import type { Workspace, Project, WorkspaceConfig, ProjectIndex } from "@/types/workspace";

export class WorkspaceManager {
  private static instance: WorkspaceManager;
  
  static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager();
    }
    return WorkspaceManager.instance;
  }

  // Check if File System Access API is supported
  isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  // Request access to a directory for workspace
  async selectWorkspace(): Promise<Workspace | null> {
    if (!this.isFileSystemAccessSupported()) {
      toast.error("File System Access API not supported in this browser");
      return null;
    }

    try {
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });

      const workspace: Workspace = {
        id: crypto.randomUUID(),
        name: directoryHandle.name,
        path: directoryHandle.name,
        directoryHandle,
        createdAt: new Date(),
        lastAccessed: new Date()
      };

      // Initialize workspace structure
      await this.initializeWorkspace(workspace);
      
      // Store workspace info in localStorage
      this.saveWorkspaceToStorage(workspace);
      
      toast.success(`Workspace "${workspace.name}" selected successfully`);
      return workspace;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Failed to select workspace");
        console.error("Workspace selection error:", error);
      }
      return null;
    }
  }

  // Initialize workspace folder structure
  private async initializeWorkspace(workspace: Workspace): Promise<void> {
    if (!workspace.directoryHandle) return;

    try {
      // Create .comic-sandbox folder
      const configDir = await workspace.directoryHandle.getDirectoryHandle('.comic-sandbox', { create: true });
      
      // Create projects folder
      await workspace.directoryHandle.getDirectoryHandle('projects', { create: true });
      
      // Create templates folder
      await workspace.directoryHandle.getDirectoryHandle('templates', { create: true });

      // Create config.json
      const configData: WorkspaceConfig = {
        version: '1.0.0',
        appName: 'Comic Sandbox',
        createdAt: new Date(),
        lastModified: new Date()
      };
      
      await this.writeJsonFile(configDir, 'config.json', configData);

      // Create projects.json
      const projectIndex: ProjectIndex = {
        projects: []
      };
      
      await this.writeJsonFile(configDir, 'projects.json', projectIndex);
    } catch (error) {
      console.error("Failed to initialize workspace:", error);
      throw error;
    }
  }

  // Save workspace info to localStorage
  private saveWorkspaceToStorage(workspace: Workspace): void {
    const workspaces = this.getStoredWorkspaces();
    const existingIndex = workspaces.findIndex(w => w.id === workspace.id);
    
    if (existingIndex >= 0) {
      workspaces[existingIndex] = { ...workspace, directoryHandle: undefined };
    } else {
      workspaces.push({ ...workspace, directoryHandle: undefined });
    }
    
    localStorage.setItem('comic-sandbox-workspaces', JSON.stringify(workspaces));
  }

  // Get stored workspaces from localStorage
  getStoredWorkspaces(): Workspace[] {
    try {
      const stored = localStorage.getItem('comic-sandbox-workspaces');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Restore directory handle for a workspace
  async restoreWorkspaceHandle(workspace: Workspace): Promise<Workspace | null> {
    if (!this.isFileSystemAccessSupported()) return null;

    try {
      // Try to access the stored directory handle
      const handles = await navigator.storage.getDirectory();
      // This is a simplified approach - in reality, you'd need to implement
      // a more sophisticated handle restoration mechanism
      return workspace;
    } catch (error) {
      console.error("Failed to restore workspace handle:", error);
      return null;
    }
  }

  // Create a new project in the workspace
  async createProject(workspace: Workspace, projectName: string, projectType: Project['type']): Promise<Project | null> {
    if (!workspace.directoryHandle) {
      toast.error("No workspace directory handle");
      return null;
    }

    try {
      const projectsDir = await workspace.directoryHandle.getDirectoryHandle('projects', { create: true });
      const projectDir = await projectsDir.getDirectoryHandle(projectName, { create: true });
      
      // Create project subdirectories
      await projectDir.getDirectoryHandle('assets', { create: true });
      await projectDir.getDirectoryHandle('pages', { create: true });
      await projectDir.getDirectoryHandle('exports', { create: true });

      const project: Project = {
        id: crypto.randomUUID(),
        name: projectName,
        type: projectType,
        workspaceId: workspace.id,
        assets: [],
        metadata: {
          tags: [],
          version: '1.0.0'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save project.json
      await this.writeJsonFile(projectDir, 'project.json', project);

      // Update projects index
      await this.updateProjectsIndex(workspace, project);

      toast.success(`Project "${projectName}" created successfully`);
      return project;
    } catch (error) {
      toast.error("Failed to create project");
      console.error("Project creation error:", error);
      return null;
    }
  }

  // Update projects index
  private async updateProjectsIndex(workspace: Workspace, project: Project): Promise<void> {
    if (!workspace.directoryHandle) return;

    try {
      const configDir = await workspace.directoryHandle.getDirectoryHandle('.comic-sandbox');
      const projectIndex = await this.readJsonFile<ProjectIndex>(configDir, 'projects.json') || { projects: [] };
      
      projectIndex.projects.push({
        id: project.id,
        name: project.name,
        type: project.type,
        lastModified: project.updatedAt,
        folderPath: `projects/${project.name}`
      });

      await this.writeJsonFile(configDir, 'projects.json', projectIndex);
    } catch (error) {
      console.error("Failed to update projects index:", error);
    }
  }

  // List projects in workspace
  async listProjects(workspace: Workspace): Promise<Project[]> {
    if (!workspace.directoryHandle) return [];

    try {
      const configDir = await workspace.directoryHandle.getDirectoryHandle('.comic-sandbox');
      const projectIndex = await this.readJsonFile<ProjectIndex>(configDir, 'projects.json');
      
      if (!projectIndex) return [];

      const projects: Project[] = [];
      
      for (const projectInfo of projectIndex.projects) {
        try {
          const projectsDir = await workspace.directoryHandle.getDirectoryHandle('projects');
          const projectDir = await projectsDir.getDirectoryHandle(projectInfo.name);
          const project = await this.readJsonFile<Project>(projectDir, 'project.json');
          
          if (project) {
            projects.push(project);
          }
        } catch (error) {
          console.warn(`Failed to load project ${projectInfo.name}:`, error);
        }
      }

      return projects;
    } catch (error) {
      console.error("Failed to list projects:", error);
      return [];
    }
  }

  // Helper method to write JSON files
  private async writeJsonFile(directoryHandle: FileSystemDirectoryHandle, fileName: string, data: any): Promise<void> {
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  // Helper method to read JSON files
  private async readJsonFile<T>(directoryHandle: FileSystemDirectoryHandle, fileName: string): Promise<T | null> {
    try {
      const fileHandle = await directoryHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as T;
    } catch (error) {
      console.warn(`Failed to read ${fileName}:`, error);
      return null;
    }
  }
}