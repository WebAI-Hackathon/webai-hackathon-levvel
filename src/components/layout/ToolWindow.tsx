import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToolManager } from '@/managers/ToolManager';
import { ShapeToolWindow } from '../tool-windows/ShapeToolWindow';
import { TextToolWindow } from '../tool-windows/TextToolWindow';
import { ImageToolWindow } from '../tool-windows/ImageToolWindow';
import { AlignmentToolWindow } from '../tool-windows/AlignmentToolWindow';
import { PaintToolWindow } from '../tool-windows/PaintToolWindow';

export function ToolWindow() {
  const { selectedObjectType, closeToolWindow } = useToolManager();

  const getWindowTitle = () => {
    switch (selectedObjectType) {
      case 'rectangle':
      case 'circle':
        return 'Shape Properties';
      case 'text':
        return 'Text Properties';
      case 'image':
        return 'Image Properties';
      case 'paint':
      case 'brush':
      case 'eraser':
        return 'Paint Tools';
      case 'select':
        return 'Selection Tools';
      default:
        return 'Properties';
    }
  };

  const renderToolContent = () => {
    switch (selectedObjectType) {
      case 'rectangle':
      case 'circle':
        return <ShapeToolWindow />;
      case 'text':
        return <TextToolWindow />;
      case 'image':
        return <ImageToolWindow />;
      case 'paint':
      case 'brush':
      case 'eraser':
        return <PaintToolWindow />;
      case 'select':
        return <AlignmentToolWindow />;
      default:
        return (
          <div className="p-4 text-sm text-muted-foreground">
            Select an object to view its properties
          </div>
        );
    }
  };

  return (
    <div className="h-full border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">
          {getWindowTitle()}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={closeToolWindow}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Tool content */}
      <ScrollArea className="flex-1">
        {renderToolContent()}
      </ScrollArea>
    </div>
  );
}