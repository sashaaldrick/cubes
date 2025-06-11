import type { RollAnimation, CubePositionState, Position3D, Rotation3D } from './types.js';

export class RollingPhysics {
  private static readonly ANIMATION_SPEED = 0.05;
  private static readonly CUBE_HALF_SIZE = 1;

  static createRollAnimation(
    startState: CubePositionState,
    targetState: CubePositionState,
    direction: 'up' | 'down' | 'left' | 'right'
  ): RollAnimation {
    return {
      axis: (direction === 'left' || direction === 'right') ? 'x' : 'z',
      direction: this.getDirectionMultiplier(direction),
      progress: 0,
      startState: {
        grid: { ...startState.grid },
        world: { ...startState.world },
        rotation: { ...startState.rotation }
      },
      targetState: {
        grid: { ...targetState.grid },
        world: { ...targetState.world },
        rotation: { ...targetState.rotation }
      },
      isActive: true
    };
  }

  private static getDirectionMultiplier(direction: 'up' | 'down' | 'left' | 'right'): number {
    switch (direction) {
      case 'up': return -1;
      case 'down': return 1;
      case 'left': return -1;
      case 'right': return 1;
    }
  }

  static updateAnimation(animation: RollAnimation): boolean {
    if (!animation.isActive) return false;

    animation.progress += this.ANIMATION_SPEED;
    
    if (animation.progress >= 1) {
      animation.progress = 1;
      animation.isActive = false;
      return false;
    }
    
    return true;
  }

  static calculateCurrentPosition(animation: RollAnimation): Position3D {
    const angle = (Math.PI / 2) * animation.progress;
    const { startState } = animation;
    
    if (animation.axis === 'x') {
      const pivotX = startState.world.x + (animation.direction * this.CUBE_HALF_SIZE);
      const pivotY = 0;
      
      return {
        x: pivotX + Math.sin(angle) * animation.direction * this.CUBE_HALF_SIZE,
        y: pivotY + Math.cos(angle) * this.CUBE_HALF_SIZE + this.CUBE_HALF_SIZE,
        z: startState.world.z
      };
    } else {
      const pivotZ = startState.world.z + (animation.direction * this.CUBE_HALF_SIZE);
      const pivotY = 0;
      
      return {
        x: startState.world.x,
        y: pivotY + Math.cos(angle) * this.CUBE_HALF_SIZE + this.CUBE_HALF_SIZE,
        z: pivotZ + Math.sin(angle) * animation.direction * this.CUBE_HALF_SIZE
      };
    }
  }

  static calculateCurrentRotation(animation: RollAnimation): Rotation3D {
    const angle = (Math.PI / 2) * animation.progress;
    const { startState } = animation;
    
    if (animation.axis === 'x') {
      return {
        x: startState.rotation.x,
        y: startState.rotation.y,
        z: startState.rotation.z - (angle * animation.direction)
      };
    } else {
      return {
        x: startState.rotation.x + (angle * animation.direction),
        y: startState.rotation.y,
        z: startState.rotation.z
      };
    }
  }

  static getFinalPosition(animation: RollAnimation): Position3D {
    return { ...animation.targetState.world };
  }

  static getFinalRotation(animation: RollAnimation): Rotation3D {
    return { ...animation.targetState.rotation };
  }
}