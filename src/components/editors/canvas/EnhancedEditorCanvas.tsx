import { useEffect, useRef, useState, useCallback } from "react";
import {Canvas as FabricCanvas, Image as FabricImage, Circle, Rect, Textbox, FabricObject, Triangle, Line} from "fabric";
import {ImageIcon} from "lucide-react";
import { toast } from "sonner";
import { NavigationControls } from "./NavigationControls";
import {Tool} from "@/components/Tool.tsx";

interface EnhancedEditorCanvasProps {
  onCanvasReady?: (canvas: FabricCanvas) => void;
  activeTool?: string;
  activeColor?: string;
  brushSize?: number;
  fontSize?: number;
  strokeWidth?: number;
  onImageLoad?: (image: FabricImage) => void;
  width?: number;
  height?: number;
  setActiveTool?: (tool: string) => void;
  fabricObjects?: FabricObject[];
  setFabricObjects?: (objects: FabricObject[]) => void;
}

export const EnhancedEditorCanvas = ({
  onCanvasReady,
  activeTool = "select",
  activeColor = "#6366f1",
  brushSize = 5,
  fontSize = 20,
  strokeWidth = 2,
  onImageLoad,
  width = 800,
  height = 600,
  setActiveTool,
  fabricObjects = [],
  setFabricObjects = () => { /* no-op */ }
}: EnhancedEditorCanvasProps) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const addTextBox = useCallback((text: string, left: number, top: number, width: number) => {
      const textbox = new Textbox(text, {
          left: left,
          top: top,
          fill: activeColor,
          fontSize: fontSize,
          fontFamily: "Arial",
          width: width,
          borderColor: activeColor,
          cornerColor: activeColor,
        textAlign: "center",
      });
      fabricCanvas.add(textbox);
      fabricCanvas.renderAll();
  }, [activeColor, fontSize, fabricCanvas]);

  const editTextBox = useCallback((index: number, newText: string) => {
    if (fabricCanvas && fabricObjects[index] && fabricObjects[index].isType("textbox")) {
      const textBox = fabricObjects[index] as Textbox;
        textBox.set("text", newText);
      fabricCanvas.renderAll();
      toast.success("Text updated successfully!");
    } else {
      toast.error("Selected object is not a text box.");
    }
  }, [fabricCanvas, fabricObjects]);


  const removeObjects = useCallback((ids: number[]) => {

    if (fabricCanvas) {
        // Filter out the objects to be removed
        const objectsToRemove = ids.map(i => fabricObjects[i]).filter(obj => obj);
        for (const obj of objectsToRemove) {
            if (obj) {
                fabricCanvas.remove(obj);
            }
        }
      fabricCanvas.renderAll();
      toast.success("Object removed successfully!");
    } else {
      toast.error("Object not found.");
    }
  }, [fabricCanvas, fabricObjects]);


  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    // Initialize drawing brush with better defaults
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else {
      // Force initialization of the drawing brush
      canvas.isDrawingMode = true;
      canvas.isDrawingMode = false;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = brushSize;
      }
    }

    // Grid will be handled via CSS background for better performance

    setFabricCanvas(canvas);
    onCanvasReady?.(canvas);

    const updateObjectsState = () => {
      if (canvas) {
        // Use getObjects() and slice() to create a new array reference
        // This ensures React detects the state change.
        setFabricObjects(canvas.getObjects() as FabricObject[]);
      }
    };

    // Listen to all events that change the canvas content
    canvas.on("after:render", updateObjectsState);
    canvas.on("object:added", updateObjectsState);
    canvas.on("object:removed", updateObjectsState);


    return () => {
      canvas.off("after:render", updateObjectsState);
      canvas.off("object:added", updateObjectsState);
      canvas.off("object:removed", updateObjectsState);
      canvas.dispose();
    };
  }, [onCanvasReady, width, height]);

  // Update canvas based on active tool
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    fabricCanvas.selection = activeTool === "select";

    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }

    // Set cursor based on tool
    switch (activeTool) {
      case "draw":
        fabricCanvas.defaultCursor = "crosshair";
        break;
      case "text":
        fabricCanvas.defaultCursor = "text";
        break;
      case "crop":
        fabricCanvas.defaultCursor = "crop";
        break;
      case "eraser":
        fabricCanvas.defaultCursor = "not-allowed";
        break;
      default:
        fabricCanvas.defaultCursor = "default";
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleCanvasClick = useCallback((e: any) => {
    if (!fabricCanvas) return;

    if (activeTool === "eraser" && e.target && e.target !== fabricCanvas) {
      fabricCanvas.remove(e.target);
      toast.success("Object removed");
      return;
    }

    if (activeTool === "select" || activeTool === "draw") return;

    const pointer = fabricCanvas.getViewportPoint(e.e);

    switch (activeTool) {
      case "rectangle": {
        const rect = new Rect({
          left: pointer.x - 50,
          top: pointer.y - 25,
          fill: activeColor,
          width: 100,
          height: 50,
          strokeWidth: strokeWidth,
          stroke: activeColor,
          rx: 5, // Rounded corners
          ry: 5,
          centeredRotation: true,
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
        setActiveTool?.("select"); // <-- Werkzeug zurücksetzen
        break;
      }

      case "circle": {
        const circle = new Circle({
          left: pointer.x - 25,
          top: pointer.y - 25,
          fill: "transparent",
          radius: 25,
          strokeWidth: strokeWidth,
          stroke: activeColor,
          centeredRotation: true,
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
        setActiveTool?.("select");
        break;
      }

      case "text": {
        const text = new Textbox("Edit text", {
          left: pointer.x,
          top: pointer.y,
          fill: activeColor,
          fontSize: fontSize,
          fontFamily: "Arial",
          width: 200,
          borderColor: activeColor,
          cornerColor: activeColor,
          centeredRotation: true,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        text.enterEditing();
        setActiveTool?.("select");
        break;
      }
      case "triangle":
        { const triangle = new Triangle({
          left: pointer.x - 50,
          top: pointer.y - 50,
          fill: activeColor,
          width: 100,
          height: 100,
          strokeWidth: strokeWidth,
          stroke: activeColor,
          centeredRotation: true,
        });
        fabricCanvas.add(triangle);
        fabricCanvas.setActiveObject(triangle);
        setActiveTool?.("select");
        break; }

        case "line":
            { const line = new Line([pointer.x - 50, pointer.y, pointer.x + 50, pointer.y], {
            stroke: activeColor,
            strokeWidth: strokeWidth,
            selectable: true,
              centeredRotation: true,
            });
            fabricCanvas.add(line);
            fabricCanvas.setActiveObject(line);
            setActiveTool?.("select");

            break; }
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, activeTool, activeColor, fontSize, strokeWidth, setActiveTool]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on("mouse:down", handleCanvasClick);

    return () => {
      fabricCanvas.off("mouse:down", handleCanvasClick);
    };
  }, [fabricCanvas, handleCanvasClick]);

  const loadImageFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = new Image();
      imgElement.onload = () => {
        const fabricImg = new FabricImage(imgElement, {
          left: 0,
          top: 0,
          selectable: true,
        });

        // Scale image to fit canvas while maintaining aspect ratio
        const canvasWidth = fabricCanvas?.width || width;
        const canvasHeight = fabricCanvas?.height || height;
        const imgWidth = imgElement.naturalWidth;
        const imgHeight = imgElement.naturalHeight;

        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight, 1);
        fabricImg.scale(scale);

        // Center the image
        fabricImg.set({
          left: (canvasWidth - imgWidth * scale) / 2,
          top: (canvasHeight - imgHeight * scale) / 2,
        });

        if (fabricCanvas) {
          fabricCanvas.add(fabricImg);
          fabricCanvas.setActiveObject(fabricImg);
          fabricCanvas.renderAll();
          onImageLoad?.(fabricImg);
          toast.success("Image loaded successfully (fabric)!");
        }
      };
      imgElement.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      loadImageFromFile(imageFile);
    }
  }, [fabricCanvas]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const filteredObjects = fabricObjects.filter(obj => obj.visible !== false);
  const canvasObjectsString = filteredObjects.length === 0 ?
      "No objects" :
      filteredObjects.map((obj, index) => {
        if (obj.isType("textbox")) {
          const textObj = obj as Textbox;
          return `Text Object id = ${index}: "${textObj.text}" at (${obj.left}, ${obj.top}) with size ${textObj.width}x${textObj.height}`;
        } else if (obj.isType('rect')) {
          return `Rectangle Object id = ${index} at (${obj.left}, ${obj.top}) with size ${obj.width}x${obj.height}`;
        } else if (obj.isType('circle')) {
          return `Circle Object id = ${index} at (${obj.left}, ${obj.top}) with size ${obj.width}x${obj.height}`;
        } else if (obj.isType("image")) {
          const imageDescription = obj?.["imageDescription"] || "No description";
          return `Image Object id = ${index} at (${obj.left}, ${obj.top}) with size (${obj.width} x ${obj.height}) with description: "${imageDescription}"`;
        } else if (obj.isType("triangle")) {
          return `Triangle Object id = ${index} at (${obj.left}, ${obj.top}) with size ${obj.width}x${obj.height}`;
        } else if (obj.isType("line")) {
          const line = obj as Line;
          return `Line Object id = ${index} from (${line.x1}, ${line.y1}) to (${line.x2}, ${line.y2})`;
        } else {
          console.log(obj.type);
          return `Object id = ${index} of type ${obj.type}`;
        }
      }).join("\n");

  return (
    <div className="flex flex-col">
      <div
        className="relative border-2 border-dashed border-border/50 overflow-hidden bg-background rounded-lg shadow-lg"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
          <context name="Canvas Size">
              {width} x {height}
          </context>
          <context name="Canvas Objects">
            {canvasObjectsString}
          </context>
          <Tool name="add_text" description="Add text to the canvas" onCall={(event) => {
            const { text, left, top, width } = event.detail;
            if (fabricCanvas) {
              addTextBox(text, left, top, width);
            }
          }}>

              <prop name="text" type="string" required description="The text to add" />
                <prop name="left" type="number" required description="X position of the text" />
                <prop name="top" type="number" required description="Y position of the text" />
                <prop name="width" type="number" required description="Width of the text box" />
          </Tool>

            <Tool name="edit_text" description="Edit text on the canvas" onCall={(event) => {
                const { index, newText } = event.detail;
                if (fabricCanvas) {
                editTextBox(index, newText);
                }
            }}>
                <prop name="index" type="number" required description="Index of the text box to edit" />
                <prop name="newText" type="string" required description="New text content" />
            </Tool>

            <Tool name="remove_objects" description="Remove objects from the canvas by giving the ids as a list" onCall={(event) => {
                const { ids } = event.detail;
                console.log(indeces);
                if (fabricCanvas) {
                  removeObjects(indeces);
                }
            }}>
                <array name="users" required>
                    <dict>
                        <prop name="email" type="string" description="Valid email address" required></prop>
                        <prop name="role" type="string" description="Either 'viewer', 'editor', or 'admin'"></prop>
                    </dict>
                </array>
            </Tool>
        <canvas
          ref={canvasRef}
          className="max-w-full block"
        />

        {/* Drop overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 hover:opacity-100 pointer-events-none transition-opacity">
          <div className="text-center p-8">
            <div className="mb-4">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            </div>
            <p className="text-muted-foreground mb-2 text-lg font-medium">Drop an image here to start editing</p>
            <p className="text-sm text-muted-foreground">or use the upload button in the toolbar</p>
            <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, WebP formats</p>
          </div>
        </div>
      </div>

      {/* Navigation Controls Footer */}
      <NavigationControls canvas={fabricCanvas} />
    </div>
  );
};
