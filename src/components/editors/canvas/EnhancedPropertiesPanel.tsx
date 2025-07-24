import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {Canvas as FabricCanvas, FabricObject, Image as FabricImage, filters as ImageFilters, Textbox} from "fabric";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import {
  Palette,
  Sun,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Move,
  Sliders,
  Type,
  Square,
  Circle,
  Settings,
  Filter,
  Layers, RotateCcw, Eye, EyeOff, Trash, LoaderCircle, Check
} from "lucide-react";
import { toast } from "sonner";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface EnhancedPropertiesPanelProps {
  canvas?: FabricCanvas | null;
  canvasObjects?: FabricObject[];
  activeTool: string;
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
}

const filterPresets = [
  { name: "Original", filters: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, sepia: 0, grayscale: 0 } },
  { name: "Vintage", filters: { brightness: 10, contrast: 15, saturation: -20, hue: 5, blur: 0, sepia: 40, grayscale: 0 } },
  { name: "Black & White", filters: { brightness: 0, contrast: 20, saturation: 0, hue: 0, blur: 0, sepia: 0, grayscale: 100 } },
  { name: "Warm", filters: { brightness: 15, contrast: 5, saturation: 15, hue: 10, blur: 0, sepia: 20, grayscale: 0 } },
  { name: "Cool", filters: { brightness: 5, contrast: 10, saturation: 10, hue: -15, blur: 0, sepia: 0, grayscale: 0 } },
  { name: "Dramatic", filters: { brightness: -10, contrast: 40, saturation: 20, hue: 0, blur: 0, sepia: 0, grayscale: 0 } },
];

export const EnhancedPropertiesPanel = ({ canvas, canvasObjects, activeTool, selectedObject }: EnhancedPropertiesPanelProps) => {
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
  });

  const [activePreset, setActivePreset] = useState("Original");

  const applyFiltersToImage = (image: FabricImage, filterSettings: FilterSettings) => {
    try {
      // Clear existing filters
      image.filters = [];

      // Add new filters based on settings
      if (filterSettings.brightness !== 0) {
        image.filters.push(new ImageFilters.Brightness({
          brightness: filterSettings.brightness / 100,
        }));
      }
      if (filterSettings.contrast !== 0) {
        image.filters.push(new ImageFilters.Contrast({
          contrast: filterSettings.contrast / 100,
        }));
      }
      if (filterSettings.saturation !== 0) {
        image.filters.push(new ImageFilters.Saturation({
          saturation: filterSettings.saturation / 100,
        }));
      }
      if (filterSettings.hue !== 0) {
        image.filters.push(new ImageFilters.HueRotation({
          rotation: filterSettings.hue / 180 * Math.PI, // Convert degrees to radians
        }));
      }
      if (filterSettings.blur > 0) {
        image.filters.push(new ImageFilters.Blur({
          blur: filterSettings.blur / 100,
        }));
      }
      if (filterSettings.sepia > 0) {
        image.filters.push(new ImageFilters.Sepia());
      }
      if (filterSettings.grayscale > 0) {
        image.filters.push(new ImageFilters.Grayscale());
      }

      // Apply the filters and re-render the canvas
      image.applyFilters();
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

  const handleRotate = (degrees: number) => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const currentAngle = activeObject.angle || 0;
        activeObject.rotate(currentAngle + degrees);
        activeObject.setCoords();
        canvas.renderAll();
        toast.success(`Rotated ${degrees}°`);
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
        activeObject.setCoords();
        canvas.renderAll();
        toast.success(`Flipped ${direction}`);
      }
    }
  };

  const reorder = (list: FabricObject[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

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

          {/* Position and Size */}
          <div className="space-y-2">
            <Label className="text-sm">Position & Size</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={Math.round(selectedObject.left || 0)}
                  onChange={(e) => {
                    selectedObject.set('left', Number(e.target.value)).setCoords();
                    canvas?.renderAll();
                  }}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={Math.round(selectedObject.top || 0)}
                  onChange={(e) => {
                    selectedObject.set('top', Number(e.target.value)).setCoords();
                    canvas?.renderAll();
                  }}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <Label>Opacity: {Math.round((selectedObject.opacity ?? 1) * 100)}%</Label>
            <Slider
              value={[(selectedObject.opacity ?? 1) * 100]}
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
    );

    switch (selectedObject.type) {
      case 'image':
        return (
          <>
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

                <div>
                  <Label>Font Alignment</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {['left', 'center', 'right'].map((align) => (
                        <Button
                            key={align}
                            variant={selectedObject.textAlign === align ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                            selectedObject.set('textAlign', align);
                            canvas?.renderAll();
                            }}
                        >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                        </Button>
                        ))}
                    </div>

                </div>

                <div>
                  <Label>Font Weight</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={selectedObject.fontWeight === 'normal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        selectedObject.set('fontWeight', 'normal');
                        canvas?.renderAll();
                      }}
                    >
                      Normal
                    </Button>
                    <Button
                      variant={selectedObject.fontWeight === 'bold' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        selectedObject.set('fontWeight', 'bold');
                        canvas?.renderAll();
                      }}
                    >
                      Bold
                    </Button>
                  </div>
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
                  <Label>Stroke Color</Label>
                  <input
                    type="color"
                    value={selectedObject.stroke || '#000000'}
                    onChange={(e) => {
                      selectedObject.set('stroke', e.target.value);
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
                      canvas?.renderAll();
                    }}
                    min={0}
                    max={20}
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

  const getLayerName = (layer: FabricObject, index: number) => {
    if (layer.isType("textbox")) {
      const textbox = layer as Textbox;
      return (
          <span className="flex items-center gap-2">
            <Type />
            <span className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-[100px]">
              {textbox.text.replace("\n", " ") || "Text Layer"}</span>
          </span>
      );
    } else if (layer.isType("image")) {
        const image = layer as FabricImage;
        return (
            <span className="flex items-center gap-2">
                <img src={image.getSrc()} alt="Image Layer" className="h-4 w-4 object-cover" />
                <span>{`Image ${index + 1}`}</span>
              {image.imageDescription ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Check />
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="max-w-80">
                            {image.imageDescription}
                        </div>
                    </TooltipContent>
                  </Tooltip>
                  ) : (
                  <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
        </span>
        );
    } else if (layer.isType("rect")) {
        return (
            <span className="flex items-center gap-2">
            <Square />
            <span>Rectangle</span>
            </span>
        );
    } else if (layer.isType("circle")) {
        return (
            <span className="flex items-center gap-2">
            <Circle />
            <span>Circle</span>
            </span>
        );
    }
    return `Layer ${index + 1}`;
  }

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedLayers = reorder(
        canvasObjects,
        result.source.index,
        result.destination.index
    );
    reorderedLayers.forEach((layer, index) => {
      canvas.moveObjectTo(layer, index);
    });
    canvas.renderAll();
    toast.success("Layer order updated");
  };

  const renderLayersPanel = () => {
    if (!canvas) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              No canvas available. Please create or load a canvas to manage layers.
            </p>
          </CardContent>
        </Card>
      );
    }

    const layers = canvas.getObjects();
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {layers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No layers available.</p>
          ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="layers">
                  {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {layers.map((layer, index) => (
                            <Draggable key={layer.id || index} draggableId={String(layer.id || index)} index={index}>
                              {(provided) => (
                                  <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center justify-between p-2 bg-secondary rounded-md"
                                      onClick={() => {
                                        canvas.setActiveObject(layer);
                                        canvas.renderAll();
                                      }}
                                  >
                                  <span>{getLayerName(layer, index)}</span>
                                    <div>
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (canvas.getActiveObject() === layer) {
                                              canvas.discardActiveObject();
                                            }
                                            canvas.remove(layer);
                                            canvas.renderAll();
                                          }}
                                      >
                                        <Trash color="red"/>
                                      </Button>
                                     <Button
                                         variant="ghost"
                                         size="sm"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           layer.set('visible', !layer.visible);
                                           if (canvas.getActiveObject() === layer) {
                                             canvas.discardActiveObject();
                                           }
                                           canvas.renderAll();
                                         }}
                                     >
                                       {layer.visible ? <Eye /> : <EyeOff />}
                                     </Button>
                                    </div>
                                  </div>
                              )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                  )}
                </Droppable>
              </DragDropContext>
          )}
        </CardContent>
      </Card>
    );
  }

  const renderFilterPanel = () => {
    if (!selectedObject || selectedObject.type !== 'image') {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Select an image to apply filters and effects.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
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
              {filterPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={activePreset === preset.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilterPreset(preset)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Manual Adjustments
              <RotateCcw onClick={() => applyFilterPreset(filterPresets[0])} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Brightness: {filters.brightness}</Label>
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
              <Label>Contrast: {filters.contrast}</Label>
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
              <Label>Saturation: {filters.saturation}</Label>
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
              <Label>Hue: {filters.hue}°</Label>
              <Slider
                value={[filters.hue]}
                onValueChange={([value]) => handleFilterChange('hue', value)}
                min={-180}
                max={180}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Blur: {filters.blur}</Label>
              <Slider
                value={[filters.blur]}
                onValueChange={([value]) => handleFilterChange('blur', value)}
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

  return (
    <div className="h-full">
      <Tabs defaultValue="properties" className="h-full">
        <TabsList className="grid w-full grid-cols-3 m-2">
          <TabsTrigger value="properties" className="text-xs">
            <Settings className="h-4 w-4 mr-1" />
            Props
          </TabsTrigger>
          <TabsTrigger value="filters" className="text-xs">
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="layers" className="text-xs">
            <Layers className="h-4 w-4 mr-1" />
            Layers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="m-0 h-[calc(100%-60px)] overflow-y-auto p-4">
          <div className="space-y-4">
            {/*<div className="flex items-center gap-2">*/}
            {/*  <Badge variant="secondary">{activeTool}</Badge>*/}
            {/*  <span className="text-sm text-muted-foreground">*/}
            {/*    {selectedObject ? `${selectedObject.type} selected` : 'No selection'}*/}
            {/*  </span>*/}
            {/*</div>*/}

            {/*<Separator />*/}

            {renderObjectProperties()}
          </div>
        </TabsContent>

        <TabsContent value="filters" className="m-0 h-[calc(100%-60px)] overflow-y-auto p-4">
          {renderFilterPanel()}
        </TabsContent>

        <TabsContent value="layers" className="m-0 h-[calc(100%-60px)] overflow-y-auto p-4">
          {renderLayersPanel()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
