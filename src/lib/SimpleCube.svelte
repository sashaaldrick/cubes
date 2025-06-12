<!-- SimpleCube.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { CubeGame } from "./cube/CubeGame";

  export let gridSize = 3;

  let canvas: HTMLCanvasElement;
  let game: CubeGame;
  
  const dispatch = createEventDispatcher();

  onMount(() => {
    // Get the actual size of the canvas container
    const container = canvas.parentElement!;
    const { width, height } = container.getBoundingClientRect();

    // Set canvas internal size to match display size
    canvas.width = width;
    canvas.height = height;

    game = new CubeGame(canvas, gridSize);
    game.startGameLoop();

    // Handle cube position changes
    const handlePositionChange = (event: CustomEvent) => {
      dispatch('positionChange', event.detail);
    };
    
    window.addEventListener('cubePositionChanged', handlePositionChange as EventListener);

    // Handle window resize
    const handleResize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      game.resize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('cubePositionChanged', handlePositionChange as EventListener);
    };
  });
</script>

<div class="container">
  <canvas bind:this={canvas}></canvas>
  <div class="instructions">
    <p>Use arrow keys to roll the cube</p>
    <p>Press R to reset</p>
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .instructions {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
  }

  .instructions p {
    margin: 5px 0;
    font-size: 14px;
  }
</style>
