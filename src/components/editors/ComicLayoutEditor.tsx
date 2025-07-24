import { useState, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Grid3X3, 
  Square, 
  LayoutGrid, 
  Plus, 
  Minus,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2
} from 'lucide-react';
import { ComicProject, ProjectFile } from '@/types/project';
import { GridOverlay } from './GridOverlay';
import { SpeechBubbleRenderer } from '../speech-bubbles/SpeechBubbleRenderer';

interface ComicLayoutEditorProps {
  project: ComicProject;
  file?: ProjectFile;
}

interface Panel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frameStyle: string;
  content?: {
    type: 'image' | 'story' | 'canvas';
    reference: string;
  };
}

interface Page {
  id: string;
  panels: Panel[];
  width: number;
  height: number;
}

export function ComicLayoutEditor({ project, file }: ComicLayoutEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(project.aspectRatio);
  const [pageLayout, setPageLayout] = useState<'single' | 'double'>('single');
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(project.settings.gridSize);
  
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'page-1',
      panels: [],
      width: 800,
      height: 600
    }
  ]);

  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: pageLayout === 'double' ? 1600 : 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);

    canvas.on('selection:created', (e) => {
      if (e.selected?.[0]) {
        setSelectedPanel((e.selected[0] as any).id || null);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedPanel(null);
    });

    return () => {
      canvas.dispose();
    };
  }, [pageLayout]);

  const addPanel = () => {
    if (!fabricCanvas) return;

    const panelId = `panel-${Date.now()}`;
    const panel = new Rect({
      left: 50,
      top: 50,
      width: 150,
      height: 150,
      fill: 'transparent',
      stroke: '#333',
      strokeWidth: 2,
      id: panelId,
    });

    fabricCanvas.add(panel);
    fabricCanvas.setActiveObject(panel);

    const newPanel: Panel = {
      id: panelId,
      x: 50,
      y: 50,
      width: 150,
      height: 150,
      frameStyle: 'classic'
    };

    setPages(prev => {
      const updated = [...prev];
      updated[currentPage].panels.push(newPanel);
      return updated;
    });
  };

  const deletePanel = () => {
    if (!fabricCanvas || !selectedPanel) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      fabricCanvas.remove(activeObject);
      
      setPages(prev => {
        const updated = [...prev];
        updated[currentPage].panels = updated[currentPage].panels.filter(
          panel => panel.id !== selectedPanel
        );
        return updated;
      });
      
      setSelectedPanel(null);
    }
  };

  const addPage = () => {
    const newPage: Page = {
      id: `page-${pages.length + 1}`,
      panels: [],
      width: pageLayout === 'double' ? 1600 : 800,
      height: 600
    };
    setPages(prev => [...prev, newPage]);
  };

  const removePage = () => {
    if (pages.length > 1) {
      setPages(prev => prev.filter((_, index) => index !== currentPage));
      setCurrentPage(prev => Math.max(0, prev - 1));
    }
  };

  const panelLayouts = [
    { id: '1-panel', name: 'Single Panel', icon: Square },
    { id: '2-panel-h', name: '2 Horizontal', icon: LayoutGrid },
    { id: '2-panel-v', name: '2 Vertical', icon: LayoutGrid },
    { id: '3-panel', name: '3 Panel', icon: Grid3X3 },
    { id: '4-panel', name: '4 Panel', icon: Grid3X3 },
  ];

  const applyLayout = (layoutId: string) => {
    if (!fabricCanvas) return;

    fabricCanvas.clear();
    const page = pages[currentPage];
    const canvasWidth = fabricCanvas.width || 800;
    const canvasHeight = fabricCanvas.height || 600;

    let newPanels: Panel[] = [];

    switch (layoutId) {
      case '1-panel':
        newPanels = [{
          id: `panel-${Date.now()}`,
          x: 50,
          y: 50,
          width: canvasWidth - 100,
          height: canvasHeight - 100,
          frameStyle: 'classic'
        }];
        break;
      case '2-panel-h':
        newPanels = [
          {
            id: `panel-${Date.now()}-1`,
            x: 25,
            y: 50,
            width: (canvasWidth - 75) / 2,
            height: canvasHeight - 100,
            frameStyle: 'classic'
          },
          {
            id: `panel-${Date.now()}-2`,
            x: (canvasWidth + 25) / 2,
            y: 50,
            width: (canvasWidth - 75) / 2,
            height: canvasHeight - 100,
            frameStyle: 'classic'
          }
        ];
        break;
      case '2-panel-v':
        newPanels = [
          {
            id: `panel-${Date.now()}-1`,
            x: 50,
            y: 25,
            width: canvasWidth - 100,
            height: (canvasHeight - 75) / 2,
            frameStyle: 'classic'
          },
          {
            id: `panel-${Date.now()}-2`,
            x: 50,
            y: (canvasHeight + 25) / 2,
            width: canvasWidth - 100,
            height: (canvasHeight - 75) / 2,
            frameStyle: 'classic'
          }
        ];
        break;
    }

    newPanels.forEach(panel => {
      const rect = new Rect({
        left: panel.x,
        top: panel.y,
        width: panel.width,
        height: panel.height,
        fill: 'transparent',
        stroke: '#333',
        strokeWidth: 2,
        id: panel.id,
      });
      fabricCanvas.add(rect);
    });

    setPages(prev => {
      const updated = [...prev];
      updated[currentPage].panels = newPanels;
      return updated;
    });

    fabricCanvas.renderAll();
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Tools */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold mb-3">Comic Layout</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Page Layout</Label>
              <Select value={pageLayout} onValueChange={(value: 'single' | 'double') => setPageLayout(value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Page</SelectItem>
                  <SelectItem value="double">Double Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                  <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                  <SelectItem value="A4">A4 (Print)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="panels" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 m-2">
            <TabsTrigger value="panels" className="text-xs">Panels</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="panels" className="flex-1 p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Panel Layouts</Label>
              <div className="grid grid-cols-2 gap-2">
                {panelLayouts.map((layout) => {
                  const Icon = layout.icon;
                  return (
                    <Button
                      key={layout.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyLayout(layout.id)}
                      className="h-12 flex flex-col gap-1"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{layout.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-3 block">Panel Actions</Label>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={addPanel} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Panel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={deletePanel} 
                  disabled={!selectedPanel}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Panel
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="flex-1 p-4">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Panel Content</Label>
              {selectedPanel ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Content Type</Label>
                    <Select defaultValue="none">
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select content" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Content</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="story">Story Panel</SelectItem>
                        <SelectItem value="canvas">Canvas Drawing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Frame Style</Label>
                    <Select defaultValue="classic">
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="jagged">Jagged</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a panel to edit its content</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pages" className="flex-1 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Pages</Label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={addPage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={removePage} disabled={pages.length <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {pages.map((page, index) => (
                  <Button
                    key={page.id}
                    variant={currentPage === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(index)}
                    className="w-full justify-start"
                  >
                    Page {index + 1}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {page.panels.length} panels
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-muted">
        <div className="h-full flex items-center justify-center p-4">
          <div className="relative">
            {showGrid && (
              <GridOverlay
                width={pageLayout === 'double' ? 1600 : 800}
                height={600}
                zoom={100}
              />
            )}
            {pageLayout === 'double' && (
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-muted-foreground/30 pointer-events-none"
                style={{ left: '50%' }}
              />
            )}
            <canvas
              ref={canvasRef}
              className="border border-border bg-white shadow-lg"
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}