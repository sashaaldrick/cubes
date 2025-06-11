<script lang="ts">
  import Cube3D from '$lib/Cube3D.svelte';
</script>

<div class="container">
  <Cube3D />
</div>

<style>
  .container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
