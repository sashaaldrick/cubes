import type { CubePositionState, GridPosition, Position3D, Rotation3D } from './types.js';
import { GridSystem } from './GridSystem.js';

export class CubeState {
  private currentState: CubePositionState;
  private gridSystem: GridSystem;

  constructor(gridSystem: GridSystem) {
    this.gridSystem = gridSystem;
    this.currentState = this.createInitialState();
  }

  private createInitialState(): CubePositionState {
    const startingGrid = this.gridSystem.getStartingGridPosition();
    const startingWorld = this.gridSystem.gridToWorld(startingGrid);
    
    return {
      grid: startingGrid,
      world: startingWorld,
      rotation: { x: 0, y: 0, z: 0 }
    };
  }

  get currentGrid(): GridPosition {
    return { ...this.currentState.grid };
  }

  get currentWorld(): Position3D {
    return { ...this.currentState.world };
  }

  get currentRotation(): Rotation3D {
    return { ...this.currentState.rotation };
  }

  get state(): CubePositionState {
    return {
      grid: { ...this.currentState.grid },
      world: { ...this.currentState.world },
      rotation: { ...this.currentState.rotation }
    };
  }

  updatePosition(newGrid: GridPosition): void {
    this.currentState.grid = { ...newGrid };
    this.currentState.world = this.gridSystem.gridToWorld(newGrid);
  }

  updateRotation(newRotation: Rotation3D): void {
    this.currentState.rotation = { ...newRotation };
  }

  updateState(newState: CubePositionState): void {
    this.currentState = {
      grid: { ...newState.grid },
      world: { ...newState.world },
      rotation: { ...newState.rotation }
    };
  }

  getTargetStateForDirection(direction: 'up' | 'down' | 'left' | 'right'): CubePositionState {
    const targetGrid = this.gridSystem.getAdjacentGridPosition(this.currentState.grid, direction);
    const targetWorld = this.gridSystem.gridToWorld(targetGrid);
    
    const rotationDelta = this.getRotationDeltaForDirection(direction);
    const targetRotation = {
      x: this.currentState.rotation.x + rotationDelta.x,
      y: this.currentState.rotation.y + rotationDelta.y,
      z: this.currentState.rotation.z + rotationDelta.z
    };

    return {
      grid: targetGrid,
      world: targetWorld,
      rotation: targetRotation
    };
  }

  private getRotationDeltaForDirection(direction: 'up' | 'down' | 'left' | 'right'): Rotation3D {
    const quarterTurn = Math.PI / 2;
    
    switch (direction) {
      case 'up':
        return { x: -quarterTurn, y: 0, z: 0 };
      case 'down':
        return { x: quarterTurn, y: 0, z: 0 };
      case 'left':
        return { x: 0, y: 0, z: quarterTurn };
      case 'right':
        return { x: 0, y: 0, z: -quarterTurn };
    }
  }

  canMoveInDirection(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    return this.gridSystem.canMoveInDirection(this.currentState.grid, direction);
  }

  reset(): void {
    this.currentState = this.createInitialState();
  }

  clone(): CubeState {
    const cloned = new CubeState(this.gridSystem);
    cloned.updateState(this.currentState);
    return cloned;
  }
}