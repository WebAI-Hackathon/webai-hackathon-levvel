import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToolManager } from '@/managers/ToolManager';
import { useSelectionManager } from '@/managers/SelectionManager';
import { Upload, RotateCw, FlipHorizontal, FlipVertical, Crop } from 'lucide-react';

export function ImageToolWindow() {
  const { toolProperties, updateToolProperties } = useToolManager();
  const { selectedObjects } = useSelectionManager();

  const selectedImageObject = selectedObjects.find(obj => obj.type === 'image');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imgSrc = e.target?.result as string;
        // TODO: Add image to canvas
        console.log('Image loaded:', e.target?.result);
      };
       reader.readAsDataURL(file);

    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Image Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Add Image</Label>
        <div className="space-y-2">
          <Button variant="outline" className="w-full" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Transform Tools */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Transform</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Rotate image 90 degrees
              console.log('Rotate 90°');
            }}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Rotate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Flip horizontally
              console.log('Flip horizontal');
            }}
          >
            <FlipHorizontal className="h-4 w-4 mr-1" />
            Flip H
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Flip vertically
              console.log('Flip vertical');
            }}
          >
            <FlipVertical className="h-4 w-4 mr-1" />
            Flip V
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Enter crop mode
              console.log('Crop mode');
            }}
          >
            <Crop className="h-4 w-4 mr-1" />
            Crop
          </Button>
        </div>
      </div>

      {/* Image Adjustments */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Adjustments</Label>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              Brightness: {Math.round((toolProperties.brightness || 1) * 100)}%
            </Label>
            <Slider
              value={[(toolProperties.brightness || 1) * 100]}
              onValueChange={([value]) => updateToolProperties({ brightness: value / 100 })}
              max={200}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Contrast: {Math.round((toolProperties.contrast || 1) * 100)}%
            </Label>
            <Slider
              value={[(toolProperties.contrast || 1) * 100]}
              onValueChange={([value]) => updateToolProperties({ contrast: value / 100 })}
              max={200}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Saturation: {Math.round((toolProperties.saturation || 1) * 100)}%
            </Label>
            <Slider
              value={[(toolProperties.saturation || 1) * 100]}
              onValueChange={([value]) => updateToolProperties({ saturation: value / 100 })}
              max={200}
              min={0}
              step={5}
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

      {/* Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Filters</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({ filter: 'grayscale' })}
          >
            Grayscale
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({ filter: 'sepia' })}
          >
            Sepia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({ filter: 'blur' })}
          >
            Blur
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({ filter: 'none' })}
          >
            None
          </Button>
        </div>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => updateToolProperties({
          brightness: 1,
          contrast: 1,
          saturation: 1,
          opacity: 1,
          filter: 'none'
        })}
      >
        Reset Adjustments
      </Button>
    </div>
  );
}
