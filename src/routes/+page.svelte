<script lang="ts">
  import SimpleCube from "../lib/SimpleCube.svelte";

  let gridSize = 7;
  let key = 0;

  const changeGridSize = (newSize: number) => {
    gridSize = newSize;
    key++; // Force re-mount
  };
</script>

<div class="container">
  <div class="cube-wrapper">
    {#key key}
      <SimpleCube {gridSize} />
    {/key}
  </div>
  <div class="controls">
    <div class="grid-controls">
      <span>Grid Size:</span>
      <button
        class="size-button"
        class:active={gridSize === 3}
        on:click={() => changeGridSize(3)}>3x3</button
      >
      <button
        class="size-button"
        class:active={gridSize === 5}
        on:click={() => changeGridSize(5)}>5x5</button
      >
      <button
        class="size-button"
        class:active={gridSize === 7}
        on:click={() => changeGridSize(7)}>7x7</button
      >
    </div>
  </div>
</div>

<style>
  .container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    overflow: hidden;
    background-color: #f0f0f0;
  }

  .cube-wrapper {
    width: 600px;
    height: 600px;
    max-width: 90vw;
    max-height: 90vh;
    position: relative;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .grid-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .grid-controls span {
    font-weight: bold;
    color: #333;
  }

  .size-button {
    padding: 8px 16px;
    background-color: #e0e0e0;
    color: #333;
    border: 2px solid transparent;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    margin: 2px;
  }

  .size-button:hover {
    background-color: #d0d0d0;
  }

  .size-button.active {
    background-color: #0066cc;
    color: white;
    border-color: #0052a3;
  }


  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
