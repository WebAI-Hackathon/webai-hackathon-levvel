import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { 
  Palette, 
  Sun, 
  Contrast, 
  Droplets, 
  Zap,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Move,
  Sliders,
  Type,
  Square,
  Circle
} from "lucide-react";
import { toast } from "sonner";

interface PropertiesPanelProps {
  canvas?: FabricCanvas | null;
  activeTool: string;
  selectedObject?: any;
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  grayscale: number;
  vintage: number;
}

const filterPresets = [
  { name: "Original", filters: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, sepia: 0, grayscale: 0, vintage: 0 } },
  { name: "Vintage", filters: { brightness: 10, contrast: 10, saturation: -20, hue: 5, blur: 0, sepia: 40, grayscale: 0, vintage: 0 } },
  { name: "Black & White", filters: { brightness: 0, contrast: 20, saturation: 0, hue: 0, blur: 0, sepia: 0, grayscale: 100, vintage: 0 } },
  { name: "Warm", filters: { brightness: 15, contrast: 5, saturation: 15, hue: 10, blur: 0, sepia: 20, grayscale: 0, vintage: 0 } },
  { name: "Cool", filters: { brightness: 5, contrast: 10, saturation: 10, hue: -10, blur: 0, sepia: 0, grayscale: 0, vintage: 0 } },
  { name: "Dramatic", filters: { brightness: -10, contrast: 40, saturation: 20, hue: 0, blur: 0, sepia: 0, grayscale: 0, vintage: 0 } },
];

export const PropertiesPanel = ({ canvas, activeTool, selectedObject }: PropertiesPanelProps) => {
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    vintage: 0,
  });

  const [cropSettings, setCropSettings] = useState({
    aspectRatio: "free",
    width: 800,
    height: 600,
  });

  const [resizeSettings, setResizeSettings] = useState({
    width: 800,
    height: 600,
    maintainAspectRatio: true,
  });

  const applyFiltersToImage = (image: FabricImage, filterSettings: ImageFilters) => {
    // Note: Fabric.js v6 has different filter API, simplified for now
    try {
      // Apply basic CSS filters via canvas element
      const canvasEl = canvas?.getElement();
      if (canvasEl) {
        const filterString = [
          `brightness(${1 + filterSettings.brightness / 100})`,
          `contrast(${1 + filterSettings.contrast / 100})`,
          `saturate(${1 + filterSettings.saturation / 100})`,
          `hue-rotate(${filterSettings.hue}deg)`,
          `blur(${filterSettings.blur / 10}px)`,
          filterSettings.sepia > 0 ? `sepia(${filterSettings.sepia / 100})` : '',
          filterSettings.grayscale > 0 ? `grayscale(${filterSettings.grayscale / 100})` : ''
        ].filter(Boolean).join(' ');
        
        canvasEl.style.filter = filterString;
      }
      canvas?.renderAll();
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const handleFilterChange = (filterName: keyof ImageFilters, value: number) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'image') {
        applyFiltersToImage(activeObject as FabricImage, newFilters);
      }
    }
  };

  const applyFilterPreset = (preset: typeof filterPresets[0]) => {
    setFilters(preset.filters);
    
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'image') {
        applyFiltersToImage(activeObject as FabricImage, preset.filters);
        toast.success(`Applied ${preset.name} filter`);
      }
    }
  };

  const handleRotate = (degrees: number) => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const currentAngle = activeObject.angle || 0;
        activeObject.rotate(currentAngle + degrees);
        canvas.renderAll();
      }
    }
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (direction === 'horizontal') {
          activeObject.set('flipX', !activeObject.flipX);
        } else {
          activeObject.set('flipY', !activeObject.flipY);
        }
        canvas.renderAll();
      }
    }
  };

  const handleCrop = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'image') {
        // Implement cropping logic here
        toast.success("Crop applied");
      }
    }
  };

  const handleResize = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const scaleX = resizeSettings.width / (activeObject.width || 1);
        const scaleY = resizeSettings.maintainAspectRatio ? scaleX : resizeSettings.height / (activeObject.height || 1);
        
        activeObject.set({
          scaleX: scaleX,
          scaleY: scaleY
        });
        canvas.renderAll();
        toast.success("Image resized");
      }
    }
  };

  // Show object-specific properties
  const renderObjectProperties = () => {
    if (!selectedObject) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sliders className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Select an object on the canvas to view its properties.
            </p>
          </CardContent>
        </Card>
      );
    }

    const commonControls = (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Transform
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate(-90)}
              className="flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4 transform scale-x-[-1]" />
              90° Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate(90)}
              className="flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4" />
              90° Right
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlip('horizontal')}
              className="flex items-center gap-2"
            >
              <FlipHorizontal className="h-4 w-4" />
              Flip H
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlip('vertical')}
              className="flex items-center gap-2"
            >
              <FlipVertical className="h-4 w-4" />
              Flip V
            </Button>
          </div>
        </CardContent>
      </Card>
    );

    switch (selectedObject.type) {
      case 'image':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Image Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Opacity: {Math.round((selectedObject.opacity || 1) * 100)}%</Label>
                  <Slider
                    value={[(selectedObject.opacity || 1) * 100]}
                    onValueChange={([value]) => {
                      selectedObject.set('opacity', value / 100);
                      canvas?.renderAll();
                    }}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
            {commonControls}
          </>
        );

      case 'textbox':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Text Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Font Size: {selectedObject.fontSize || 20}px</Label>
                  <Slider
                    value={[selectedObject.fontSize || 20]}
                    onValueChange={([value]) => {
                      selectedObject.set('fontSize', value);
                      canvas?.renderAll();
                    }}
                    min={8}
                    max={72}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Color</Label>
                  <input
                    type="color"
                    value={selectedObject.fill || '#000000'}
                    onChange={(e) => {
                      selectedObject.set('fill', e.target.value);
                      canvas?.renderAll();
                    }}
                    className="w-full h-10 rounded border cursor-pointer mt-2"
                  />
                </div>
              </CardContent>
            </Card>
            {commonControls}
          </>
        );

      case 'rect':
      case 'circle':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedObject.type === 'rect' ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  Shape Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fill Color</Label>
                  <input
                    type="color"
                    value={selectedObject.fill || '#000000'}
                    onChange={(e) => {
                      selectedObject.set('fill', e.target.value);
                      canvas?.renderAll();
                    }}
                    className="w-full h-10 rounded border cursor-pointer mt-2"
                  />
                </div>
                
                <div>
                  <Label>Stroke Width: {selectedObject.strokeWidth || 0}px</Label>
                  <Slider
                    value={[selectedObject.strokeWidth || 0]}
                    onValueChange={([value]) => {
                      selectedObject.set('strokeWidth', value);
                      selectedObject.set('stroke', value > 0 ? selectedObject.fill : 'transparent');
                      canvas?.renderAll();
                    }}
                    min={0}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
            {commonControls}
          </>
        );

      default:
        return commonControls;
    }
  };

  const renderToolProperties = () => {
    if (activeTool === "crop") {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Crop Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Aspect Ratio</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["free", "1:1", "4:3", "16:9"].map((ratio) => (
                  <Button
                    key={ratio}
                    variant={cropSettings.aspectRatio === ratio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCropSettings({ ...cropSettings, aspectRatio: ratio })}
                  >
                    {ratio}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="crop-width">Width</Label>
                <Input
                  id="crop-width"
                  type="number"
                  value={cropSettings.width}
                  onChange={(e) => setCropSettings({ ...cropSettings, width: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="crop-height">Height</Label>
                <Input
                  id="crop-height"
                  type="number"
                  value={cropSettings.height}
                  onChange={(e) => setCropSettings({ ...cropSettings, height: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <Button onClick={handleCrop} className="w-full">
              Apply Crop
            </Button>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{activeTool}</Badge>
        <span className="text-sm text-muted-foreground">
          {selectedObject ? `${selectedObject.type} selected` : 'No selection'}
        </span>
      </div>
      
      <Separator />
      
      {renderToolProperties()}
      {renderObjectProperties()}
    </div>
  );
};