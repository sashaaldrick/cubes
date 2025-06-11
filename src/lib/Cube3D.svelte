<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvas: HTMLCanvasElement;
  let animationId: number;
  let isAnimating = false;
  let cube: THREE.Mesh;
  let render: () => void;
  
  // Grid position (1-3, 1-3)
  let gridX = 1;
  let gridY = 1;
  
  // Actual 3D position
  let cubeX = -2;
  let cubeZ = 2;
  let targetX = -2;

  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create grid
    const gridSize = 3;
    const cellSize = 2;
    const gridHelper = new THREE.Group();
    
    // Create grid lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    
    // Horizontal lines
    for (let i = 0; i <= gridSize; i++) {
      const geometry = new THREE.BufferGeometry();
      const points = [];
      points.push(new THREE.Vector3(-gridSize, 0, i * cellSize - gridSize));
      points.push(new THREE.Vector3(gridSize, 0, i * cellSize - gridSize));
      geometry.setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      gridHelper.add(line);
    }
    
    // Vertical lines
    for (let i = 0; i <= gridSize; i++) {
      const geometry = new THREE.BufferGeometry();
      const points = [];
      points.push(new THREE.Vector3(i * cellSize - gridSize, 0, -gridSize));
      points.push(new THREE.Vector3(i * cellSize - gridSize, 0, gridSize));
      geometry.setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      gridHelper.add(line);
    }
    
    scene.add(gridHelper);

    // Create cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0066cc,
      wireframe: false
    });
    
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(cubeX, 1, cubeZ);
    scene.add(cube);

    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    cube.add(wireframe);

    const handleResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    render = () => {
      renderer.render(scene, camera);
    };

    // Rolling animation variables
    let rollProgress = 0;
    let rollStartX = 0;
    let rollStartRotation = 0;

    const animate = () => {
      if (rollProgress < 1) {
        rollProgress += 0.05;
        
        const angle = (Math.PI / 2) * rollProgress;
        
        // Rolling right: pivot around bottom-right edge
        // Pivot is at the bottom-right corner of the cube at ground level
        const pivotX = rollStartX + 1; // Right edge of cube
        const pivotY = 0; // Ground level
        
        // As the cube rolls, it follows a circular arc around the pivot
        // The center of the cube moves in a quarter circle with radius 1 (half cube size)
        cube.position.x = pivotX + Math.sin(angle) * 1;
        cube.position.y = pivotY + Math.cos(angle) * 1;
        cube.position.z = cubeZ;
        
        // The cube rotates clockwise when rolling right
        cube.rotation.z = rollStartRotation - angle;
        
        render();
        animationId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        isAnimating = false;
        rollProgress = 0;
        cubeX = targetX;
        
        // Set final position to match exactly what the animation would calculate
        const finalAngle = Math.PI / 2;
        const pivotX = rollStartX + 1;
        const pivotY = 0;
        cube.position.x = pivotX + Math.sin(finalAngle) * 1; // Should equal targetX
        cube.position.y = pivotY + Math.cos(finalAngle) * 1; // Should equal 1
        
        render();
      }
    };

    const startRoll = () => {
      if (!isAnimating) {
        isAnimating = true;
        rollProgress = 0;
        rollStartX = cubeX;
        rollStartRotation = cube.rotation.z;
        animate();
      }
    };

    render();

    const gridToWorld = (gridPos: number) => {
      return (gridPos - 2) * 2;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAnimating) return;
      
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          if (gridX < 3) {
            gridX += 1;
            targetX = gridToWorld(gridX);
            startRoll();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (animationId) cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  });

  export function reset() {
    if (isAnimating) return;
    
    gridX = 1;
    gridY = 1;
    cubeX = -2;
    cubeZ = 2;
    targetX = -2;
    
    // Reset cube position and rotation
    if (cube) {
      cube.position.set(cubeX, 1, cubeZ);
      cube.rotation.set(0, 0, 0);
      render();
    }
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