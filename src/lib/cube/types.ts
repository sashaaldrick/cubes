export interface GridConfig {
  size: number;
  cellSize: number;
  worldBounds: number;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export interface GridPosition {
  gridX: number;
  gridZ: number;
}

export interface CubePositionState {
  grid: GridPosition;
  world: Position3D;
  rotation: Rotation3D;
}

export interface RollAnimation {
  axis: 'x' | 'z';
  direction: number;
  progress: number;
  startState: CubePositionState;
  targetState: CubePositionState;
  isActive: boolean;
}

export type RollDirection = 'up' | 'down' | 'left' | 'right';

export interface InputConfig {
  keyMap: Record<string, RollDirection>;
}

export interface RenderConfig {
  canvasWidth: number;
  canvasHeight: number;
  antialias: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
}