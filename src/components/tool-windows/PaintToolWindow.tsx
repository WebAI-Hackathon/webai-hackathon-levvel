import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToolManager } from '@/managers/ToolManager';
import { Paintbrush, Eraser } from 'lucide-react';

export function PaintToolWindow() {
  const { toolProperties, updateToolProperties, activeTool, setActiveTool } = useToolManager();

  const brushPresets = [
    { size: 2, label: 'Fine' },
    { size: 5, label: 'Small' },
    { size: 10, label: 'Medium' },
    { size: 20, label: 'Large' },
    { size: 40, label: 'XL' }
  ];

  const colorPresets = [
    '#000000', '#ffffff', '#ff0000', '#00ff00',
    '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#8b4513', '#ffa500', '#800080', '#ffc0cb'
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Tool Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Paint Tool</Label>
        <div className="flex gap-2">
          <Button
            variant={activeTool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('brush')}
            className="flex-1"
          >
            <Paintbrush className="h-4 w-4 mr-2" />
            Brush
          </Button>
          <Button
            variant={activeTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('eraser')}
            className="flex-1"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Eraser
          </Button>
        </div>
      </div>

      {/* Brush Size */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Brush Size: {toolProperties.brushSize || 5}px
        </Label>
        <Slider
          value={[toolProperties.brushSize || 5]}
          onValueChange={([value]) => updateToolProperties({ brushSize: value })}
          max={100}
          min={1}
          step={1}
        />
        
        {/* Brush size presets */}
        <div className="grid grid-cols-5 gap-1">
          {brushPresets.map((preset) => (
            <Button
              key={preset.size}
              variant="outline"
              size="sm"
              onClick={() => updateToolProperties({ brushSize: preset.size })}
              className="h-8 text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Brush Color (only for brush, not eraser) */}
      {activeTool === 'brush' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Brush Color</Label>
          <Input
            type="color"
            value={toolProperties.brushColor || '#000000'}
            onChange={(e) => updateToolProperties({ brushColor: e.target.value })}
            className="w-full h-8"
          />
          
          {/* Color presets */}
          <div className="grid grid-cols-4 gap-2">
            {colorPresets.map((color) => (
              <Button
                key={color}
                variant="outline"
                className="h-8 w-full p-0 border-2"
                style={{ 
                  backgroundColor: color,
                  borderColor: toolProperties.brushColor === color ? '#007bff' : '#e2e8f0'
                }}
                onClick={() => updateToolProperties({ brushColor: color })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Opacity */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Opacity: {Math.round((toolProperties.brushOpacity || 1) * 100)}%
        </Label>
        <Slider
          value={[(toolProperties.brushOpacity || 1) * 100]}
          onValueChange={([value]) => updateToolProperties({ brushOpacity: value / 100 })}
          max={100}
          min={10}
          step={5}
        />
      </div>

      {/* Visual Preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Preview</Label>
        <div className="h-16 bg-muted rounded-lg flex items-center justify-center border">
          <div
            className="rounded-full border border-border"
            style={{
              width: Math.min(toolProperties.brushSize || 5, 40),
              height: Math.min(toolProperties.brushSize || 5, 40),
              backgroundColor: activeTool === 'brush' 
                ? toolProperties.brushColor || '#000000' 
                : '#ffffff',
              opacity: toolProperties.brushOpacity || 1,
              border: activeTool === 'eraser' ? '2px dashed #666' : 'none'
            }}
          />
        </div>
      </div>

      {/* Quick Settings */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Settings</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({ 
              brushSize: 2, 
              brushColor: '#000000', 
              brushOpacity: 1 
            })}
          >
            Fine Line
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({ 
              brushSize: 20, 
              brushColor: '#000000', 
              brushOpacity: 0.5 
            })}
          >
            Soft Brush
          </Button>
        </div>
      </div>
    </div>
  );
}