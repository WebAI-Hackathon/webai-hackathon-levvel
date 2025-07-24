import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseFileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileLoad?: (file: File) => void;
}

export const useFileUpload = ({ 
  accept = "image/*", 
  maxSize = 10,
  onFileLoad 
}: UseFileUploadProps = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      toast.error(`File type not supported. Please upload ${accept} files.`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize}MB.`);
      return false;
    }

    return true;
  }, [accept, maxSize]);

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) return;

    setUploadedFile(file);
    onFileLoad?.(file);
    toast.success(`File "${file.name}" uploaded successfully!`);
  }, [validateFile, onFileLoad]);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const clearFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return {
    isDragging,
    uploadedFile,
    handleFileInput,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
  };
};