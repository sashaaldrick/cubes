<script lang="ts">
  import Cube3D from '$lib/Cube3D.svelte';
  
  let cubeComponent: Cube3D;
  
  const resetCube = () => {
    cubeComponent?.reset();
  };
</script>

<div class="container">
  <div class="cube-wrapper">
    <Cube3D bind:this={cubeComponent} />
  </div>
  <button class="reset-button" on:click={resetCube}>
    Reset
  </button>
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
  }

  .reset-button {
    padding: 12px 24px;
    background-color: #0066cc;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .reset-button:hover {
    background-color: #0052a3;
  }

  .reset-button:active {
    background-color: #003d7a;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
