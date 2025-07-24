import { useState, useCallback } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, Point } from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { EditorCanvas } from "./EditorCanvas";
import { EditorToolbar } from "./EditorToolbar";
import { PropertiesPanel } from "./PropertiesPanel";
import { SettingsPanel } from "./SettingsPanel";
import { FilterPanel } from "./FilterPanel";
import { BackgroundRemover } from "./BackgroundRemover";
import { 
  Image as ImageIcon, 
  Palette, 
  Scissors, 
  Settings,
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut
} from "lucide-react";

export const ImageEditor = () => {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(5);
  const [fontSize, setFontSize] = useState(20);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [hasImage, setHasImage] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");
  const [zoom, setZoom] = useState(100);

  const handleCanvasReady = useCallback((fabricCanvas: FabricCanvas) => {
    setCanvas(fabricCanvas);
    
    // Add event listeners
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0]);
    });
    
    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0]);
    });
    
    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    toast.success("Editor ready! Upload an image to start editing.");
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    if (!canvas) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = new Image();
      imgElement.onload = () => {
        const fabricImg = new FabricImage(imgElement, {
          left: 0,
          top: 0,
          selectable: true,
        });

        // Scale image to fit canvas while maintaining aspect ratio
        const canvasWidth = canvas.width || 800;
        const canvasHeight = canvas.height || 600;
        const imgWidth = imgElement.naturalWidth;
        const imgHeight = imgElement.naturalHeight;

        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight, 1);
        fabricImg.scale(scale);

        // Center the image
        fabricImg.set({
          left: (canvasWidth - imgWidth * scale) / 2,
          top: (canvasHeight - imgHeight * scale) / 2,
        });

        canvas.clear();
        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();
        setHasImage(true);
        toast.success("Image loaded successfully!");
      };
      imgElement.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [canvas]);

  const handleImageLoad = useCallback((image: FabricImage) => {
    setSelectedObject(image);
    setHasImage(true);
  }, []);

  const handleSettingsClick = () => {
    setActiveTab("settings");
  };

  const handleFiltersClick = () => {
    setActiveTab("filters");
  };

  const handleZoomIn = () => {
    if (!canvas) return;
    const newZoom = Math.min(zoom + 25, 500);
    setZoom(newZoom);
    const zoomPoint = new Point(canvas.width! / 2, canvas.height! / 2);
    canvas.zoomToPoint(zoomPoint, newZoom / 100);
    canvas.renderAll();
    toast.success(`Zoomed to ${newZoom}%`);
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const newZoom = Math.max(zoom - 25, 25);
    setZoom(newZoom);
    const zoomPoint = new Point(canvas.width! / 2, canvas.height! / 2);
    canvas.zoomToPoint(zoomPoint, newZoom / 100);
    canvas.renderAll();
    toast.success(`Zoomed to ${newZoom}%`);
  };

  const handleZoomSlider = (value: number[]) => {
    if (!canvas) return;
    const newZoom = value[0];
    setZoom(newZoom);
    const zoomPoint = new Point(canvas.width! / 2, canvas.height! / 2);
    canvas.zoomToPoint(zoomPoint, newZoom / 100);
    canvas.renderAll();
  };

  return (
    <div className="min-h-screen bg-gradient-editor text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <ImageIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  ProEdit Studio
                </h1>
                <p className="text-sm text-muted-foreground">Professional Image Editor</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Powered
              </Badge>
              {hasImage && (
                <Badge variant="outline" className="gap-1">
                  <Info className="h-3 w-3" />
                  Image Loaded
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Upload an image to start editing
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Toolbar */}
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          canvas={canvas}
          onImageUpload={handleImageUpload}
          onSettingsClick={handleSettingsClick}
          onFiltersClick={handleFiltersClick}
        />

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 flex items-center justify-center bg-gradient-glow">
            <div className="w-full max-w-4xl">
              <EditorCanvas
                onCanvasReady={handleCanvasReady}
                activeTool={activeTool}
                activeColor={activeColor}
                brushSize={brushSize}
                fontSize={fontSize}
                strokeWidth={strokeWidth}
                onImageLoad={handleImageLoad}
              />
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="border-t border-border bg-card/50 backdrop-blur-sm px-6 py-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Tool: <strong className="text-foreground">{activeTool}</strong></span>
                {selectedObject && (
                  <span>Selected: <strong className="text-foreground">{selectedObject.type}</strong></span>
                )}
              </div>
              
              {/* Zoom Controls */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  disabled={zoom <= 25}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <div className="w-24">
                  <Slider
                    value={[zoom]}
                    onValueChange={handleZoomSlider}
                    min={25}
                    max={500}
                    step={25}
                    className="w-full"
                  />
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  disabled={zoom >= 500}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-muted-foreground min-w-[50px] text-center">
                  {zoom}%
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span>Canvas: 800×600</span>
                <span className="text-primary">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-80 bg-card border-l border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 m-2">
              <TabsTrigger value="properties" className="text-xs">
                <Settings className="h-4 w-4 mr-1" />
                Props
              </TabsTrigger>
              <TabsTrigger value="filters" className="text-xs">
                <Palette className="h-4 w-4 mr-1" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                <Scissors className="h-4 w-4 mr-1" />
                AI
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties" className="m-0 h-[calc(100%-60px)] overflow-y-auto">
              <PropertiesPanel
                canvas={canvas}
                activeTool={activeTool}
                selectedObject={selectedObject}
              />
            </TabsContent>
            
            <TabsContent value="filters" className="m-0 h-[calc(100%-60px)] overflow-y-auto">
              <FilterPanel
                canvas={canvas}
                selectedObject={selectedObject}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="m-0 h-[calc(100%-60px)] overflow-y-auto p-4">
              <SettingsPanel canvas={canvas} />
            </TabsContent>
            
            <TabsContent value="ai" className="m-0 p-4 h-[calc(100%-60px)] overflow-y-auto">
              <div className="space-y-4">
                <BackgroundRemover canvas={canvas} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      More AI Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Additional AI-powered editing tools will be available here, such as:
                    </div>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Object detection and selection</li>
                      <li>• Smart crop suggestions</li>
                      <li>• Auto color correction</li>
                      <li>• Noise reduction</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};