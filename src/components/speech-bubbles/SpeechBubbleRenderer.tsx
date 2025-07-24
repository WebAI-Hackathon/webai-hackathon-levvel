import { useRef, useEffect } from 'react';
import { SpeechBubble } from '@/types/project';

interface SpeechBubbleRendererProps {
  bubble: SpeechBubble;
  x: number;
  y: number;
  width: number;
  height: number;
  onUpdate?: (bubble: SpeechBubble) => void;
}

export function SpeechBubbleRenderer({ 
  bubble, 
  x, 
  y, 
  width, 
  height, 
  onUpdate 
}: SpeechBubbleRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw speech bubble based on style
    drawSpeechBubble(ctx, bubble, width, height);
  }, [bubble, width, height]);

  const drawSpeechBubble = (
    ctx: CanvasRenderingContext2D, 
    bubble: SpeechBubble, 
    width: number, 
    height: number
  ) => {
    const bubbleWidth = width - 20; // Padding for tail
    const bubbleHeight = height - 20;
    const bubbleX = 10;
    const bubbleY = 10;

    // Set styles
    ctx.fillStyle = bubble.backgroundColor;
    ctx.strokeStyle = bubble.borderColor;
    ctx.lineWidth = bubble.borderWidth;
    ctx.font = `${bubble.fontSize}px ${bubble.fontFamily}`;

    // Draw bubble shape based on style
    ctx.beginPath();
    
    switch (bubble.style) {
      case 'round':
        drawRoundBubble(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        break;
      case 'square':
        drawSquareBubble(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        break;
      case 'thought':
        drawThoughtBubble(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        break;
      case 'shout':
        drawShoutBubble(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        break;
      case 'whisper':
        drawWhisperBubble(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        break;
    }

    ctx.fill();
    ctx.stroke();

    // Draw tail
    drawTail(ctx, bubble, bubbleX, bubbleY, bubbleWidth, bubbleHeight);

    // Draw text
    ctx.fillStyle = bubble.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = wrapText(ctx, bubble.text, bubbleWidth - 20);
    const lineHeight = bubble.fontSize * 1.2;
    const textStartY = bubbleY + bubbleHeight / 2 - (lines.length * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(
        line, 
        bubbleX + bubbleWidth / 2, 
        textStartY + index * lineHeight
      );
    });
  };

  const drawRoundBubble = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) => {
    const radius = Math.min(width, height) * 0.1;
    ctx.roundRect(x, y, width, height, radius);
  };

  const drawSquareBubble = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) => {
    ctx.rect(x, y, width, height);
  };

  const drawThoughtBubble = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) => {
    // Cloud-like shape with multiple arcs
    const cloudRadius = Math.min(width, height) * 0.15;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const cloudX = x + width / 2 + Math.cos(angle) * (width / 2 - cloudRadius);
      const cloudY = y + height / 2 + Math.sin(angle) * (height / 2 - cloudRadius);
      ctx.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
    }
  };

  const drawShoutBubble = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) => {
    // Jagged/spiky edges
    const spikes = 12;
    const spikeHeight = 8;
    
    for (let i = 0; i <= spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      const baseRadius = Math.min(width, height) / 2;
      const radius = baseRadius + (i % 2 === 0 ? spikeHeight : 0);
      const pointX = x + width / 2 + Math.cos(angle) * radius;
      const pointY = y + height / 2 + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
  };

  const drawWhisperBubble = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) => {
    // Dashed border effect
    ctx.setLineDash([5, 5]);
    const radius = Math.min(width, height) * 0.1;
    ctx.roundRect(x, y, width, height, radius);
    ctx.setLineDash([]);
  };

  const drawTail = (
    ctx: CanvasRenderingContext2D, 
    bubble: SpeechBubble, 
    bubbleX: number, 
    bubbleY: number, 
    bubbleWidth: number, 
    bubbleHeight: number
  ) => {
    const tailSize = 15;
    
    ctx.beginPath();
    ctx.fillStyle = bubble.backgroundColor;
    ctx.strokeStyle = bubble.borderColor;

    switch (bubble.tailDirection) {
      case 'bottom-left':
        ctx.moveTo(bubbleX + 20, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX, bubbleY + bubbleHeight + tailSize);
        ctx.lineTo(bubbleX + 30, bubbleY + bubbleHeight);
        break;
      case 'bottom-right':
        ctx.moveTo(bubbleX + bubbleWidth - 30, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight + tailSize);
        ctx.lineTo(bubbleX + bubbleWidth - 20, bubbleY + bubbleHeight);
        break;
      case 'top-left':
        ctx.moveTo(bubbleX + 20, bubbleY);
        ctx.lineTo(bubbleX, bubbleY - tailSize);
        ctx.lineTo(bubbleX + 30, bubbleY);
        break;
      case 'top-right':
        ctx.moveTo(bubbleX + bubbleWidth - 30, bubbleY);
        ctx.lineTo(bubbleX + bubbleWidth, bubbleY - tailSize);
        ctx.lineTo(bubbleX + bubbleWidth - 20, bubbleY);
        break;
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 1000 // Always on top
      }}
    />
  );
}