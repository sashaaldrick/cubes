<script lang="ts">
  import Cube3D from '$lib/Cube3D.svelte';
</script>

<div class="container">
  <div class="cube-wrapper">
    <Cube3D />
  </div>
</div>

<style>
  .container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-color: #f0f0f0;
  }

  .cube-wrapper {
    width: 600px;
    height: 600px;
    max-width: 90vw;
    max-height: 90vh;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
