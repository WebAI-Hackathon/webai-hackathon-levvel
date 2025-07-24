import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  File,
  Image,
  Trash2,
  Download,
  Eye,
  MoreHorizontal,
  Edit,
  FileText,
  Layout,
  Palette,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectFileType } from "@/types/project";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileItem {
  id: string;
  name: string;
  type: "image" | "document";
  size: string;
  lastModified: string;
  thumbnail?: string;
}

const FileManager = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { createFile, currentProject } = useProjectStore();

  const { handleFileInput, handleDrop, handleDragOver, handleDragLeave, isDragging } = useFileUpload({
    accept: "image/*",
    maxSize: 10,
    onFileLoad: (file) => {
      navigate("/ide");
    },
  });

  // Editor panel types
  const editorPanels = [
    { 
      type: 'image' as ProjectFileType, 
      name: 'Image Editor', 
      icon: Image, 
      description: 'Edit and enhance images',
      color: 'text-green-500'
    },
    { 
      type: 'story' as ProjectFileType, 
      name: 'Story Editor', 
      icon: FileText, 
      description: 'Write stories with visual panels',
      color: 'text-purple-500'
    },
    { 
      type: 'comic' as ProjectFileType, 
      name: 'Comic Layout', 
      icon: Layout, 
      description: 'Create comic page layouts',
      color: 'text-orange-500'
    },
    { 
      type: 'frame' as ProjectFileType, 
      name: 'Frame Editor', 
      icon: Layout, 
      description: 'Design reusable frames',
      color: 'text-red-500'
    },
    { 
      type: 'template' as ProjectFileType, 
      name: 'Template Editor', 
      icon: Palette, 
      description: 'Create custom templates',
      color: 'text-pink-500'
    }
  ];

  const handleCreateFile = (type: ProjectFileType) => {
    const name = prompt(`Enter ${type} name:`);
    if (name && currentProject) {
      createFile(null, name, type);
      navigate("/ide");
      toast.success(`Created new ${type}: ${name}`);
    }
  };

  // Mock file data
  const files: FileItem[] = [
    {
      id: "1",
      name: "Comic Page 1.png",
      type: "image",
      size: "2.4 MB",
      lastModified: "2 hours ago",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop",
    },
    {
      id: "2",
      name: "Character Design.jpg",
      type: "image",
      size: "1.8 MB",
      lastModified: "1 day ago",
      thumbnail: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=200&h=200&fit=crop",
    },
    {
      id: "3",
      name: "Story Draft.txt",
      type: "document",
      size: "45 KB",
      lastModified: "3 days ago",
    },
    {
      id: "4",
      name: "Background Art.png",
      type: "image",
      size: "3.1 MB",
      lastModified: "1 week ago",
      thumbnail: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=200&h=200&fit=crop",
    },
  ];

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileEdit = (file: FileItem) => {
    navigate("/ide");
    toast.success(`Opening ${file.name} in IDE`);
  };

  const FileCard = ({ file }: { file: FileItem }) => (
    <Card className="group hover:shadow-elegant transition-smooth cursor-pointer border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden relative">
          {file.thumbnail ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {file.type === "image" ? (
                <Image className="w-8 h-8 text-muted-foreground" />
              ) : (
                <File className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button size="sm" variant="glass" className="scale-90 group-hover:scale-100 transition-transform">
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="glass" 
                className="scale-90 group-hover:scale-100 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileEdit(file);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm truncate">{file.name}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{file.size}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFileEdit(file)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-muted-foreground">{file.lastModified}</p>
        </div>
      </CardContent>
    </Card>
  );

  const FileRow = ({ file }: { file: FileItem }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-smooth group">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {file.thumbnail ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : file.type === "image" ? (
            <Image className="w-5 h-5 text-muted-foreground" />
          ) : (
            <File className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-sm">{file.name}</h3>
          <p className="text-xs text-muted-foreground">{file.lastModified}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">{file.size}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">File Manager</h1>
            <p className="text-muted-foreground">Manage your creative assets</p>
          </div>
          <label htmlFor="file-upload-header">
            <Button variant="gradient" className="w-fit cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Input
              id="file-upload-header"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              multiple
            />
          </label>
        </div>

        {/* Editor Panels */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {editorPanels.map((panel) => {
              const Icon = panel.icon;
              return (
                <Card 
                  key={panel.type}
                  className="cursor-pointer hover:shadow-elegant transition-smooth border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm"
                  onClick={() => handleCreateFile(panel.type)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">
                      <Icon className={cn("w-8 h-8 mx-auto", panel.color)} />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{panel.name}</h3>
                    <p className="text-xs text-muted-foreground">{panel.description}</p>
                    <Button size="sm" variant="ghost" className="mt-2 w-full">
                      <Plus className="w-3 h-3 mr-1" />
                      Create
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/80 backdrop-blur-sm border-border/50"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Upload Zone */}
        <Card 
          className={cn(
            "mb-8 border-dashed border-2 bg-card/30 backdrop-blur-sm transition-all cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Drag & drop files here</h3>
              <p className="text-muted-foreground mb-4">
                Or click to browse your computer
              </p>
              <label htmlFor="file-upload-zone">
                <Button variant="outline" className="cursor-pointer">Browse Files</Button>
                <Input
                  id="file-upload-zone"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  multiple
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Files Grid/List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Files</h2>
            <span className="text-sm text-muted-foreground">
              {filteredFiles.length} files
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-0">
                {filteredFiles.map((file, index) => (
                  <div key={file.id}>
                    <FileRow file={file} />
                    {index < filteredFiles.length - 1 && (
                      <div className="border-b border-border/30 mx-3" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;