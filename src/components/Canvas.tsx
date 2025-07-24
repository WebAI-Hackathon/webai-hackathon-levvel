import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Circle, Rect, FabricText, FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Brush,
  Square,
  Circle as CircleIcon,
  Type,
  Move,
  Eraser,
  Undo,
  Redo,
  Trash2,
} from "lucide-react";
import ColorPicker from "@/components/ColorPicker.tsx";

export type EditorMode = "image" | "meme" | "story" | "comic";
export type Tool = "select" | "brush" | "rectangle" | "circle" | "text" | "eraser";

interface CanvasProps {
  mode: EditorMode;
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  imageFile?: File;
}

const Canvas = ({ mode, activeTool, onToolChange, imageFile }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Initialize the freeDrawingBrush - check if it exists first
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    }

    setFabricCanvas(canvas);
    toast("Canvas ready!");

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load image file when provided
  useEffect(() => {
    if (!fabricCanvas || !imageFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        try {
          const imgElement = await FabricImage.fromURL(e.target.result as string);

          // Scale image to fit canvas
          const scaleX = fabricCanvas.width! / imgElement.width!;
          const scaleY = fabricCanvas.height! / imgElement.height!;
          const scale = Math.min(scaleX, scaleY);

          imgElement.scale(scale);
          imgElement.set({
            left: (fabricCanvas.width! - imgElement.width! * scale) / 2,
            top: (fabricCanvas.height! - imgElement.height! * scale) / 2,
            selectable: false,
          });

          fabricCanvas.add(imgElement);
          fabricCanvas.renderAll();
        } catch (error) {
          console.error("Error loading image:", error);
          toast.error("Failed to load image");
        }
      }
    };
    reader.readAsDataURL(imageFile);
  }, [fabricCanvas, imageFile]);

  // Update canvas settings when tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "brush" || activeTool === "eraser";

    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeTool === "eraser" ? "#ffffff" : brushColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }

    fabricCanvas.selection = activeTool === "select";
  }, [activeTool, brushColor, brushSize, fabricCanvas]);

  const handleToolClick = useCallback((tool: Tool) => {
    onToolChange(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: brushColor,
        width: 100,
        height: 100,
        stroke: brushColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: "transparent",
        radius: 50,
        stroke: brushColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === "text") {
      const text = new FabricText("Add text here", {
        left: 100,
        top: 100,
        fontFamily: "Arial",
        fontSize: 24,
        fill: brushColor,
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    }
  }, [brushColor, fabricCanvas, onToolChange]);

  const handleUndo = () => {
    // Basic undo implementation - can be enhanced with proper history management
    const objects = fabricCanvas?.getObjects();
    if (objects && objects.length > 0) {
      fabricCanvas?.remove(objects[objects.length - 1]);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast("Canvas cleared!");
  };

  const tools = [
    { id: "select" as Tool, name: "Select", icon: Move },
    { id: "brush" as Tool, name: "Brush", icon: Brush },
    { id: "eraser" as Tool, name: "Eraser", icon: Eraser },
    { id: "rectangle" as Tool, name: "Rectangle", icon: Square },
    { id: "circle" as Tool, name: "Circle", icon: CircleIcon },
    { id: "text" as Tool, name: "Text", icon: Type },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between p-3 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center space-x-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolClick(tool.id)}
              className="h-8 w-8 p-0"
              title={tool.name}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {/* Brush Settings */}
          {(activeTool === "brush" || activeTool === "eraser") && (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Size:</span>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="w-24"
                />
                <span className="text-sm font-mono w-8">{brushSize}</span>
              </div>

              {activeTool === "brush" && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Color:</span>
                  <ColorPicker activeColor={brushColor} onColorChange={setBrushColor} />
                </div>
              )}
            </>
          )}

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleUndo}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <div className="border border-border/50 shadow-elegant rounded-lg overflow-hidden bg-background">
          <canvas ref={canvasRef} className="max-w-full max-h-full" />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
