import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, FolderOpen, Plus } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from '@/lib/utils';

export function ProjectSelector() {
  const { currentProject, projects, setCurrentProject, createProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
    setIsOpen(false);
  };

  const handleCreateProject = () => {
    const name = prompt('Enter project name:');
    if (name) {
      createProject(name, '16:9');
    }
    setIsOpen(false);
  };

  if (!currentProject && projects.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateProject}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Project
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 max-w-48",
            isOpen && "bg-accent"
          )}
        >
          <FolderOpen className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {currentProject?.name || 'Select Project'}
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleProjectSelect(project.id)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              currentProject?.id === project.id && "bg-accent"
            )}
          >
            <FolderOpen className="h-4 w-4" />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{project.name}</div>
              {project.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {project.description}
                </div>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateProject}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create New Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}