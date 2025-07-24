import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { Scissors, Download } from "lucide-react";
import { toast } from "sonner";

// Import the background removal utilities
const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Dynamic import to avoid loading the large model unless needed
    const { pipeline, env } = await import('@huggingface/transformers');
    
    // Configure transformers.js
    env.allowLocalModels = false;
    env.useBrowserCache = false;

    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed
    const MAX_IMAGE_DIMENSION = 1024;
    let width = imageElement.naturalWidth;
    let height = imageElement.naturalHeight;

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert the mask value (1 - value) to keep the subject instead of the background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

interface BackgroundRemoverProps {
  canvas?: FabricCanvas | null;
}

export const BackgroundRemover = ({ canvas }: BackgroundRemoverProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRemoveBackground = async () => {
    if (!canvas) {
      toast.error("No canvas available");
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
      toast.error("Please select an image first");
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      toast.info("Starting background removal...");

      // Get the image element from the fabric object
      const fabricImage = activeObject as FabricImage;
      const imageElement = fabricImage.getElement() as HTMLImageElement;

      setProgress(30);
      toast.info("Loading AI model...");

      // Remove background
      const resultBlob = await removeBackground(imageElement);
      
      setProgress(80);
      toast.info("Applying results...");

      // Create new image element from result
      const resultImage = await loadImage(resultBlob);
      
      // Create new fabric image
      const newFabricImage = new FabricImage(resultImage, {
        left: fabricImage.left,
        top: fabricImage.top,
        scaleX: fabricImage.scaleX,
        scaleY: fabricImage.scaleY,
        angle: fabricImage.angle,
      });

      // Replace the original image
      canvas.remove(fabricImage);
      canvas.add(newFabricImage);
      canvas.setActiveObject(newFabricImage);
      canvas.renderAll();

      setProgress(100);
      toast.success("Background removed successfully!");

    } catch (error) {
      console.error('Background removal failed:', error);
      toast.error("Background removal failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadResult = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'no-background-image.png';
      link.click();
      
      toast.success("Image downloaded!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Background Removal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Use AI to automatically remove the background from your image. Select an image first, then click the button below.
        </div>
        
        {isProcessing && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Processing...</div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        
        <div className="space-y-2">
          <Button 
            onClick={handleRemoveBackground}
            disabled={isProcessing}
            className="w-full"
          >
            <Scissors className="h-4 w-4 mr-2" />
            {isProcessing ? "Removing Background..." : "Remove Background"}
          </Button>
          
          <Button 
            onClick={downloadResult}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Result
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Note: Background removal uses AI processing which may take a few moments to complete.
        </div>
      </CardContent>
    </Card>
  );
};
