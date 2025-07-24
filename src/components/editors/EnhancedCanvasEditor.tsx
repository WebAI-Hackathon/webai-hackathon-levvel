import { useState, useCallback } from "react";
import {Canvas as FabricCanvas, FabricObject, Image as FabricImage, Point} from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { EnhancedEditorCanvas } from "./canvas/EnhancedEditorCanvas";
import { EnhancedToolbar } from "./canvas/EnhancedToolbar";
import { EnhancedPropertiesPanel } from "./canvas/EnhancedPropertiesPanel";
import {
  ZoomIn,
  ZoomOut,
  Info,
  Sparkles
} from "lucide-react";
import { EditorProject } from "@/types/editor";
import {generateImageDescription} from "@/utils/aiHelpers.ts";

interface EnhancedCanvasEditorProps {
  project: EditorProject;
  width?: number;
  height?: number;
}

export function EnhancedCanvasEditor({ project, width = 800, height = 600 }: EnhancedCanvasEditorProps) {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [fabricObjects, setFabricObjects] = useState<FabricObject[]>([]);
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(5);
  const [fontSize, setFontSize] = useState(20);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [hasImage, setHasImage] = useState(false);
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

    toast.success("Canvas ready! Start creating your artwork.");
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    if (!canvas) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imgElement = new Image();
      const imgSrc = e.target?.result as string;
      imgElement.onload = async () => {
        const fabricImg = new FabricImage(imgElement, {
          left: 0,
          top: 0,
          selectable: true,
        });

        // Scale image to fit canvas while maintaining aspect ratio
        const canvasWidth = canvas.width || width;
        const canvasHeight = canvas.height || height;
        const imgWidth = imgElement.naturalWidth;
        const imgHeight = imgElement.naturalHeight;

        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight, 1);
        fabricImg.scale(scale);

        // Center the image
        fabricImg.set({
          left: (canvasWidth - imgWidth * scale) / 2,
          top: (canvasHeight - imgHeight * scale) / 2,
        });

        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();

        generateImageDescription(imgElement.src).then(description => {
            fabricImg.set({
                imageDescription: description,
            });
            canvas.renderAll();
        })

        setHasImage(true);
        toast.success("Image loaded successfully!");


      };
      imgElement.src = imgSrc;
      await generateImageDescription(imgElement.src);
    };
    reader.readAsDataURL(file);
  }, [canvas, width, height]);

  const handleImageLoad = useCallback((image: FabricImage) => {
    setSelectedObject(image);
    setHasImage(true);
  }, []);

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
    <div className="h-full flex bg-background">
      {/* Left Toolbar */}
      <EnhancedToolbar
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
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="h-12 border-b border-border bg-card/50 backdrop-blur-sm px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Enhanced Canvas
              </Badge>
              {hasImage && (
                <Badge variant="outline" className="gap-1">
                  <Info className="h-3 w-3" />
                  Image Loaded
                </Badge>
              )}
            </div>
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
        </div>

        {/* Canvas Content */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6 flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
            <div className="w-full max-w-4xl">
              <EnhancedEditorCanvas
                onCanvasReady={handleCanvasReady}
                activeTool={activeTool}
                activeColor={activeColor}
                brushSize={brushSize}
                fontSize={fontSize}
                strokeWidth={strokeWidth}
                onImageLoad={handleImageLoad}
                width={width}
                height={height}
                setActiveTool={setActiveTool}
                setFabricObjects={setFabricObjects}
                fabricObjects={fabricObjects}
              />
            </div>
          </div>

          {/* Right Properties Panel */}
          <div className="w-80 bg-card border-l border-border">
            <EnhancedPropertiesPanel
              canvas={canvas}
              activeTool={activeTool}
              selectedObject={selectedObject}
              canvasObjects={fabricObjects}
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

            <div className="flex items-center gap-4">
              <span>Canvas: {width}×{height}</span>
              <span className="text-primary">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
