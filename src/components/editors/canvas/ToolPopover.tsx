import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {Type, Paintbrush, Square, Circle, Slash, Triangle} from "lucide-react";

interface ToolPopoverProps {
  tool: string;
  isOpen: boolean;
  activeColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  children: React.ReactNode;
}

export const ToolPopover = ({
  tool,
  isOpen,
  activeColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  fontSize,
  onFontSizeChange,
  strokeWidth,
  onStrokeWidthChange,
  children
}: ToolPopoverProps) => {

  const getToolIcon = () => {
    switch (tool) {
      case "draw": return <Paintbrush className="h-4 w-4" />;
      case "text": return <Type className="h-4 w-4" />;
      case "rectangle": return <Square className="h-4 w-4" />;
      case "circle": return <Circle className="h-4 w-4" />;
      case "line": return <Slash className="h-4 w-4" />;
      case "triangle": return <Triangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getToolName = () => {
    switch (tool) {
      case "draw": return "Brush";
      case "text": return "Text";
      case "rectangle": return "Rectangle";
      case "circle": return "Circle";
      case "line": return "Line";
      case "triangle": return "Triangle";
      default: return "Tool";
    }
  };

  const shouldShowPopover = ["draw", "text", "rectangle", "circle", "line", "triangle"].includes(tool);

  if (!shouldShowPopover) {
    return <>{children}</>;
  }

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="w-64 ml-2"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {getToolIcon()}
            <span className="font-medium">{getToolName()} Settings</span>
          </div>

          <Separator />

          {/* Color Picker */}
          <div>
            <Label className="text-sm">Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={activeColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <Input
                type="text"
                value={activeColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="flex-1 text-xs"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Tool-specific settings */}
          {tool === "draw" && (
            <div>
              <Label className="text-sm">Brush Size: {brushSize}px</Label>
              <Slider
                value={[brushSize]}
                onValueChange={([value]) => onBrushSizeChange(value)}
                min={1}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>
          )}

          {tool === "text" && (
            <div>
              <Label className="text-sm">Font Size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([value]) => onFontSizeChange(value)}
                min={8}
                max={72}
                step={1}
                className="mt-2"
              />
            </div>
          )}

          {(tool === "rectangle" || tool === "circle" || tool === "triangle") && (
              <div>
                <Label className="text-sm">Fill Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={activeColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">Fill</span>
                </div>
              </div>

          )}

          {(tool === "rectangle" || tool === "circle" || tool === "triangle" || tool === "line") && (
              <div>
                <Label className="text-sm">Stroke Width: {strokeWidth}px</Label>
                <Slider
                    value={[strokeWidth]}
                    onValueChange={([value]) => onStrokeWidthChange(value)}
                    min={0}
                    max={10}
                    step={1}
                    className="mt-2"
                />
              </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
