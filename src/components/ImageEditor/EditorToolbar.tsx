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
  Sliders,
  Filter,
  Upload,
  Eraser
} from "lucide-react";
import { toast } from "sonner";
import { ToolPopover } from "./ToolPopover";

interface EditorToolbarProps {
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
  onSettingsClick: () => void;
  onFiltersClick: () => void;
}

const tools = [
  { id: "select", icon: MousePointer, label: "Select" },
  { id: "crop", icon: Crop, label: "Crop" },
  { id: "draw", icon: Paintbrush, label: "Draw" },
  { id: "text", icon: Type, label: "Text" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

export const EditorToolbar = ({
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
  onImageUpload,
  onSettingsClick,
  onFiltersClick
}: EditorToolbarProps) => {
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

  const handleUndo = () => {
    if (canvas && historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      canvas.loadFromJSON(JSON.parse(previousState), () => {
        canvas.renderAll();
        setHistoryIndex(historyIndex - 1);
      });
    }
  };

  const handleRedo = () => {
    if (canvas && historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      canvas.loadFromJSON(JSON.parse(nextState), () => {
        canvas.renderAll();
        setHistoryIndex(historyIndex + 1);
      });
    }
  };

  const handleClear = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = "#f8f9fa";
      canvas.renderAll();
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
      link.download = 'edited-image.png';
      link.click();
      
      toast.success("Image exported successfully!");
    }
  };

  return (
    <div className="bg-card border-r border-border w-20 flex flex-col items-center py-4 space-y-4">
      {/* File Operations */}
      <div className="space-y-2">
        <label htmlFor="image-upload">
          <Button variant="editor" size="tool" asChild>
            <div className="cursor-pointer">
              <Upload className="h-5 w-5" />
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
          variant="editor" 
          size="tool" 
          onClick={handleExport}
          title="Export Image"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="w-8" />

      {/* History Controls */}
      <div className="space-y-2">
        <Button 
          variant="editor" 
          size="tool" 
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          <Undo className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="editor" 
          size="tool" 
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          <Redo className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="editor" 
          size="tool" 
          onClick={handleClear}
          title="Clear Canvas"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="w-8" />

      {/* Drawing Tools */}
      <div className="space-y-2">
        {tools.map((tool) => {
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
                variant={activeTool === tool.id ? "tool-active" : "tool"}
                size="tool"
                onClick={() => onToolChange(tool.id)}
                title={tool.label}
                className="w-full"
              >
                <Icon className="h-5 w-5" />
              </Button>
            </ToolPopover>
          );
        })}
      </div>

      <Separator className="w-8" />

      {/* Panel Controls */}
      <div className="space-y-2">
        <Button 
          variant="editor" 
          size="tool" 
          onClick={onSettingsClick}
          title="Settings"
        >
          <Sliders className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="editor" 
          size="tool" 
          onClick={onFiltersClick}
          title="Filters"
        >
          <Filter className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};