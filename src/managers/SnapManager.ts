import { create } from 'zustand';
import { SnapPoint, CanvasObject } from '@/types/canvas';

interface SnapSettings {
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToGuides: boolean;
  gridSize: number;
  snapDistance: number;
  showSnapLines: boolean;
}

interface SnapState extends SnapSettings {
  snapPoints: SnapPoint[];
  activeSnapPoint: SnapPoint | null;
  snapLines: Array<{ x1: number; y1: number; x2: number; y2: number; }>;
  
  // Actions
  updateSnapSettings: (settings: Partial<SnapSettings>) => void;
  calculateSnapPoint: (x: number, y: number, objects: CanvasObject[]) => SnapPoint | null;
  generateSnapPoints: (objects: CanvasObject[]) => void;
  clearSnapLines: () => void;
  snapToRotation: (rotation: number) => number;
}

const defaultSnapSettings: SnapSettings = {
  snapToGrid: true,
  snapToObjects: true,
  snapToGuides: true,
  gridSize: 20,
  snapDistance: 10,
  showSnapLines: true
};

export const useSnapManager = create<SnapState>((set, get) => ({
  ...defaultSnapSettings,
  snapPoints: [],
  activeSnapPoint: null,
  snapLines: [],

  updateSnapSettings: (settings: Partial<SnapSettings>) => {
    set(state => ({ ...state, ...settings }));
  },

  calculateSnapPoint: (x: number, y: number, objects: CanvasObject[]) => {
    const { snapToGrid, snapToObjects, gridSize, snapDistance } = get();
    let closestPoint: SnapPoint | null = null;
    let minDistance = snapDistance;

    // Grid snapping
    if (snapToGrid) {
      const gridX = Math.round(x / gridSize) * gridSize;
      const gridY = Math.round(y / gridSize) * gridSize;
      const gridDistance = Math.sqrt(Math.pow(x - gridX, 2) + Math.pow(y - gridY, 2));
      
      if (gridDistance < minDistance) {
        closestPoint = { x: gridX, y: gridY, type: 'grid' };
        minDistance = gridDistance;
      }
    }

    // Object snapping
    if (snapToObjects) {
      objects.forEach(obj => {
        const objPoints = [
          { x: obj.x, y: obj.y }, // top-left
          { x: obj.x + (obj.width || 0), y: obj.y }, // top-right
          { x: obj.x, y: obj.y + (obj.height || 0) }, // bottom-left
          { x: obj.x + (obj.width || 0), y: obj.y + (obj.height || 0) }, // bottom-right
          { x: obj.x + (obj.width || 0) / 2, y: obj.y }, // top-center
          { x: obj.x + (obj.width || 0) / 2, y: obj.y + (obj.height || 0) }, // bottom-center
          { x: obj.x, y: obj.y + (obj.height || 0) / 2 }, // left-center
          { x: obj.x + (obj.width || 0), y: obj.y + (obj.height || 0) / 2 }, // right-center
        ];

        objPoints.forEach(point => {
          const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          if (distance < minDistance) {
            closestPoint = { ...point, type: 'object' };
            minDistance = distance;
          }
        });
      });
    }

    set({ activeSnapPoint: closestPoint });
    return closestPoint;
  },

  generateSnapPoints: (objects: CanvasObject[]) => {
    const { snapToGrid, gridSize } = get();
    const points: SnapPoint[] = [];

    // Generate grid points (within visible area - TODO: calculate from viewport)
    if (snapToGrid) {
      for (let x = 0; x <= 1000; x += gridSize) {
        for (let y = 0; y <= 1000; y += gridSize) {
          points.push({ x, y, type: 'grid' });
        }
      }
    }

    // Generate object anchor points
    objects.forEach(obj => {
      const objPoints = [
        { x: obj.x, y: obj.y, type: 'object' as const },
        { x: obj.x + (obj.width || 0), y: obj.y, type: 'object' as const },
        { x: obj.x, y: obj.y + (obj.height || 0), type: 'object' as const },
        { x: obj.x + (obj.width || 0), y: obj.y + (obj.height || 0), type: 'object' as const },
      ];
      points.push(...objPoints);
    });

    set({ snapPoints: points });
  },

  clearSnapLines: () => {
    set({ snapLines: [], activeSnapPoint: null });
  },

  snapToRotation: (rotation: number) => {
    const snapAngles = [0, 15, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
    const snapThreshold = 5; // degrees
    
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    
    for (const angle of snapAngles) {
      if (Math.abs(normalizedRotation - angle) <= snapThreshold) {
        return angle;
      }
    }
    
    return rotation;
  }
}));