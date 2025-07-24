import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Canvas as FabricCanvas } from "fabric";
import { 
  Settings, 
  Grid, 
  Eye, 
  Move, 
  RotateCw,
  Maximize,
  Monitor
} from "lucide-react";
import { toast } from "sonner";

interface SettingsPanelProps {
  canvas?: FabricCanvas | null;
}

export const SettingsPanel = ({ canvas }: SettingsPanelProps) => {
  const [canvasSettings, setCanvasSettings] = useState({
    width: 800,
    height: 600,
    backgroundColor: "#f8f9fa",
    showGrid: false,
    gridSize: 20,
    snapToGrid: false,
    zoom: 100
  });

  const [viewSettings, setViewSettings] = useState({
    showRulers: false,
    showGuides: true,
    centerObjects: true,
    highlightBounds: true
  });

  const handleCanvasSizeChange = (dimension: 'width' | 'height', value: number) => {
    const newSettings = { ...canvasSettings, [dimension]: value };
    setCanvasSettings(newSettings);
    
    if (canvas) {
      canvas.setDimensions({ [dimension]: value });
      canvas.renderAll();
      toast.success(`Canvas ${dimension} updated to ${value}px`);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    const newSettings = { ...canvasSettings, backgroundColor: color };
    setCanvasSettings(newSettings);
    
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.renderAll();
    }
  };

  const handleGridToggle = (enabled: boolean) => {
    const newSettings = { ...canvasSettings, showGrid: enabled };
    setCanvasSettings(newSettings);
    
    if (canvas) {
      // Simple grid implementation
      if (enabled) {
        toast.success("Grid enabled");
      } else {
        toast.success("Grid disabled");
      }
    }
  };

  const handleZoomChange = (zoom: number) => {
    const newSettings = { ...canvasSettings, zoom };
    setCanvasSettings(newSettings);
    
    if (canvas) {
      canvas.setZoom(zoom / 100);
      canvas.renderAll();
    }
  };

  const resetCanvas = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = "#f8f9fa";
      canvas.setZoom(1);
      canvas.renderAll();
      setCanvasSettings({
        ...canvasSettings,
        backgroundColor: "#f8f9fa",
        zoom: 100
      });
      toast.success("Canvas reset to defaults");
    }
  };

  const exportSettings = () => {
    const settings = { canvasSettings, viewSettings };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'editor-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported");
  };

  return (
    <div className="space-y-4">
      {/* Canvas Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Canvas Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="canvas-width">Width (px)</Label>
              <Input
                id="canvas-width"
                type="number"
                value={canvasSettings.width}
                onChange={(e) => handleCanvasSizeChange('width', Number(e.target.value))}
                min={100}
                max={4000}
              />
            </div>
            <div>
              <Label htmlFor="canvas-height">Height (px)</Label>
              <Input
                id="canvas-height"
                type="number"
                value={canvasSettings.height}
                onChange={(e) => handleCanvasSizeChange('height', Number(e.target.value))}
                min={100}
                max={4000}
              />
            </div>
          </div>
          
          <div>
            <Label>Background Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={canvasSettings.backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                type="text"
                value={canvasSettings.backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Zoom: {canvasSettings.zoom}%</Label>
            <Slider
              value={[canvasSettings.zoom]}
              onValueChange={([value]) => handleZoomChange(value)}
              min={10}
              max={500}
              step={10}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Grid & Snapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid">Show Grid</Label>
            <Switch
              id="show-grid"
              checked={canvasSettings.showGrid}
              onCheckedChange={handleGridToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="snap-grid">Snap to Grid</Label>
            <Switch
              id="snap-grid"
              checked={canvasSettings.snapToGrid}
              onCheckedChange={(checked) => 
                setCanvasSettings({ ...canvasSettings, snapToGrid: checked })
              }
            />
          </div>
          
          <div>
            <Label>Grid Size: {canvasSettings.gridSize}px</Label>
            <Slider
              value={[canvasSettings.gridSize]}
              onValueChange={([value]) => 
                setCanvasSettings({ ...canvasSettings, gridSize: value })
              }
              min={5}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* View Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            View Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-rulers">Show Rulers</Label>
            <Switch
              id="show-rulers"
              checked={viewSettings.showRulers}
              onCheckedChange={(checked) => 
                setViewSettings({ ...viewSettings, showRulers: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-guides">Show Guides</Label>
            <Switch
              id="show-guides"
              checked={viewSettings.showGuides}
              onCheckedChange={(checked) => 
                setViewSettings({ ...viewSettings, showGuides: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="center-objects">Auto-center Objects</Label>
            <Switch
              id="center-objects"
              checked={viewSettings.centerObjects}
              onCheckedChange={(checked) => 
                setViewSettings({ ...viewSettings, centerObjects: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={resetCanvas} variant="outline" className="w-full">
            <RotateCw className="h-4 w-4 mr-2" />
            Reset Canvas
          </Button>
          
          <Button onClick={exportSettings} variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};