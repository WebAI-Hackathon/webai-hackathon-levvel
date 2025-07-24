import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Folder, 
  FolderOpen, 
  File, 
  Image, 
  FileText, 
  Search,
  Plus,
  MoreVertical,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorFile, EditorProject } from '@/types/editor';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuItem,
} from '@/components/ui/context-menu';

interface FileExplorerProps {
  project: EditorProject;
  isCollapsed: boolean;
}

interface FileItemProps {
  file: EditorFile;
  level: number;
  isCollapsed: boolean;
  isActive?: boolean;
  onSelect?: (file: EditorFile) => void;
}

function FileItem({ file, level, isCollapsed, isActive, onSelect }: FileItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = file.children && file.children.length > 0;

  const getFileIcon = (type: EditorFile['type']) => {
    switch (type) {
      case 'project':
        return isExpanded ? FolderOpen : Folder;
      case 'image':
        return Image;
      case 'text':
        return FileText;
      default:
        return File;
    }
  };

  const Icon = getFileIcon(file.type);

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect?.(file);
    }
  };

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0 justify-center"
        onClick={handleClick}
        title={file.name}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start h-8 px-2 text-sm font-normal",
              isActive && "bg-accent text-accent-foreground"
            )}
            style={{ paddingLeft: `${8 + level * 16}px` }}
            onClick={handleClick}
          >
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{file.name}</span>
            </div>
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Rename</ContextMenuItem>
          <ContextMenuItem>Duplicate</ContextMenuItem>
          <ContextMenuItem className="text-destructive">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {hasChildren && isExpanded && (
        <div>
          {file.children?.map((child) => (
            <FileItem
              key={child.id}
              file={child}
              level={level + 1}
              isCollapsed={false}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ project, isCollapsed }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFileId, setActiveFileId] = useState<string | null>(project.activeFileId || null);

  const handleFileSelect = (file: EditorFile) => {
    setActiveFileId(file.id);
    // TODO: Load file content in editor
    console.log('Selected file:', file);
  };

  const filteredFiles = project.files.filter(file =>
    searchQuery === '' || 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-border bg-card p-2 space-y-2">
        {filteredFiles.slice(0, 8).map((file) => (
          <FileItem
            key={file.id}
            file={file}
            level={0}
            isCollapsed={true}
            onSelect={handleFileSelect}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-foreground">Explorer</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>

      {/* File tree */}
      <ScrollArea className="flex-1">
        <div className="p-1">
          {filteredFiles.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              level={0}
              isCollapsed={false}
              isActive={file.id === activeFileId}
              onSelect={handleFileSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}