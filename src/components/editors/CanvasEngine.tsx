import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';
import Konva from 'konva';
import { useToolManager } from '@/managers/ToolManager';
import { useSelectionManager } from '@/managers/SelectionManager';
import { useSnapManager } from '@/managers/SnapManager';
import { useHistoryManager, createObjectEntry } from '@/managers/HistoryManager';
import { CanvasObject, ToolType } from '@/types/canvas';
import { EditorProject } from '@/types/editor';
import { CanvasToolbar } from './CanvasToolbar';
import { Button } from '@/components/ui/button';
import { Grid, MousePointer } from 'lucide-react';

interface CanvasEngineProps {
  project: EditorProject;
  width?: number;
  height?: number;
}

export function CanvasEngine({ project, width = 800, height = 600 }: CanvasEngineProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);

  const { activeTool, toolProperties, setActiveTool, openToolWindow } = useToolManager();
  const { selectObject, clearSelection, selectedObjectIds } = useSelectionManager();
  const { snapToGrid, gridSize, showSnapLines, calculateSnapPoint } = useSnapManager();
  const { addHistoryEntry } = useHistoryManager();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createNewObject = (type: CanvasObject['type'], x: number, y: number): CanvasObject => {
    const id = generateId();
    const baseObject = {
      id,
      type,
      x,
      y,
      createdAt: new Date(),
      updatedAt: new Date(),
      properties: { ...toolProperties }
    };

    switch (type) {
      case 'shape':
        return {
          ...baseObject,
          width: 100,
          height: 100,
          properties: {
            ...baseObject.properties,
            shapeType: activeTool === 'rectangle' ? 'rect' : 'circle'
          }
        };
      case 'text':
        return {
          ...baseObject,
          width: 200,
          height: 50,
          properties: {
            ...baseObject.properties,
            text: 'New Text',
            fontSize: toolProperties.fontSize || 16
          }
        };
      default:
        return baseObject;
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'select') {
      // Handle selection
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        clearSelection();
      }
      return;
    }

    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    let { x, y } = pointer;

    // Apply snapping
    if (snapToGrid) {
      const snapPoint = calculateSnapPoint(x, y, objects);
      if (snapPoint) {
        x = snapPoint.x;
        y = snapPoint.y;
      }
    }

    // Create new object based on active tool
    let newObject: CanvasObject | null = null;

    switch (activeTool) {
      case 'rectangle':
      case 'circle':
        newObject = createNewObject('shape', x, y);
        break;
      case 'text':
        newObject = createNewObject('text', x, y);
        openToolWindow('text');
        break;
    }

    if (newObject) {
      setObjects(prev => [...prev, newObject]);
      selectObject(newObject);
      addHistoryEntry(createObjectEntry('create', newObject));
      
      // Switch to select tool after creating object
      setActiveTool('select');
    }
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'brush' || activeTool === 'eraser') {
      setIsDrawing(true);
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      setCurrentPath([pointer.x, pointer.y]);
    } else {
      handleStageClick(e);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || (activeTool !== 'brush' && activeTool !== 'eraser')) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    setCurrentPath(prev => [...prev, pointer.x, pointer.y]);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length > 0) {
      const newObject: CanvasObject = {
        id: generateId(),
        type: 'drawing',
        x: 0,
        y: 0,
        properties: {
          points: currentPath,
          stroke: toolProperties.brushColor || '#000000',
          strokeWidth: toolProperties.brushSize || 5,
          tool: activeTool
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setObjects(prev => [...prev, newObject]);
      addHistoryEntry(createObjectEntry('create', newObject));
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleObjectClick = (object: CanvasObject) => {
    selectObject(object);
    openToolWindow(object.type);
  };

  const renderObject = (object: CanvasObject) => {
    const isSelected = selectedObjectIds.includes(object.id);
    const commonProps = {
      key: object.id,
      x: object.x,
      y: object.y,
      draggable: activeTool === 'select',
      stroke: isSelected ? '#007bff' : object.properties.strokeColor,
      strokeWidth: isSelected ? 2 : (object.properties.strokeWidth || 1),
      onClick: () => handleObjectClick(object),
      onTap: () => handleObjectClick(object)
    };

    switch (object.type) {
      case 'shape':
        if (object.properties.shapeType === 'rect') {
          return (
            <Rect
              {...commonProps}
              width={object.width || 100}
              height={object.height || 100}
              fill={object.properties.fillColor || '#3b82f6'}
            />
          );
        } else {
          return (
            <Circle
              {...commonProps}
              radius={50}
              fill={object.properties.fillColor || '#3b82f6'}
            />
          );
        }
      case 'text':
        return (
          <Text
            {...commonProps}
            text={object.properties.text || 'Text'}
            fontSize={object.properties.fontSize || 16}
            fontFamily={object.properties.fontFamily || 'Arial'}
            fill={object.properties.fillColor || '#000000'}
          />
        );
      case 'drawing':
        return (
          <Line
            {...commonProps}
            points={object.properties.points || []}
            stroke={object.properties.stroke || '#000000'}
            strokeWidth={object.properties.strokeWidth || 5}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={
              object.properties.tool === 'eraser' ? 'destination-out' : 'source-over'
            }
          />
        );
      default:
        return null;
    }
  };

  const renderGrid = () => {
    if (!snapToGrid) return null;

    const lines = [];
    const stage = stageRef.current;
    if (!stage) return null;

    const stageWidth = stage.width();
    const stageHeight = stage.height();

    // Vertical lines
    for (let i = 0; i <= stageWidth; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageHeight]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= stageHeight; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageWidth, i]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }

    return lines;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <CanvasToolbar />
      
      <div className="flex-1 relative overflow-hidden bg-muted/10">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          className="bg-white"
        >
          <Layer>
            {/* Grid */}
            {renderGrid()}
            
            {/* Objects */}
            {objects.map(renderObject)}
            
            {/* Current drawing path */}
            {isDrawing && currentPath.length > 0 && (
              <Line
                points={currentPath}
                stroke={toolProperties.brushColor || '#000000'}
                strokeWidth={toolProperties.brushSize || 5}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  activeTool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            )}
          </Layer>
        </Stage>

        {/* Tool indicator */}
        <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            <span className="capitalize">{activeTool}</span>
            {snapToGrid && (
              <>
                <div className="w-px h-4 bg-border" />
                <Grid className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Grid: {gridSize}px</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}