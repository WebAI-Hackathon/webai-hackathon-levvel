import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, FolderOpen, Plus, Calendar } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { format } from "date-fns";

export function WorkspaceSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    currentWorkspace, 
    workspaces, 
    selectWorkspace, 
    setCurrentWorkspace,
    isLoading 
  } = useWorkspaceStore();

  const handleSelectWorkspace = async () => {
    await selectWorkspace();
    setIsOpen(false);
  };

  const handleSelectExisting = (workspace: any) => {
    setCurrentWorkspace(workspace);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          {currentWorkspace ? (
            <>
              <FolderOpen className="h-4 w-4" />
              {currentWorkspace.name}
            </>
          ) : (
            <>
              <Folder className="h-4 w-4" />
              Select Workspace
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Workspace</DialogTitle>
          <DialogDescription>
            Choose a local folder to store your projects and assets
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create New Workspace */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Workspace
              </CardTitle>
              <CardDescription>
                Select a folder on your computer to use as your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSelectWorkspace} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Selecting..." : "Choose Folder"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Workspaces */}
          {workspaces.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Workspaces</h3>
              {workspaces.map((workspace) => (
                <Card 
                  key={workspace.id} 
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    currentWorkspace?.id === workspace.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectExisting(workspace)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        {workspace.name}
                      </CardTitle>
                      {currentWorkspace?.id === workspace.id && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      Last accessed: {format(new Date(workspace.lastAccessed), 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {!('showDirectoryPicker' in window) && (
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <strong>Note:</strong> File System Access API may not be fully supported in your browser. 
              Some features might be limited.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
