<script lang="ts">
  import { onMount } from 'svelte';
  import { GridSystem } from './cube/GridSystem.js';
  import { CubeState } from './cube/CubeState.js';
  import { RollingPhysics } from './cube/RollingPhysics.js';
  import { RenderEngine } from './cube/RenderEngine.js';
  import { InputHandler } from './cube/InputHandler.js';
  import type { RollAnimation, RollDirection } from './cube/types.js';

  export let gridSize: number = 3;
  export let cellSize: number = 2;

  let canvas: HTMLCanvasElement;
  let gridSystem: GridSystem;
  let cubeState: CubeState;
  let renderEngine: RenderEngine;
  let inputHandler: InputHandler;
  let currentAnimation: RollAnimation | null = null;

  onMount(() => {
    gridSystem = new GridSystem(gridSize, cellSize);
    cubeState = new CubeState(gridSystem);
    renderEngine = new RenderEngine(canvas, gridSystem);
    inputHandler = new InputHandler();

    inputHandler.onMove(handleMove);
    inputHandler.onReset(reset);

    const initialState = cubeState.state;
    renderEngine.updateCube(initialState.world, initialState.rotation);
    renderEngine.render();

    renderEngine.startAnimationLoop(updateAnimation);

    return () => {
      renderEngine.dispose();
      inputHandler.dispose();
    };
  });

  function handleMove(direction: RollDirection): void {
    if (currentAnimation?.isActive) return;
    if (!cubeState.canMoveInDirection(direction)) return;

    const startState = cubeState.state;
    const targetState = cubeState.getTargetStateForDirection(direction);
    
    currentAnimation = RollingPhysics.createRollAnimation(startState, targetState, direction);
  }

  function updateAnimation(): void {
    if (!currentAnimation?.isActive) return;

    const isStillAnimating = RollingPhysics.updateAnimation(currentAnimation);
    
    if (isStillAnimating) {
      const currentPosition = RollingPhysics.calculateCurrentPosition(currentAnimation);
      const currentRotation = RollingPhysics.calculateCurrentRotation(currentAnimation);
      renderEngine.updateCube(currentPosition, currentRotation);
    } else {
      const finalPosition = RollingPhysics.getFinalPosition(currentAnimation);
      const finalRotation = RollingPhysics.getFinalRotation(currentAnimation);
      
      renderEngine.updateCube(finalPosition, finalRotation);
      cubeState.updateState(currentAnimation.targetState);
      currentAnimation = null;
    }
  }

  export function reset(): void {
    if (currentAnimation?.isActive) return;
    
    cubeState.reset();
    currentAnimation = null;
    
    const resetState = cubeState.state;
    renderEngine.updateCube(resetState.world, resetState.rotation);
    renderEngine.render();
  }
</script>

<canvas
  bind:this={canvas}
  class="cube-canvas"
  tabindex="0"
></canvas>

<style>
  .cube-canvas {
    width: 100%;
    height: 100%;
    display: block;
    outline: none;
  }
  
  .cube-canvas:focus {
    box-shadow: 0 0 0 2px #0066cc;
  }
</style>