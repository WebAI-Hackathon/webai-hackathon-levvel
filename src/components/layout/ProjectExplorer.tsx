import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, Image, FileText, Layout, Palette, Paintbrush } from 'lucide-react';
import { ProjectFile, ProjectFileType } from '@/types/project';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ProjectExplorerProps {
  files: ProjectFile[];
  selectedFileId?: string;
  onFileSelect: (file: ProjectFile) => void;
  onFileCreate: (parentId?: string, type?: ProjectFileType) => void;
  onFileMove?: (fileId: string, newParentId: string | null) => void;
  isCollapsed?: boolean;
}

const getFileIcon = (type: ProjectFileType) => {
  switch (type) {
    case 'folder': return Folder;
    case 'image': return Image;
    case 'story': return FileText;
    case 'comic': return Layout;
    case 'frame': return Layout;
    case 'template': return Palette;
    case 'canvas': return Paintbrush;
    default: return File;
  }
};

const getFileTypeColor = (type: ProjectFileType) => {
  switch (type) {
    case 'folder': return 'text-blue-500';
    case 'image': return 'text-green-500';
    case 'story': return 'text-purple-500';
    case 'comic': return 'text-orange-500';
    case 'frame': return 'text-red-500';
    case 'template': return 'text-pink-500';
    case 'canvas': return 'text-indigo-500';
    default: return 'text-muted-foreground';
  }
};

function FileTreeItem({ 
  file, 
  level = 0, 
  selectedFileId, 
  onFileSelect, 
  onFileCreate,
  onFileMove,
  expandedIds,
  onToggleExpanded 
}: {
  file: ProjectFile;
  level?: number;
  selectedFileId?: string;
  onFileSelect: (file: ProjectFile) => void;
  onFileCreate: (parentId?: string, type?: ProjectFileType) => void;
  onFileMove?: (fileId: string, newParentId: string | null) => void;
  expandedIds: Set<string>;
  onToggleExpanded: (id: string) => void;
}) {
  const hasChildren = file.children && file.children.length > 0;
  const isExpanded = expandedIds.has(file.id);
  const isSelected = selectedFileId === file.id;
  const Icon = getFileIcon(file.type);

  const handleDragStart = (e: React.DragEvent) => {
    if (file.type === 'folder') return; // Don't allow dragging folders
    e.dataTransfer.setData('text/plain', file.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (file.type !== 'folder') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    if (file.type !== 'folder') return;
    e.preventDefault();
    const draggedFileId = e.dataTransfer.getData('text/plain');
    if (draggedFileId && draggedFileId !== file.id && onFileMove) {
      onFileMove(draggedFileId, file.id);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-sm group",
          isSelected && "bg-accent text-accent-foreground",
          getFileTypeColor(file.type)
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => onFileSelect(file)}
        draggable={file.type !== 'folder'}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(file.id);
            }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        ) : (
          <div className="w-4" />
        )}
        
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate flex-1">{file.name}</span>
        
        {file.type === 'folder' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onFileCreate(file.id);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {file.children!.map(child => (
            <FileTreeItem
              key={child.id}
              file={child}
              level={level + 1}
              selectedFileId={selectedFileId}
              onFileSelect={onFileSelect}
              onFileCreate={onFileCreate}
              onFileMove={onFileMove}
              expandedIds={expandedIds}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectExplorer({ 
  files, 
  selectedFileId, 
  onFileSelect, 
  onFileCreate,
  onFileMove,
  isCollapsed = false 
}: ProjectExplorerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-border bg-card flex flex-col items-center py-2 gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Folder className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 border-r border-border bg-card flex flex-col min-w-0">
      <div className="h-12 border-b border-border flex items-center justify-between px-3">
        <h2 className="text-sm font-medium">Project Explorer</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onFileCreate()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-1 group">
          {files.map(file => (
            <FileTreeItem
              key={file.id}
              file={file}
              selectedFileId={selectedFileId}
              onFileSelect={onFileSelect}
              onFileCreate={onFileCreate}
              expandedIds={expandedIds}
              onToggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}