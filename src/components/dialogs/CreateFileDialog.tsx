import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectFileType } from '@/types/project';

interface CreateFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFile: (name: string, type: ProjectFileType) => void;
  parentFolderName?: string;
}

const fileTypeOptions: { value: ProjectFileType; label: string }[] = [
  { value: 'story', label: 'Story' },
  { value: 'comic', label: 'Comic' },
  { value: 'canvas', label: 'Canvas' },
  { value: 'image', label: 'Image' },
  { value: 'frame', label: 'Frame' },
  { value: 'template', label: 'Template' },
  { value: 'folder', label: 'Folder' },
];

export function CreateFileDialog({ open, onOpenChange, onCreateFile, parentFolderName }: CreateFileDialogProps) {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<ProjectFileType>('story');

  const handleCreate = () => {
    if (fileName.trim()) {
      onCreateFile(fileName.trim(), fileType);
      setFileName('');
      setFileType('story');
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Create New File
            {parentFolderName && (
              <span className="text-sm text-muted-foreground font-normal">
                {' '}in {parentFolderName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file-type">File Type</Label>
            <Select value={fileType} onValueChange={(value) => setFileType(value as ProjectFileType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fileTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="file-name">File Name</Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter ${fileType} name...`}
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!fileName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}