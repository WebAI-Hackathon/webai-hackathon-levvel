import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, FabricText, FabricImage, Rect } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  MessageSquare,
  Type,
  Move,
  RotateCcw,
  Trash2,
  Plus,
} from "lucide-react";

interface MemeEditorProps {
  imageFile?: File;
  onCanvasReady?: (canvas: FabricCanvas) => void;
}

export function MemeEditor({ imageFile, onCanvasReady }: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedText, setSelectedText] = useState<FabricText | null>(null);
  const [textContent, setTextContent] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Listen for text selection
    canvas.on('selection:created', (e) => {
      if (e.selected && e.selected[0] instanceof FabricText) {
        const text = e.selected[0] as FabricText;
        setSelectedText(text);
        setTextContent(text.text || "");
        setFontSize(text.fontSize || 24);
        setFontFamily(text.fontFamily || "Arial");
        setTextColor(text.fill as string || "#000000");
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedText(null);
      setTextContent("");
    });

    setFabricCanvas(canvas);
    onCanvasReady?.(canvas);
    toast("Meme editor ready!");

    return () => {
      canvas.dispose();
    };
  }, [onCanvasReady]);

  // Load image file when provided
  useEffect(() => {
    if (!fabricCanvas || !imageFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        try {
          const imgElement = await FabricImage.fromURL(e.target.result as string);
          
          const scaleX = fabricCanvas.width! / imgElement.width!;
          const scaleY = fabricCanvas.height! / imgElement.height!;
          const scale = Math.min(scaleX, scaleY);
          
          imgElement.scale(scale);
          imgElement.set({
            left: (fabricCanvas.width! - imgElement.width! * scale) / 2,
            top: (fabricCanvas.height! - imgElement.height! * scale) / 2,
            selectable: false,
          });
          
          fabricCanvas.add(imgElement);
          fabricCanvas.renderAll();
        } catch (error) {
          console.error("Error loading image:", error);
          toast.error("Failed to load image");
        }
      }
    };
    reader.readAsDataURL(imageFile);
  }, [fabricCanvas, imageFile]);

  const addTextBox = useCallback(() => {
    if (!fabricCanvas) return;

    const text = new FabricText("Your text here", {
      left: 100,
      top: 100,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fill: textColor,
      textAlign: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: 10,
    });
    
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  }, [fabricCanvas, fontFamily, fontSize, textColor]);

  const addSpeechBubble = useCallback(() => {
    if (!fabricCanvas) return;

    // Create speech bubble background
    const bubble = new Rect({
      left: 150,
      top: 150,
      width: 200,
      height: 80,
      fill: 'white',
      stroke: '#000000',
      strokeWidth: 2,
      rx: 20,
      ry: 20,
    });

    const text = new FabricText("Speech bubble text", {
      left: 160,
      top: 170,
      fontFamily: fontFamily,
      fontSize: 16,
      fill: textColor,
      textAlign: 'center',
      width: 180,
    });
    
    fabricCanvas.add(bubble);
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  }, [fabricCanvas, fontFamily, textColor]);

  const updateSelectedText = useCallback(() => {
    if (!selectedText) return;

    selectedText.set({
      text: textContent,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
    });
    
    fabricCanvas?.renderAll();
  }, [selectedText, textContent, fontSize, fontFamily, textColor, fabricCanvas]);

  const deleteSelected = useCallback(() => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (activeObject) {
      fabricCanvas.remove(activeObject);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  const fonts = [
    "Arial", "Helvetica", "Times New Roman", "Courier New", 
    "Verdana", "Comic Sans MS", "Impact", "Georgia"
  ];

  return (
    <div className="flex h-full">
      {/* Left Panel - Tools */}
      <div className="w-80 border-r border-border/50 bg-background/50 backdrop-blur-sm p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Elements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={addTextBox} className="w-full" variant="outline">
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            <Button onClick={addSpeechBubble} className="w-full" variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Speech Bubble
            </Button>
          </CardContent>
        </Card>

        {selectedText && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Text Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Text:</label>
                <Input
                  value={textContent}
                  onChange={(e) => {
                    setTextContent(e.target.value);
                    updateSelectedText();
                  }}
                  placeholder="Enter text"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Font:</label>
                <Select value={fontFamily} onValueChange={(value) => {
                  setFontFamily(value);
                  updateSelectedText();
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Size: {fontSize}px</label>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => {
                    setFontSize(value[0]);
                    updateSelectedText();
                  }}
                  max={100}
                  min={8}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Color:</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateSelectedText();
                  }}
                  className="w-full h-10 rounded border border-border mt-1"
                />
              </div>

              <Button onClick={deleteSelected} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Panel - Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <div className="border border-border/50 shadow-elegant rounded-lg overflow-hidden bg-background">
          <canvas ref={canvasRef} className="max-w-full max-h-full" />
        </div>
      </div>
    </div>
  );
}