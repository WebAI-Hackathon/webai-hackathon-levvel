import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  BookOpen,
  Image,
  Plus,
  Eye,
  Edit3,
  Grid3X3,
} from "lucide-react";

interface StoryEditorProps {
  onCanvasReady?: () => void;
}

interface Panel {
  id: string;
  title: string;
  description: string;
  textContent: string;
  imageUrl?: string;
}

export function StoryEditor({ onCanvasReady }: StoryEditorProps) {
  const [panels, setPanels] = useState<Panel[]>([
    {
      id: '1',
      title: 'Opening Scene',
      description: 'Introduction to the main character',
      textContent: 'Our hero begins their journey...',
    },
  ]);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(panels[0]);
  const [viewMode, setViewMode] = useState<'split' | 'text' | 'visual'>('split');

  const editor = useEditor({
    extensions: [StarterKit],
    content: selectedPanel?.textContent || '',
    onUpdate: ({ editor }) => {
      if (selectedPanel) {
        const updatedPanels = panels.map(p => 
          p.id === selectedPanel.id 
            ? { ...p, textContent: editor.getHTML() }
            : p
        );
        setPanels(updatedPanels);
        setSelectedPanel({ ...selectedPanel, textContent: editor.getHTML() });
      }
    },
  });

  const addNewPanel = () => {
    const newPanel: Panel = {
      id: Date.now().toString(),
      title: `Panel ${panels.length + 1}`,
      description: 'New story panel',
      textContent: 'Write your story here...',
    };
    setPanels([...panels, newPanel]);
    setSelectedPanel(newPanel);
    editor?.commands.setContent(newPanel.textContent);
  };

  const selectPanel = (panel: Panel) => {
    setSelectedPanel(panel);
    editor?.commands.setContent(panel.textContent);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Split View
          </Button>
          <Button
            variant={viewMode === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('text')}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Text Only
          </Button>
          <Button
            variant={viewMode === 'visual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('visual')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visual Only
          </Button>
        </div>
        
        <Button onClick={addNewPanel} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Panel
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {viewMode === 'split' && (
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel - Story Timeline */}
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full p-4 space-y-4 bg-background/50 backdrop-blur-sm border-r border-border/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Story Panels
                </h3>
                <div className="space-y-2">
                  {panels.map((panel) => (
                    <Card
                      key={panel.id}
                      className={`cursor-pointer transition-colors ${
                        selectedPanel?.id === panel.id
                          ? 'ring-2 ring-primary'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => selectPanel(panel)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{panel.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {panel.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Badge variant="outline" className="text-xs">
                          Panel {panels.indexOf(panel) + 1}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Middle Panel - Text Editor */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full p-4">
                <div className="h-full border border-border/50 rounded-lg">
                  <div className="p-3 border-b border-border/50 bg-background/50">
                    <h4 className="font-medium">{selectedPanel?.title || 'Select a panel'}</h4>
                  </div>
                  <div className="p-4 h-full">
                    <EditorContent 
                      editor={editor} 
                      className="prose prose-sm max-w-none h-full overflow-y-auto"
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Right Panel - Visual Representation */}
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full p-4 space-y-4 bg-background/50 backdrop-blur-sm border-l border-border/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Visual Map
                </h3>
                {selectedPanel && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">{selectedPanel.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Image className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs">Visual representation</p>
                          <p className="text-xs">of this panel</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-3" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Visual
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {viewMode === 'text' && (
          <div className="h-full p-8">
            <div className="max-w-4xl mx-auto h-full">
              <div className="h-full border border-border/50 rounded-lg">
                <div className="p-4 border-b border-border/50 bg-background/50">
                  <h4 className="font-medium">{selectedPanel?.title || 'Select a panel'}</h4>
                </div>
                <div className="p-6 h-full">
                  <EditorContent 
                    editor={editor} 
                    className="prose max-w-none h-full overflow-y-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'visual' && (
          <div className="h-full p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
              {panels.map((panel, index) => (
                <Card key={panel.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{panel.title}</CardTitle>
                    <Badge variant="outline" className="text-xs w-fit">
                      Panel {index + 1}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-2">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {panel.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}