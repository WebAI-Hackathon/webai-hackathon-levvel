import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {X, Save, Undo, Redo, ZoomIn, ZoomOut, Plus} from 'lucide-react';
import { useHistoryManager } from '@/managers/HistoryManager';
import { ProjectFile, ComicProject } from '@/types/project';
import { ImageEditor } from '../editors/ImageEditor';
import { ComicLayoutEditor } from '../editors/ComicLayoutEditor';
import { CanvasEngine } from '../editors/CanvasEngine';
import { EnhancedCanvasEditor } from '../editors/EnhancedCanvasEditor';
import { StoryEditor } from '../editors/StoryEditor';
import { StoryTextEditor } from '../editors/StoryTextEditor';

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

  const renderEditor = (tab: EditorTab) => {
    // Add error boundary for individual editors
    try {
      if (tab.id === 'welcome') {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Welcome to Comic Studio IDE</h2>
            <p className="text-muted-foreground mb-6">
              Select a file from the project explorer to start editing. Your project contains sample files to get you started.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Story Editor</h3>
                <p className="text-sm text-muted-foreground">Write scripts with synchronized visual panels</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Comic Layout</h3>
                <p className="text-sm text-muted-foreground">Design multi-page comic layouts</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Image Editor</h3>
                <p className="text-sm text-muted-foreground">Advanced drawing and editing tools</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Frame Templates</h3>
                <p className="text-sm text-muted-foreground">Reusable frame designs and layouts</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Quick Start:</h4>
              <ul className="text-sm text-muted-foreground text-left space-y-1">
                <li>• Open "Chapter-1-Origin.story" to see the story editor</li>
                <li>• Try "Issue-1-Pilot.comic" for comic layout tools</li>
                <li>• Browse Assets folder for sample images</li>
                <li>• Create new files from the File Manager</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Load file content based on file type
    if (tab.file?.content) {
      switch (tab.type) {
        case 'story':
          // For story files with content, show the content viewer
          if (tab.file?.content && tab.file.content.text) {
            return (
              <div className="h-full overflow-auto">
                <div className="p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold mb-2">{tab.file.name}</h1>
                      <div className="text-sm text-muted-foreground mb-4">
                        Last modified: {formatDate(tab.file.metadata?.lastModified)}
                      </div>
                    </div>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: tab.file.content.text || 'No content available' }}
                    />
                    {Array.isArray(tab.file.content.panels) && tab.file.content.panels.length > 0 && (
                      <div className="mt-8 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Visual Panels</h3>
                        <div className="space-y-4">
                          {tab.file.content.panels.map((panel: any, index: number) => (
                            <div key={panel.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">Panel {index + 1}</h4>
                                <span className="text-xs text-muted-foreground">
                                  Position: {panel.textPosition.start}-{panel.textPosition.end}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{panel.notes}</p>
                              <div className="text-xs bg-muted p-2 rounded">
                                Visual: {panel.visualContent.type} - {panel.visualContent.reference}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          // For new story files or editing mode, use the StoryEditor
          return <StoryEditor />;

        case 'image':
          return (
            <div className="h-full overflow-auto">
              <div className="p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">{tab.file.name}</h2>
                  {tab.file.content?.url && (
                    <div className="max-w-2xl mx-auto">
                      <img
                        src={tab.file.content.url}
                        alt={tab.file.name}
                        className="w-full h-auto border rounded-lg shadow-lg"
                      />
                      <div className="mt-4 text-sm text-muted-foreground">
                        Size: {((tab.file.metadata?.size || 0) / 1024 / 1024).toFixed(2)} MB
                        {tab.file.metadata?.dimensions && (
                          <span> • {tab.file.metadata.dimensions.width}×{tab.file.metadata.dimensions.height}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        case 'comic':
          return <ComicLayoutEditor project={project} file={tab.file} />;
        default:
          return (
            <div className="h-full overflow-auto">
              <div className="p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">{tab.file.name}</h2>
                  <p className="text-muted-foreground">
                    This file type is not yet fully supported in the editor.
                  </p>
                  <pre className="mt-4 p-4 bg-muted rounded text-xs text-left overflow-auto max-h-96">
                    {JSON.stringify(tab.file.content, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          );
      }
    }

    // Convert ComicProject to EditorProject for compatibility
    const editorProject = {
      id: project.id,
      name: project.name,
      mode: 'comic' as const,
      files: [],
      canvasState: {},
      metadata: {
        description: project.description,
        tags: project.metadata?.tags || [],
        author: 'User',
        version: project.metadata?.version || '1.0.0'
      },
      createdAt: project.metadata?.created || new Date(),
      updatedAt: project.metadata?.lastModified || new Date()
    };

    switch (tab.type) {
      case 'canvas':
        return <EnhancedCanvasEditor project={editorProject} width={800} height={600} />;
      case 'text':
        return <StoryTextEditor project={editorProject} />;
      case 'story':
        return <StoryEditor />;
      case 'image':
        return <ImageEditor file={tab.file} />;
      case 'comic':
        return <ComicLayoutEditor project={project} file={tab.file} />;
      default:
        return <div className="p-4 text-muted-foreground">Editor for {tab.type} not implemented</div>;
    }
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
      {/* Editor tabs und Inhalt */}
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
                className="h-4 w-4 p-0"
                onClick={() => setActiveTabId("new-tab")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TabsTrigger>
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="flex-1 min-h-0">
              {renderEditor(tab)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
