import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move,
  Maximize,
  Home
} from "lucide-react";
import { Canvas as FabricCanvas, Point } from "fabric";
import { toast } from "sonner";

interface NavigationControlsProps {
  canvas?: FabricCanvas | null;
}

export const NavigationControls = ({ canvas }: NavigationControlsProps) => {
  const [isPanning, setIsPanning] = useState(false);

  const handleFitToScreen = () => {
    if (!canvas) return;
    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.renderAll();
    toast.success("Fit to screen");
  };

  const handleTogglePan = () => {
    if (!canvas) return;
    
    const newPanMode = !isPanning;
    setIsPanning(newPanMode);
    
    if (newPanMode) {
      canvas.selection = false;
      canvas.isDrawingMode = false;
      canvas.defaultCursor = "grab";
      canvas.hoverCursor = "grab";
      
      let isDragging = false;
      let lastPosX = 0;
      let lastPosY = 0;

      const startPanning = (opt: any) => {
        if (newPanMode) {
          isDragging = true;
          canvas.selection = false;
          lastPosX = opt.e.clientX;
          lastPosY = opt.e.clientY;
          canvas.defaultCursor = "grabbing";
        }
      };

      const continuePanning = (opt: any) => {
        if (isDragging && newPanMode) {
          const vpt = canvas.viewportTransform;
          if (vpt) {
            vpt[4] += opt.e.clientX - lastPosX;
            vpt[5] += opt.e.clientY - lastPosY;
            canvas.requestRenderAll();
            lastPosX = opt.e.clientX;
            lastPosY = opt.e.clientY;
          }
        }
      };

      const stopPanning = () => {
        if (newPanMode) {
          isDragging = false;
          canvas.defaultCursor = "grab";
        }
      };

      canvas.on('mouse:down', startPanning);
      canvas.on('mouse:move', continuePanning);
      canvas.on('mouse:up', stopPanning);
      
      toast.success("Pan mode enabled - Click and drag to move canvas");
    } else {
      canvas.off('mouse:down');
      canvas.off('mouse:move'); 
      canvas.off('mouse:up');
      canvas.selection = true;
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      toast.success("Pan mode disabled");
    }
  };

  const handleResetView = () => {
    if (!canvas) return;
    setIsPanning(false);
    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.selection = true;
    canvas.defaultCursor = "default";
    canvas.renderAll();
    toast.success("View reset");
  };

  const handleZoomIn = () => {
    if (!canvas) return;
    const zoom = canvas.getZoom();
    const newZoom = Math.min(zoom * 1.1, 5);
    const center = canvas.getCenter();
    canvas.zoomToPoint(new Point(center.left, center.top), newZoom);
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const zoom = canvas.getZoom();
    const newZoom = Math.max(zoom * 0.9, 0.1);
    const center = canvas.getCenter();
    canvas.zoomToPoint(new Point(center.left, center.top), newZoom);
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-t border-border p-3">
      <div className="flex items-center justify-center gap-2">
        {/* Navigation Controls */}
        <Button
          size="sm"
          variant={isPanning ? "default" : "outline"}
          onClick={handleTogglePan}
          title="Pan Mode"
        >
          <Move className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleFitToScreen}
          title="Fit to Screen"
        >
          <Maximize className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetView}
          title="Reset View"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};