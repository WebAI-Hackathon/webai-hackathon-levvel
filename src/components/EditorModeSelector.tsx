import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brush,
  MessageCircle,
  BookOpen,
  Grid3X3,
} from "lucide-react";
import type { EditorMode } from "./Canvas";

interface EditorModeSelectorProps {
  currentMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  className?: string;
}

const EditorModeSelector = ({ currentMode, onModeChange, className }: EditorModeSelectorProps) => {
  const modes = [
    {
      id: "image" as EditorMode,
      name: "Image Editor",
      description: "Basic image editing and painting tools",
      icon: Brush,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    {
      id: "meme" as EditorMode,
      name: "Meme Editor", 
      description: "Add speech bubbles and text overlays",
      icon: MessageCircle,
      color: "bg-green-500/10 text-green-600 border-green-200",
    },
    {
      id: "story" as EditorMode,
      name: "Story Editor",
      description: "Text editor with comic panel integration",
      icon: BookOpen,
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
    },
    {
      id: "comic" as EditorMode,
      name: "Comic Layout",
      description: "Arrange panels in comic book format",
      icon: Grid3X3,
      color: "bg-orange-500/10 text-orange-600 border-orange-200",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modes.map((mode) => (
          <Card
            key={mode.id}
            className={`cursor-pointer transition-all hover:shadow-elegant ${
              currentMode === mode.id
                ? "ring-2 ring-primary shadow-elegant"
                : "hover:border-primary/20"
            }`}
            onClick={() => onModeChange(mode.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${mode.color}`}>
                  <mode.icon className="w-5 h-5" />
                </div>
                {currentMode === mode.id && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold mb-1">{mode.name}</h3>
              <p className="text-sm text-muted-foreground">{mode.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EditorModeSelector;