import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, Circle, Rect, Textbox } from "fabric";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { NavigationControls } from "./NavigationControls";

interface EnhancedEditorCanvasProps {
  onCanvasReady?: (canvas: FabricCanvas) => void;
  activeTool?: string;
  activeColor?: string;
  brushSize?: number;
  fontSize?: number;
  strokeWidth?: number;
  onImageLoad?: (image: FabricImage) => void;
  width?: number;
  height?: number;
}

export const EnhancedEditorCanvas = ({
  onCanvasReady,
  activeTool = "select",
  activeColor = "#6366f1",
  brushSize = 5,
  fontSize = 20,
  strokeWidth = 2,
  onImageLoad,
  width = 800,
  height = 600
}: EnhancedEditorCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    // Initialize drawing brush with better defaults
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else {
      // Force initialization of the drawing brush
      canvas.isDrawingMode = true;
      canvas.isDrawingMode = false;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = brushSize;
      }
    }

    // Grid will be handled via CSS background for better performance

    setFabricCanvas(canvas);
    onCanvasReady?.(canvas);

    return () => {
      canvas.dispose();
    };
  }, [onCanvasReady, width, height]);

  // Update canvas based on active tool
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    fabricCanvas.selection = activeTool === "select";

    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }

    // Set cursor based on tool
    switch (activeTool) {
      case "draw":
        fabricCanvas.defaultCursor = "crosshair";
        break;
      case "text":
        fabricCanvas.defaultCursor = "text";
        break;
      case "crop":
        fabricCanvas.defaultCursor = "crop";
        break;
      case "eraser":
        fabricCanvas.defaultCursor = "not-allowed";
        break;
      default:
        fabricCanvas.defaultCursor = "default";
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleCanvasClick = useCallback((e: any) => {
    if (!fabricCanvas) return;

    if (activeTool === "eraser" && e.target && e.target !== fabricCanvas) {
      fabricCanvas.remove(e.target);
      toast.success("Object removed");
      return;
    }

    if (activeTool === "select" || activeTool === "draw") return;

    const pointer = fabricCanvas.getViewportPoint(e.e);

    switch (activeTool) {
      case "rectangle":
        const rect = new Rect({
          left: pointer.x - 50,
          top: pointer.y - 25,
          fill: activeColor,
          width: 100,
          height: 50,
          strokeWidth: strokeWidth,
          stroke: activeColor,
          rx: 5, // Rounded corners
          ry: 5,
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
        break;

      case "circle":
        const circle = new Circle({
          left: pointer.x - 25,
          top: pointer.y - 25,
          fill: "transparent",
          radius: 25,
          strokeWidth: strokeWidth,
          stroke: activeColor,
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
        break;

      case "text":
        const text = new Textbox("Edit text", {
          left: pointer.x,
          top: pointer.y,
          fill: activeColor,
          fontSize: fontSize,
          fontFamily: "Arial",
          width: 200,
          borderColor: activeColor,
          cornerColor: activeColor,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        text.enterEditing();
        break;
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, activeTool, activeColor, fontSize, strokeWidth]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on("mouse:down", handleCanvasClick);

    return () => {
      fabricCanvas.off("mouse:down", handleCanvasClick);
    };
  }, [fabricCanvas, handleCanvasClick]);

  const loadImageFromFile = (file: File) => {
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
        const canvasWidth = fabricCanvas?.width || width;
        const canvasHeight = fabricCanvas?.height || height;
        const imgWidth = imgElement.naturalWidth;
        const imgHeight = imgElement.naturalHeight;

        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight, 1);
        fabricImg.scale(scale);

        // Center the image
        fabricImg.set({
          left: (canvasWidth - imgWidth * scale) / 2,
          top: (canvasHeight - imgHeight * scale) / 2,
        });

        if (fabricCanvas) {
          fabricCanvas.add(fabricImg);
          fabricCanvas.setActiveObject(fabricImg);
          fabricCanvas.renderAll();
          onImageLoad?.(fabricImg);
          toast.success("Image loaded successfully (fabric)!");
        }
      };
      imgElement.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      loadImageFromFile(imageFile);
    }
  }, [fabricCanvas]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="flex flex-col">
      <div
        className="relative border-2 border-dashed border-border/50 overflow-hidden bg-background rounded-lg shadow-lg"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <canvas
          ref={canvasRef}
          className="max-w-full block"
        />

        {/* Drop overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 hover:opacity-100 pointer-events-none transition-opacity">
          <div className="text-center p-8">
            <div className="mb-4">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            </div>
            <p className="text-muted-foreground mb-2 text-lg font-medium">Drop an image here to start editing</p>
            <p className="text-sm text-muted-foreground">or use the upload button in the toolbar</p>
            <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, WebP formats</p>
          </div>
        </div>
      </div>

      {/* Navigation Controls Footer */}
      <NavigationControls canvas={fabricCanvas} />
    </div>
  );
};
