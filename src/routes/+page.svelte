<script lang="ts">
  import SimpleCube from "../lib/SimpleCube.svelte";

  let gridSize = 8;
  let key = 0;
  let currentTile: string | null = null;
  let lastVisitedTile: string | null = null;

  // const changeGridSize = (newSize: number) => {
  //   gridSize = newSize;
  //   key++; // Force re-mount
  // };

  const handlePositionChange = (event: CustomEvent) => {
    currentTile = event.detail.chessNotation;

    // Update lastVisitedTile when we land on a colored tile
    if (currentTile === "b7" || currentTile === "g3") {
      lastVisitedTile = currentTile;
    }
  };
</script>

<div class="main-container">
  <div class="game-section">
    <div class="cube-wrapper">
      {#key key}
        <SimpleCube {gridSize} on:positionChange={handlePositionChange} />
      {/key}
    </div>
  </div>

  <div class="content-section">
    <div class="content-page">
      {#if lastVisitedTile === "b7"}
        <h1>Books</h1>
        <p>Recently read books:</p>
        <ul>
          <li>Project Hail Mary by Andy Weir</li>
          <li>Dealers of Lightning (Xerox Parc) by Michael A. Hiltzik</li>
          <li>The Best Interface is No Interface by Golden Krishna</li>
        </ul>
      {:else if lastVisitedTile === "g3"}
        <h1>Blog</h1>
        <ul>
          <li>28 Apr, 2025 spring break 2025</li>
          <li>
            25 Apr, 2025 social media is dead. long live ad media (and what we
            can do about it)
          </li>
          <li>20 Apr, 2025 self driving cars are boring</li>
          <li>17 Apr, 2025 do I leave the Apple walled garden (again)?</li>
          <li>16 Apr, 2025 retroactive big data analysis of YOU with AI</li>
          <li>14 Apr, 2025 what would I want from good flashcard software?</li>
        </ul>
      {:else}
        <h1>Welcome</h1>
        <p>Move the cube around the grid to explore different content.</p>
        <p>Gray tiles contain special content:</p>
        <ul>
          <li><strong>b7</strong> - Books I've read recently</li>
          <li><strong>g3</strong> - Blog entries</li>
        </ul>
        <p>Use WASD keys to move the cube around the 8×8 grid.</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .main-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    overflow: hidden;
    background-color: #f0f0f0;
  }

  .game-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 20px 0 20px 40px;
  }

  .content-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 20px 40px 20px 0;
    overflow-y: auto;
  }

  .content-page {
    text-align: left;
  }

  .content-page h1 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 2.5em;
  }

  .content-page p {
    margin: 0 0 12px 0;
    color: #555;
    font-size: 1.1em;
  }

  .content-page ul {
    margin: 0;
    padding-left: 20px;
    color: #444;
    line-height: 1.6;
  }

  .content-page li {
    margin-bottom: 8px;
  }

  .cube-wrapper {
    width: 600px;
    height: 600px;
    max-width: 50vw;
    max-height: 70vh;
    position: relative;
  }

  /* .controls {
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
  } */

  :global(body) {
    margin: 0;
    padding: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .main-container {
      flex-direction: column;
    }

    .game-section {
      flex: 0 0 60vh;
      order: 1;
      justify-content: center;
      padding: 20px;
    }

    .content-section {
      flex: 1;
      order: 2;
      justify-content: center;
      padding: 20px;
    }

    .content-page h1 {
      font-size: 2em;
    }

    .cube-wrapper {
      width: 400px;
      height: 400px;
    }
  }
</style>
