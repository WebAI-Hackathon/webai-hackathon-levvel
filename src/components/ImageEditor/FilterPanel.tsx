import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { 
  Palette, 
  Sun, 
  Contrast, 
  Droplets, 
  Zap,
  Eye,
  Sparkles,
  Moon,
  Flame,
  Snowflake
} from "lucide-react";
import { toast } from "sonner";

interface FilterPanelProps {
  canvas?: FabricCanvas | null;
  selectedObject?: any;
}

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  grayscale: number;
  vintage: number;
  vibrance: number;
  exposure: number;
}

const filterPresets = [
  { 
    name: "Original", 
    icon: Eye,
    filters: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, sepia: 0, grayscale: 0, vintage: 0, vibrance: 0, exposure: 0 } 
  },
  { 
    name: "Vintage", 
    icon: Moon,
    filters: { brightness: 10, contrast: 15, saturation: -20, hue: 5, blur: 0, sepia: 40, grayscale: 0, vintage: 30, vibrance: -10, exposure: 5 } 
  },
  { 
    name: "Black & White", 
    icon: Contrast,
    filters: { brightness: 0, contrast: 20, saturation: 0, hue: 0, blur: 0, sepia: 0, grayscale: 100, vintage: 0, vibrance: 0, exposure: 0 } 
  },
  { 
    name: "Warm", 
    icon: Flame,
    filters: { brightness: 15, contrast: 5, saturation: 15, hue: 10, blur: 0, sepia: 20, grayscale: 0, vintage: 0, vibrance: 20, exposure: 10 } 
  },
  { 
    name: "Cool", 
    icon: Snowflake,
    filters: { brightness: 5, contrast: 10, saturation: 10, hue: -15, blur: 0, sepia: 0, grayscale: 0, vintage: 0, vibrance: 15, exposure: -5 } 
  },
  { 
    name: "Dramatic", 
    icon: Zap,
    filters: { brightness: -10, contrast: 40, saturation: 20, hue: 0, blur: 0, sepia: 0, grayscale: 0, vintage: 0, vibrance: 30, exposure: 15 } 
  },
  { 
    name: "Soft", 
    icon: Sparkles,
    filters: { brightness: 20, contrast: -10, saturation: 5, hue: 2, blur: 5, sepia: 10, grayscale: 0, vintage: 15, vibrance: 10, exposure: 5 } 
  },
  { 
    name: "High Key", 
    icon: Sun,
    filters: { brightness: 30, contrast: -15, saturation: -5, hue: 0, blur: 0, sepia: 0, grayscale: 0, vintage: 0, vibrance: 5, exposure: 25 } 
  }
];

export const FilterPanel = ({ canvas, selectedObject }: FilterPanelProps) => {
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    vintage: 0,
    vibrance: 0,
    exposure: 0
  });

  const [activePreset, setActivePreset] = useState("Original");

  const applyFiltersToImage = (image: FabricImage, filterSettings: FilterSettings) => {
    try {
      const canvasEl = canvas?.getElement();
      if (canvasEl) {
        const filterString = [
          `brightness(${1 + filterSettings.brightness / 100})`,
          `contrast(${1 + filterSettings.contrast / 100})`,
          `saturate(${1 + filterSettings.saturation / 100})`,
          `hue-rotate(${filterSettings.hue}deg)`,
          `blur(${filterSettings.blur / 10}px)`,
          filterSettings.sepia > 0 ? `sepia(${filterSettings.sepia / 100})` : '',
          filterSettings.grayscale > 0 ? `grayscale(${filterSettings.grayscale / 100})` : '',
          filterSettings.exposure !== 0 ? `brightness(${1 + filterSettings.exposure / 50})` : ''
        ].filter(Boolean).join(' ');
        
        canvasEl.style.filter = filterString;
      }
      canvas?.renderAll();
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error("Failed to apply filter");
    }
  };

  const handleFilterChange = (filterName: keyof FilterSettings, value: number) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setActivePreset("Custom");

    if (canvas && selectedObject && selectedObject.type === 'image') {
      applyFiltersToImage(selectedObject as FabricImage, newFilters);
    }
  };

  const applyFilterPreset = (preset: typeof filterPresets[0]) => {
    setFilters(preset.filters);
    setActivePreset(preset.name);
    
    if (canvas && selectedObject && selectedObject.type === 'image') {
      applyFiltersToImage(selectedObject as FabricImage, preset.filters);
      toast.success(`Applied ${preset.name} filter`);
    } else {
      toast.error("Please select an image to apply filters");
    }
  };

  const resetFilters = () => {
    const originalFilters = filterPresets[0].filters;
    setFilters(originalFilters);
    setActivePreset("Original");
    
    if (canvas && selectedObject && selectedObject.type === 'image') {
      applyFiltersToImage(selectedObject as FabricImage, originalFilters);
      toast.success("Filters reset");
    }
  };

  if (!selectedObject || selectedObject.type !== 'image') {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Select an image on the canvas to apply filters and adjustments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Filter Presets
            <Badge variant="secondary" className="ml-auto text-xs">
              {activePreset}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {filterPresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.name}
                  variant={activePreset === preset.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilterPreset(preset)}
                  className="flex items-center gap-2 text-xs h-auto py-2"
                >
                  <Icon className="h-3 w-3" />
                  {preset.name}
                </Button>
              );
            })}
          </div>
          
          <Button 
            onClick={resetFilters} 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
          >
            Reset All Filters
          </Button>
        </CardContent>
      </Card>

      {/* Basic Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Basic Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Brightness: {filters.brightness}
            </Label>
            <Slider
              value={[filters.brightness]}
              onValueChange={([value]) => handleFilterChange('brightness', value)}
              min={-100}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              Contrast: {filters.contrast}
            </Label>
            <Slider
              value={[filters.contrast]}
              onValueChange={([value]) => handleFilterChange('contrast', value)}
              min={-100}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Saturation: {filters.saturation}
            </Label>
            <Slider
              value={[filters.saturation]}
              onValueChange={([value]) => handleFilterChange('saturation', value)}
              min={-100}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Hue: {filters.hue}°
            </Label>
            <Slider
              value={[filters.hue]}
              onValueChange={([value]) => handleFilterChange('hue', value)}
              min={-180}
              max={180}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Advanced
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Blur: {filters.blur}
            </Label>
            <Slider
              value={[filters.blur]}
              onValueChange={([value]) => handleFilterChange('blur', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Vibrance: {filters.vibrance}</Label>
            <Slider
              value={[filters.vibrance]}
              onValueChange={([value]) => handleFilterChange('vibrance', value)}
              min={-100}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Exposure: {filters.exposure}</Label>
            <Slider
              value={[filters.exposure]}
              onValueChange={([value]) => handleFilterChange('exposure', value)}
              min={-100}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Sepia: {filters.sepia}</Label>
            <Slider
              value={[filters.sepia]}
              onValueChange={([value]) => handleFilterChange('sepia', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};