import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToolManager } from '@/managers/ToolManager';
import { useSelectionManager } from '@/managers/SelectionManager';
import ColorPicker from "@/components/ColorPicker.tsx";

export function ShapeToolWindow() {
  const { toolProperties, updateToolProperties } = useToolManager();
  const { selectedObjects } = useSelectionManager();

  const colorPresets = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Fill Color */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Fill Color</Label>
        <div className="space-y-2">
          <ColorPicker activeColor={toolProperties.fillColor || '#3b82f6'} onColorChange={color => {
            updateToolProperties({ fillColor: color });
          }}/>
          <div className="grid grid-cols-4 gap-2">
            {colorPresets.map((color) => (
              <Button
                key={color}
                variant="outline"
                className="h-8 w-full p-0"
                style={{ backgroundColor: color }}
                onClick={() => updateToolProperties({ fillColor: color })}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stroke */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Stroke</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Color</Label>
            <ColorPicker activeColor={toolProperties.strokeColor || '#1e40af'} onColorChange={color => {
                updateToolProperties({ strokeColor: color });
            }}/>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Width: {toolProperties.strokeWidth || 2}px
            </Label>
            <Slider
              value={[toolProperties.strokeWidth || 2]}
              onValueChange={([value]) => updateToolProperties({ strokeWidth: value })}
              max={20}
              min={0}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Opacity: {Math.round((toolProperties.opacity || 1) * 100)}%
        </Label>
        <Slider
          value={[(toolProperties.opacity || 1) * 100]}
          onValueChange={([value]) => updateToolProperties({ opacity: value / 100 })}
          max={100}
          min={0}
          step={5}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Actions</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({ strokeWidth: 0 })}
          >
            No Border
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({ fillColor: 'transparent' })}
          >
            No Fill
          </Button>
        </div>
      </div>

      {/* Selection Info */}
      {selectedObjects.length > 0 && (
        <div className="pt-4 border-t border-border">
          <Label className="text-sm font-medium text-muted-foreground">
            Selected: {selectedObjects.length} object(s)
          </Label>
          <div className="mt-2 text-xs text-muted-foreground space-y-1">
            {selectedObjects.map((obj) => (
              <div key={obj.id} className="flex justify-between">
                <span>{obj.type}</span>
                <span>{obj.x.toFixed(0)}, {obj.y.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
