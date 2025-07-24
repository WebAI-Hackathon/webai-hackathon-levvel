import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Canvas as FabricCanvas } from "fabric";
import { 
  MousePointer, 
  Crop, 
  Paintbrush, 
  Type, 
  Square, 
  Circle, 
  Download,
  Undo,
  Redo,
  Trash2,
  Upload,
  Eraser,
  Layers,
  Palette
} from "lucide-react";
import { toast } from "sonner";
import { ToolPopover } from "./ToolPopover";

interface EnhancedToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  canvas?: FabricCanvas | null;
  onImageUpload: (file: File) => void;
}

const tools = [
  { id: "select", icon: MousePointer, label: "Select", category: "basic" },
  { id: "draw", icon: Paintbrush, label: "Draw", category: "drawing" },
  { id: "eraser", icon: Eraser, label: "Eraser", category: "drawing" },
  { id: "text", icon: Type, label: "Text", category: "content" },
  { id: "rectangle", icon: Square, label: "Rectangle", category: "shapes" },
  { id: "circle", icon: Circle, label: "Circle", category: "shapes" },
  { id: "crop", icon: Crop, label: "Crop", category: "advanced" },
];

export const EnhancedToolbar = ({
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  fontSize,
  onFontSizeChange,
  strokeWidth,
  onStrokeWidthChange,
  canvas,
  onImageUpload
}: EnhancedToolbarProps) => {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const saveCanvasState = () => {
    if (canvas) {
      const state = JSON.stringify(canvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(state);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (canvas && historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      canvas.loadFromJSON(JSON.parse(previousState), () => {
        canvas.renderAll();
        setHistoryIndex(historyIndex - 1);
        toast.success("Undone");
      });
    }
  };

  const handleRedo = () => {
    if (canvas && historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      canvas.loadFromJSON(JSON.parse(nextState), () => {
        canvas.renderAll();
        setHistoryIndex(historyIndex + 1);
        toast.success("Redone");
      });
    }
  };

  const handleClear = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();
      saveCanvasState();
      toast.success("Canvas cleared");
    }
  };

  const handleExport = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas-artwork.png';
      link.click();
      
      toast.success("Image exported successfully!");
    }
  };

  const handleDuplicate = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.clone((cloned: any) => {
          cloned.set({
            left: cloned.left + 10,
            top: cloned.top + 10,
          });
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.renderAll();
          saveCanvasState();
          toast.success("Object duplicated");
        });
      } else {
        toast.error("Select an object to duplicate");
      }
    }
  };

  const handleDelete = () => {
    if (canvas) {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        canvas.remove(...activeObjects);
        canvas.discardActiveObject();
        canvas.renderAll();
        saveCanvasState();
        toast.success("Objects deleted");
      } else {
        toast.error("Select objects to delete");
      }
    }
  };

  const basicTools = tools.filter(tool => tool.category === "basic");
  const drawingTools = tools.filter(tool => tool.category === "drawing");
  const contentTools = tools.filter(tool => tool.category === "content");
  const shapeTools = tools.filter(tool => tool.category === "shapes");
  const advancedTools = tools.filter(tool => tool.category === "advanced");

  const renderToolGroup = (toolGroup: typeof tools, title: string) => (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground px-2 font-medium">{title}</div>
      {toolGroup.map((tool) => {
        const Icon = tool.icon;
        return (
          <ToolPopover
            key={tool.id}
            tool={tool.id}
            activeColor={activeColor}
            onColorChange={onColorChange}
            brushSize={brushSize}
            onBrushSizeChange={onBrushSizeChange}
            fontSize={fontSize}
            onFontSizeChange={onFontSizeChange}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={onStrokeWidthChange}
          >
            <Button
              variant={activeTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
              className="w-full h-10 justify-start"
            >
              <Icon className="h-4 w-4 mr-2" />
              {tool.label}
            </Button>
          </ToolPopover>
        );
      })}
    </div>
  );

  return (
    <div className="bg-card border-r border-border w-64 flex flex-col py-4 space-y-4 overflow-y-auto">
      {/* File Operations */}
      <div className="px-4 space-y-2">
        <div className="text-xs text-muted-foreground font-medium">File</div>
        <label htmlFor="image-upload">
          <Button variant="outline" size="sm" asChild className="w-full justify-start">
            <div className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </div>
          </Button>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExport}
          className="w-full justify-start"
        >
          <Download className="h-4 w-4 mr-2" />
          Export PNG
        </Button>
      </div>

      <Separator />

      {/* History Controls */}
      <div className="px-4 space-y-2">
        <div className="text-xs text-muted-foreground font-medium">History</div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClear}
          className="w-full justify-start"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Canvas
        </Button>
      </div>

      <Separator />

      {/* Tools */}
      <div className="px-4 space-y-4">
        {renderToolGroup(basicTools, "Basic")}
        {renderToolGroup(drawingTools, "Drawing")}
        {renderToolGroup(contentTools, "Content")}
        {renderToolGroup(shapeTools, "Shapes")}
        {renderToolGroup(advancedTools, "Advanced")}
      </div>

      <Separator />

      {/* Object Operations */}
      <div className="px-4 space-y-2">
        <div className="text-xs text-muted-foreground font-medium">Objects</div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDuplicate}
          className="w-full justify-start"
        >
          <Layers className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDelete}
          className="w-full justify-start"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <Separator />

      {/* Color Palette */}
      <div className="px-4 space-y-2">
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
          <Palette className="h-3 w-3" />
          Colors
        </div>
        <div className="grid grid-cols-6 gap-2">
          {[
            "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00",
            "#ff00ff", "#00ffff", "#ffa500", "#800080", "#008000", "#ffc0cb"
          ].map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded border-2 ${
                activeColor === color ? "border-primary" : "border-border"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              title={color}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={activeColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded border cursor-pointer"
          />
          <span className="text-xs text-muted-foreground flex-1">{activeColor}</span>
        </div>
      </div>
    </div>
  );
};