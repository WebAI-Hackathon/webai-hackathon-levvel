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

  const addTextBox = useCallback((text: string, left: number, top: number, width: number,
                                  rotation?: number, fontsize?: number, color?: string,
                                  fontAlignment?: "left" | "center" | "right", bold?: boolean, italic?: boolean,
                                  underlined?: boolean, strikeThrough?: boolean, fontfamily?: string, borderColor?: string, strokeWidth?: number) => {
      const textbox = new Textbox(text, {
          left: left,
          top: top,
          fill: color || activeColor,
          fontSize: fontsize || fontSize,
          fontFamily: fontfamily || "Arial",
          width: width,
          borderColor: borderColor || activeColor,
          textAlign: fontAlignment || "center",
          linethrough: strikeThrough || false,
          underline: underlined || false,
          strokeWidth: strokeWidth || 0,
          fontWeight: bold ? "bold" : "normal",
          fontStyle: italic ? "italic" : "normal",
          centeredRotation: true,
          angle: rotation || 0,
      });
      fabricCanvas.add(textbox);
      fabricCanvas.renderAll();

  }, [activeColor, fontSize, fabricCanvas]);

  const editTextBox = useCallback((index: number, text?: string, left?: number, top?: number, width?: number,
                                   rotation?: number, fontsize?: number, color?: string,
                                   fontAlignment?: "left" | "center" | "right", bold?: boolean, italic?: boolean,
                                   underlined?: boolean, strikeThrough?: boolean, fontfamily?: string, borderColor?: string, strokeWidth?: number) => {
    if (fabricCanvas && fabricObjects[index - 1] && fabricObjects[index - 1].isType("textbox")) {
      const textBox = fabricObjects[index - 1];

        if (text) {
          textBox.set("text", text);
        }

        if (left !== undefined) {
          textBox.set("left", left);
        }

        if (top !== undefined) {
          textBox.set("top", top);
        }

        if (width !== undefined) {
          textBox.set("width", width);
        }

        if (rotation !== undefined) {
          textBox.set("angle", rotation);
        }

        if (fontsize !== undefined) {
          textBox.set("fontSize", fontsize);
        }

        if (color !== undefined) {
          textBox.set("fill", color);
        }

        if (fontAlignment !== undefined) {
          textBox.set("textAlign", fontAlignment);
        }

        if (bold !== undefined) {
          textBox.set("fontWeight", bold ? "bold" : "normal");
        }

        if (italic !== undefined) {
          textBox.set("fontStyle", italic ? "italic" : "normal");
        }

        if (underlined !== undefined) {
          textBox.set("underline", underlined);
        }

        if (strikeThrough !== undefined) {
          textBox.set("linethrough", strikeThrough);
        }

        if (fontfamily !== undefined) {
          textBox.set("fontFamily", fontfamily);
        }

        if (borderColor !== undefined) {
          textBox.set("stroke", borderColor);
        }

        if (strokeWidth !== undefined) {
          textBox.set("strokeWidth", strokeWidth);
        }

        // Update the object in the fabricObjects array
        fabricObjects[index - 1] = textBox;
        fabricObjects[index - 1].setCoords();
      fabricCanvas.renderAll();
      toast.success("Text updated successfully!");
    } else {
      toast.error("Selected object is not a text box.");
    }
  }, [fabricCanvas, fabricObjects]);


  const add_shape = useCallback((shape: "rectangle" | "circle" | "triangle" | "line", left: number, top: number, width: number,
                  height: number, fillColor?: string, strokeWidth?: number, strokeColor?: string) => {
        if (fabricCanvas) {

            let newShape: FabricObject | null = null;

            switch (shape) {
                case "rectangle":
                    newShape = new Rect({
                        left: left,
                        top: top,
                        width: width,
                        height: height,
                        fill: fillColor || activeColor,
                        stroke: strokeColor || activeColor,
                        strokeWidth: strokeWidth || 1,
                        centeredRotation: true,
                    });
                    break;
                case "circle":
                    newShape = new Circle({
                        left: left + width / 2,
                        top: top + height / 2,
                        radius: Math.min(width, height) / 2,
                        fill: fillColor || activeColor,
                        stroke: strokeColor || activeColor,
                        strokeWidth: strokeWidth || 1,
                        centeredRotation: true,
                    });
                    break;
                case "triangle":
                    newShape = new Triangle({
                        left: left + width / 2,
                        top: top + height / 2,
                        width: width,
                        height: height,
                        fill: fillColor || activeColor,
                        stroke: strokeColor || activeColor,
                        strokeWidth: strokeWidth || 1,
                        centeredRotation: true,
                    });
                    break;
                case "line":
                    newShape = new Line([left, top, left + width, top + height], {
                        stroke: strokeColor || activeColor,
                        strokeWidth: strokeWidth || 1,
                        selectable: true,
                      centeredRotation: true
                    });
                    break;
            }

            if (newShape) {
                fabricCanvas.add(newShape);
                fabricCanvas.setActiveObject(newShape);
                fabricCanvas.renderAll();
                toast.success(`${shape.charAt(0).toUpperCase() + shape.slice(1)} added successfully!`);
            }

        }
    }, [activeColor, fabricCanvas]);



  const removeObjects = useCallback((ids: number[]) => {
      const realIds = ids.map(i => i["id"]);

    if (fabricCanvas) {
        // Filter out the objects to be removed
        const objectsToRemove = realIds.map(i => fabricObjects[i - 1]).filter(obj => obj);
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

  const edit_shape = useCallback((
    index: number,
    left?: number,
    top?: number,
    width?: number,
    height?: number,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
    rotation?: number,
    radius?: number,
  ) => {
    if (!fabricCanvas || !fabricObjects[index - 1]) {
      toast.error("Shape not found.");
      return;
    }
    const obj = fabricObjects[index - 1];

    if (obj.isType("rect") || obj.isType("triangle")) {
      if (left !== undefined) obj.set("left", left);
      if (top !== undefined) obj.set("top", top);
      if (width !== undefined) obj.set("width", width);
      if (height !== undefined) obj.set("height", height);
      if (fillColor !== undefined) obj.set("fill", fillColor);
      if (strokeColor !== undefined) obj.set("stroke", strokeColor);
      if (strokeWidth !== undefined) obj.set("strokeWidth", strokeWidth);
      if (rotation !== undefined) obj.set("angle", rotation);
    } else if (obj.isType("circle")) {
      if (left !== undefined) obj.set("left", left);
      if (top !== undefined) obj.set("top", top);
      if (radius !== undefined) obj.set("radius", radius);
      if (fillColor !== undefined) obj.set("fill", fillColor);
      if (strokeColor !== undefined) obj.set("stroke", strokeColor);
      if (strokeWidth !== undefined) obj.set("strokeWidth", strokeWidth);
      if (rotation !== undefined) obj.set("angle", rotation);
    } else if (obj.isType("line")) {
        if (left !== undefined) obj.set("x1", left);
        if (top !== undefined) obj.set("y1", top);
        if (width !== undefined) obj.set("x2", left + width);
        if (height !== undefined) obj.set("y2", top + height);
      if (strokeColor !== undefined) obj.set("stroke", strokeColor);
      if (strokeWidth !== undefined) obj.set("strokeWidth", strokeWidth);
    } else {
      toast.error("Selected object is not a supported shape.");
      return;
    }

    obj.setCoords();
    fabricCanvas.renderAll();

    toast.success("Shape updated successfully!");
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
          return `Text Object id = ${index}: "${textObj.text}" at (X: ${obj.left}, Y: ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height})`;
        } else if (obj.isType('rect')) {
          return `Rectangle Object id = ${index} at (${obj.left}, ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height})`;
        } else if (obj.isType('circle')) {
          return `Circle Object id = ${index} at (${obj.left}, ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height})`;
        } else if (obj.isType("image")) {
          const imageDescription = obj?.["imageDescription"] || "No description";
          return `Image Object id = ${index} at (${obj.left}, ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height}) with description: "${imageDescription}"`;
        } else if (obj.isType("triangle")) {
          return `Triangle Object id = ${index} at (${obj.left}, ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height})`;
        } else if (obj.isType("line")) {
          const line = obj as Line;
          return `Line Object id = ${index + 1} from (${line.x1}, ${line.y1}) to (${line.x2}, ${line.y2})`;
        } else {
          return `Object id = ${index + 1} of type ${obj.type}`;
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
          <Tool
              name="add_text"
              description="Fügt Text mit allen unterstützten Eigenschaften zur Leinwand hinzu"
              onCall={(event) => {
                  const {
                      text, left, top, width,
                      rotation, fontsize, color,
                      fontAlignment, bold, italic,
                      underlined, strikeThrough, fontfamily, borderColor, strokeWidth
                  } = event.detail;
                  if (fabricCanvas) {
                      addTextBox(
                          text, left, top, width,
                          rotation, fontsize, color,
                          fontAlignment, bold, italic,
                          underlined, strikeThrough, fontfamily, borderColor, strokeWidth
                      );
                  }
              }}
          >
              <prop name="text" type="string" required description="Der hinzuzufügende Text" />
              <prop name="left" type="number" required description="X-Position des Textes" />
              <prop name="top" type="number" required description="Y-Position des Textes" />
              <prop name="width" type="number" required description="Breite der Textbox" />
              <prop name="rotation" type="number" description="Rotationswinkel in Grad" />
              <prop name="fontsize" type="number" description="Schriftgröße" />
              <prop name="color" type="string" description="Textfarbe im Hex-Format" />
              <prop name="fontAlignment" type="string" description="Textausrichtung: left, center oder right" />
              <prop name="bold" type="boolean" description="Fett" />
              <prop name="italic" type="boolean" description="Kursiv" />
              <prop name="underlined" type="boolean" description="Unterstrichen" />
              <prop name="strikeThrough" type="boolean" description="Durchgestrichen" />
              <prop name="fontfamily" type="string" description="Schriftfamilie" />
              <prop name="borderColor" type="string" description="Rahmenfarbe" />
              <prop name="strokeWidth" type="number" description="Linienstärke des Rahmens" />
          </Tool>

          <Tool name="edit_text"
                description="Edit text on the canvas identifying with the id"
                onCall={(event) => {
                    const {
                        id, text, left, top, width,
                        rotation, fontsize, color,
                        fontAlignment, bold, italic,
                        underlined, strikeThrough, fontfamily, borderColor, strokeWidth
                    } = event.detail;
                    console.log("Edit id:", id)
                    if (fabricCanvas) {
                        editTextBox(
                            id, text, left, top, width,
                            rotation, fontsize, color,
                            fontAlignment, bold, italic,
                            underlined, strikeThrough, fontfamily, borderColor, strokeWidth
                        );
                    }
                }}
          >
              <prop name="id" type="number" required description="ID of the to changing text box, the id stays the same after editing, take the same id" />
              <prop name="text" type="string" description="Neuer Textinhalt" />
              <prop name="left" type="number" description="Neue X-Position" />
              <prop name="top" type="number" description="Neue Y-Position" />
              <prop name="width" type="number" description="Neue Breite der Textbox" />
              <prop name="rotation" type="number" description="Neuer Rotationswinkel in Grad" />
              <prop name="fontsize" type="number" description="Neue Schriftgröße" />
              <prop name="color" type="string" description="Neue Textfarbe im Hex-Format" />
              <prop name="fontAlignment" type="string" description="Textausrichtung: left, center oder right" />
              <prop name="bold" type="boolean" description="Fett" />
              <prop name="italic" type="boolean" description="Kursiv" />
              <prop name="underlined" type="boolean" description="Unterstrichen" />
              <prop name="strikeThrough" type="boolean" description="Durchgestrichen" />
              <prop name="fontfamily" type="string" description="Schriftfamilie" />
              <prop name="borderColor" type="string" description="Rahmenfarbe" />
              <prop name="strokeWidth" type="number" description="Linienstärke des Rahmens" />
          </Tool>

          <Tool
              name="add_shape"
              description="Fügt eine Form (Rechteck, Kreis, Dreieck oder Linie) mit den angegebenen Eigenschaften zur Leinwand hinzu"
              onCall={(event) => {
                  const {
                      shape, left, top, width, height,
                      fillColor, strokeWidth, strokeColor
                  } = event.detail;
                  if (fabricCanvas) {
                      add_shape(
                          shape, left, top, width, height,
                          fillColor, strokeWidth, strokeColor
                      );
                  }
              }}
          >
              <prop name="shape" type="string" required description="Formtyp: rectangle, circle, triangle oder line" />
              <prop name="left" type="number" required description="X-Position der Form" />
              <prop name="top" type="number" required description="Y-Position der Form" />
              <prop name="width" type="number" required description="Breite der Form" />
              <prop name="height" type="number" required description="Höhe der Form" />
              <prop name="fillColor" type="string" required description="Füllfarbe der Form" />
              <prop name="strokeWidth" type="number" description="Linienstärke der Umrandung" />
              <prop name="strokeColor" type="string" description="Farbe der Umrandung" />
          </Tool>

            <Tool name="remove_objects" description="Remove objects from the canvas by giving the ids as a list" onCall={(event) => {
                const { ids } = event.detail;
                if (fabricCanvas) {
                  removeObjects(ids);
                }
            }}>
                <array name="ids" required>
                    <dict>
                        <prop name="id" type="number" required description="ID of the object to remove" />
                    </dict>
                </array>
            </Tool>

          <Tool
            name="edit_shape"
            description="Bearbeite eine Form (Rechteck, Kreis, Dreieck oder Linie) auf der Leinwand anhand ihrer ID und der gewünschten Eigenschaften"
            onCall={(event) => {
              const {
                id, left, top, width, height,
                fillColor, strokeColor, strokeWidth, rotation
              } = event.detail;

              console.log("Edit id:", id)
              if (fabricCanvas) {
                edit_shape(
                  id, left, top, width, height,
                  fillColor, strokeColor, strokeWidth, rotation,
                );
              }
            }}
          >
            <prop name="id" type="number" required description="ID of the to change shape, the id stays the same after editing, take the same id" />
            <prop name="left" type="number" description="Neue X-Position" />
            <prop name="top" type="number" description="Neue Y-Position" />
            <prop name="width" type="number" description="Neue Breite (nur für Rechteck/Dreieck)" />
            <prop name="height" type="number" description="Neue Höhe (nur für Rechteck/Dreieck)" />
            <prop name="fillColor" type="string" description="Neue Füllfarbe" />
            <prop name="strokeColor" type="string" description="Neue Umrandungsfarbe" />
            <prop name="strokeWidth" type="number" description="Neue Linienstärke" />
            <prop name="rotation" type="number" description="Neuer Rotationswinkel in Grad (optional)" />
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
