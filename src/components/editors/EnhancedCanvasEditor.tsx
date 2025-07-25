import {useState, useCallback, useEffect} from "react";
import {Canvas as FabricCanvas, FabricObject, Image as FabricImage, PencilBrush, Point} from "fabric";
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
import {generateImage, generateImageDescription} from "@/utils/aiHelpers.ts";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface EnhancedCanvasEditorProps {
  width?: number;
  height?: number;
}

export function EnhancedCanvasEditor({ width = 800, height = 600 }: EnhancedCanvasEditorProps) {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [fabricObjects, setFabricObjects] = useState<FabricObject[]>([]);
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(5);
  const [fontSize, setFontSize] = useState(20);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [hasImage, setHasImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = activeTool === "draw";
    if (activeTool === "draw") {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeColor, activeTool, brushSize, canvas]);

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

  const handleGenerateImage = useCallback(async (prompt: string) => {
    setIsGeneratingImage(true);
    generateImage(prompt).then((imageUrl) => {
        setIsGeneratingImage(false);
        if (!canvas) return;

        const imgElement = new Image();
        imgElement.src = `data:image/png;base64,${imageUrl}`;
        imgElement.onload = () => {
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
                toast.success("Image description generated successfully!");
            })

            setHasImage(true);
            toast.success("Image generated and loaded successfully!");
        };
    })
  }, [canvas, height, width]);

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
            toast.success("Image description generated successfully!");
        })

        setHasImage(true);
        toast.success("Image loaded successfully!");
      };
      imgElement.src = imgSrc;
    };
    reader.readAsDataURL(file);
  }, [canvas, width, height]);

  const handleImageLoad = useCallback((image: FabricImage) => {
    setSelectedObject(image);
    setHasImage(true);
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full flex bg-background">
      {/* Left Toolbar */}
      <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
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
          onGenerateImage={handleGenerateImage}
          isGeneratingImage={isGeneratingImage}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />

      {/* Main Canvas Area */}
      <ResizablePanel defaultSize={65}>
        <div className="flex-1 flex flex-col h-full">
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

          </div>

          {/* Canvas Content */}
          <div className="flex-1 flex">
            <div className="flex-1 p-6 flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
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
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/* Right Properties Panel */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
        <EnhancedPropertiesPanel
          canvas={canvas}
          activeTool={activeTool}
          selectedObject={selectedObject}
          canvasObjects={fabricObjects}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
