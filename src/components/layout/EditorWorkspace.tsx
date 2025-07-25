import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {X, Save, Undo, Redo, ZoomIn, ZoomOut, Plus, Files} from 'lucide-react';
import { useHistoryManager } from '@/managers/HistoryManager';
import { ProjectFile, ComicProject } from '@/types/project';
import { ImageEditor } from '../editors/ImageEditor';
import { ComicLayoutEditor } from '../editors/ComicLayoutEditor';
import { CanvasEngine } from '../editors/CanvasEngine';
import { EnhancedCanvasEditor } from '../editors/EnhancedCanvasEditor';
import { StoryEditor } from '../editors/StoryEditor';
import { StoryTextEditor } from '../editors/StoryTextEditor';
import {Link} from "react-router-dom";
import {Tool} from "@/components/Tool.tsx";

interface EditorWorkspaceProps {
  project: ComicProject;
  selectedFile?: ProjectFile | null;
}

interface EditorTab {
  id: string;
  title: string;
  type: 'canvas' | 'text' | 'image' | 'comic' | 'story' | 'frame';
  isDirty: boolean;
  file?: ProjectFile;
}

const welcomeTab: EditorTab = {
    id: 'welcome',
    title: 'Welcome',
    type: 'canvas',
    isDirty: false,
}

export function EditorWorkspace({ project, selectedFile }: EditorWorkspaceProps) {
  const [activeTabId, setActiveTabId] = useState('welcome');
  const [zoom, setZoom] = useState(100);
  const { canUndo, canRedo, undo, redo, getHistoryPreview } = useHistoryManager();
  const [tabs, setTabs] = useState<EditorTab[]>([welcomeTab]);

  useEffect(() => {
    if (activeTabId === "new-tab") {
      const newTab: EditorTab = {
        id: `new-${Date.now()}`,
        title: 'New Canvas',
        type: 'canvas',
        isDirty: false,
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  }, [activeTabId]);

  // Helper function to safely format dates
  const formatDate = (date: any): string => {
    if (!date) return 'Unknown';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Open file in new tab when selectedFile changes
  useEffect(() => {
    if (selectedFile && selectedFile.type !== 'folder') {
      const existingTab = tabs.find(tab => tab.file?.id === selectedFile.id);
      if (!existingTab) {
        const getEditorType = (fileType: string): EditorTab['type'] => {
          switch (fileType) {
            case 'story': return 'story';
            case 'image': return 'image';
            case 'comic': return 'comic';
            case 'frame': return 'canvas';
            case 'template': return 'canvas';
            default: return 'canvas';
          }
        };

        const newTab: EditorTab = {
          id: selectedFile.id,
          title: selectedFile.name,
          type: getEditorType(selectedFile.type),
          isDirty: false,
          file: selectedFile
        };
        setTabs(prev => [...prev, newTab]);
      }
      setActiveTabId(selectedFile.id);
    }
  }, [selectedFile, tabs]);

  const { undoAction, redoAction } = getHistoryPreview();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving project...');
  };

  const handleUndo = () => {
    const entry = undo();
    if (entry) {
      console.log('Undoing:', entry);
      // TODO: Apply undo operation to canvas
    }
  };

  const handleRedo = () => {
    const entry = redo();
    if (entry) {
      console.log('Redoing:', entry);
      // TODO: Apply redo operation to canvas
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 500));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const closeTab = (tabId: string) => {
    let newTabs = tabs.filter(tab => tab.id !== tabId);
    if (newTabs.length === 0) {
      newTabs = [welcomeTab];
    }
    setTabs(newTabs);

    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const createNewTab = () => {
    const newTab: EditorTab = {
      id: `new-${Date.now()}`,
      title: 'New Canvas',
      type: 'canvas',
      isDirty: false,
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }

  const buildCreateTabTool = () => {
    return (
        <Tool name="create_canvas" description="Creates a new canvas to start a new project. Doesn't delete the old canvas." onCall={createNewTab} />
    )
  }

  const buildCloseTabTool = () => {
    return (
        <Tool name={"close_tab"} description={"Closes a tab/project. This deletes the artwork on the canvas completely."} onCall={(event) => {
          closeTab(event.detail.id);
        }}>
          <prop name="id" type="string" required description="The ID of the tab to close. This should match the tab's unique identifier." />
        </Tool>
    )
  }

  const buildContext = () => {
    return (
        <context name="tabs">
          {tabs.map((tab, index) =>
            `${index + 1}. Tab ID: ${tab.id}`
          ).join("\n") + "\n\nActive Tab: " + activeTabId}
        </context>
    )
  }

  const buildTools = () => {
    return (
        <>
          {buildContext()}
          {buildCreateTabTool()}
          {buildCloseTabTool()}
        </>
    )
  }

  const renderEditor = (tab: EditorTab) => {
    // Add error boundary for individual editors
    try {
      if (tab.id === 'welcome') {
      return (
        <div className="h-full flex items-center justify-center">
          {buildTools()}
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Welcome to Creative Studio Canvas!</h2>
            <p className="text-muted-foreground mb-6">
              Open a <span
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={createNewTab}>new tab</span> to start creating your image project.
            </p>

            <div className="mt-6 p-16 bg-muted rounded-lg">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" asChild className="shadow-elegant hover:shadow-glow" onClick={createNewTab}>
                  <div>
                    <Files className="w-5 h-5 mr-2" />
                    Create New Canvas
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {buildTools()}
        <EnhancedCanvasEditor width={800} height={800} />
      </>
    );
    } catch (error) {
      console.error('Error rendering editor:', error);
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2 text-destructive">Editor Error</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading this editor. Please try refreshing or selecting a different file.
            </p>
            <Button
              variant="outline"
              onClick={() => closeTab(tab.id)}
            >
              Close Tab
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Editor toolbar */}
      {/*<div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">*/}
      {/*  <div className="flex items-center gap-2">*/}
      {/*    <Button */}
      {/*      variant="ghost" */}
      {/*      size="sm" */}
      {/*      onClick={handleUndo}*/}
      {/*      disabled={!canUndo()}*/}
      {/*      title={undoAction ? `Undo ${undoAction}` : 'Nothing to undo'}*/}
      {/*    >*/}
      {/*      <Undo className="h-4 w-4" />*/}
      {/*    </Button>*/}
      {/*    <Button */}
      {/*      variant="ghost" */}
      {/*      size="sm" */}
      {/*      onClick={handleRedo}*/}
      {/*      disabled={!canRedo()}*/}
      {/*      title={redoAction ? `Redo ${redoAction}` : 'Nothing to redo'}*/}
      {/*    >*/}
      {/*      <Redo className="h-4 w-4" />*/}
      {/*    </Button>*/}
      {/*    <div className="w-px h-6 bg-border mx-2" />*/}
      {/*    <Button variant="ghost" size="sm" onClick={handleSave}>*/}
      {/*      <Save className="h-4 w-4 mr-2" />*/}
      {/*      Save*/}
      {/*    </Button>*/}
      {/*  </div>*/}

      {/*  <div className="flex items-center gap-2">*/}
      {/*    <Button variant="ghost" size="sm" onClick={handleZoomOut}>*/}
      {/*      <ZoomOut className="h-4 w-4" />*/}
      {/*    </Button>*/}
      {/*    <span className="text-sm font-mono min-w-12 text-center">*/}
      {/*      {zoom}%*/}
      {/*    </span>*/}
      {/*    <Button variant="ghost" size="sm" onClick={handleZoomIn}>*/}
      {/*      <ZoomIn className="h-4 w-4" />*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* Editor tabs and content */}

      {tabs.length === 0 && renderEditor(welcomeTab)}

      <div className="flex-1 min-h-0">
        <Tabs value={activeTabId} onValueChange={setActiveTabId} className="h-full flex flex-col">
          <TabsList className="h-10 bg-muted rounded-none border-b border-border justify-start flex-shrink-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group relative data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <span className="mr-2">
                  {tab.title}
                  {tab.isDirty && <span className="text-blue-500 ml-1">•</span>}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TabsTrigger>
            ))}
            <TabsTrigger value={"new-tab"} className="group relative data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newTab: EditorTab = {
                      id: `new-${Date.now()}`,
                      title: 'New Canvas',
                      type: 'canvas',
                      isDirty: false,
                    };
                    setTabs(prev => [...prev, newTab]);
                    setActiveTabId(newTab.id);
                  }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </TabsTrigger>
          </TabsList>


          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="flex-1 m-0 data-[state=inactive]:hidden overflow-auto"
              forceMount
              hidden={tab.id !== activeTabId}
            >
              {renderEditor(tab)}
            </TabsContent>
          ))}

        </Tabs>
      </div>
    </div>
  );
}
