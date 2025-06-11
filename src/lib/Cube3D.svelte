<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvas: HTMLCanvasElement;
  let targetRotationX = 0;
  let targetRotationZ = 0;
  let rotationX = 0;
  let rotationZ = 0;
  let animationId: number;
  let isAnimating = false;
  let startAnimation: () => void;
  let cubeX = -2;
  let cubeZ = 2;

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
    const cube = new THREE.Mesh(geometry, material);
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

    const render = () => {
      cube.rotation.x = rotationX;
      cube.rotation.z = rotationZ;
      renderer.render(scene, camera);
    };

    const animate = () => {
      const deltaX = Math.abs(targetRotationX - rotationX);
      const deltaZ = Math.abs(targetRotationZ - rotationZ);
      
      if (deltaX > 0.001 || deltaZ > 0.001) {
        rotationX += (targetRotationX - rotationX) * 0.1;
        rotationZ += (targetRotationZ - rotationZ) * 0.1;
        render();
        animationId = requestAnimationFrame(animate);
      } else {
        isAnimating = false;
        rotationX = targetRotationX;
        rotationZ = targetRotationZ;
        render();
      }
    };

    startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true;
        animate();
      }
    };

    render();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAnimating) return;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          targetRotationX -= Math.PI / 2;
          startAnimation();
          break;
        case 'ArrowDown':
          event.preventDefault();
          targetRotationX += Math.PI / 2;
          startAnimation();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          targetRotationZ += Math.PI / 2;
          startAnimation();
          break;
        case 'ArrowRight':
          event.preventDefault();
          targetRotationZ -= Math.PI / 2;
          startAnimation();
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