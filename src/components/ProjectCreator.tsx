import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Image, MessageSquare, BookOpen, Layout } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { Project } from "@/types/workspace";

const projectTypes = [
  {
    type: 'image' as const,
    icon: Image,
    title: 'Image Editor',
    description: 'Create and edit images with drawing tools'
  },
  {
    type: 'meme' as const,
    icon: MessageSquare,
    title: 'Meme/Speech Bubble',
    description: 'Design memes and add speech bubbles'
  },
  {
    type: 'story' as const,
    icon: BookOpen,
    title: 'Story Editor',
    description: 'Write stories with visual mapping'
  },
  {
    type: 'comic' as const,
    icon: Layout,
    title: 'Comic Layout',
    description: 'Create comic pages and layouts'
  }
];

export function ProjectCreator() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<Project['type']>('image');
  
  const { currentWorkspace, createProject, isLoading } = useWorkspaceStore();

  const handleCreateProject = async () => {
    if (!projectName.trim() || !currentWorkspace) return;

    const project = await createProject(projectName.trim(), projectType);
    if (project) {
      setIsOpen(false);
      setProjectName("");
      setProjectType('image');
    }
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Choose a project type and give it a name to get started
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="My Awesome Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          {/* Project Type */}
          <div className="space-y-3">
            <Label>Project Type</Label>
            <RadioGroup 
              value={projectType} 
              onValueChange={(value) => setProjectType(value as Project['type'])}
              className="grid grid-cols-1 gap-3"
            >
              {projectTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.type} id={type.type} />
                    <Label htmlFor={type.type} className="flex-1 cursor-pointer">
                      <Card className="hover:bg-accent transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {type.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={!projectName.trim() || isLoading}
            >
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}