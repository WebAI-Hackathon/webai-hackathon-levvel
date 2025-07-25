import { useEffect, useRef, useState, useCallback } from "react";
import {Canvas as FabricCanvas, Image as FabricImage, Circle, Rect, Textbox, FabricObject, Triangle, Line, filters as ImageFilters,} from "fabric";
import {ImageIcon} from "lucide-react";
import { toast } from "sonner";
import { NavigationControls } from "./NavigationControls";
import {Tool} from "@/components/Tool.tsx";
import {filterPresets} from "@/components/editors/canvas/EnhancedPropertiesPanel.tsx";
import {generateImage, generateImageDescription} from "@/utils/aiHelpers.ts";

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
  generateAiImage?: (prompt: string) => Promise<FabricImage>;
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
  setFabricObjects = () => { /* no-op */ },
  generateAiImage = () => Promise.resolve(null),
}: EnhancedEditorCanvasProps) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const clearCanvas = useCallback(() => {
    if (fabricCanvas) {
      fabricCanvas.clear();
      setFabricObjects([]);
      fabricCanvas.renderAll();
      toast.success("Canvas cleared successfully!");
    } else {
      toast.error("Canvas not initialized.");
    }
  }, [fabricCanvas, setFabricObjects]);

    const moveObjectToLayer = useCallback((index: number, layer: number) => {
        if (fabricCanvas && fabricObjects[index - 1]) {
            const object = fabricObjects[index - 1];
            fabricCanvas.moveObjectTo(object, layer)

            fabricCanvas.renderAll();
            toast.success(`Objekt wurde auf Ebene ${layer} verschoben`);
        } else {
            toast.error("Objekt nicht gefunden.");
        }
    }, [fabricCanvas, fabricObjects]);

    const handleGenerateAiImage = useCallback((prompt: string, top: number, left: number, width: number, height: number, rotation?: number) => {
        generateAiImage(prompt).then((fabricImg) => {
            if (width !== undefined) fabricImg.scaleToWidth(width)
            if (height !== undefined) fabricImg.scaleToHeight(height)

            fabricImg.set({
                left: left,
                top: top,
                angle: rotation || 0,
            });
            fabricImg.setCoords();
            fabricCanvas.renderAll();
        })
    }, [fabricCanvas, generateAiImage]);


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
                                   underlined?: boolean, strikeThrough?: boolean, fontfamily?: string, borderColor?: string, strokeWidth?: number, strokeColor?: string) => {
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

        if (strokeColor !== undefined) {
          textBox.set("stroke", strokeColor);
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


  const addShape = useCallback((shape: "rectangle" | "circle" | "triangle" | "line", left: number, top: number, width: number,
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

  const editShape = useCallback((
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

  const editImage = useCallback((
      {
          id,
            left,
            top,
            width,
            height,
            brightness,
            contrast,
            saturation,
            blur,
            hue,
          rotation,
            filter_preset,
      }:
      {
          id: number,
          left?: number,
      top?: number,
      width?: number,
      height?: number,
      brightness?: number,
      contrast?: number,
      saturation?: number,
      blur?: number,
      hue?: number,
          rotation?: number,
          filter_preset?: string
}
  )=> {
    if (!fabricCanvas || !fabricObjects[id - 1] || !fabricObjects[id - 1].isType("image")) {
      toast.error("Image not found.");
      return;
    }

    const img = fabricObjects[id - 1] as FabricImage;

    if (left !== undefined) img.set("left", left);
    if (top !== undefined) img.set("top", top);
    if (width !== undefined) img.set("width", width);
    if (height !== undefined) img.set("height", height);
    if (rotation !== undefined) img.set("angle", rotation);
    img.setCoords();

    if (brightness !== undefined) {
        img.filters = img.filters.filter(f => !(f instanceof ImageFilters.Brightness));
        img.filters.push(new ImageFilters.Brightness({
            brightness: brightness / 100,
        }))
    }
    if (contrast !== undefined) {
        img.filters = img.filters.filter(f => !(f instanceof ImageFilters.Contrast));
        img.filters.push(new ImageFilters.Contrast({
            contrast: contrast / 100,
        }))
    }
    if (saturation !== undefined) {
        img.filters = img.filters.filter(f => !(f instanceof ImageFilters.Saturation));
        img.filters.push(new ImageFilters.Saturation({
            saturation: saturation / 100,
        }))
    }
    if (blur !== undefined) {
        img.filters = img.filters.filter(f => !(f instanceof ImageFilters.Blur));
        img.filters.push(new ImageFilters.Blur({
            blur: blur / 100,
        }))
    }
    if (hue !== undefined) {
        img.filters = img.filters.filter(f => !(f instanceof ImageFilters.HueRotation));
        img.filters.push(new ImageFilters.HueRotation({
            rotation: hue / 180 * Math.PI,
        }))
    }

    img.applyFilters();
    fabricCanvas.renderAll();
    toast.success("Image updated successfully!");

    if (filter_preset !== undefined) {
        const filterPreset = filterPresets.find(f => f.name === filter_preset).filters;
       editImage({
           id,
            ...filterPreset,
       });
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
          return `Text Object id = ${index + 1}: "${textObj.text}" at (X: ${obj.left}, Y: ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height}) color: ${textObj.fill}, fontSize: ${textObj.fontSize}, fontFamily: ${textObj.fontFamily}, rotation: ${textObj.angle}°`;
        } else if (obj.isType('rect')) {
          return `Rectangle Object id = ${index + 1} at (${obj.left}, ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height}) fill: ${obj.fill}, stroke: ${obj.stroke}, strokeWidth: ${obj.strokeWidth}, rotation: ${obj.angle}°`;
        } else if (obj.isType('circle')) {
          return `Circle Object id = ${index + 1} at (${obj.left}, ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height}) fill: ${obj.fill}, stroke: ${obj.stroke}, strokeWidth: ${obj.strokeWidth}, rotation: ${obj.angle}°`;
        } else if (obj.isType("image")) {
          const imageDescription = obj?.["imageDescription"] || "No description";
          return `Image Object id = ${index + 1} at (${obj.left}, ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height}) with description: "${imageDescription}"`;
        } else if (obj.isType("triangle")) {
          return `Triangle Object id = ${index + 1} at (${obj.left}, ${obj.top}) with size (Width: ${obj.width}, Height: ${obj.height}) fill: ${obj.fill}, stroke: ${obj.stroke}, strokeWidth: ${obj.strokeWidth}, rotation: ${obj.angle}°`;
        } else if (obj.isType("line")) {
          const line = obj as Line;
          return `Line Object id = ${index + 1} from (${line.x1}, ${line.y1}) to (${line.x2}, ${line.y2}) stroke: ${line.stroke}, strokeWidth: ${line.strokeWidth}, rotation: ${line.angle}°`;
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
              description="Add a text box to the canvas with the specified properties"
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
              <prop name="text" type="string" required description="The text that should be added" />
              <prop name="left" type="number" required description="X-Position of the new text" />
              <prop name="top" type="number" required description="Y-Position of the new text" />
              <prop name="width" type="number" required description="Width of the textbox" />
              <prop name="rotation" type="number" description="Rotation angle of the textbox in degrees" />
              <prop name="fontsize" type="number" description="Font size of the textbox" />
              <prop name="color" type="string" description="Text color of the new text in the format #rrggbb" />
              <prop name="fontAlignment" type="string" description="The text alignment of the new text. Can be one of 'left', 'center', or 'right'" />
              <prop name="bold" type="boolean" description="Whether the text should be bold" />
              <prop name="italic" type="boolean" description="Whether the text should be italic" />
              <prop name="underlined" type="boolean" description="Whether the text should be underlined" />
              <prop name="strikeThrough" type="boolean" description="Whether the text should be striked through" />
              <prop name="fontfamily" type="string" description="The font family of the text" />
              <prop name="borderColor" type="string" description="The color of the stroke of the text" />
              <prop name="strokeWidth" type="number" description="The width of the stroke of the text" />
          </Tool>

          <Tool name="edit_text"
                description="Edit text on the canvas identified with the id"
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
              <prop name="text" type="string" description="New text content" />
              <prop name="left" type="number" description="New X-Position" />
              <prop name="top" type="number" description="New Y-Position" />
              <prop name="width" type="number" description="New width of the textbox" />
              <prop name="rotation" type="number" description="New rotation angle of the textbox" />
              <prop name="fontsize" type="number" description="New fontsize of the textbox" />
              <prop name="color" type="string" description="New text color of the textbox" />
              <prop name="fontAlignment" type="string" description="The new alignment of the text. Can be either 'left', 'center', or 'right'." />
              <prop name="bold" type="boolean" description="Whether the text should be bold" />
              <prop name="italic" type="boolean" description="Whether the text should be italic" />
              <prop name="underlined" type="boolean" description="Whether the text should be underlined" />
              <prop name="strikeThrough" type="boolean" description="Whether the text should be striked through" />
              <prop name="fontfamily" type="string" description="The new font family of the text" />
              <prop name="borderColor" type="string" description="The new stroke color of the text" />
              <prop name="strokeWidth" type="number" description="The new stroke width of the text" />
              <prop name="strokeColor" type="string" description="The new color of the stroke of the text" />
          </Tool>

          <Tool
              name="add_shape"
              description="Adds a shape (rectangle, circle, triangle or line) to the canvas with the specified properties"
              onCall={(event) => {
                  const {
                      shape, left, top, width, height,
                      fillColor, strokeWidth, strokeColor
                  } = event.detail;
                  if (fabricCanvas) {
                      addShape(
                          shape, left, top, width, height,
                          fillColor, strokeWidth, strokeColor
                      );
                  }
              }}
          >
              <prop name="shape" type="string" required description="Type of the shape: 'rectangle', 'circle', 'triangle', or 'line'" />
              <prop name="left" type="number" required description="X-Position of the shape" />
              <prop name="top" type="number" required description="Y-Position of the shape" />
              <prop name="width" type="number" required description="Width of the shape" />
              <prop name="height" type="number" required description="Height of the shape" />
              <prop name="fillColor" type="string" required description="Fill color of the shape" />
              <prop name="strokeWidth" type="number" description="Stroke width of the shape" />
              <prop name="strokeColor" type="string" description="Color of the stroke of the shape" />
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
            description="Edit a shape on the canvas by its ID and the desired properties"
            onCall={(event) => {
              const {
                id, left, top, width, height,
                fillColor, strokeColor, strokeWidth, rotation
              } = event.detail;

              console.log("Edit id:", id)
              if (fabricCanvas) {
                editShape(
                  id, left, top, width, height,
                  fillColor, strokeColor, strokeWidth, rotation,
                );
              }
            }}
          >
            <prop name="id" type="number" required description="ID of the to change shape, the id stays the same after editing, take the same id when editing an object multiple times" />
            <prop name="left" type="number" description="New X-Position" />
            <prop name="top" type="number" description="New Y-Position" />
            <prop name="width" type="number" description="New Width (only for rectangles, circles, and triangles)" />
            <prop name="height" type="number" description="New Height (only for rectangles, circles, and triangles)" />
            <prop name="fillColor" type="string" description="New fill color of the shape" />
            <prop name="strokeColor" type="string" description="New stroke color of the shape" />
            <prop name="strokeWidth" type="number" description="New stroke width of the shape" />
            <prop name="rotation" type="number" description="New rotation angle of the shape in degrees" />
          </Tool>
          <Tool
              name="clear_canvas"
              description="Clears canvas and deletes all objects"
              onCall={() => {
                  clearCanvas();
              }}
          />

          <Tool
              name="move_object_to_layer"
                description="Moves an object to a specific layer by its index"
                onCall={(event) => {
                    const { index, layer } = event.detail;
                    moveObjectToLayer(index, layer);
                }}
            >
                <prop name="id" type="number" required description="ID of the object to move" />
                <prop name="layer" type="number" required description="Layer number to move the object to" />
            </Tool>
          <Tool
              name="generate_ai_image"
              description="Generates an AI image based on a prompt and adds it to the canvas"
                onCall={(event) => {
                    const { prompt, top, left, width, height, rotation } = event.detail;
                    handleGenerateAiImage(prompt, top, left, width, height, rotation);
                }}
            >
                <prop name="prompt" type="string" required description="AI image generation prompt" />
                <prop name="top" type="number" required description="Top position of the image on the canvas" />
                <prop name="left" type="number" required description="Left position of the image on the canvas" />
                <prop name="width" type="number" required description="Width of the image on the canvas" />
                <prop name="height" type="number" required description="Height of the image on the canvas" />
                <prop name="rotation" type="number" description="Rotation angle in degrees (optional)" />
            </Tool>

          <context name="available_filter_presets">
              {filterPresets.map((preset) => preset.name).join(", ")}
          </context>

          <Tool name="edit_image" description={"Edit an image on the canvas by its ID and the desired properties"} onCall={(event) => {
                console.log("Edit image id:", event.detail.id)
                if (fabricCanvas) {
                    editImage(event.detail);
                }
          }}>
            <prop name="id" type="number" required description="ID of the image to edit, the id stays the same after editing, take the same id" />
            <prop name="left" type="number" description="New X position of the image" />
            <prop name="top" type="number" description="New Y position of the image" />
            <prop name="width" type="number" description="New width of the image" />
            <prop name="height" type="number" description="New height of the image" />
              <prop name="rotation" type="number" description="Rotation angle in degrees (optional)" />
            <prop name="brightness" type="number" description="Brightness adjustment in percentage (0-100)" />
            <prop name="contrast" type="number" description="Contrast adjustment in percentage (0-100)" />
            <prop name="saturation" type="number" description="Saturation adjustment in percentage (0-100)" />
            <prop name="blur" type="number" description="Blur effect in percentage (0-100)" />
            <prop name="hue" type="number" description="Hue rotation in degrees (-180 to 180)" />
            <prop name="filter_preset" type="string" description="Custom filter string (optional)" />
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
