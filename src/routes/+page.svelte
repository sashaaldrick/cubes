<script lang="ts">
  import SimpleCube from "../lib/SimpleCube.svelte";

  let gridSize = 8;
  let key = 0;
  let currentTile: string | null = null;

  const changeGridSize = (newSize: number) => {
    gridSize = newSize;
    key++; // Force re-mount
  };
  
  const handlePositionChange = (event: CustomEvent) => {
    currentTile = event.detail.chessNotation;
  };
  
  $: showSidebar = currentTile === 'b7';
</script>

<div class="main-container">
  {#if showSidebar}
    <div class="sidebar">
      <h1>Hello!</h1>
    </div>
  {/if}
  
  <div class="container" class:with-sidebar={showSidebar}>
    <div class="cube-wrapper">
      {#key key}
        <SimpleCube {gridSize} on:positionChange={handlePositionChange} />
      {/key}
    </div>
    <div class="controls">
      <div class="grid-controls">
        <span>Grid Size:</span>
        <button
          class="size-button"
          class:active={gridSize === 4}
          on:click={() => changeGridSize(4)}>4x4</button
        >
        <button
          class="size-button"
          class:active={gridSize === 6}
          on:click={() => changeGridSize(6)}>6x6</button
        >
        <button
          class="size-button"
          class:active={gridSize === 8}
          on:click={() => changeGridSize(8)}>8x8</button
        >
      </div>
    </div>
  </div>
</div>

<style>
  .main-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    overflow: hidden;
    background-color: #f0f0f0;
  }

  .sidebar {
    width: 300px;
    height: 100vh;
    background-color: #ffffff;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    padding: 40px 30px;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease-out;
  }
  
  .sidebar h1 {
    margin: 0;
    color: #333;
    font-size: 2.5em;
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .container {
    flex: 1;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    transition: all 0.3s ease-out;
  }

  .container.with-sidebar {
    padding-left: 20px;
  }

  .cube-wrapper {
    width: 600px;
    height: 600px;
    max-width: 70vw;
    max-height: 70vh;
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

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .sidebar {
      width: 200px;
      padding: 20px;
    }
    
    .sidebar h1 {
      font-size: 1.8em;
    }
    
    .cube-wrapper {
      width: 400px;
      height: 400px;
    }
  }
</style>
