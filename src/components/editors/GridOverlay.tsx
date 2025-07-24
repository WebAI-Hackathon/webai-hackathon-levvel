import { useSnapManager } from '@/managers/SnapManager';

interface GridOverlayProps {
  width: number;
  height: number;
  zoom: number;
}

export function GridOverlay({ width, height, zoom }: GridOverlayProps) {
  const { showSnapLines, gridSize, snapLines } = useSnapManager();

  if (!showSnapLines) return null;

  const adjustedGridSize = gridSize * zoom / 100;
  const gridPattern = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='${adjustedGridSize}' height='${adjustedGridSize}' viewBox='0 0 ${adjustedGridSize} ${adjustedGridSize}'%3e%3cg fill='none' stroke='%23e5e7eb' stroke-width='1'%3e%3cpath d='m0 0l${adjustedGridSize} 0'/%3e%3cpath d='m0 0l0 ${adjustedGridSize}'/%3e%3c/g%3e%3c/svg%3e")`;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: gridPattern,
          backgroundSize: `${adjustedGridSize}px ${adjustedGridSize}px`
        }}
      />
      
      {/* Snap lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        {snapLines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.8"
          />
        ))}
      </svg>
    </div>
  );
}