import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ProjectExplorer } from './ProjectExplorer';
import { EditorWorkspace } from './EditorWorkspace';
import { ToolWindow } from './ToolWindow';
import { CreateFileDialog } from '@/components/dialogs/CreateFileDialog';
import { useToolManager } from '@/managers/ToolManager';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectFile, ProjectFileType, ComicProject } from '@/types/project';

interface IDELayoutProps {
  project: ComicProject;
}

export function IDELayout({ project }: IDELayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [createFileDialogOpen, setCreateFileDialogOpen] = useState(false);
  const [createFileParentId, setCreateFileParentId] = useState<string | null>(null);
  const { selectedFile, setSelectedFile, createFile, moveFile } = useProjectStore();
  const { isToolWindowOpen } = useToolManager();

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFile(file);
  };

  const handleFileCreate = (parentId?: string, type?: ProjectFileType) => {
    if (type) {
      // Legacy support for direct type specification
      const name = prompt(`Enter ${type} name:`);
      if (name) {
        createFile(parentId || null, name, type);
      }
    } else {
      // Open dialog for file creation
      setCreateFileParentId(parentId || null);
      setCreateFileDialogOpen(true);
    }
  };

  const handleCreateFileFromDialog = (name: string, type: ProjectFileType) => {
    createFile(createFileParentId, name, type);
  };

  const handleFileMove = (fileId: string, newParentId: string | null) => {
    moveFile(fileId, newParentId);
  };

  // Find parent folder name for dialog
  const findFolderName = (folderId: string | null): string | undefined => {
    if (!folderId) return undefined;

    const findInFiles = (files: ProjectFile[]): string | undefined => {
      for (const file of files) {
        if (file.id === folderId && file.type === 'folder') {
          return file.name;
        }
        if (file.children) {
          const found = findInFiles(file.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    return findInFiles(project.files);
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Project Explorer */}
        {/*<ResizablePanel*/}
        {/*  defaultSize={25}*/}
        {/*  minSize={20}*/}
        {/*  maxSize={40}*/}
        {/*  collapsible*/}
        {/*  collapsedSize={5}*/}
        {/*  onCollapse={() => setLeftPanelCollapsed(true)}*/}
        {/*  onExpand={() => setLeftPanelCollapsed(false)}*/}
        {/*>*/}
        {/*  <ProjectExplorer*/}
        {/*    files={project.files}*/}
        {/*    selectedFileId={selectedFile?.id}*/}
        {/*    onFileSelect={handleFileSelect}*/}
        {/*    onFileCreate={handleFileCreate}*/}
        {/*    onFileMove={handleFileMove}*/}
        {/*    isCollapsed={leftPanelCollapsed}*/}
        {/*  />*/}
        {/*</ResizablePanel>*/}

        <ResizableHandle withHandle />

        {/* Center Panel - Editor Workspace */}
        <ResizablePanel defaultSize={isToolWindowOpen ? 60 : 80}>
          <EditorWorkspace project={project} selectedFile={selectedFile} />
        </ResizablePanel>

        {/* Right Panel - Tool Window */}
        {isToolWindowOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={35}
              className="transition-all duration-200"
            >
              <ToolWindow />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      <CreateFileDialog
        open={createFileDialogOpen}
        onOpenChange={setCreateFileDialogOpen}
        onCreateFile={handleCreateFileFromDialog}
        parentFolderName={findFolderName(createFileParentId)}
      />
    </div>
  );
}
