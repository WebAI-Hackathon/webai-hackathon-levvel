import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToolManager } from '@/managers/ToolManager';
import { useSelectionManager } from '@/managers/SelectionManager';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TextToolWindow() {
  const { toolProperties, updateToolProperties } = useToolManager();
  const { selectedObjects } = useSelectionManager();

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
    'Verdana', 'Comic Sans MS', 'Impact', 'Trebuchet MS'
  ];

  const selectedTextObject = selectedObjects.find(obj => obj.type === 'text');

  return (
    <div className="p-4 space-y-6">
      {/* Text Content */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Text Content</Label>
        <Textarea
          value={selectedTextObject?.properties.text || toolProperties.text || 'New Text'}
          onChange={(e) => updateToolProperties({ text: e.target.value })}
          placeholder="Enter text..."
          className="min-h-20 resize-none"
        />
      </div>

      {/* Font Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Font</Label>
        
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Family</Label>
            <Select
              value={toolProperties.fontFamily || 'Arial'}
              onValueChange={(value) => updateToolProperties({ fontFamily: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Size: {toolProperties.fontSize || 16}px
            </Label>
            <Slider
              value={[toolProperties.fontSize || 16]}
              onValueChange={([value]) => updateToolProperties({ fontSize: value })}
              max={72}
              min={8}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Text Style */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Style</Label>
        <div className="flex items-center gap-2">
          <Button
            variant={toolProperties.fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateToolProperties({ 
              fontWeight: toolProperties.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={toolProperties.fontStyle === 'italic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateToolProperties({ 
              fontStyle: toolProperties.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Alignment</Label>
        <div className="flex items-center gap-1">
          {(['left', 'center', 'right'] as const).map((align) => {
            const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
            return (
              <Button
                key={align}
                variant={toolProperties.textAlign === align ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateToolProperties({ textAlign: align })}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Color</Label>
        <Input
          type="color"
          value={toolProperties.fillColor || '#000000'}
          onChange={(e) => updateToolProperties({ fillColor: e.target.value })}
          className="w-full h-8"
        />
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

      {/* Quick Text Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Presets</Label>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({
              fontSize: 24,
              fontWeight: 'bold',
              fontFamily: 'Impact'
            })}
          >
            Headline
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateToolProperties({
              fontSize: 14,
              fontWeight: 'normal',
              fontFamily: 'Comic Sans MS'
            })}
          >
            Comic Text
          </Button>
        </div>
      </div>
    </div>
  );
}