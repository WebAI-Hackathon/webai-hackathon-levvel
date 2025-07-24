import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ProjectExplorer } from './ProjectExplorer';
import { EditorWorkspace } from './EditorWorkspace';
import { ToolWindow } from './ToolWindow';
import { useToolManager } from '@/managers/ToolManager';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectFile, ProjectFileType, ComicProject } from '@/types/project';

interface IDELayoutProps {
  project: ComicProject;
}

export function IDELayout({ project }: IDELayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const { selectedFile, setSelectedFile, createFile } = useProjectStore();
  const { isToolWindowOpen } = useToolManager();

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFile(file);
  };

  const handleFileCreate = (parentId?: string, type?: ProjectFileType) => {
    if (type) {
      const name = prompt(`Enter ${type} name:`);
      if (name) {
        createFile(parentId || null, name, type);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Project Explorer */}
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          maxSize={40}
          collapsible
          collapsedSize={5}
          onCollapse={() => setLeftPanelCollapsed(true)}
          onExpand={() => setLeftPanelCollapsed(false)}
        >
          <ProjectExplorer
            files={project.files}
            selectedFileId={selectedFile?.id}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            isCollapsed={leftPanelCollapsed}
          />
        </ResizablePanel>

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
    </div>
  );
}