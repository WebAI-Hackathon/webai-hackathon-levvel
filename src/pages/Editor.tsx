import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Save,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Settings,
  Image,
  Upload,
  ArrowLeft,
} from "lucide-react";
import EditorModeSelector from "@/components/EditorModeSelector";
import { ImageEditor } from "@/components/editors/ImageEditor";
import { MemeEditor } from "@/components/editors/MemeEditor";
import { StoryEditor } from "@/components/editors/StoryEditor";
import { ComicLayoutEditor } from "@/components/editors/ComicLayoutEditor";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProject } from "@/contexts/ProjectContext";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/lib/utils";

export type EditorMode = "image" | "meme" | "story" | "comic";

const Editor = () => {
  const [currentMode, setCurrentMode] = useState<EditorMode>("image");
  const [zoom, setZoom] = useState(100);
  const [showModeSelector, setShowModeSelector] = useState(true);
  
  const { currentProject, saveProject, isProjectLoading } = useProject();
  const { currentWorkspace } = useWorkspaceStore();

  const { uploadedFile, handleFileInput, handleDrop, handleDragOver, handleDragLeave, isDragging, clearFile } = useFileUpload({
    accept: "image/*",
    maxSize: 10,
    onFileLoad: (file) => {
      setShowModeSelector(false);
    },
  });

  const handleNewProject = () => {
    setShowModeSelector(true);
    clearFile();
  };

  const handleSave = async () => {
    if (currentProject) {
      await saveProject();
    }
  };

  const renderEditor = () => {
    switch (currentMode) {
      case "image":
        return <div className="h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Image Editor</h3>
            <p className="text-muted-foreground">Use the new IDE for advanced editing</p>
          </div>
        </div>;
      case "meme":
        return <div className="h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Meme Editor</h3>
            <p className="text-muted-foreground">Use the new IDE for advanced editing</p>
          </div>
        </div>;
      case "story":
        return <div className="h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Story Editor</h3>
            <p className="text-muted-foreground">Use the new IDE for advanced editing</p>
          </div>
        </div>;
      case "comic":
        return <div className="h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Comic Layout</h3>
            <p className="text-muted-foreground">Use the new IDE for advanced editing</p>
          </div>
        </div>;
      default:
        return <div className="h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Editor</h3>
            <p className="text-muted-foreground">Use the new IDE for advanced editing</p>
          </div>
        </div>;
    }
  };

  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-gradient-subtle pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Comic Editor</h1>
              <p className="text-muted-foreground">Choose your editing mode to get started</p>
            </div>

            <EditorModeSelector 
              currentMode={currentMode} 
              onModeChange={setCurrentMode}
              className="mb-8"
            />

            {/* Upload Area */}
            <Card 
              className={cn(
                "border-dashed border-2 bg-card/30 backdrop-blur-sm transition-all",
                isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <CardContent className="p-12">
                <div className="text-center">
                  <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Start Creating</h3>
                  <p className="text-muted-foreground mb-6">
                    {currentMode === "image" && "Upload an image to edit or start with a blank canvas"}
                    {currentMode === "meme" && "Upload an image to add speech bubbles and text"}
                    {currentMode === "story" && "Begin writing your story and create panels"}
                    {currentMode === "comic" && "Start creating your comic book layout"}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <label htmlFor="file-upload">
                      <Button variant="gradient" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                    <Button variant="outline" onClick={() => setShowModeSelector(false)}>
                      Start with Blank Canvas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16 flex flex-col">
      {/* Top Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleNewProject}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Project
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h2 className="font-semibold">
              {currentMode === "image" && "Image Editor"}
              {currentMode === "meme" && "Meme Editor"}
              {currentMode === "story" && "Story Editor"}
              {currentMode === "comic" && "Comic Layout"}
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2 py-1 bg-muted rounded">
                {zoom}%
              </span>
              <Button variant="ghost" size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleSave}
              disabled={isProjectLoading || !currentProject}
            >
              <Save className="w-4 h-4 mr-2" />
              {isProjectLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1">
        {renderEditor()}
      </div>
    </div>
  );
};

export default Editor;