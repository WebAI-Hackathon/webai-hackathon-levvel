import { useRef, useEffect, useState } from 'react';
import { Canvas as FabricCanvas, Rect, Circle, FabricText } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  MousePointer,
  Paintbrush,
  Square,
  Circle as CircleIcon,
  Type,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { ProjectFile } from '@/types/project';
import { GridOverlay } from './GridOverlay';
import { cn } from '@/lib/utils';
import ColorPicker from "@/components/ColorPicker.tsx";

interface ImageEditorProps {
  file?: ProjectFile;
}

type Tool = 'select' | 'brush' | 'rectangle' | 'circle' | 'text';

export function ImageEditor({ file }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'brush';

    if (activeTool === 'brush') {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeTool, brushColor, brushSize, fabricCanvas]);

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: brushColor,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: brushColor,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === 'text') {
      const text = new FabricText('Click to edit', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: brushColor,
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
  };

  const handleDelete = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    fabricCanvas.remove(...activeObjects);
    fabricCanvas.discardActiveObject();
  };

  const handleRotate = (direction: 'left' | 'right') => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      const newAngle = direction === 'left' ? currentAngle - 15 : currentAngle + 15;
      activeObject.rotate(newAngle);
      fabricCanvas.renderAll();
    }
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    const link = document.createElement('a');
    link.download = file?.name || 'image.png';
    link.href = dataURL;
    link.click();
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'brush', icon: Paintbrush, label: 'Brush' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: CircleIcon, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  return (
    <div className="h-full flex">
      {/* Left Toolbar */}
      <div className="w-64 border-r border-border bg-card p-4 flex flex-col gap-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Tools</Label>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToolClick(tool.id as Tool)}
                  className="h-10"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-3 block">Brush Settings</Label>
          <div className="space-y-3">
            <div>
              <Label htmlFor="brush-size" className="text-xs">Size: {brushSize}px</Label>
              <Slider
                id="brush-size"
                min={1}
                max={50}
                step={1}
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="brush-color" className="text-xs">Color</Label>
              <ColorPicker activeColor={brushColor} onColorChange={setBrushColor} />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-3 block">Grid</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-grid" className="text-xs">Show Grid</Label>
              <Input
                id="show-grid"
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <div>
              <Label htmlFor="grid-size" className="text-xs">Size: {gridSize}px</Label>
              <Slider
                id="grid-size"
                min={10}
                max={50}
                step={5}
                value={[gridSize]}
                onValueChange={(value) => setGridSize(value[0])}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-3 block">Actions</Label>
          <div className="space-y-2">
            <Button variant="outline" size="sm" onClick={() => handleRotate('left')} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Rotate Left
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleRotate('right')} className="w-full">
              <RotateCw className="h-4 w-4 mr-2" />
              Rotate Right
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} className="w-full">
              Clear All
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-muted">
        <div ref={containerRef} className="h-full flex items-center justify-center p-4">
          <div className="relative">
            {showGrid && (
              <GridOverlay
                width={800}
                height={600}
                zoom={100}
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
