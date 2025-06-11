import type { GridConfig, GridPosition, Position3D } from './types.js';

export class GridSystem {
  private config: GridConfig;

  constructor(gridSize: number = 3, cellSize: number = 2) {
    this.config = {
      size: gridSize,
      cellSize: cellSize,
      worldBounds: gridSize * cellSize / 2
    };
  }

  get gridSize(): number {
    return this.config.size;
  }

  get cellSize(): number {
    return this.config.cellSize;
  }

  get worldBounds(): number {
    return this.config.worldBounds;
  }

  gridToWorld(gridPosition: GridPosition): Position3D {
    const centerOffset = (this.config.size - 1) / 2;
    return {
      x: (gridPosition.gridX - centerOffset) * this.config.cellSize,
      y: 1,
      z: (gridPosition.gridZ - centerOffset) * this.config.cellSize
    };
  }

  worldToGrid(worldPosition: Position3D): GridPosition {
    const centerOffset = (this.config.size - 1) / 2;
    return {
      gridX: Math.round(worldPosition.x / this.config.cellSize + centerOffset),
      gridZ: Math.round(worldPosition.z / this.config.cellSize + centerOffset)
    };
  }

  isValidGridPosition(gridPosition: GridPosition): boolean {
    return gridPosition.gridX >= 0 && 
           gridPosition.gridX < this.config.size &&
           gridPosition.gridZ >= 0 && 
           gridPosition.gridZ < this.config.size;
  }

  getStartingGridPosition(): GridPosition {
    const center = Math.floor(this.config.size / 2);
    return { gridX: center, gridZ: center };
  }

  canMoveInDirection(currentGrid: GridPosition, direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const newGrid = this.getAdjacentGridPosition(currentGrid, direction);
    return this.isValidGridPosition(newGrid);
  }

  getAdjacentGridPosition(gridPosition: GridPosition, direction: 'up' | 'down' | 'left' | 'right'): GridPosition {
    const { gridX, gridZ } = gridPosition;
    
    switch (direction) {
      case 'up':
        return { gridX, gridZ: gridZ - 1 };
      case 'down':
        return { gridX, gridZ: gridZ + 1 };
      case 'left':
        return { gridX: gridX - 1, gridZ };
      case 'right':
        return { gridX: gridX + 1, gridZ };
    }
  }

  createGridLines(): { horizontal: Position3D[][], vertical: Position3D[][] } {
    const horizontal: Position3D[][] = [];
    const vertical: Position3D[][] = [];
    const bounds = this.config.worldBounds;

    for (let i = 0; i <= this.config.size; i++) {
      const offset = i * this.config.cellSize - bounds;
      
      horizontal.push([
        { x: -bounds, y: 0, z: offset },
        { x: bounds, y: 0, z: offset }
      ]);
      
      vertical.push([
        { x: offset, y: 0, z: -bounds },
        { x: offset, y: 0, z: bounds }
      ]);
    }

    return { horizontal, vertical };
  }
}