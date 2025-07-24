import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer,
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Type,
  Image,
  MessageCircle,
  Grid,
  AlignCenter
} from 'lucide-react';
import { useToolManager } from '@/managers/ToolManager';
import { useSnapManager } from '@/managers/SnapManager';
import { ToolType } from '@/types/canvas';
import { cn } from '@/lib/utils';

const tools = [
  { type: 'select' as ToolType, icon: MousePointer, label: 'Select' },
  { type: 'brush' as ToolType, icon: Paintbrush, label: 'Brush' },
  { type: 'eraser' as ToolType, icon: Eraser, label: 'Eraser' },
  { type: 'rectangle' as ToolType, icon: Square, label: 'Rectangle' },
  { type: 'circle' as ToolType, icon: Circle, label: 'Circle' },
  { type: 'text' as ToolType, icon: Type, label: 'Text' },
  { type: 'image' as ToolType, icon: Image, label: 'Image' },
  { type: 'speech-bubble' as ToolType, icon: MessageCircle, label: 'Speech Bubble' },
];

export function CanvasToolbar() {
  const { activeTool, setActiveTool, openToolWindow } = useToolManager();
  const { snapToGrid, updateSnapSettings } = useSnapManager();

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    
    // Auto-open relevant tool windows
    if (['brush', 'eraser'].includes(tool)) {
      openToolWindow('paint');
    } else if (['rectangle', 'circle'].includes(tool)) {
      openToolWindow(tool);
    } else if (tool === 'text') {
      openToolWindow('text');
    } else if (tool === 'select') {
      openToolWindow('select');
    }
  };

  const toggleGrid = () => {
    updateSnapSettings({ snapToGrid: !snapToGrid });
  };

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-2">
      {/* Main tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.type}
              variant={activeTool === tool.type ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleToolClick(tool.type)}
              className={cn(
                "h-8 w-8 p-0",
                activeTool === tool.type && "bg-primary text-primary-foreground"
              )}
              title={tool.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Grid and alignment tools */}
      <div className="flex items-center gap-1">
        <Button
          variant={snapToGrid ? 'default' : 'ghost'}
          size="sm"
          onClick={toggleGrid}
          className={cn(
            "h-8 w-8 p-0",
            snapToGrid && "bg-primary text-primary-foreground"
          )}
          title="Toggle Grid Snap"
        >
          <Grid className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openToolWindow('select')}
          className="h-8 w-8 p-0"
          title="Alignment Tools"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Quick color indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div 
            className="w-4 h-4 rounded border border-border"
            style={{ backgroundColor: activeTool === 'brush' ? '#000000' : '#3b82f6' }}
          />
          <span className="text-xs">Color</span>
        </div>
      </div>
    </div>
  );
}