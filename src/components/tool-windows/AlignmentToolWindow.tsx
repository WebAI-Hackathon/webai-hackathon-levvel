import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useSnapManager } from '@/managers/SnapManager';
import { useSelectionManager } from '@/managers/SelectionManager';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignStartVertical,
  AlignCenterVertical, 
  AlignEndVertical,
  Grid,
  Magnet,
  RotateCw
} from 'lucide-react';

export function AlignmentToolWindow() {
  const { 
    snapToGrid, 
    snapToObjects, 
    gridSize, 
    snapDistance,
    updateSnapSettings,
    snapToRotation
  } = useSnapManager();
  
  const { selectedObjects, selectionBounds } = useSelectionManager();

  const hasSelection = selectedObjects.length > 0;
  const hasMultipleSelection = selectedObjects.length > 1;

  const alignHorizontal = (alignment: 'left' | 'center' | 'right') => {
    if (!hasSelection || !selectionBounds) return;
    
    // TODO: Implement horizontal alignment
    console.log(`Align horizontal: ${alignment}`, selectedObjects);
  };

  const alignVertical = (alignment: 'top' | 'center' | 'bottom') => {
    if (!hasSelection || !selectionBounds) return;
    
    // TODO: Implement vertical alignment
    console.log(`Align vertical: ${alignment}`, selectedObjects);
  };

  const distributeObjects = (direction: 'horizontal' | 'vertical') => {
    if (selectedObjects.length < 3) return;
    
    // TODO: Implement distribution
    console.log(`Distribute ${direction}`, selectedObjects);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Snap Settings */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Snap Settings</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              <Label className="text-sm">Snap to Grid</Label>
            </div>
            <Switch
              checked={snapToGrid}
              onCheckedChange={(checked) => updateSnapSettings({ snapToGrid: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Magnet className="h-4 w-4" />
              <Label className="text-sm">Snap to Objects</Label>
            </div>
            <Switch
              checked={snapToObjects}
              onCheckedChange={(checked) => updateSnapSettings({ snapToObjects: checked })}
            />
          </div>
        </div>

        {/* Grid Size */}
        <div className="space-y-2">
          <Label className="text-sm">Grid Size: {gridSize}px</Label>
          <Slider
            value={[gridSize]}
            onValueChange={([value]) => updateSnapSettings({ gridSize: value })}
            max={50}
            min={5}
            step={5}
          />
        </div>

        {/* Snap Distance */}
        <div className="space-y-2">
          <Label className="text-sm">Snap Distance: {snapDistance}px</Label>
          <Slider
            value={[snapDistance]}
            onValueChange={([value]) => updateSnapSettings({ snapDistance: value })}
            max={30}
            min={5}
            step={1}
          />
        </div>
      </div>

      {/* Alignment Tools */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">
          Alignment {!hasSelection && '(Select objects first)'}
        </Label>

        {/* Horizontal Alignment */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Horizontal</Label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              onClick={() => alignHorizontal('left')}
              className="h-8"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              onClick={() => alignHorizontal('center')}
              className="h-8"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              onClick={() => alignHorizontal('right')}
              className="h-8"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Vertical Alignment */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Vertical</Label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              onClick={() => alignVertical('top')}
              className="h-8"
            >
              <AlignStartVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              onClick={() => alignVertical('center')}
              className="h-8"
            >
              <AlignCenterVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              onClick={() => alignVertical('bottom')}
              className="h-8"
            >
              <AlignEndVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Distribution */}
      {hasMultipleSelection && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Distribution</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => distributeObjects('horizontal')}
              disabled={selectedObjects.length < 3}
            >
              Distribute H
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => distributeObjects('vertical')}
              disabled={selectedObjects.length < 3}
            >
              Distribute V
            </Button>
          </div>
        </div>
      )}

      {/* Rotation Snap */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Rotation</Label>
        <div className="grid grid-cols-4 gap-1">
          {[0, 45, 90, 180].map((angle) => (
            <Button
              key={angle}
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              onClick={() => {
                // TODO: Apply rotation to selected objects
                console.log(`Rotate to ${angle}°`);
              }}
              className="h-8 text-xs"
            >
              {angle}°
            </Button>
          ))}
        </div>
      </div>

      {/* Selection Info */}
      {hasSelection && (
        <div className="pt-4 border-t border-border">
          <Label className="text-sm font-medium text-muted-foreground">
            Selection Info
          </Label>
          <div className="mt-2 text-xs text-muted-foreground space-y-1">
            <div>Objects: {selectedObjects.length}</div>
            {selectionBounds && (
              <>
                <div>Size: {selectionBounds.width.toFixed(0)} × {selectionBounds.height.toFixed(0)}</div>
                <div>Position: {selectionBounds.x.toFixed(0)}, {selectionBounds.y.toFixed(0)}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}